/*
 * GNU AGPL-3.0 License
 *
 * Copyright (c) 2021 - present core.ai . All rights reserved.
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

/*globals Bugsnag, logger*/

import AppConfig from "./loggerConfig.js";

const isLocalHost = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const urlParams = new URLSearchParams(window.location.search || "");
window.testEnvironment = (urlParams.get('testEnvironment') === 'true');
const isBugsnagEnabled = (!window.testEnvironment && !isLocalHost);

class CustomBugSnagError extends Error {
    constructor(message, err){
        super(message + (err.message || ""));
        this.name = (err.constructor && err.constructor.name) || this.constructor.name;
        this.stack= message +" : "+ err.stack;
    }
}

const logger = {
    error: console.error,
    warn: console.warn,
    /**
     * By default all uncaught exceptions and promise rejections are sent to logger utility. But in some cases
     * you may want to sent handled errors too if it is critical. use this function to report those
     * @param {Error} error
     * @param {string} [message] optional message
     */
    reportError: function (error, message) {
        if(isBugsnagEnabled) {
            Bugsnag.notify(message?
                new CustomBugSnagError(message, error)
                :error);
        }
    },

    /**
     * This will help to provide additional context to error reporting. The trail will serve as a series of
     * events that happened before an error and will help to backtrack the error.
     * @param {string} message
     */
    leaveTrail: function (message) {
        console.log("[Trail] : ", message);
        if(isBugsnagEnabled) {
            Bugsnag.leaveBreadcrumb(message);
        }
    },

    loggingOptions: {
        LOCAL_STORAGE_KEYS: {
            LOG_LIVE_PREVIEW: "logLivePreview"
        },
        healthDataDisabled: false,
        logLivePreview: false // logLivePreview will be setup below
    },
    livePreview: {
        log: function (...args) {
            if(logger.loggingOptions.logLivePreview){
                logger.log(...args);
            }
        }
    }
    // other API setup below
};
window.logger = logger;

// logger setup
function swallowLogs() {
    // Do nothing
}
const savedLoggingFn = console.log;
const savedInfoFn = console.info;

/**
 * interceptors for console.log and info
 * @returns {boolean}
 */
window.setupLogging = function () {
    const logToConsoleOverride = urlParams.get('logToConsole');
    const logToConsolePref = localStorage.getItem("logToConsole");
    if((logToConsoleOverride && logToConsoleOverride.toLowerCase() === 'true')
        || (logToConsolePref && logToConsolePref.toLowerCase() === 'true' && !logToConsoleOverride)){
        console.log= savedLoggingFn;
        console.info= savedInfoFn;
        logger.log = console.log;
        logger.info = console.info;
        logger.logToConsolePref = 'true';
        window.debugMode = true;
        return true;
    } else {
        console.info = console.log = swallowLogs;
        logger.info = logger.log = swallowLogs;
        logger.logToConsolePref = 'false';
        window.debugMode = false;
        return false;
    }
};
window.setupLogging();

window.isLoggingEnabled = function (key) {
    let loggingEnabled = localStorage.getItem(key) || "false";
    return loggingEnabled.toLowerCase() === 'true';
};

window.toggleLoggingKey = function(key) {
    if(window.isLoggingEnabled(key)){
        localStorage.setItem(key, 'false');
    } else {
        localStorage.setItem(key, 'true');
    }
};


logger.loggingOptions.logLivePreview = window.isLoggingEnabled(
    logger.loggingOptions.LOCAL_STORAGE_KEYS.LOG_LIVE_PREVIEW);

function onError(event) {
    // for mroe info https://docs.bugsnag.com/platforms/javascript/customizing-error-reports
    // change health logger popup string before changing the below line to anything other than "Caught Critical error"
    let reportedStatus = logger.loggingOptions.healthDataDisabled? "Not Reported as health data disabled." : "Reported";

    console.error(`Caught Critical error, ${reportedStatus}: `, event);
    if(window.Metrics) {
        window.Metrics.countEvent(window.Metrics.EVENT_TYPE.ERROR, "uncaught", "logger");
    }
    if(logger.loggingOptions.healthDataDisabled){
        // don't log anything as user disabled health tracking
        return false;
    }
}

if(isBugsnagEnabled) {
    Bugsnag.start({
        apiKey: 'a899c29d251bfdf30c3222016a2a7ea7',
        appType: window.__TAURI__ ? "tauri" : "browser",
        collectUserIp: false,
        appVersion: AppConfig.version,
        enabledReleaseStages: [ 'development', 'production', 'staging',
            'tauri-development', 'tauri-production', 'tauri-staging'],
        releaseStage: window.__TAURI__ ? "tauri-" + AppConfig.config.bugsnagEnv : AppConfig.config.bugsnagEnv,
        // https://docs.bugsnag.com/platforms/javascript/#logging-breadcrumbs
        // breadcrumbs is disabled as it seems a bit intrusive in Pheonix even-though it might help with debugging.
        // only manual explicit privacy ready breadcrumbs are allowed
        enabledBreadcrumbTypes: ['manual'],
        // https://docs.bugsnag.com/platforms/javascript/configuration-options/#maxevents
        maxEvents: 10,
        maxBreadcrumbs: 50,
        onError
    });
    if(window.cacheClearError){
        logger.reportError(window.cacheClearError);
    }
} else {
    console.warn("Logging to Bugsnag is disabled as current environment is localhost.");
}
