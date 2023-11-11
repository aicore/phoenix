/*
 * GNU AGPL-3.0 License
 *
 * Copyright (c) 2022 - present core.ai . All rights reserved.
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

/* eslint-env node */

const del = require('del');
const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const webserver = require('gulp-webserver');
const { src, dest, series } = require('gulp');
// removed require('merge-stream') node module. it gives wired glob behavior and some files goes missing
const zip = require('gulp-zip');
const jsDocGenerate = require('./jsDocGenerate');
const Translate = require("./translateStrings");
const copyThirdPartyLibs = require("./thirdparty-lib-copy");
const minify = require('gulp-minify');
const glob = require("glob");
const sourcemaps = require('gulp-sourcemaps');
const crypto = require("crypto");
const rename = require("gulp-rename");
const execSync = require('child_process').execSync;

function cleanDist() {
    return del(['dist', 'dist-test']);
}

const RELEASE_BUILD_ARTEFACTS = [
    'src/brackets-min.js',
    'src/styles/brackets-all.css',
    'src/styles/brackets-all.css.map'
];
function _cleanReleaseBuildArtefactsInSrc() {
    return del(RELEASE_BUILD_ARTEFACTS);
}

function cleanAll() {
    return del([
        'node_modules',
        'dist',
        // Test artifacts
        'dist-test',
        'test/spec/test_folders.zip',
        ...RELEASE_BUILD_ARTEFACTS
    ]);
}

/**
 * TODO: Release scripts to merge and min src js/css/html resources into dist.
 * Links that might help:
 * for less compilation:
 * https://stackoverflow.com/questions/27627936/compiling-less-using-gulp-useref-and-gulp-less
 * https://www.npmjs.com/package/gulp-less
 * Minify multiple files into 1:
 * https://stackoverflow.com/questions/26719884/gulp-minify-multiple-js-files-to-one
 * https://stackoverflow.com/questions/53353266/minify-and-combine-all-js-files-from-an-html-file
 * @returns {*}
 */
function makeDistAll() {
    return src('src/**/*')
        .pipe(dest('dist'));
}

function makeJSDist() {
    return src(['src/**/*.js', '!src/**/unittest-files/**/*'])
        .pipe(sourcemaps.init())
        .pipe(minify({
            ext:{
                min:'.js'
            },
            noSource: true,
            mangle: false,
            compress: {
                unused: false
            }
        }))
        .pipe(sourcemaps.write('./'))
        .pipe(dest('dist'));
}

function makeDistNonJS() {
    return src(['src/**/*', '!src/**/*.js'])
        .pipe(dest('dist'));
}

function serve() {
    return src('.')
        .pipe(webserver({
            livereload: false,
            directoryListing: true,
            open: true
        }));
}

function serveExternal() {
    return src('.')
        .pipe(webserver({
            host: '0.0.0.0',
            livereload: false,
            directoryListing: true,
            open: true
        }));
}

function zipTestFiles() {
    return src([
        'test/**',
        'test/**/.*',
        '!test/thirdparty/**',
        '!test/test_folders.zip'])
        .pipe(zip('test_folders.zip'))
        .pipe(dest('test/'));
}

function zipDefaultProjectFiles() {
    return src(['src/assets/default-project/en/**'])
        .pipe(zip('en.zip'))
        .pipe(dest('src/assets/default-project/'));
}

// sample projects
function zipSampleProjectBootstrapBlog() {
    return src(['src/assets/sample-projects/bootstrap-blog/**'])
        .pipe(zip('bootstrap-blog.zip'))
        .pipe(dest('src/assets/sample-projects/'));
}
function zipSampleProjectExplore() {
    return src(['src/assets/sample-projects/explore/**'])
        .pipe(zip('explore.zip'))
        .pipe(dest('src/assets/sample-projects/'));
}
function zipSampleProjectHTML5() {
    return src(['src/assets/sample-projects/HTML5/**'])
        .pipe(zip('HTML5.zip'))
        .pipe(dest('src/assets/sample-projects/'));
}
function zipSampleProjectDashboard() {
    return src(['src/assets/sample-projects/dashboard/**'])
        .pipe(zip('dashboard.zip'))
        .pipe(dest('src/assets/sample-projects/'));
}
function zipSampleProjectHomePages() {
    return src(['src/assets/sample-projects/home-pages/**'])
        .pipe(zip('home-pages.zip'))
        .pipe(dest('src/assets/sample-projects/'));
}
let zipSampleProjectFiles = series(zipSampleProjectBootstrapBlog, zipSampleProjectExplore, zipSampleProjectHTML5,
    zipSampleProjectDashboard, zipSampleProjectHomePages);

function _patchBumpConfigFile(fileName) {
    let config = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    let version = config.apiVersion .split("."); // ["3","0","0"]
    version[2] = "" + (parseInt(version[2]) + 1); // ["3","0","1"]
    config.apiVersion = version.join("."); // 3.0.1
    config.version = `${config.apiVersion}-0`; // 3.0.1-0 . The final build number is always "-0" as the build number
    // is generated by release scripts only and never checked in source.
    fs.writeFileSync(fileName, JSON.stringify(config, null, 4));
}

function _majorVersionBumpConfigFile(fileName) {
    let config = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    let version = config.apiVersion .split("."); // ["3","0","0"]
    const newMajorVersion = "" + (parseInt(version[0]) + 1); // "4"
    config.apiVersion = `${newMajorVersion}.0.0`; // 4.0.0
    config.version = `${config.apiVersion}-0`; // 4.0.0-0 . The final build number is always "-0" as the build number
    // is generated by release scripts only and never checked in source.
    fs.writeFileSync(fileName, JSON.stringify(config, null, 4));
}

function patchVersionBump() {
    return new Promise((resolve)=> {
        _patchBumpConfigFile('./package.json');
        _patchBumpConfigFile('./src-node/package.json');
        _patchBumpConfigFile('./src/config.json');
        resolve();
    });
}

function majorVersionBump() {
    return new Promise((resolve)=> {
        _majorVersionBumpConfigFile('./package.json');
        _majorVersionBumpConfigFile('./src-node/package.json');
        _majorVersionBumpConfigFile('./src/config.json');
        resolve();
    });
}

function _getBuildNumber() {
    // we count the number of commits in branch. which should give a incrementing
    // build number counter if there are any changes. Provided no one does a force push deleting commits.
    return execSync('git rev-list --count HEAD').toString().trim();
}

function _compileLessSrc() {
    return new Promise((resolve)=> {
        execSync('npm run _compileLessSrc');
        resolve();
    });
}

function _getAppConfigJS(configJsonStr) {
    return "// Autogenerated by gulp scripts. Do not edit\n"+
        `window.AppConfig = ${configJsonStr};\n`;
}

function _updateConfigFile(config) {
    delete config.scripts;
    delete config.devDependencies;
    delete config.dependencies;
    delete config.dependencies;

    config.config.build_timestamp = new Date();
    let newVersionStr = config.version.split("-")[0]; // 3.0.0-0 to 3.0.0
    config.version = `${newVersionStr}-${_getBuildNumber()}`;

    console.log("using config: ", config);
    const configJsonStr = JSON.stringify(config, null, 4);
    fs.writeFileSync('dist/config.json', configJsonStr);
    fs.writeFileSync('dist/appConfig.js', _getAppConfigJS(configJsonStr));

}

function releaseDev() {
    return new Promise((resolve)=>{
        const configFile = require('../src/config.json');
        _updateConfigFile(configFile);

        resolve();
    });
}

function releaseStaging() {
    return new Promise((resolve)=>{
        const configFile = require('../src/config.json');
        const stageConfigFile = {
            config: require('../src/brackets.config.staging.json')
        };
        _updateConfigFile(_.merge(configFile, stageConfigFile));

        resolve();
    });
}

function releaseProd() {
    return new Promise((resolve)=>{
        const configFile = require('../src/config.json');
        const prodConfigFile = {
            config: require('../src/brackets.config.dist.json')
        };
        _updateConfigFile(_.merge(configFile, prodConfigFile));

        resolve();
    });
}

function cleanDocs() {
    return del(['docs/generatedApiDocs']);
}

function createJSDocs() {
    return src('src/**/*.js')
        // Instead of using gulp-uglify, you can create an inline plugin
        .pipe(jsDocGenerate.generateDocs())
        .pipe(dest('docs/generatedApiDocs'));
}

function generateDocIndex() {
    return new Promise(async (resolve)=>{ // eslint-disable-line
        await jsDocGenerate.generateDocIndex('docs/generatedApiDocs');
        resolve();
    });
}

function translateStrings() {
    return new Promise(async (resolve)=>{ // eslint-disable-line
        await Translate.translate();
        resolve();
    });
}

function _listFilesInDir(dir) {
    return new Promise((resolve, reject)=>{
        glob(dir + '/**/*', {
            nodir: true
        }, (err, res)=>{
            if(err){
                reject(err);
                return;
            }
            resolve(res);
        });
    });
}

const ALLOWED_EXTENSIONS_TO_CACHE = ["js", "html", "htm", "xhtml", "css", "less", "scss", "ttf", "woff", "woff2", "eot",
    "txt", "otf",
    "json", "config",
    "zip",
    "png", "svg", "jpg", "jpeg", "gif", "ico",
    "mustache", "md", "markdown"];
const DISALLOWED_EXTENSIONS_TO_CACHE = ["map", "nuspec", "partial", "pre", "post", "webmanifest", "rb"];

function _isCacheableFile(path) {
    if(path.indexOf(".") === -1){
        // no extension. dont cache
        return false;
    }
    let ext = path.split(".");
    ext = ext[ext.length - 1];
    if(ALLOWED_EXTENSIONS_TO_CACHE.includes(ext.toLocaleString())){
        return true;
    }
    if(!DISALLOWED_EXTENSIONS_TO_CACHE.includes(ext.toLocaleString())){
        // please add newly found extensions either in ALLOWED_EXTENSIONS_TO_CACHE or DISALLOWED_EXTENSIONS_TO_CACHE
        // if you wound this Warning. These extensions determine which file extensions ends up in
        // browser cache for progressive web app (PWA). Be mindful that only cache what is absolutely necessary
        // as we expect to see cache size to be under 100MB MAX.
        console.warn("WARNING: Please update disallowed extensions. New extension type found: ", ext, path);
        throw new Error("WARNING: Please update file types for PWA cache in build script. New extension type found");
    }
    return false;
}

function _fixAndFilterPaths(basePath, entries) {
    let filtered = [];
    for(let entry of entries){
        if(_isCacheableFile(entry)){
            filtered.push(entry.replace(`${basePath}/`, ""));
        }
    }
    return filtered;
}

function _getFileDetails(path) {
    const data = fs.readFileSync(path,
        {encoding: null});
    return {
        sizeBytes: data.length,
        hash: crypto.createHash("md5").update(data).digest("hex")
    };
}

function _computeCacheManifest(baseDir, filePaths) {
    let manifest = {}, fileDetails, totalSize = 0;
    for(let filePath of filePaths){
        fileDetails = _getFileDetails(baseDir + "/" + filePath);
        manifest[filePath] = fileDetails.hash;
        totalSize += fileDetails.sizeBytes;
    }
    totalSize = Math.round(totalSize/1024); // KB
    console.log("Total size of cache in KB: ", totalSize);
    if(totalSize > 75000){
        throw new Error("The total size of the src or dist folder core assets exceeds 75MB." +
            "\nPlease review and trim storage. This significantly impacts the distribution size." +
            "\nEither trim down the size or increase the limit after careful review.");
    }
    return manifest;
}

function listAllJsFilesRecursively(dirPath) {
    const allFiles = [];

    // Read the contents of the directory.
    const files = fs.readdirSync(dirPath);

    // Iterate over the files.
    files.forEach(file => {
        // Get the full path to the file.
        const filePath = path.join(dirPath, file);

        // Check if the file is a directory.
        if (fs.statSync(filePath).isDirectory()) {
            // Recursively list all JS files in the directory.
            const nestedFiles = listAllJsFilesRecursively(filePath);
            allFiles.push(...nestedFiles);
        } else if (file.endsWith('.js')) {
            // Add the JS file to the array.
            allFiles.push(filePath);
        }
    });

    // Return the array of all JS files.
    return allFiles;
}

function makeBracketsConcatJS() {
    return new Promise((resolve)=>{
        const srcDir = "src/";
        const pathsToMerge = [];
        const PathsToIgnore = ["assets", "thirdparty", "extensions"];
        for(let dir of fs.readdirSync(srcDir, {withFileTypes: true})){
            if(dir.isDirectory() && !PathsToIgnore.includes(dir.name)){
                pathsToMerge.push(dir.name);
            }
        }
        console.log("Processing the following dirs for brackets-min.js", pathsToMerge);
        let concatenatedFile = fs.readFileSync(`${srcDir}brackets.js`, "utf8");
        let mergeCount = 0;
        const notConcatenatedJS = [];
        for(let mergePath of pathsToMerge){
            let files = listAllJsFilesRecursively(`${srcDir}${mergePath}`);
            for(let file of files){
                const requirePath = file.replace(srcDir, "").replace(".js", "");
                let content = fs.readFileSync(file, "utf8");
                const count = content.split("define(").length - 1;
                if(count === 0) {
                    notConcatenatedJS.push(file);
                    continue;
                }
                if(count !== 1){
                    throw new Error("multiple define statements detected in file!!!" + file);
                }
                console.log("Merging: ", requirePath);
                mergeCount ++;
                content = content.replace("define(", `define("${requirePath}", `);
                concatenatedFile = concatenatedFile + "\n" + content;
            }
        }
        console.log("Not concatenated: ", notConcatenatedJS);
        console.log(`Merged ${mergeCount} files into ${srcDir}brackets-min.js`);
        fs.writeFileSync(`${srcDir}brackets-min.js`, concatenatedFile);
        resolve();
    });
}

function _renameBracketsConcatAsBracketsJSInDist() {
    return new Promise((resolve)=>{
        fs.unlinkSync("dist/brackets.js");
        fs.copyFileSync("dist/brackets-min.js", "dist/brackets.js");
        fs.copyFileSync("dist/brackets-min.js.map", "dist/brackets.js.map");
        // cleanup minifed files
        fs.unlinkSync("dist/brackets-min.js");
        fs.unlinkSync("dist/brackets-min.js.map");
        resolve();
    });
}

function createCacheManifest(srcFolder) {
    return new Promise((resolve, reject)=>{
        _listFilesInDir(srcFolder).then((files)=>{
            files = _fixAndFilterPaths(srcFolder, files);
            console.log("Files in cache: ", files.length);
            let cache = _computeCacheManifest(srcFolder, files);
            fs.writeFileSync(srcFolder + "/cacheManifest.json", JSON.stringify(cache, null, 2));
            resolve();
        }).catch(reject);
    });
}

function createSrcCacheManifest() {
    return createCacheManifest("src");
}

function createDistCacheManifest() {
    return createCacheManifest("dist");
}

function copyDistToDistTestFolder() {
    return src('dist/**/*')
        .pipe(dest('dist-test/src'));
}

function copyTestToDistTestFolder() {
    return src('test/**/*')
        .pipe(dest('dist-test/test'));
}

function copyIndexToDistTestFolder() {
    return src('test/index-dist-test.html')
        .pipe(rename("index.html"))
        .pipe(dest('dist-test'));
}

function makeLoggerConfig() {
    return new Promise((resolve)=>{
        const configJsonStr = JSON.stringify(require('../src/config.json'), null, 4);
        fs.writeFileSync('src/appConfig.js', _getAppConfigJS(configJsonStr));
        resolve();
    });
}

function validatePackageVersions() {
    return new Promise((resolve, reject)=>{
        const mainPackageJson = require("../package.json", "utf8");
        const nodePackageJson = require("../src-node/package.json", "utf8");
        if(nodePackageJson.devDependencies){
            reject("Node package json file(src-node/package.json) should not have any dev dependencies!");
            return;
        }
        const mainDevDeps = mainPackageJson.devDependencies,
            mainDeps = mainPackageJson.dependencies,
            nodeDeps = nodePackageJson.dependencies;

        // Create a merged list of all package names
        const allPackages = new Set([
            ...Object.keys(mainDevDeps || {}),
            ...Object.keys(mainDeps || {}),
            ...Object.keys(nodeDeps || {})
        ]);

        let hasMismatch = false;
        for (let packageName of allPackages) {
            const mainDevVersion = mainDevDeps && mainDevDeps[packageName];
            const mainVersion = mainDeps && mainDeps[packageName];
            const nodeVersion = nodeDeps && nodeDeps[packageName];

            if (mainDevVersion && mainVersion && mainDevVersion !== mainVersion) {
                console.error(`Version mismatch for package ${packageName}: ${mainDevVersion} (package.json devDependencies) vs ${mainVersion} (package.json dependencies)`);
                hasMismatch = true;
            }

            if (mainDevVersion && nodeVersion && mainDevVersion !== nodeVersion) {
                console.error(`Version mismatch for package ${packageName}: ${mainDevVersion} (package.json devDependencies) vs ${nodeVersion} (src-node/package.json dependencies)`);
                hasMismatch = true;
            }

            if (mainVersion && nodeVersion && mainVersion !== nodeVersion) {
                console.error(`Version mismatch for package ${packageName}: ${mainVersion} (package.json dependencies) vs ${nodeVersion} (src-node/package.json dependencies)`);
                hasMismatch = true;
            }
        }

        if (hasMismatch) {
            reject("Package version mismatch detected. Check the errors above.");
        } else {
            resolve();
        }
    });
}

function _patchMinifiedCSSInDistIndex() {
    return new Promise((resolve)=>{
        let content = fs.readFileSync("dist/index.html", "utf8");
        if(!content.includes(`<link rel="stylesheet/less" type="text/css" href="styles/brackets.less">`)){
            throw new Error(`Could not locate string <link rel="stylesheet/less" type="text/css" href="styles/brackets.less"> in file dist/index.html`)
        }
        content = content.replace(
            `<link rel="stylesheet/less" type="text/css" href="styles/brackets.less">`,
            `<link rel="stylesheet" type="text/css" href="styles/brackets-all.css">`);
        fs.writeFileSync("dist/index.html", content, "utf8");
        resolve();
    });
}

const createDistTest = series(copyDistToDistTestFolder, copyTestToDistTestFolder, copyIndexToDistTestFolder);

exports.build = series(copyThirdPartyLibs.copyAll, makeLoggerConfig, zipDefaultProjectFiles, zipSampleProjectFiles,
    makeBracketsConcatJS, _compileLessSrc, _cleanReleaseBuildArtefactsInSrc, // these are here only as sanity check so as to catch release build minify fails not too late
    createSrcCacheManifest, validatePackageVersions);
exports.buildDebug = series(copyThirdPartyLibs.copyAllDebug, makeLoggerConfig, zipDefaultProjectFiles,
    makeBracketsConcatJS, _compileLessSrc, _cleanReleaseBuildArtefactsInSrc, // these are here only as sanity check so as to catch release build minify fails not too late
    zipSampleProjectFiles, createSrcCacheManifest);
exports.clean = series(cleanDist);
exports.reset = series(cleanAll);

exports.releaseDev = series(cleanDist, exports.buildDebug, makeBracketsConcatJS, _compileLessSrc,
    makeDistAll, releaseDev,
    createDistCacheManifest, createDistTest, _cleanReleaseBuildArtefactsInSrc);
exports.releaseStaging = series(cleanDist, exports.build, makeBracketsConcatJS, _compileLessSrc,
    makeDistNonJS, makeJSDist, _renameBracketsConcatAsBracketsJSInDist, _patchMinifiedCSSInDistIndex, releaseStaging,
    createDistCacheManifest, createDistTest, _cleanReleaseBuildArtefactsInSrc);
exports.releaseProd = series(cleanDist, exports.build, makeBracketsConcatJS, _compileLessSrc,
    makeDistNonJS, makeJSDist, _renameBracketsConcatAsBracketsJSInDist, _patchMinifiedCSSInDistIndex, releaseProd,
    createDistCacheManifest, createDistTest, _cleanReleaseBuildArtefactsInSrc);
exports.serve = series(exports.build, serve);
exports.zipTestFiles = series(zipTestFiles);
exports.serveExternal = series(exports.build, serveExternal);
exports.createJSDocs = series(cleanDocs, createJSDocs, generateDocIndex);
exports.translateStrings = series(translateStrings);
exports.default = series(exports.build);
exports.patchVersionBump = series(patchVersionBump);
exports.majorVersionBump = series(majorVersionBump);
