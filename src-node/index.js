/*
 * GNU AGPL-3.0 License
 *
 * Copyright (c) 2021 - present core.ai . All rights reserved.
 * Original work Copyright (c) 2014 - 2021 Adobe Systems Incorporated. All rights reserved.
 *
 * This program is free software: you can redistribute it and/or modify it
 * under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License
 * for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see https://opensource.org/licenses/AGPL-3.0.
 *
 */

/**
 * Phoenix Node Connector Initialization
 *
 * This module initializes the Phoenix Node Connector, which is used to establish communication
 * between the Phoenix and Tauri Node Sidecar. The Phoenix Node Connector manages the
 * lifecycle of the `phnode` instance and handles handshake, process commands, and WebSocket
 * connections.
 *
 * Initialization Steps:
 *
 * 1. Phoenix loads this module with Tauri Node Sidecar, and an initial handshake occurs via stdio connectors.
 *    During this handshake, web server URLs for Phoenix Node FS and node connector APIs are exchanged.
 *
 * 2. WebSockets are started for further communication. A dynamically detected free port is used for the server.
 *    A random URL prefix is generated to obfuscate the localhost URL and enhance security.
 *
 * Security Considerations:
 *
 * - **Port Scanning Attacks**: Port scanning attacks from external sources to discover localhost URLs
 *   are a security concern. To mitigate this risk, we use a large random URL prefix, making it impossible for
 *   attackers to guess the URL with brute force scans.
 *
 * Available Commands:
 *
 * The following commands are supported by the Phoenix Node Connector during its lifecycle:
 *
 * - `getEndpoints`: Retrieves available endpoints.
 * - `terminate`: Terminates the Phoenix Node Connector.
 * - ... (See the full list in the `processCommand` function below)
 *
 * Please refer to the `node-connector.js` file in this directory for details on the
 * Node Connector architecture and implementation were the majority of the
 * communication between phoenix and node happens.
 *
 */

require("./NodeEventDispatcher");
const lmdb = require("./lmdb");
const readline = require('readline');
const http = require('http');
const mime = require('mime-types');
const os = require('os');
const fs= require("fs");
const path = require('path');
const PhoenixFS = require('@phcode/fs/dist/phoenix-fs');
const NodeConnector = require("./node-connector");
const LivePreview = require("./live-preview");
require("./test-connection");
require("./utils");
function randomNonce(byteLength) {
    const randomBuffer = new Uint8Array(byteLength);
    crypto.getRandomValues(randomBuffer);

    // Define the character set for the random string
    const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    // Convert the ArrayBuffer to a case-sensitive random string with numbers
    let randomId = '';
    Array.from(randomBuffer).forEach(byte => {
        randomId += charset[byte % charset.length];
    });

    return randomId;
}

let debugMode = false;
const COMMAND_RESPONSE_PREFIX = 'phnodeResp_1!5$:'; // a string thats not likely to just start with in stdio
const COMMAND_ERROR_PREFIX = 'phnodeErr_1!5$:';
// Generate a random 64-bit url. This should take 100 million+ of years to crack with current http connection speed.
const PHOENIX_FS_URL = `/PhoenixFS${randomNonce(8)}`;
const PHOENIX_STATIC_SERVER_URL = `/Static${randomNonce(8)}`;
const PHOENIX_NODE_URL = `/PhoenixNode${randomNonce(8)}`;
const PHOENIX_LIVE_PREVIEW_COMM_URL = `/PreviewComm${randomNonce(8)}`;

const savedConsoleLog = console.log;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let serverPortResolve;
const serverPortPromise = new Promise((resolve) => { serverPortResolve = resolve; });

let orphanExitTimer = setTimeout(()=>{
    process.exit(1);
}, 60000);

function _sendResponse(responseMessage, commandID) {
    savedConsoleLog(COMMAND_RESPONSE_PREFIX + JSON.stringify({
        message: responseMessage,
        commandID
    }) + "\n");
}

let nodeBinPath='', nodeSrcPath='';
if(path.isAbsolute(process.argv[0])){
    nodeBinPath = path.dirname(process.argv[0]);
}
if(path.isAbsolute(process.argv[1])){
    nodeSrcPath = path.dirname(process.argv[1]);
}
const userHomeDir = os.homedir();

function _stripSensitiveInfo(message) {
    message = message || '';
    // remove sensitive user path info from stack
    message = nodeSrcPath && message.replace(nodeSrcPath, '');// this should be first in order due to a windows path quirk
    message = nodeBinPath && message.replace(nodeBinPath, '');
    message = userHomeDir && message.replace(userHomeDir, '');
    return message;
}

function _sendError(err, type) {
    err.stack = err.stack || "";
    savedConsoleLog(COMMAND_ERROR_PREFIX + JSON.stringify({
        message: _stripSensitiveInfo(err.message),
        stack: _stripSensitiveInfo(err.stack),
        code: err.code,
        type: type
    }) + "\n");
}

process.on('unhandledRejection', (reason, promise) => {
    // we dont exit here.
    console.error('Unhandled PhNode Promise Rejection:', reason);
    _sendError(reason, "unhandledRejection");
});
process.on('uncaughtException', (error) => {
    // we dont exit here.
    console.error('Uncaught PhNode Exception:', error);
    _sendError(error, "uncaughtException");
});

function resetOrphanExitTimer() {
    const timeout = debugMode ? 60000 * 15 : 60000;
    // in debug mode, we wait for more minutes to not exit node if phcode doesn't send heartbeats on break point debug
    clearTimeout(orphanExitTimer);
    orphanExitTimer = setTimeout(()=>{
        process.exit(1);
    }, timeout);
}

function processCommand(line) {
    try{
        let jsonCmd = JSON.parse(line);
        switch (jsonCmd.commandCode) {
        case "terminate":
            lmdb.dumpDBToFileAndCloseDB()
                .catch(console.error)
                .finally(()=>{
                    process.exit(0);
                });
            return;
        case "heartBeat":
            resetOrphanExitTimer();
            return;
        case "ping": _sendResponse("pong", jsonCmd.commandID); return;
        case "setDebugMode":
            debugMode = jsonCmd.commandData;
            if(debugMode) {
                console.log = savedConsoleLog;
                console.log("Debug Mode Enabled");
            } else {
                console.log = function () {}; // swallow logs
            }
            resetOrphanExitTimer();
            _sendResponse("done", jsonCmd.commandID); return;
        case "getEndpoints":
            serverPortPromise.then(port =>{
                _sendResponse({
                    port,
                    phoenixFSURL: `ws://localhost:${port}${PHOENIX_FS_URL}`,
                    phoenixNodeURL: `ws://localhost:${port}${PHOENIX_NODE_URL}`,
                    staticServerURL: `http://localhost:${port}${PHOENIX_STATIC_SERVER_URL}`,
                    livePreviewCommURL: `ws://localhost:${port}${PHOENIX_LIVE_PREVIEW_COMM_URL}`
                }, jsonCmd.commandID);
            });
            return;
        default: console.error("unknown command: "+ line);
        }
    } catch (e) {
        console.error(e);
    }
}

rl.on('line', (line) => {
    processCommand(line);
});

const localhostOnly = 'localhost';

// Create an HTTP server
const server = http.createServer((req, res) => {
    if (req.url.startsWith(PHOENIX_STATIC_SERVER_URL)) {
        // Remove '/Static<rand>' from the beginning of the URL and construct file path
        const url = new URL(req.url, `http://${req.headers.host}`);
        const cleanPath = url.pathname.replace(PHOENIX_STATIC_SERVER_URL, '');
        const filePath = path.join(__dirname, 'www', cleanPath);

        fs.readFile(filePath, (err, data) => {
            if (err) {
                if (err.code === 'ENOENT' || err.code === 'EISDIR') {
                    // File not found
                    res.writeHead(404);
                    res.end('Not Found');
                } else {
                    // Other server errors
                    res.writeHead(500);
                    res.end('Server Error');
                }
            } else {
                // Successfully read the file
                res.writeHead(200, {
                    'Content-Type': mime.lookup(filePath),
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
                    'Access-Control-Allow-Headers': 'X-Requested-With,content-type',
                    "Cache-Control": "no-store"
                });
                res.end(data);
            }
        });

    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

PhoenixFS.CreatePhoenixFsServer(server, PHOENIX_FS_URL);
NodeConnector.CreateNodeConnectorWSServer(server, PHOENIX_NODE_URL);
// PhoenixFS.setDebugMode(true); // uncomment this line to enable more logging in phoenix fs lib

LivePreview.CreateLivePreviewWSServer(server, PHOENIX_LIVE_PREVIEW_COMM_URL);
// Start the HTTP server on port 3000
server.listen(0, localhostOnly, () => {
    const port = server.address().port;
    savedConsoleLog('Server Opened on port: ', port);
    savedConsoleLog(`Server running on http://localhost:${port}`);
    savedConsoleLog(`Phoenix node Static Server url is http://localhost:${port}${PHOENIX_STATIC_SERVER_URL}`);
    savedConsoleLog(`Phoenix node tauri FS url is ws://localhost:${port}${PHOENIX_FS_URL}`);
    savedConsoleLog(`Phoenix node connector url is ws://localhost:${port}${PHOENIX_NODE_URL}`);
    savedConsoleLog(`Phoenix live preview comm url is ws://localhost:${port}${PHOENIX_LIVE_PREVIEW_COMM_URL}`);
    serverPortResolve(port);
});