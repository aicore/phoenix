/*
 * GNU AGPL-3.0 License
 *
 * Copyright (c) 2021 - present core.ai . All rights reserved.
 * Original work Copyright (c) 2012 - 2021 Adobe Systems Incorporated. All rights reserved.
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

// @INCLUDE_IN_API_DOCS

/**
 * ProjectManager glues together the project model and file tree view and integrates as needed with other parts
 * of Brackets. It is responsible for creating and updating the project tree when projects are opened
 * and when changes occur to the file tree.
 *
 * This module dispatches these events:
 *    - beforeProjectClose -- before `_projectRoot` changes, but working set files still open
 *    - projectClose       -- *just* before `_projectRoot` changes; working set already cleared
 *      & project root unwatched
 *    - beforeAppClose     -- before Brackets quits entirely
 *    - projectOpen        -- after `_projectRoot` changes and the tree is re-rendered
 *    - projectRefresh     -- when project tree is re-rendered for a reason other than
 *      a project being opened (e.g. from the Refresh command)
 *
 * To listen for events, do something like this: (see EventDispatcher for details on this pattern)
 *    ProjectManager.on("eventname", handler);
 */

/*global Phoenix, path*/

define(function (require, exports, module) {


    require("utils/Global");

    const _ = require("thirdparty/lodash");

    // Load dependent modules
    const AppInit = require("utils/AppInit"),
        Async = require("utils/Async"),
        PreferencesDialogs = require("preferences/PreferencesDialogs"),
        PreferencesManager = require("preferences/PreferencesManager"),
        DocumentManager = require("document/DocumentManager"),
        MainViewManager = require("view/MainViewManager"),
        CommandManager = require("command/CommandManager"),
        Commands = require("command/Commands"),
        Dialogs = require("widgets/Dialogs"),
        DefaultDialogs = require("widgets/DefaultDialogs"),
        EventDispatcher = require("utils/EventDispatcher"),
        LanguageManager = require("language/LanguageManager"),
        Menus = require("command/Menus"),
        StringUtils = require("utils/StringUtils"),
        Strings = require("strings"),
        FileSystem = require("filesystem/FileSystem"),
        FileViewController = require("project/FileViewController"),
        PerfUtils = require("utils/PerfUtils"),
        FileUtils = require("file/FileUtils"),
        FileSystemError = require("filesystem/FileSystemError"),
        Urls = require("i18n!nls/urls"),
        FileSyncManager = require("project/FileSyncManager"),
        ProjectModel = require("project/ProjectModel"),
        FileTreeView = require("project/FileTreeView"),
        WorkingSetView = require("project/WorkingSetView"),
        ViewUtils = require("utils/ViewUtils"),
        ZipUtils = require("utils/ZipUtils"),
        Metrics = require("utils/Metrics");

    // Needed to ensure that menus are set up when we need them.
    // See #10115
    require("command/DefaultMenus");

    /**
     * @constant {string} EVENT_PROJECT_BEFORE_CLOSE -
     * Event triggered before closing a project.
     */
    const EVENT_PROJECT_BEFORE_CLOSE = "beforeProjectClose";

    /**
     * @constant {string} EVENT_PROJECT_CLOSE -
     * Event triggered when a project is closed.
     */
    const EVENT_PROJECT_CLOSE = "projectClose";

    /**
     * @constant {string} EVENT_PROJECT_OPEN_FAILED -
     * Event triggered when opening a project fails.
     */
    const EVENT_PROJECT_OPEN_FAILED = "projectFileOpenFailed";

    /**
     * @constant {string} EVENT_PROJECT_OPEN -
     * Event triggered when a project is opened.
     */
    const EVENT_PROJECT_OPEN = "projectOpen";

    /**
     * @constant {string} EVENT_AFTER_PROJECT_OPEN -
     * Event triggered after a project is opened.
     */
    const EVENT_AFTER_PROJECT_OPEN = "afterProjectOpen";

    /**
     * @constant {string} EVENT_AFTER_STARTUP_FILES_LOADED - 
     * Event triggered after startup files passed in from the OS or CLI are loaded.
     * This may be triggered before any extensions are loaded, so check for isStartupFilesLoaded().
     */
    const EVENT_AFTER_STARTUP_FILES_LOADED = "startupFilesLoaded";

    /**
     * @constant {string} EVENT_PROJECT_REFRESH -
     * Event triggered when a project is refreshed.
     */
    const EVENT_PROJECT_REFRESH = "projectRefresh";

    /**
     * @constant {string} EVENT_CONTENT_CHANGED -
     * Event triggered when the content of a project changes.
     */
    const EVENT_CONTENT_CHANGED = "contentChanged";

    /**
     * @constant {string} EVENT_PROJECT_FILE_CHANGED -
     * Event that captures all file/folder changes in projects except renames.
     * For tracking renames, use EVENT_PROJECT_PATH_CHANGED_OR_RENAMED or EVENT_PROJECT_FILE_RENAMED.
     */
    const EVENT_PROJECT_FILE_CHANGED = "projectFileChanged";

    /**
     * @constant {string} EVENT_PROJECT_FILE_RENAMED -
     * Event triggered when a project file is renamed.
     */
    const EVENT_PROJECT_FILE_RENAMED = "projectFileRenamed";

    /**
     * @constant {string} EVENT_PROJECT_CHANGED_OR_RENAMED_PATH -
     * Event triggered when a project's path changes or is renamed.
     * All events returned will be related to a path.
     */
    const EVENT_PROJECT_CHANGED_OR_RENAMED_PATH = "projectChangedPath";


    /**
     * Sets the leak threshold for the EVENT_PROJECT_OPEN event.
     * @function
     * @param {string} EVENT_PROJECT_OPEN - The event to set the leak threshold for.
     * @param {number} 25 - The threshold value for the event leak.
     */
    EventDispatcher.setLeakThresholdForEvent(EVENT_PROJECT_OPEN, 25);

    /**
     * @constant {string} CLIPBOARD_SYNC_KEY -
     * Key used for synchronizing the clipboard in Phoenix.
     */
    const CLIPBOARD_SYNC_KEY = "phoenix.clipboard";

    /**
     * @private
     * Filename to use for project settings files.
     * @type {string}
     */
    const SETTINGS_FILENAME = "." + PreferencesManager.SETTINGS_FILENAME,
        SETTINGS_FILENAME_BRACKETS = "." + PreferencesManager.SETTINGS_FILENAME_BRACKETS;

    /**
     * Name of the preferences for sorting directories first
     *
     * @type {string}
     */
    var SORT_DIRECTORIES_FIRST = "sortDirectoriesFirst";

    /**
     * @private
     * Forward declarations to make JSLint happy.
     */
    var _fileSystemChange,
        _fileSystemRename,
        _showErrorDialog,
        _saveTreeState,
        _renderTreeSync,
        _renderTree;

    /**
     * @const
     * @private
     * Error context to show the correct error message
     * @type {int}
     */
    const ERR_TYPE_CREATE = 1,
        ERR_TYPE_CREATE_EXISTS = 2,
        ERR_TYPE_RENAME = 3,
        ERR_TYPE_DELETE = 4,
        ERR_TYPE_LOADING_PROJECT = 5,
        ERR_TYPE_LOADING_PROJECT_NATIVE = 6,
        ERR_TYPE_MAX_FILES = 7,
        ERR_TYPE_OPEN_DIALOG = 8,
        ERR_TYPE_INVALID_FILENAME = 9,
        ERR_TYPE_MOVE = 10,
        ERR_TYPE_PASTE = 11,
        ERR_TYPE_PASTE_FAILED = 12,
        ERR_TYPE_DUPLICATE_FAILED = 13,
        ERR_TYPE_DOWNLOAD_FAILED = 14;

    /**
     * @private
     * Reference to the tree control container div. Initialized by
     * htmlReady handler
     * @type {jQueryObject}
     */
    var $projectTreeContainer;

    /**
     * @private
     *
     * Reference to the container of the Preact component. Everything in this
     * node is managed by Preact.
     * @type {Element}
     */
    var fileTreeViewContainer;

    /**
     * @private
     *
     * Does the file tree currently have the focus?
     *
     * @return {boolean} `true` if the file tree has the focus
     */
    function _hasFileSelectionFocus() {
        return FileViewController.getFileSelectionFocus() === FileViewController.PROJECT_MANAGER;
    }

    /**
     * @private
     * Singleton ProjectModel object.
     * @type {ProjectModel.ProjectModel}
     */
    var model = new ProjectModel.ProjectModel({
        focused: _hasFileSelectionFocus()
    });

    /**
     * @private
     * @type {boolean}
     * A flag to remember when user has been warned about too many files, so they
     * are only warned once per project/session.
     */
    var _projectWarnedForTooManyFiles = false;

    /**
     * @private
     *
     * Event handler which displays an error based on a problem creating a file.
     *
     * @param {$.Event} e jQuery event object
     * @param {{type:any,isFolder:boolean}} errorInfo Information passed in the error events
     */
    function _displayCreationError(e, errorInfo) {
        window.setTimeout(function () {
            var error = errorInfo.type,
                isFolder = errorInfo.isFolder,
                name = errorInfo.name;

            if (error === FileSystemError.ALREADY_EXISTS) {
                _showErrorDialog(ERR_TYPE_CREATE_EXISTS, isFolder, null, name);
            } else if (error === ProjectModel.ERROR_INVALID_FILENAME) {
                _showErrorDialog(ERR_TYPE_INVALID_FILENAME, isFolder, ProjectModel._invalidChars);
            } else {
                var errString = error === FileSystemError.NOT_WRITABLE ?
                    Strings.NO_MODIFICATION_ALLOWED_ERR :
                    StringUtils.format(Strings.GENERIC_ERROR, error);

                _showErrorDialog(ERR_TYPE_CREATE, isFolder, errString, name).getPromise();
            }
        }, 10);
    }

    /**
     * @private
     *
     * Reverts to the previous selection (useful if there's an error).
     *
     * @param {string|File} previousPath The previously selected path.
     * @param {boolean} switchToWorkingSet True if we need to switch focus to the Working Set
     */
    function _revertSelection(previousPath, switchToWorkingSet) {
        model.setSelected(previousPath);
        if (switchToWorkingSet) {
            FileViewController.setFileViewFocus(FileViewController.WORKING_SET_VIEW);
        }
    }

    /**
     * @constructor
     * @private
     *
     * Manages the interaction between the view and the model. This is loosely structured in
     * the style of [Flux](https://github.com/facebook/flux), but the initial implementation did
     * not need all of the parts of Flux yet. This ActionCreator could be replaced later with
     * a real ActionCreator that talks to a Dispatcher.
     *
     * Most of the methods just delegate to the ProjectModel. Some are responsible for integration
     * with other parts of Brackets.
     *
     * @param {ProjectModel} model store (in Flux terminology) with the project data
     */
    function ActionCreator(model) {
        this.model = model;
        this._bindEvents();
    }

    /**
     * @private
     *
     * Listen to events on the ProjectModel and cause the appropriate behavior within the rest of the system.
     */
    ActionCreator.prototype._bindEvents = function () {

        // Change events are the standard Flux signal to rerender the view. Note that
        // current Flux style is to have the view itself listen to the Store for change events
        // and re-render itself.
        this.model.on(ProjectModel.EVENT_CHANGE, function () {
            _renderTree();
        });

        // The "should select" event signals that we need to open the document based on file tree
        // activity.
        this.model.on(ProjectModel.EVENT_SHOULD_SELECT, function (e, data) {
            if (data.add) {
                FileViewController.openFileAndAddToWorkingSet(data.path).fail(_.partial(_revertSelection, data.previousPath, !data.hadFocus));
            } else {
                FileViewController.openAndSelectDocument(data.path, FileViewController.PROJECT_MANAGER).fail(_.partial(_revertSelection, data.previousPath, !data.hadFocus));
            }
        });

        this.model.on(ProjectModel.EVENT_SHOULD_FOCUS, function () {
            FileViewController.setFileViewFocus(FileViewController.PROJECT_MANAGER);
        });

        this.model.on(ProjectModel.ERROR_CREATION, _displayCreationError);
    };

    /**
     * Sets the directory at the given path to open in the tree and saves the open nodes to view state.
     *
     * See `ProjectModel.setDirectoryOpen`
     */
    ActionCreator.prototype.setDirectoryOpen = function (path, open) {
        this.model.setDirectoryOpen(path, open).then(_saveTreeState);
    };

    /**
     * See `ProjectModel.setSelected`
     */
    ActionCreator.prototype.setSelected = function (path, doNotOpen) {
        this.model.setSelected(path, doNotOpen);
    };

    /**
     * See `ProjectModel.selectInWorkingSet`
     */
    ActionCreator.prototype.selectInWorkingSet = function (path) {
        this.model.selectInWorkingSet(path);
    };

    /**
     * See `FileViewController.openWithExternalApplication`
     */
    ActionCreator.prototype.openWithExternalApplication = function (path) {
        FileViewController.openWithExternalApplication(path);
    };


    /**
     * See `ProjectModel.setContext`
     */
    ActionCreator.prototype.setContext = function (path) {
        this.model.setContext(path);
    };

    /**
     * See `ProjectModel.restoreContext`
     */
    ActionCreator.prototype.restoreContext = function () {
        this.model.restoreContext();
    };

    /**
     * See `ProjectModel.startRename`
     */
    ActionCreator.prototype.startRename = function (path, isMoved) {
        // This is very not Flux-like, which is a sign that Flux may not be the
        // right choice here *or* that this architecture needs to evolve subtly
        // in how errors are reported (more like the create case).
        // See #9284.
        renameItemInline(path, isMoved);
    };

    /**
     * See `ProjectModel.setRenameValue`
     */
    ActionCreator.prototype.setRenameValue = function (path) {
        this.model.setRenameValue(path);
    };

    /**
     * See `ProjectModel.cancelRename`
     */
    ActionCreator.prototype.cancelRename = function () {
        this.model.cancelRename();
    };

    /**
     * See `ProjectModel.performRename`
     */
    ActionCreator.prototype.performRename = function () {
        return this.model.performRename();
    };

    /**
     * See `ProjectModel.startCreating`
     */
    ActionCreator.prototype.startCreating = function (basedir, newName, isFolder) {
        return this.model.startCreating(basedir, newName, isFolder);
    };

    /**
     * See `ProjectModel.setSortDirectoriesFirst`
     */
    ActionCreator.prototype.setSortDirectoriesFirst = function (sortDirectoriesFirst) {
        this.model.setSortDirectoriesFirst(sortDirectoriesFirst);
    };

    /**
     * See `ProjectModel.setFocused`
     */
    ActionCreator.prototype.setFocused = function (focused) {
        this.model.setFocused(focused);
    };

    /**
     * See `ProjectModel.setCurrentFile`
     */
    ActionCreator.prototype.setCurrentFile = function (curFile) {
        this.model.setCurrentFile(curFile);
    };

    /**
     * See `ProjectModel.toggleSubdirectories`
     */
    ActionCreator.prototype.toggleSubdirectories = function (path, openOrClose) {
        this.model.toggleSubdirectories(path, openOrClose).then(_saveTreeState);
    };

    /**
     * See `ProjectModel.closeSubtree`
     */
    ActionCreator.prototype.closeSubtree = function (path) {
        this.model.closeSubtree(path);
        _saveTreeState();
    };

    /**
     * Closes open menus and sets the context to null when dragging an item;
     * also closes the directory if the dragged item is a directory.
     * @param {string} path
     */
    ActionCreator.prototype.dragItem = function (path) {
        // Close open menus on drag and clear the context, but only if there's a menu open.
        if ($(".dropdown.open").length > 0) {
            Menus.closeAll();
            this.setContext(null);
        }

        // Close directory, if dragged item is directory
        if (_.last(path) === '/') {
            this.setDirectoryOpen(path, false);
        }
    };

    /**
     * Moves the item in the oldPath to the newDirectory directory
     * @param {string} oldPath the oldpath of the item
     * @param {string} newDirectory the new directory where the item is to be moved
     */
    ActionCreator.prototype.moveItem = function (oldPath, newDirectory) {
        var fileName = FileUtils.getBaseName(oldPath),
            newPath = newDirectory + fileName,
            self = this;

        // If item dropped onto itself or onto its parent directory, return
        if (oldPath === newDirectory || FileUtils.getParentPath(oldPath) === newDirectory) {
            return;
        }

        // Add trailing slash if directory is moved
        if (_.last(oldPath) === '/') {
            newPath = ProjectModel._ensureTrailingSlash(newPath);
        }

        this.startRename(oldPath, true);
        this.setRenameValue(newPath);

        this.performRename();
        this.setDirectoryOpen(newDirectory, true);
    };

    /**
     * See `ProjectModel.refresh`
     */
    ActionCreator.prototype.refresh = function () {
        this.model.refresh();
    };

    /**
     * @private
     * @type {ActionCreator}
     *
     * Singleton actionCreator that is used for dispatching changes to the ProjectModel.
     */
    var actionCreator = new ActionCreator(model);

    /**
     * Returns the File or Directory corresponding to the item that was right-clicked on in the file tree menu.
     * @return {?(File|Directory)}
     */
    function getFileTreeContext() {
        var selectedEntry = model.getContext();
        return selectedEntry;
    }

    /**
     * Returns the File or Directory corresponding to the item selected in the sidebar panel, whether in
     * the file tree OR in the working set; or null if no item is selected anywhere in the sidebar.
     * May NOT be identical to the current Document - a folder may be selected in the sidebar, or the sidebar may not
     * have the current document visible in the tree & working set.
     * @return {?(File|Directory)}
     */
    function getSelectedItem() {
        // Prefer file tree context, then file tree selection, else use working set
        var selectedEntry = getFileTreeContext();
        if (!selectedEntry) {
            selectedEntry = model.getSelected();
        }
        if (!selectedEntry) {
            selectedEntry = MainViewManager.getCurrentlyViewedFile();
        }
        return selectedEntry;
    }

    /**
     * @private
     *
     * Handler for changes in the focus between working set and file tree view.
     */
    function _fileViewControllerChange() {
        actionCreator.setFocused(_hasFileSelectionFocus());
        _renderTree();
    }

    /**
     * @private
     *
     * Handler for changes in document selection.
     */
    function _documentSelectionFocusChange() {
        var curFullPath = MainViewManager.getCurrentlyViewedPath(MainViewManager.ACTIVE_PANE);
        if (curFullPath && _hasFileSelectionFocus()) {
            actionCreator.setSelected(curFullPath, true);
        } else {
            actionCreator.setSelected(null);
        }
        _fileViewControllerChange();
    }

    /**
     * @private
     *
     * Handler for changes to which file is currently viewed.
     *
     * @param {Object} e jQuery event object
     * @param {File} curFile Currently viewed file.
     */
    function _currentFileChange(e, curFile) {
        actionCreator.setCurrentFile(curFile);
    }

    /**
     * Returns the encoded Base URL of the currently loaded project, or empty string if no project
     * is open (during startup, or running outside of app shell).
     * @return {String}
     */
    function getBaseUrl() {
        return model.getBaseUrl();
    }

    /**
     * Sets the encoded Base URL of the currently loaded project.
     * @param {String}
     */
    function setBaseUrl(projectBaseUrl) {
        projectBaseUrl = model.setBaseUrl(projectBaseUrl);

        PreferencesManager.setViewState("project.baseUrl", projectBaseUrl, PreferencesManager.STATE_PROJECT_CONTEXT);
    }

    /**
     * Returns true if absPath lies within the project, false otherwise.
     * Does not support paths containing ".."
     * @param {string|FileSystemEntry} absPathOrEntry
     * @return {boolean}
     */
    function isWithinProject(absPathOrEntry) {
        return model.isWithinProject(absPathOrEntry);
    }

    /**
     * Returns an array of files that is within the project from the supplied list of paths.
     * @param {string|FileSystemEntry[]} absPathOrEntryArray array which can be either a string path or FileSystemEntry
     * @return {string|FileSystemEntry[]} A array that contains only files paths that are in the project
     */
    function filterProjectFiles(absPathOrEntryArray) {
        if (!absPathOrEntryArray) {
            return absPathOrEntryArray;
        }
        let filteredPaths = [];
        absPathOrEntryArray.forEach(function (file) {
            if (isWithinProject(file)) {
                filteredPaths.push(file);
            }
        });
        return filteredPaths;
    }

    /**
     * If absPath lies within the project, returns a project-relative path. Else returns absPath
     * unmodified.
     * Does not support paths containing ".."
     * @param {!string} absPath
     * @return {!string}
     */
    function makeProjectRelativeIfPossible(absPath) {
        return model.makeProjectRelativeIfPossible(absPath);
    }

    /**
     * Gets a generally displayable path that can be shown to the user in most cases.
     * Gets the project relative path if possible. If paths is not in project, then if its a platform path(Eg. in tauri)
     * it will return the full platform path. If not, then it will return a mount relative path for fs access mount
     * folders opened in the bowser. at last, falling back to vfs path. This should only be used for display purposes
     * as this path will be changed by phcode depending on the situation in the future.
     * @param fullPath
     * @returns {string}
     */
    function getProjectRelativeOrDisplayPath(fullPath) {
        return Phoenix.app.getDisplayPath(makeProjectRelativeIfPossible(fullPath));
    }

    /**
     * Returns the root folder of the currently loaded project, or null if no project is open (during
     * startup, or running outside of app shell).
     * @return {Directory}
     */
    function getProjectRoot() {
        return model.projectRoot;
    }

    /**
     * @private
     *
     * Sets the project root to the given directory, resetting the ProjectModel and file tree in the process.
     *
     * @param {Directory} rootEntry directory object for the project root
     * @return {$.Promise} resolved when the project is done setting up
     */
    function _setProjectRoot(rootEntry) {
        var d = new $.Deferred();
        model.setProjectRoot(rootEntry).then(function () {
            d.resolve();
            model.reopenNodes(PreferencesManager.getViewState("project.treeState", PreferencesManager.STATE_PROJECT_CONTEXT));
        });
        return d.promise();
    }

    /**
     * @private
     *
     * Saves the project path.
     */
    var _saveProjectPath = function () {
        // save the current project
        PreferencesManager.setViewState("projectPath", model.projectRoot.fullPath);
    };

    /**
     * @private
     * Save tree state.
     */
    _saveTreeState = function () {
        const openNodes = model.getOpenNodes();

        // Store the open nodes by their full path and persist to storage
        PreferencesManager.setViewState("project.treeState", openNodes, PreferencesManager.STATE_PROJECT_CONTEXT);
    };

    /**
     * @private
     *
     * Displays an error dialog for problems when working with files in the file tree.
     *
     * @param {number} errType type of error that occurred
     * @param {boolean} isFolder did the error occur because of a folder operation?
     * @param {string} error message with detail about the error
     * @param {string} path path to file or folder that had the error
     * @return {Dialog|null} Dialog if the error message was created
     */
    _showErrorDialog = function (errType, isFolder, error, path, dstPath) {
        var titleType = isFolder ? Strings.DIRECTORY_TITLE : Strings.FILE_TITLE,
            entryType = isFolder ? Strings.DIRECTORY : Strings.FILE,
            title,
            message;
        path = StringUtils.breakableUrl(path);

        switch (errType) {
            case ERR_TYPE_CREATE:
                title = StringUtils.format(Strings.ERROR_CREATING_FILE_TITLE, titleType);
                message = StringUtils.format(Strings.ERROR_CREATING_FILE, entryType, path, error);
                break;
            case ERR_TYPE_CREATE_EXISTS:
                title = StringUtils.format(Strings.INVALID_FILENAME_TITLE, titleType);
                message = StringUtils.format(Strings.ENTRY_WITH_SAME_NAME_EXISTS, path);
                break;
            case ERR_TYPE_RENAME:
                title = StringUtils.format(Strings.ERROR_RENAMING_FILE_TITLE, titleType);
                message = StringUtils.format(Strings.ERROR_RENAMING_FILE, path, error, entryType);
                break;
            case ERR_TYPE_MOVE:
                title = StringUtils.format(Strings.ERROR_MOVING_FILE_TITLE, titleType);
                message = StringUtils.format(Strings.ERROR_MOVING_FILE, path, error, entryType);
                break;
            case ERR_TYPE_DELETE:
                title = StringUtils.format(Strings.ERROR_DELETING_FILE_TITLE, titleType);
                message = StringUtils.format(Strings.ERROR_DELETING_FILE, path, error, entryType);
                break;
            case ERR_TYPE_LOADING_PROJECT:
                title = Strings.ERROR_LOADING_PROJECT;
                message = StringUtils.format(Strings.READ_DIRECTORY_ENTRIES_ERROR, path, error);
                break;
            case ERR_TYPE_LOADING_PROJECT_NATIVE:
                title = Strings.ERROR_LOADING_PROJECT;
                message = StringUtils.format(Strings.REQUEST_NATIVE_FILE_SYSTEM_ERROR, path, error);
                break;
            case ERR_TYPE_MAX_FILES:
                title = Strings.ERROR_MAX_FILES_TITLE;
                message = Strings.ERROR_MAX_FILES;
                break;
            case ERR_TYPE_OPEN_DIALOG:
                title = Strings.ERROR_LOADING_PROJECT;
                message = StringUtils.format(Strings.OPEN_DIALOG_ERROR, error);
                break;
            case ERR_TYPE_INVALID_FILENAME:
                title = StringUtils.format(Strings.INVALID_FILENAME_TITLE, isFolder ? Strings.DIRECTORY_NAME : Strings.FILENAME);
                message = StringUtils.format(Strings.INVALID_FILENAME_MESSAGE, isFolder ? Strings.DIRECTORY_NAMES_LEDE : Strings.FILENAMES_LEDE, error);
                break;
            case ERR_TYPE_PASTE:
                title = StringUtils.format(Strings.CANNOT_PASTE_TITLE, titleType);
                message = StringUtils.format(Strings.ENTRY_WITH_SAME_NAME_EXISTS, path);
                break;
            case ERR_TYPE_PASTE_FAILED:
                title = StringUtils.format(Strings.CANNOT_PASTE_TITLE, titleType);
                message = StringUtils.format(Strings.ERR_TYPE_PASTE_FAILED, path, dstPath);
                break;
            case ERR_TYPE_DUPLICATE_FAILED:
                title = StringUtils.format(Strings.CANNOT_DUPLICATE_TITLE, titleType);
                message = StringUtils.format(Strings.ERR_TYPE_DUPLICATE_FAILED, path);
                break;
            case ERR_TYPE_DOWNLOAD_FAILED:
                title = StringUtils.format(Strings.CANNOT_DOWNLOAD_TITLE, titleType);
                message = StringUtils.format(Strings.ERR_TYPE_DOWNLOAD_FAILED, path);
                break;
        }

        if (title && message) {
            return Dialogs.showModalDialog(
                DefaultDialogs.DIALOG_ID_ERROR,
                title,
                message
            );
        }
        return null;
    };

    /**
     * The debounce time in milliseconds for rendering operations.
     * @private
     */
    var _RENDER_DEBOUNCE_TIME = 100;

    /**
     * @private
     *
     * Rerender the file tree view.
     *
     * @param {boolean} forceRender Force the tree to rerender. Should only be needed by extensions that call rerenderTree.
     */
    _renderTreeSync = function (forceRender) {
        var projectRoot = getProjectRoot();
        if (!projectRoot) {
            return;
        }
        model.setScrollerInfo($projectTreeContainer[0].scrollWidth, $projectTreeContainer.scrollTop(), $projectTreeContainer.scrollLeft(), $projectTreeContainer.offset().top);
        FileTreeView.render(fileTreeViewContainer, model._viewModel, projectRoot, actionCreator, forceRender, brackets.platform);
    };

    _renderTree = _.debounce(_renderTreeSync, _RENDER_DEBOUNCE_TIME);

    /**
     * @private
     *
     * Returns the full path to the welcome project, which we open on first launch.
     *
     * @param {string} sampleUrl URL for getting started project
     * @param {string} initialPath Path to Brackets directory (see FileUtils.getNativeBracketsDirectoryPath())
     * @return {!string} fullPath reference
     */
    function getWelcomeProjectPath() {
        return ProjectModel._ensureTrailingSlash(Phoenix.VFS.getDefaultProjectDir());
    }

    /**
     * Returns the placeholder path for a project when no project is loaded.
     * @returns {string} The placeholder project path.
     */
    function getPlaceholderProjectPath() {
        return "/no_project_loaded/";
    }

    /**
     * Returns the path to the explore directory within local projects.
     * @returns {string} The path to the explore project directory.
     */
    function getExploreProjectPath() {
        return `${getLocalProjectsPath()}explore/`;
    }

    /**
     * The flder where all the system managed projects live
     * @returns {string}
     */
    function getLocalProjectsPath() {
        return Phoenix.VFS.getUserProjectsDirectory();
    }

    /**
     * Adds the path to the list of welcome projects we've ever seen, if not on the list already.
     *
     * @param {string} path Path to possibly add
     */
    function addWelcomeProjectPath(path) {
        var welcomeProjects = ProjectModel._addWelcomeProjectPath(path,
            PreferencesManager.getViewState("welcomeProjects"));
        PreferencesManager.setViewState("welcomeProjects", welcomeProjects);
    }


    /**
     * Returns true if the given path is the same as one of the welcome projects we've previously opened,
     * or the one for the current build.
     *
     * @param {string} path Path to check to see if it's a welcome project path
     * @return {boolean} true if this is a welcome project path
     */
    function isWelcomeProjectPath(path) {
        return ProjectModel._isWelcomeProjectPath(path, getWelcomeProjectPath(), PreferencesManager.getViewState("welcomeProjects"));
    }

    /**
     * If the provided path is to an old welcome project, returns the current one instead.
     * @param {string} path Path to get the welcome project path
     * @return {string} current welcome project path
     */
    function updateWelcomeProjectPath(path) {
        if (isWelcomeProjectPath(path)) {
            return getWelcomeProjectPath();
        }
        return path;

    }

    /**
     * @deprecated use getStartupProjectPath instead. Can be removed anytime after 2-Apr-2023.
     * Initial project path is stored in prefs, which defaults to the welcome project on
     * first launch.
     */
    function getInitialProjectPath() {
        return updateWelcomeProjectPath(PreferencesManager.getViewState("projectPath"));
    }

    /**
     * Responsible to check whether dir exists
     * @private
     * @param {string} fullPath the path to the directory
     * @returns {boolean} if dir returns true else false
     */
    async function _dirExists(fullPath) {
        try {
            const { entry } = await FileSystem.resolveAsync(fullPath);
            return entry.isDirectory;
        } catch (e) {
            return false;
        }
    }

    /**
     * Safely checks if a folder exists and returns its path.
     * @private
     * @param {string} absOrRelativePath - Absolute or relative path of the folder to check.
     * @param {string|null} relativeToDir - Optional base directory for relative paths.
     * @returns {Promise<string|null>} - The folder path if it exists, otherwise `null`.
     */
    async function _safeCheckFolder(absOrRelativePath, relativeToDir = null) {
        try {
            let folderToOpen;
            if (!relativeToDir) {
                folderToOpen = Phoenix.VFS.getTauriVirtualPath(absOrRelativePath);
                const dirExists = await _dirExists(folderToOpen);
                if (dirExists) {
                    return folderToOpen;
                }
            } else {
                folderToOpen = window.path.join(Phoenix.VFS.getTauriVirtualPath(relativeToDir), absOrRelativePath);
                const dirExists = await _dirExists(folderToOpen);
                if (dirExists) {
                    return folderToOpen;
                }
            }
        } catch (e) {
            console.warn("error opening folder at path", absOrRelativePath, relativeToDir);
        }
        return null;
    }


    /**
     * Retrieves the startup project folder from command line arguments.
     *
     * @private
     * @returns {Promise<string|null>} - The folder path if found and valid, otherwise `null`.
     */
    async function _getStartupProjectFromCLIArgs() {
        const cliArgs = await Phoenix.app.getCommandLineArgs();
        const args = cliArgs && cliArgs.args,
            cwd = cliArgs && cliArgs.cwd;
        if (!args || args.length <= 1) { // the second arg is the folder we have to open
            return null;
        }
        try {
            let folderToOpen = args[1];
            folderToOpen = await _safeCheckFolder(args[1]);
            if (folderToOpen) {
                Metrics.countEvent(Metrics.EVENT_TYPE.PLATFORM, 'openWith', "folder");
                return folderToOpen;
            }
            folderToOpen = await _safeCheckFolder(args[1], cwd);
            if (folderToOpen) {
                Metrics.countEvent(Metrics.EVENT_TYPE.PLATFORM, 'openWith', "folder");
            }
            return folderToOpen;
        } catch (e) {
            console.error("Error getting startupProjectPath from CLI args", e);
        }
        return null;
    }

    /**
     * Initial project path is stored in prefs, which defaults to the welcome project on
     * first launch.
     * @return {string} welcome/startup project path
     */
    async function getStartupProjectPath() {
        let startupProjectPath = await _getStartupProjectFromCLIArgs();
        if (startupProjectPath) {
            return startupProjectPath;
        }
        startupProjectPath = updateWelcomeProjectPath(PreferencesManager.getViewState("projectPath"));
        if (startupProjectPath && _isProjectSafeToStartup(startupProjectPath)) {
            const dirExists = await _dirExists(startupProjectPath);
            if (dirExists) {
                return startupProjectPath;
            }
        }
        return getWelcomeProjectPath();
    }

    /**
     * Merges multiple `.gitignore` files into a single file, adjusting child patterns 
     * to be relative to the project root.
     * @private
     * @param {string} rootPath - The root path of the project.
     * @param {Array} gitIgnoreFilters - An array of objects containing `.gitignore` content and base paths.
     * gitIgnoreFilters[].gitIgnoreContent - The content of a `.gitignore` file.
     * gitIgnoreFilters[].basePath - The base path where the `.gitignore` resides.
     * @returns {string} - The merged `.gitignore` content with adjusted paths.
     */
    function _mergeProjectGitIgnores(rootPath, gitIgnoreFilters) {
        // this is an approximation to the gitIgnore spec to transform child git ignores to be
        // relative to the project root.
        let mergedGitIgnoreFile = "";
        for (let filter of gitIgnoreFilters) {
            if (!filter.gitIgnoreContent) {
                continue;
            }
            const projectRelativePath = makeProjectRelativeIfPossible(filter.basePath);
            if (!projectRelativePath) {
                // this is the .gitignore file in the root folder, do nothing.
                mergedGitIgnoreFile = `${mergedGitIgnoreFile}\n${filter.gitIgnoreContent}`;
            } else {
                let lines = [];
                // Transform each line to be relative to the project directory
                for (let line of filter.gitIgnoreContent.split('\n')) {
                    if (!line.trim() || line.startsWith('#')) {
                        lines.push(line); // empty lines and comments push as is
                    } else {
                        // Handle negated patterns like `!node_modules`
                        const isNegated = line.startsWith('!');
                        const pattern = isNegated ? line.substring(1) : line;
                        // Patterns starting with a slash are relative to the .gitignore's directory
                        if (line.startsWith('/')) {
                            // Remove the leading '/' to correct the path for the new location
                            lines.push(`${isNegated ? '!' : ''}${projectRelativePath}${pattern.substring(1)}`);
                        } else {
                            // For patterns without a leading '/', check if it's a directory-specific pattern
                            if (line.endsWith('/') && (line.match(/\//g) || []).length === 1) {
                                // This checks both if the line ends with a slash
                                // and if there's only one slash in the line, indicating it's
                                // a top-level directory pattern.. Eg. `dir/`
                                lines.push(`${isNegated ? '!' : ''}${projectRelativePath}**/${pattern}`);
                            } else {
                                // 1. this is a rule of the form `sub/dir/`, which should match exact sub dir
                                // and children according to git spec
                                // 2. For global patterns like `sub/dir/other` or `sub/dir/other.txt`
                                lines.push(`${isNegated ? '!' : ''}${projectRelativePath}${pattern}`);
                            }
                        }
                    }
                }
                mergedGitIgnoreFile = `${mergedGitIgnoreFile}\n${lines.join('\n')}`;
            }
        }
        return mergedGitIgnoreFile;
    }

    /**
     * @private
     *
     * Watches the project for filesystem changes so that the tree can be updated.
     */
    async function _watchProjectRoot(rootPath) {
        FileSystem.on("change", _fileSystemChange);
        FileSystem.on("rename", _fileSystemRename);
        let gitIgnoreContent = _mergeProjectGitIgnores(rootPath, await model.computeProjectGitIgnoreAsync());
        const gitIgnoreFilter = `${gitIgnoreContent}\n${ProjectModel.defaultIgnoreGlobs.join("\n")}`;
        FileSystem.watch(FileSystem.getDirectoryForPath(rootPath),
            ProjectModel._shouldShowName, gitIgnoreFilter, function (err) {
                if (err === FileSystemError.TOO_MANY_ENTRIES) {
                    if (!_projectWarnedForTooManyFiles) {
                        _showErrorDialog(ERR_TYPE_MAX_FILES);
                        _projectWarnedForTooManyFiles = true;
                    }
                } else if (err) {
                    console.error("Error watching project root: ", rootPath, err);
                }
            });

        // Reset allFiles cache
        model._resetCache();
    }


    /**
     * @private
     * Close the file system and remove listeners.
     * @return {$.Promise} A promise that's resolved when the root is unwatched. Rejected if
     *     there is no project root or if the unwatch fails.
     */
    function _unwatchProjectRoot() {
        var result = new $.Deferred();
        if (!model.projectRoot) {
            result.reject();
        } else {
            FileSystem.off("change", _fileSystemChange);
            FileSystem.off("rename", _fileSystemRename);

            FileSystem.unwatch(model.projectRoot, function (err) {
                if (err) {
                    console.error("Error unwatching project root: ", model.projectRoot.fullPath, err);
                    result.reject(err);
                } else {
                    result.resolve();
                }
            });

            // Reset allFiles cache
            model._resetCache();
        }

        return result.promise();
    }

    /**
     * Preference status constants.
     *
     * @constant {string} PREF_OK - Indicates the preference file was loaded successfully.
     * @constant {string} PREF_JSON_ERR - Indicates a JSON parsing error in the preference file.
     * @constant {string} PREF_NO_FILE - Indicates the preference file does not exist.
     */
    const PREF_OK = "prefOK",
        PREF_JSON_ERR = "jsonERR",
        PREF_NO_FILE = "noFile";


    /**
     * Validates a project preferences file by checking if it exists and contains valid JSON.
     * @private
     * @param {string} filePath - The path to the preferences file.
     * @returns {Promise<string>} - A promise that resolves to:
     * - `PREF_OK` if the file exists and contains valid JSON.
     * - `PREF_JSON_ERR` if the file contains invalid JSON.
     * - `PREF_NO_FILE` if the file does not exist or cannot be read.
     */
    function _validateProjectPreferencesFile(filePath) {
        return new Promise((resolve) => {
            const file = FileSystem.getFileForPath(filePath);
            FileUtils.readAsText(file)
                .done(function (text) {
                    try {
                        if (text) {
                            JSON.parse(text);
                        }
                        resolve(PREF_OK);
                    } catch (err) {
                        resolve(PREF_JSON_ERR);
                    }
                })
                .fail(() => {
                    resolve(PREF_NO_FILE);
                });
        });
    }

    /**
     * @private
     * Reloads the project preferences.
     */
    async function _reloadProjectPreferencesScope() {
        const root = getProjectRoot();
        if (root) {
            const phoenixPrefFile = root.fullPath + SETTINGS_FILENAME,
                bracketsPrefFile = root.fullPath + SETTINGS_FILENAME_BRACKETS;
            const statusPhoenix = await _validateProjectPreferencesFile(phoenixPrefFile);
            const statusBrackets = await _validateProjectPreferencesFile(bracketsPrefFile);
            let prefFileToUse = phoenixPrefFile;
            if (statusPhoenix === PREF_NO_FILE && statusBrackets !== PREF_NO_FILE) {
                prefFileToUse = bracketsPrefFile;
            }
            _alertBrokenPreferenceFile();
            // Alias the "project" Scope to the path Scope for the project-level settings file
            PreferencesManager._setProjectSettingsFile(prefFileToUse);
        } else {
            PreferencesManager._setProjectSettingsFile();
        }
    }

    /**
     * alert shown, defaults to false
     * @private
     */
    let alertIsShown = false;

    /**
     * Alerts the user if the project preferences file is corrupted and opens it for editing.
     *
     * @private
     * @returns {Promise<void>} - Resolves when the alert process completes or if no corrupted file is found.
     */
    async function _alertBrokenPreferenceFile() {
        if (alertIsShown) {
            return;
        }
        //Verify that the project preferences file (.phcode.json or brackets.json) is NOT corrupted.
        //If corrupted, display the error message and open the file in editor for the user to edit.
        const root = getProjectRoot();
        const phoenixPrefFile = root.fullPath + SETTINGS_FILENAME,
            bracketsPrefFile = root.fullPath + SETTINGS_FILENAME_BRACKETS;
        const statusPhoenix = await _validateProjectPreferencesFile(phoenixPrefFile);
        const statusBrackets = await _validateProjectPreferencesFile(bracketsPrefFile);
        let errorPrefFile = null;
        if (statusPhoenix === PREF_JSON_ERR) {
            errorPrefFile = phoenixPrefFile;
        } else if (statusPhoenix === PREF_NO_FILE && statusBrackets === PREF_JSON_ERR) {
            errorPrefFile = bracketsPrefFile;
        } else {
            // no error/no pref file
            return;
        }
        // Cannot parse the text read from the project preferences file.
        const info = MainViewManager.findInAllWorkingSets(errorPrefFile);
        let paneId;
        if (info.length) {
            paneId = info[0].paneId;
        }
        if (alertIsShown) { // due to async functions above, we have to check again
            return;
        }
        alertIsShown = true;
        FileViewController.openFileAndAddToWorkingSet(errorPrefFile, paneId)
            .done(function () {
                Dialogs.showModalDialog(
                    DefaultDialogs.DIALOG_ID_ERROR,
                    Strings.ERROR_PREFS_CORRUPT_TITLE,
                    Strings.ERROR_PROJ_PREFS_CORRUPT
                ).done(function () {
                    // give the focus back to the editor with the pref file
                    alertIsShown = false;
                    MainViewManager.focusActivePane();
                });
            });
    }

    /**
     * Loads an existing project by setting the project root and managing related preferences.
     *
     * @private
     * @param {Object} rootEntry - The root entry of the project containing the full path.
     * @param {string} rootEntry.fullPath - The full path to the project root.
     * @returns {Promise} - A promise that resolves when the project is fully loaded.
     */
    function _loadExistingProject(rootEntry) {
        const rootPath = rootEntry.fullPath;
        const result = new $.Deferred();
        var projectRootChanged = (!model.projectRoot || !rootEntry) ||
            model.projectRoot.fullPath !== rootEntry.fullPath;

        // Success!
        var perfTimerName = PerfUtils.markStart("Load Project: " + rootPath);

        _projectWarnedForTooManyFiles = false;

        _setProjectRoot(rootEntry).always(function () {
            model.setBaseUrl(PreferencesManager.getViewState("project.baseUrl", PreferencesManager.STATE_PROJECT_CONTEXT) || "");

            if (projectRootChanged) {
                _reloadProjectPreferencesScope();
                PreferencesManager._setCurrentFile(rootPath);
            }
            _watchProjectRoot(rootPath);

            // If this is the most current welcome project, record it. In future launches, we want
            // to substitute the latest welcome project from the current build instead of using an
            // outdated one (when loading recent projects or the last opened project).
            if (rootPath === getWelcomeProjectPath()) {
                addWelcomeProjectPath(rootPath);
            }

            if (projectRootChanged) {
                // Allow asynchronous event handlers to finish before resolving result by collecting promises from them
                exports.trigger(EVENT_PROJECT_OPEN, model.projectRoot);
                result.resolve();
                exports.trigger(EVENT_AFTER_PROJECT_OPEN, model.projectRoot);
            } else {
                exports.trigger(EVENT_PROJECT_REFRESH, model.projectRoot);
                result.resolve();
            }
            let projectLoadTime = PerfUtils.addMeasurement(perfTimerName);
            Metrics.valueEvent(Metrics.EVENT_TYPE.PERFORMANCE, "projectLoad",
                "timeMs", Number(projectLoadTime));
        });
        return result.promise();
    }

    /**
     * Sample HTML template
     * @private
     */
    const _SAMPLE_HTML = `<!DOCTYPE html>
<html>
    <head>
        <title>Phoenix Editor for the web</title>
    </head>

    <body>
        <h1>Welcome to Phoenix</h1>
        <p> Modern, Open-source, IDE For The Web.</p>
    </body>
</html>`;


    /**
     * Creates the default Phoenix project if it doesn't already exist.
     * @private
     * @returns {Promise<void>} - A promise that resolves when the default project is created or already exists.
     */
    function _createDefaultProject() {
        // Create phoenix app dirs
        // Create Phoenix default project if it doesnt exist
        return new Promise((resolve, reject) => {
            let projectDir = getWelcomeProjectPath();
            Phoenix.VFS.exists(projectDir, (exists) => {
                if (exists) {
                    resolve();
                    return;
                }
                Phoenix.VFS.ensureExistsDir(projectDir, (err) => {
                    if (err) {
                        window.logger.reportError(err, "Error creating default project");
                        reject(err);
                        return;
                    }
                    let indexFile = Phoenix.VFS.path.normalize(`${projectDir}/index.html`);
                    Phoenix.VFS.fs.writeFile(indexFile, _SAMPLE_HTML, 'utf8', () => { });
                    resolve();
                });
            });
        });
    }

    /**
     * Loads the welcome project, or creates a default/placeholder project if it doesn't exist.
     * @private
     * @returns {Promise<void>} - A promise that resolves when the welcome or 
     * placeholder project is loaded successfully.
     */
    function _loadWelcomeProject() {
        const welcomeProjectPath = getWelcomeProjectPath();
        const result = new $.Deferred();
        const rootEntry = FileSystem.getDirectoryForPath(welcomeProjectPath);

        /**
         * Attempts to load the root entry of the welcome project.
         * @private
         */
        function _loadRootEntry() {
            _loadExistingProject(rootEntry)
                .done(result.resolve)
                .fail(result.reject);
        }

        /**
         * Loads a placeholder project if the welcome project cannot be created.
         * Displays an alert if the placeholder project also fails to initialize.
         * @private
         */
        function _loadPlaceholderProject() {
            // default project could not be created. As a last ditch effort to continue boot, we will
            // use a vfs path `/no_project_loaded` to continue boot.
            Phoenix.VFS.ensureExistsDir(getPlaceholderProjectPath(), (placeHolderErr) => {
                if (placeHolderErr) {
                    window.logger.reportError(placeHolderErr, "Error creating /no_project_loaded");
                    alert("Unrecoverable error, startup project could not be created.");
                    return;
                }
                const placeholderProject = FileSystem.getDirectoryForPath(getPlaceholderProjectPath());
                _loadExistingProject(placeholderProject)
                    .done(result.resolve)
                    .fail(result.reject);
            });
        }

        // Check if the welcome project already exists
        rootEntry.exists(function (err, exists) {
            if (exists) {
                _loadRootEntry();
            } else {
                // create the welcome project only on first boot in desktop builds. The user may delete the phoenix
                // project directory as he doesn't want phoenix folders in his documents. we should respect that.
                if (Phoenix.isNativeApp && !Phoenix.firstBoot) {
                    _loadPlaceholderProject();
                    return;
                }
                _createDefaultProject()
                    .then(_loadRootEntry)
                    .catch(_loadPlaceholderProject);
            }
        });
        return result.promise();
    }

    /**
     * Loads a project from the specified path. If the project doesn't exist,
     * it shows an error dialog and loads the welcome project as a fallback.
     * @private
     * @param {string} rootPath - The path of the project to load.
     * @returns {Promise<void>} - A promise that resolves or rejects based on the project load status.
     */
    function _loadProjectInternal(rootPath) {
        const result = new $.Deferred();
        const rootEntry = FileSystem.getDirectoryForPath(rootPath);
        rootEntry.exists(function (err, exists) {
            if (exists) {
                _loadExistingProject(rootEntry)
                    .done(result.resolve)
                    .fail(result.reject);
            } else {
                console.error("error loading project");
                exports.trigger(EVENT_PROJECT_OPEN_FAILED, rootPath);
                _showErrorDialog(ERR_TYPE_LOADING_PROJECT_NATIVE, true, FileSystemError.NOT_FOUND, rootPath)
                    .done(function () {
                        // Reset _projectRoot to null so that the following _loadProject call won't
                        // run the 'beforeProjectClose' event a second time on the original project,
                        // which is now partially torn down (see #6574).
                        model.projectRoot = null;

                        _loadProject(getWelcomeProjectPath()).always(function () {
                            // Make sure not to reject the original deferred until the fallback
                            // project is loaded, so we don't violate expectations that there is always
                            // a current project before continuing after _loadProject().
                            result.reject();
                        });
                    });
            }
        });
        return result.promise();
    }

    /**
     * Loads the given folder as a project. Does NOT prompt about any unsaved changes - use openProject()
     * instead to check for unsaved changes and (optionally) let the user choose the folder to open.
     * @private
     * @param {!string} rootPath  Absolute path to the root folder of the project.
     *  A trailing "/" on the path is optional (unlike many Brackets APIs that assume a trailing "/").
     * @return {$.Promise} A promise object that will be resolved when the
     *  project is loaded and tree is rendered, or rejected if the project path
     *  fails to load.
     */
    function _loadProject(rootPath) {

        Metrics.valueEvent(Metrics.EVENT_TYPE.PROJECT, "Load",
            isWelcomeProjectPath(rootPath) ? "default" : "other", 1);

        // Some legacy code calls this API with a non-canonical path
        rootPath = ProjectModel._ensureTrailingSlash(rootPath);

        if (model.projectRoot && model.projectRoot.fullPath === rootPath) {
            return (new $.Deferred()).resolve().promise();
        }

        // About to close current project (if any)
        if (model.projectRoot) {
            exports.trigger(EVENT_PROJECT_BEFORE_CLOSE, model.projectRoot);
        }

        // close all the old files
        MainViewManager._closeAll(MainViewManager.ALL_PANES);

        _unwatchProjectRoot().fail(console.error);

        if (model.projectRoot) {
            LanguageManager._resetPathLanguageOverrides();
            PreferencesManager._reloadUserPrefs(model.projectRoot);
            exports.trigger(EVENT_PROJECT_CLOSE, model.projectRoot);
        }
        if (rootPath === getWelcomeProjectPath()) {
            // welcome project path is always guaranteed to be present!
            return _loadWelcomeProject();
        }
        return _loadProjectInternal(rootPath);
    }

    /**
     * @const
     * @private
     * @type {number} Minimum delay in milliseconds between calls to refreshFileTree
     */
    var _refreshDelay = 1000;

    /**
     * Refresh the project's file tree, maintaining the current selection.
     *
     * Note that the original implementation of this returned a promise to be resolved when the refresh is complete.
     * That use is deprecated and `refreshFileTree` is now a "fire and forget" kind of function.
     */
    var refreshFileTree = function refreshFileTree() {
        FileSystem.clearAllCaches();
        return new $.Deferred().resolve().promise();
    };

    /**
     * Displays the folders first, before the files
     * @private
     */
    function _showFolderFirst() {
        const newPref = !PreferencesManager.get(SORT_DIRECTORIES_FIRST);
        PreferencesManager.set(SORT_DIRECTORIES_FIRST, newPref);
    }

    refreshFileTree = _.debounce(refreshFileTree, _refreshDelay);

    /**
     * Expands tree nodes to show the given file or folder and selects it. Silently no-ops if the
     * path lies outside the project, or if it doesn't exist.
     *
     * @param {!(File|Directory)} entry File or Directory to show
     * @return {$.Promise} Resolved when done; or rejected if not found
     */
    function showInTree(entry) {
        return model.showInTree(entry).then(_saveTreeState);
    }

    /**
     * Checks if the file picker is supported in the current environment.
     * @private
     * @returns {boolean} - Returns true if file picker is supported, otherwise false.
     */
    function _filePickerSupported() {
        return Phoenix.isNativeApp
            || window.showOpenFilePicker; // fs access file picker
    }

    /**
     * Open a new project. Currently, Brackets must always have a project open, so
     * this method handles both closing the current project and opening a new project.
     *
     * @param {string=} path Optional absolute path to the root folder of the project.
     *  If path is undefined or null, displays a dialog where the user can choose a
     *  folder to load. If the user cancels the dialog, nothing more happens.
     * @return {$.Promise} A promise object that will be resolved when the
     *  project is loaded and tree is rendered, or rejected if the project path
     *  fails to load.
     */
    function openProject(path) {

        var result = new $.Deferred();

        if (!path && !_filePickerSupported()) {
            Dialogs.showModalDialog(
                DefaultDialogs.DIALOG_ID_ERROR,
                Strings.UNSUPPORTED_BROWSER_OPEN_FOLDER_TITLE,
                Strings.UNSUPPORTED_BROWSER_OPEN_FOLDER
            );
            result.reject();
            return result.promise();
        }

        // Confirm any unsaved changes first. We run the command in "prompt-only" mode, meaning it won't
        // actually close any documents even on success; we'll do that manually after the user also oks
        // the folder-browse dialog.
        CommandManager.execute(Commands.FILE_CLOSE_ALL, { promptOnly: true })
            .done(function () {
                if (path) {
                    // use specified path
                    _loadProject(path).then(result.resolve, result.reject);
                } else {
                    // Pop up a folder browse dialog
                    FileSystem.showOpenDialog(false, true, Strings.CHOOSE_FOLDER, model.projectRoot.fullPath, null, function (err, files) {
                        if (!err && files.length > 0) {
                            // Load the new project into the folder tree
                            _loadProject(files[0]).then(result.resolve, result.reject);
                        } else {
                            result.reject();
                        }
                    });
                }
            })
            .fail(function () {
                result.reject();
            });

        // if fail, don't open new project: user canceled (or we failed to save its unsaved changes)
        return result.promise();
    }

    /**
     * Invoke project settings dialog.
     * @private
     * @return {$.Promise}
     */
    function _projectSettings() {
        return PreferencesDialogs.showProjectPreferencesDialog(getBaseUrl()).getPromise();
    }

    /**
     * Create a new item in the current project.
     *
     * @param baseDir {string|Directory} Full path of the directory where the item should go.
     *   Defaults to the project root if the entry is not valid or not within the project.
     * @param initialName {string} Initial name for the item
     * @param skipRename {boolean} If true, don't allow the user to rename the item
     * @param isFolder {boolean} If true, create a folder instead of a file
     * @return {$.Promise} A promise object that will be resolved with the File
     *  of the created object, or rejected if the user cancelled or entered an illegal
     *  filename.
     */
    function createNewItem(baseDir, initialName, skipRename, isFolder) {
        baseDir = model.getDirectoryInProject(baseDir);

        if (skipRename) {
            if (isFolder) {
                return model.createAtPath(baseDir + initialName + "/");
            }
            return model.createAtPath(baseDir + initialName);
        }
        return actionCreator.startCreating(baseDir, initialName, isFolder);
    }

    /**
     * Moves the specified entry (file or directory) to the trash.
     *
     * @param {Object} entry - The file or directory entry to move to trash.
     * @returns {Promise} - A promise that resolves when the operation completes, or rejects on failure.
     */
    function moveToTrash(entry) {
        const result = new $.Deferred();
        const canMoveToTrash = Phoenix.app.canMoveToTrash(entry.fullPath);
        if (!canMoveToTrash) {
            console.error("Only tauri paths can be moved to trash, but got", entry.fullPath);
            result.reject(FileSystemError.NOT_SUPPORTED);
            return result.promise();
        }
        let name = _getProjectDisplayNameOrPath(entry.fullPath);
        const messageTemplate = Phoenix.platform === "win" ?
            Strings.DELETE_TO_RECYCLE_BIN : Strings.DELETE_TO_TRASH;
        let message = StringUtils.format(messageTemplate, name);
        setProjectBusy(true, message);
        Phoenix.app.moveToTrash(entry.fullPath)
            .then(() => {
                DocumentManager.notifyPathDeleted(entry.fullPath);
                let parent = window.path.dirname(entry.fullPath);
                _updateModelWithChange(parent);
                result.resolve();
            }).catch(err => {
                _showErrorDialog(ERR_TYPE_DELETE, entry.isDirectory, FileUtils.getFileErrorString(err), entry.fullPath);
                result.reject(err);
            }).finally(() => {
                setProjectBusy(false, message);
            });

        return result.promise();
    }

    /**
     * Delete file or directore from project
     * @param {!(File|Directory)} entry File or Directory to delete
     */
    function deleteItem(entry) {
        var result = new $.Deferred();
        let name = _getProjectDisplayNameOrPath(entry.fullPath);
        let message = StringUtils.format(Strings.DELETING, name);
        setProjectBusy(true, message);
        entry.unlink(function (err) {
            setProjectBusy(false, message);
            if (!err) {
                DocumentManager.notifyPathDeleted(entry.fullPath);
                let parent = window.path.dirname(entry.fullPath);
                _updateModelWithChange(parent);
                result.resolve();
            } else {
                _showErrorDialog(ERR_TYPE_DELETE, entry.isDirectory, FileUtils.getFileErrorString(err), entry.fullPath);

                result.reject(err);
            }
        });

        return result.promise();
    }

    /**
     * Returns a filter for use with getAllFiles() that filters files based on LanguageManager language id
     * @param {!(string|Array.<string>)} languageId a single string of a language id or an array of language ids
     * @return {!function(File):boolean}
     */
    function getLanguageFilter(languageId) {
        return function languageFilter(file) {
            var id = LanguageManager.getLanguageForPath(file.fullPath).getId();
            if (typeof languageId === "string") {
                return (id === languageId);
            }
            return (languageId.indexOf(id) !== -1);

        };
    }

    /**
     * @private
     *
     * Respond to a FileSystem change event. Note that if renames are initiated
     * externally, they may be reported as a separate removal and addition. In
     * this case, the editor state isn't currently preserved.
     *
     * @param {$.Event} event
     * @param {?(File|Directory)} entry File or Directory changed
     * @param {Array.<FileSystemEntry>=} added If entry is a Directory, contains zero or more added children
     * @param {Array.<FileSystemEntry>=} removed If entry is a Directory, contains zero or more removed children
     */
    _fileSystemChange = function (event, entry, added, removed) {
        FileSyncManager.syncOpenDocuments();

        model.handleFSEvent(entry, added, removed);
        let removedInProject = [],
            addedInProject = [];

        // @TODO: DocumentManager should implement its own fsChange  handler
        //          we can clean up the calls to DocumentManager.notifyPathDeleted
        //          and privatize DocumentManager.notifyPathDeleted as well
        //        We can also remove the _fileSystemRename handler below and move
        //          it to DocumentManager
        if (removed) {
            removed.forEach(function (file) {
                // The call to syncOpenDocuemnts above will not nofify
                //  document manager about deleted images that are
                //  not in the working set -- try to clean that up here
                DocumentManager.notifyPathDeleted(file.fullPath);
                if (isWithinProject(file)) {
                    removedInProject.push(file);
                }
            });
        }
        addedInProject = filterProjectFiles(added);

        if (entry && !isWithinProject(entry)) {
            if (addedInProject && addedInProject.length && isWithinProject(addedInProject[0].parentPath)) {
                entry = FileSystem.getDirectoryForPath(addedInProject[0].parentPath);
            } else if (removedInProject && removedInProject.length && isWithinProject(removedInProject[0].parentPath)) {
                entry = FileSystem.getDirectoryForPath(removedInProject[0].parentPath);
            } else {
                return;
            }
        }
        exports.trigger(EVENT_PROJECT_FILE_CHANGED, entry, addedInProject, removedInProject);
    };

    /**
     * Updates the model with changes at the specified file system path.
     * @private
     * @param {string} path - The file system path to resolve and update in the model.
     */
    function _updateModelWithChange(path) {
        FileSystem.resolve(path, (err, entry) => {
            if (!err) {
                model.handleFSEvent(entry);
            }
        });
    }

    /**
     * @private
     * Respond to a FileSystem rename event.
     */
    _fileSystemRename = function (event, oldName, newName) {
        // Tell the document manager about the name change. This will update
        // all of the model information and send notification to all views
        let oldParent = window.path.dirname(oldName),
            newParent = window.path.dirname(newName);
        _updateModelWithChange(oldParent);
        if (newParent !== oldParent) {
            _updateModelWithChange(newParent);
        }
        DocumentManager.notifyPathNameChanged(oldName, newName);
        exports.trigger(EVENT_PROJECT_FILE_RENAMED, oldName, newName);
    };

    /**
     * Causes the rename operation that's in progress to complete.
     */
    function forceFinishRename() {
        actionCreator.performRename();
    }

    /**
     * @private
     *
     * Sets the width of the selection bar in the file tree.
     *
     * @param {int} width New width value
     */
    function _setFileTreeSelectionWidth(width) {
        model.setSelectionWidth(width);
        _renderTreeSync();
    }

    let _numPendingOperations = 0,
        projectBusyMessages = [];

    /**
     * Sets or unsets project busy spinner with the specified message as reason.
     *
     * For Eg., if you want to mark project as busy with reason compiling project:
     * `setProjectBusy(true, "compiling project...")` . The project spinner will be shown with the specified reason.
     *
     * Once the compilation is complete, call, we need to unset the busy status by calling:
     * `setProjectBusy(false, "compiling project...")` . Make sure to pass in the exact message when
     * calling set and unset.
     *
     * @param {boolean} isBusy true or false to set the project as busy or not
     * @param {string} message The reason why the project is busy. Will be displayed as a hover tooltip on busy spinner.
     */
    function setProjectBusy(isBusy, message) {
        const $projectSpinner = $("#project-operations-spinner");
        message = message || Strings.PROJECT_BUSY;
        if (isBusy) {
            _numPendingOperations++;
            projectBusyMessages.push(message);
        } else {
            _numPendingOperations--;
            console.log("ProjectBusy marked by: ", projectBusyMessages);
            console.log("removing busy status: ", message);
            const index = projectBusyMessages.indexOf(message);
            if (index > -1) {
                // can't use array.filter here as it will filter all similar messages like ["copy","copy"]
                projectBusyMessages.splice(index, 1);
            }
            console.log(projectBusyMessages);
        }
        if (projectBusyMessages.length > 0) {
            $projectSpinner.attr("title", projectBusyMessages.join(", "));
        }
        if (_numPendingOperations > 0) {
            $projectSpinner.removeClass("forced-hidden");
        } else {
            $projectSpinner.addClass("forced-hidden");
        }
    }

    /**
     * after model change, queue path for selection. As there can be only one selection, the last selection wins.
     */
    let queuePathForSelection = null;
    model.on(ProjectModel.EVENT_CHANGE, async () => {
        // Path that is being copied can be selected only after project model is updated.
        if (queuePathForSelection) {
            let entry = (await FileSystem.resolveAsync(queuePathForSelection)).entry;
            if (entry.isFile) {
                actionCreator.setSelected(queuePathForSelection);
            }
            queuePathForSelection = null;
        }
    });

    model.on(ProjectModel.EVENT_FS_RENAME_STARTED, () => {
        setProjectBusy(true, Strings.RENAMING);
    });
    model.on(ProjectModel.EVENT_FS_RENAME_END, () => {
        setProjectBusy(false, Strings.RENAMING);
    });

    /**
     * Duplicates the currently viewed file in the project.
     * @private
     */
    function _duplicateFileCMD() {
        let context = getContext();
        let fullPath = context && context.fullPath;
        if (!fullPath) {
            fullPath = MainViewManager.getCurrentlyViewedPath(MainViewManager.ACTIVE_PANE);
        }
        if (fullPath && isWithinProject(fullPath)) {
            let name = _getProjectDisplayNameOrPath(fullPath);
            let message = StringUtils.format(Strings.DUPLICATING, name);
            setProjectBusy(true, message);
            FileSystem.getFreePath(fullPath, (err, dupePath) => {
                FileSystem.copy(fullPath, dupePath, (err, copiedStats) => {
                    setProjectBusy(false, message);
                    if (err) {
                        _showErrorDialog(ERR_TYPE_DUPLICATE_FAILED, false, "err",
                            _getProjectDisplayNameOrPath(fullPath));
                        return;
                    }
                    FileSystem.resolve(dupePath, function (err, file) {
                        if (!err) {
                            // we have to wait a bit for the tree to be in sync before locating file in tree
                            setTimeout(() => {
                                showInTree(file);
                            }, 200);
                        }
                    });
                });
            });
        } else {
            Dialogs.showModalDialog(
                DefaultDialogs.DIALOG_ID_ERROR,
                Strings.CANNOT_DUPLICATE_TITLE,
                Strings.ERR_TYPE_DUPLICATE_FAILED_NO_FILE
            );
        }
    }

    /**
     * Displays an error dialog when zipping a project or file fails.
     * @private
     * @param {string} fullPath - The full path of the project or file that failed to zip.
     */
    function _zipFailed(fullPath) {
        _showErrorDialog(ERR_TYPE_DOWNLOAD_FAILED, false, "err",
            _getProjectDisplayNameOrPath(fullPath));
    }

    /**
     * Downloads a folder as a ZIP file. If no path is provided, it defaults to the project root path.
     * @param {string} downloadPath - The path of the folder to download. Defaults to the project root path.
     * @private
     */
    function _downloadFolderCommand(downloadPath) {
        downloadPath = downloadPath || getProjectRoot().fullPath;
        let projectName = path.basename(downloadPath);
        let message = StringUtils.format(Strings.DOWNLOADING_FILE, projectName);
        setProjectBusy(true, message);
        ZipUtils.zipFolder(downloadPath).then(zip => {
            return zip.generateAsync({ type: "blob" });
        }).then(function (blob) {
            window.saveAs(blob, `${projectName}.zip`);
        }).catch(() => {
            _zipFailed(downloadPath);
        }).finally(() => {
            setProjectBusy(false, message);
        });
    }

    /**
     * Downloads a file or folder. If the provided entry is a file, it saves it directly. 
     * If it is a folder, it triggers the folder download process.
     *
     * @param {Object} [entryToDownload] - The file or folder entry to download. 
     * Defaults to the current context if not provided.
     * @private
     */
    function _downloadCommand(entryToDownload) {
        let context = entryToDownload || getContext();
        let fullPath = context && context.fullPath;
        if (!fullPath) {
            fullPath = MainViewManager.getCurrentlyViewedPath(MainViewManager.ACTIVE_PANE);
        }
        if (fullPath) {
            FileSystem.resolve(fullPath, function (err, fileOrFolder) {
                if (err) {
                    _zipFailed(fullPath);
                    return;
                }
                let name = _getProjectDisplayNameOrPath(fullPath);
                let message = StringUtils.format(Strings.DOWNLOADING_FILE, name);
                if (fileOrFolder.isFile) {
                    setProjectBusy(true, message);
                    fileOrFolder.read({ encoding: window.fs.BYTE_ARRAY_ENCODING }, function (err, blobContent) {
                        if (err) {
                            _zipFailed(fullPath);
                            return;
                        }
                        setProjectBusy(false, message);
                        let blob = new Blob([blobContent], { type: "application/octet-stream" });
                        window.saveAs(blob, path.basename(fullPath));
                    });
                } else {
                    _downloadFolderCommand(fullPath);
                }
            });
        }
    }

    const OPERATION_CUT = 'cut',
        OPERATION_COPY = 'copy';

    /**
     * Registers a file or folder path with the clipboard, storing the operation type 
     * and syncing it with the application state.
     *
     * @param {string} path - The path to register with the clipboard.
     * @param {string} operation - The operation to associate with the path ('cut' or 'copy').
     * @private
     */
    function _registerPathWithClipboard(path, operation) {
        const clipboardText = window.path.basename(path);
        Phoenix.app.copyToClipboard(clipboardText);
        PhStore.setItem(CLIPBOARD_SYNC_KEY, {
            operation: operation,
            path: path,
            clipboardText: clipboardText
        });
    }

    /**
     * Return the project root relative path of the given path.
     * @param {string} path
     * @return {string}
     */
    function getProjectRelativePath(path) {
        let projectRootParent = window.path.dirname(getProjectRoot().fullPath);
        let relativePath = window.path.relative(projectRootParent, path);
        return relativePath;
    }

    /**
     * Gets a display-friendly path or project-relative path. Handles edge cases when working 
     * across multiple project roots or virtual file systems.
     *
     * @param {string} path - The path to process and convert to a display-friendly format.
     * @returns {string} - The relative or display-friendly path.
     * @private
     */
    function _getProjectDisplayNameOrPath(path) {
        // sometimes, when we copy across projects, there can be two project roots at work. For eg, when copying
        // across /mnt/prj1 and /app/local/prj2; both should correctly resolve to prj1/ and prj2/ even though only
        // /mnt/prj1 is the current active project root. So we cannot really use getProjectRoot().fullPath for all cases
        let projectRootParent = window.path.dirname(getProjectRoot().fullPath);
        let displayPath = window.path.relative(projectRootParent, path);
        if (path.startsWith(Phoenix.VFS.getMountDir())) {
            displayPath = window.path.relative(Phoenix.VFS.getMountDir(), path);
        } else if (path.startsWith(Phoenix.VFS.getTauriDir())) {
            displayPath = window.fs.getTauriPlatformPath(path);
        } else if (path.startsWith(Phoenix.VFS._getVirtualDocumentsDirectory())) {
            displayPath = window.path.relative(Phoenix.VFS._getVirtualDocumentsDirectory(), path);
        }
        return displayPath;
    }

    /**
     * Copies the project-relative path of the current context or viewed path to the clipboard.
     * If the full path is not available, it retrieves the currently viewed path.
     *
     * @private
     */
    function _copyProjectRelativePath() {
        let context = getContext();
        let fullPath = context && context.fullPath;
        if (!fullPath) {
            fullPath = MainViewManager.getCurrentlyViewedPath(MainViewManager.ACTIVE_PANE);
        }
        if (fullPath) {
            let pathToCopy = makeProjectRelativeIfPossible(fullPath);
            Phoenix.app.copyToClipboard(pathToCopy);
            PhStore.setItem(CLIPBOARD_SYNC_KEY, {});
        }
    }

    /**
     * Registers the currently selected or viewed file for a 'cut' operation.
     * If no file is selected, it falls back to the currently viewed path.
     *
     * @private
     */
    function _cutFileCMD() {
        let context = getContext();
        let fullPath = context && context.fullPath;
        if (!fullPath) {
            fullPath = MainViewManager.getCurrentlyViewedPath(MainViewManager.ACTIVE_PANE);
        }
        if (fullPath) {
            _registerPathWithClipboard(fullPath, OPERATION_CUT);
        }
    }

    /**
     * Registers the currently selected or viewed file for a 'copy' operation.
     * If no file is selected, it falls back to the currently viewed path.
     *
     * @private
     */
    function _copyFileCMD() {
        let context = getContext();
        let fullPath = context && context.fullPath;
        if (!fullPath) {
            fullPath = MainViewManager.getCurrentlyViewedPath(MainViewManager.ACTIVE_PANE);
        }
        if (fullPath) {
            _registerPathWithClipboard(fullPath, OPERATION_COPY);
        }
    }

    /**
     * Retrieves the appropriate paste target based on the given destination path.
     * If the destination is a file, it returns the parent directory. 
     * If it is a directory, it returns the directory itself.
     *
     * @param {string} dstThatExists - The path to an existing destination (either a file or directory).
     * @private
     */
    function _getPasteTarget(dstThatExists) {
    // this function should be given a destination that always exists, be it file or dir
        return new Promise(async (resolve, reject) => { // eslint-disable-line
            try {
                let entry = (await FileSystem.resolveAsync(dstThatExists)).entry;
                if (entry.isFile) {
                    let parent = window.path.dirname(dstThatExists);
                    let parentEntry = (await FileSystem.resolveAsync(parent)).entry;
                    resolve(parentEntry);
                } else {
                    resolve(entry);
                }
            } catch (e) {
                reject(e);
            }
        });
    }


    /**
     * Determines if a given directory is the same as or a subdirectory of another directory.
     *
     * @param {string} dir - The parent directory path.
     * @param {string} subDir - The directory path to check against the parent.
     * @returns {boolean} - Returns true if `subDir` is the same as or a subdirectory of `dir`; otherwise, false.
     * @private
     */
    function _isSameOrSubPathOf(dir, subDir) {
        if (dir === subDir) {
            return true;
        }
        const relative = window.path.relative(dir, subDir);
        return relative && !relative.startsWith('..') && !window.path.isAbsolute(relative);
    }

    /**
     * Validates the target location for a paste operation by checking if the source entry is
     * the same as or a subdirectory of the target entry. It also checks if a file or directory
     * already exists at the target location.
     *
     * @param {FileSystemEntry} srcEntry - The source file or directory entry being pasted.
     * @param {FileSystemEntry} targetEntry - The target directory entry where the source will be pasted.
     * @returns {boolean} - A promise that resolves to true if the paste target is valid; otherwise, false.
     * @private
     */
    async function _validatePasteTarget(srcEntry, targetEntry) {
        if (_isSameOrSubPathOf(srcEntry.fullPath, targetEntry.fullPath)) {
            _showErrorDialog(ERR_TYPE_PASTE_FAILED, srcEntry.isDirectory, "err",
                _getProjectDisplayNameOrPath(srcEntry.fullPath),
                _getProjectDisplayNameOrPath(targetEntry.fullPath));
            return false;
        }
        let baseName = window.path.basename(srcEntry.fullPath);
        let targetPath = window.path.normalize(`${targetEntry.fullPath}/${baseName}`);
        let exists = await FileSystem.existsAsync(targetPath);
        if (exists) {
            _showErrorDialog(ERR_TYPE_PASTE, srcEntry.isDirectory, "err", _getProjectDisplayNameOrPath(targetPath));
            return false;
        }
        return true;
    }

    /**
     * Performs a cut operation by moving a source file or directory to a specified destination.
     *
     * @param {string} src - The path of the source file or directory to be cut.
     * @param {string} dst - The destination path where the source will be moved.
     * @private
     */
    async function _performCut(src, dst) {
        let target = await _getPasteTarget(dst);
        let srcEntry = (await FileSystem.resolveAsync(src)).entry;
        let canPaste = await _validatePasteTarget(srcEntry, target);
        if (canPaste) {
            let baseName = window.path.basename(srcEntry.fullPath);
            let targetPath = window.path.normalize(`${target.fullPath}/${baseName}`);
            let message = StringUtils.format(Strings.MOVING, _getProjectDisplayNameOrPath(srcEntry.fullPath));
            setProjectBusy(true, message);
            srcEntry.rename(targetPath, (err) => {
                setProjectBusy(false, message);
                if (err) {
                    _showErrorDialog(ERR_TYPE_PASTE_FAILED, srcEntry.isDirectory, "err",
                        _getProjectDisplayNameOrPath(srcEntry.fullPath),
                        _getProjectDisplayNameOrPath(target.fullPath));
                    return;
                }
                queuePathForSelection = targetPath;
            });
        }
    }

    /**
     * Performs a copy operation by copying a source file or directory to a specified destination.
     *
     * @param {string} src - The path of the source file or directory to be copied.
     * @param {string} dst - The destination path where the source will be copied.
     * @private
     */
    async function _performCopy(src, dst) {
        let target = await _getPasteTarget(dst);
        let srcEntry = (await FileSystem.resolveAsync(src)).entry;
        let canPaste = await _validatePasteTarget(srcEntry, target);
        if (canPaste) {
            let name = _getProjectDisplayNameOrPath(srcEntry.fullPath);
            let message = StringUtils.format(Strings.COPYING, name);
            setProjectBusy(true, message);
            FileSystem.copy(srcEntry.fullPath, target.fullPath, (err, targetStat) => {
                setProjectBusy(false, message);
                if (err) {
                    _showErrorDialog(ERR_TYPE_PASTE_FAILED, srcEntry.isDirectory, "err",
                        _getProjectDisplayNameOrPath(srcEntry.fullPath),
                        _getProjectDisplayNameOrPath(target.fullPath));
                    return;
                }
                queuePathForSelection = targetStat.realPath;
            });
        }
    }

    /**
     * Handles the paste operation for files or directories from the clipboard into the target path.
     *
     * This function checks the clipboard for copied files or text and performs either a cut or copy
     * operation based on the contents of the clipboard. It handles files copied externally and 
     * respects operations performed within the application.
     *
     * @private
     */
    async function _pasteFileCMD() {
        let targetPath = getProjectRoot().fullPath;
        let context = getContext();
        if (context) {
            targetPath = context.fullPath;
        }

        const copiedFiles = await Phoenix.app.clipboardReadFiles();
        if (copiedFiles) {
            // there were some files the user copied external, eg. from os file explorer. This takes precedence
            for (let copiedFileOrFolderPath of copiedFiles) {
                _performCopy(copiedFileOrFolderPath, targetPath);
            }
            return;
        }

        const clipboardText = await Phoenix.app.clipboardReadText();
        const clipboard = PhStore.getItem(CLIPBOARD_SYNC_KEY);
        if (!clipboard || clipboard.clipboardText !== clipboardText) {
            // either no copied file, or user copied something outside the app.
            return;
        }
        switch (clipboard.operation) {
            case OPERATION_CUT: await _performCut(clipboard.path, targetPath); break;
            case OPERATION_COPY: await _performCopy(clipboard.path, targetPath); break;
            default: console.error("Clipboard unknown Operation: ", clipboard, targetPath);
        }
    }

    // Initialize variables and listeners that depend on the HTML DOM
    AppInit.htmlReady(function () {
        PhStore.watchExternalChanges(CLIPBOARD_SYNC_KEY);
        $projectTreeContainer = $("#project-files-container");
        $projectTreeContainer.addClass("jstree jstree-brackets");
        $projectTreeContainer.css("overflow", "auto");
        $projectTreeContainer.css("position", "relative");

        fileTreeViewContainer = $("<div>").appendTo($projectTreeContainer)[0];

        model.setSelectionWidth($projectTreeContainer.width());

        $(".main-view").click(function (jqEvent) {
            if (!jqEvent.target.classList.contains("jstree-rename-input")) {
                forceFinishRename();
                actionCreator.setContext(null);
            }
        });

        $("#working-set-list-container").on(EVENT_CONTENT_CHANGED, function () {
            $projectTreeContainer.trigger(EVENT_CONTENT_CHANGED);
        });

        Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU).on("beforeContextMenuOpen", function () {
            actionCreator.restoreContext();
        });

        Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU).on("beforeContextMenuClose", function () {
            model.setContext(null, false, true);
        });

        $projectTreeContainer.on("contextmenu", function () {
            forceFinishRename();
        });

        $projectTreeContainer.on("dragover", function (e) {
            e.preventDefault();
        });

        // Add support for moving items to root directory
        $projectTreeContainer.on("drop", function (e) {
            var data = JSON.parse(e.originalEvent.dataTransfer.getData("text"));
            actionCreator.moveItem(data.path, getProjectRoot().fullPath);
            e.stopPropagation();
        });

        // When a context menu item is selected, we need to clear the context
        // because we don't get a beforeContextMenuClose event since Bootstrap
        // handles this directly.
        $("#project-context-menu").on("click.dropdown-menu", function () {
            model.setContext(null, true);
        });

        $projectTreeContainer.on("scroll", function () {
            // Close open menus on scroll and clear the context, but only if there's a menu open.
            if ($(".dropdown.open").length > 0) {
                Menus.closeAll();
                actionCreator.setContext(null);
            }
            // we need to render the tree without a delay to not cause selection extension issues (#10573)
            _renderTreeSync();
        });

        _renderTree();

        ViewUtils.addScrollerShadow($projectTreeContainer[0]);
    });

    EventDispatcher.makeEventDispatcher(exports);

    // Init default project path to welcome project
    PreferencesManager.stateManager.definePreference("projectPath", "string", getWelcomeProjectPath());

    /**
     * Enables or disables the project download commands based on the project root path.
     *
     * @private
     * @param {Event} _event - The event triggering the command status change.
     * @param {Object} projectRoot - The project root object containing the path.
     * projectRoot.fullPath - The full path of the project root.
     */
    function _setProjectDownloadCommandEnabled(_event, projectRoot) {
        CommandManager.get(Commands.FILE_DOWNLOAD_PROJECT)
            .setEnabled(!Phoenix.VFS.isLocalDiscPath(projectRoot.fullPath));
        CommandManager.get(Commands.FILE_DOWNLOAD)
            .setEnabled(!Phoenix.VFS.isLocalDiscPath(projectRoot.fullPath));
    }

    const UNSAFE_PROJECT_EXIT_PREFIX = "_Unafe_project_exit_";

    /**
     * Flags a project as not exited safely by storing a flag in local storage.
     *
     * @private
     * @param {string} projectRootPath - The project root path to flag.
     */
    function _flagProjectNotExitedSafely(projectRootPath) {
        // we store this in local storage as these checks happen in app exit/startup flows where
        // phstore is not reliable. It's ok to lose this data.
        PhStore.setItem(UNSAFE_PROJECT_EXIT_PREFIX + projectRootPath, true);
        PhStore.persistDBForReboot(); // promise is ignored here.
    }

    /**
     * Flags a project as exited safely by removing the corresponding flag from local storage.
     *
     * @private
     * @param {string} projectRootPath - The project root path to unflag.
     */
    function _flagProjectExitedSafely(projectRootPath) {
        PhStore.removeItem(UNSAFE_PROJECT_EXIT_PREFIX + projectRootPath);
    }


    /**
     * In some cases, For eg: user tries to open a whole drive with phcode (or any project that makes phcode crash),
     * phoenix may get stuck and never open again with the bad project as we try to open the same bad project
     * on restart. So we keep a safe exit flag with each project. We only start the project on boot if it has
     * been marked safe at previous exit or project switch. So on unsafe exit, the default project will be opened.
     *
     * @private
     * @param {string} projectRootPath - The project root path to check.
     * @returns {boolean} - Returns true if the project is safe to startup; otherwise, false.
     */
    function _isProjectSafeToStartup(projectRootPath) {
        const unsafeExit = (PhStore.getItem(UNSAFE_PROJECT_EXIT_PREFIX + projectRootPath) === true);
        if (unsafeExit) {
            console.error(`Project ${projectRootPath} marked as not safe to startup during` +
                `previous exit. Starting default project`);
        }
        return !unsafeExit;
    }

    /**
     * Converts an array of entries to a Set of normalized paths.
     *
     * @private
     * @param {Array} entryArray - An array of entry objects containing a `fullPath` property.
     * @returns {Set} - A Set of normalized paths derived from the entry array.
     */
    function _entryToPathSet(entryArray) {
        if (!entryArray || !entryArray.length) {
            return new Set();
        }
        return new Set(entryArray.map(entry => path.normalize(entry.fullPath)));
    }

    /**
     * Handles project file change events.
     *
     * @param {Object} _evt - The event object.
     * @param {Object} entry - The entry object representing the changed file.
     * @param {Array} addedInProject - An array of entries added to the project.
     * @param {Array} removedInProject - An array of entries removed from the project.
     *
     * Ignores empty change events triggered during cache clearing.
     * Triggers an event if there are changes to the project.
     */
    exports.on(EVENT_PROJECT_FILE_CHANGED, (_evt, entry, addedInProject, removedInProject) => {
        if (!entry && !addedInProject && !removedInProject) {
            // when clearing the cached files forcefully, empty change events may get trigerred, in which case ignore.
            return;
        }
        const addedSet = _entryToPathSet(addedInProject);
        const removedSet = _entryToPathSet(removedInProject);
        if (!entry && !addedSet.size && !removedSet.size) {
            return;
        }
        exports.trigger(EVENT_PROJECT_CHANGED_OR_RENAMED_PATH, entry && path.normalize(entry.fullPath),
            addedSet, removedSet);
    });

    /**
     * Handles project file rename events.
     *
     * @param {Object} _evt - The event object.
     * @param {string} oldPath - The previous path of the renamed file.
     * @param {string} newPath - The new path of the renamed file.
     *
     * Normalizes both paths and checks for changes.
     * Triggers project change events based on whether the file's parent directory has changed.
     */
    exports.on(EVENT_PROJECT_FILE_RENAMED, (_evt, oldPath, newPath) => {
        oldPath = path.normalize(oldPath);
        newPath = path.normalize(newPath);
        if (oldPath === newPath) {
            return; // no change
        }
        const oldParent = path.dirname(oldPath), newParent = path.dirname(newPath);
        if (oldParent === newParent) {
            exports.trigger(EVENT_PROJECT_CHANGED_OR_RENAMED_PATH, newParent, new Set([newPath]), new Set([oldPath]));
        } else {
            exports.trigger(EVENT_PROJECT_CHANGED_OR_RENAMED_PATH, oldParent, new Set(), new Set([oldPath]));
            exports.trigger(EVENT_PROJECT_CHANGED_OR_RENAMED_PATH, newParent, new Set([newPath]), new Set());
        }
    });

    /**
     * Handles project open events.
     *
     * @param {Object} _evt - The event object.
     * @param {Object} projectRoot - The root object of the opened project.
     *
     * Reloads project preferences, saves the project path,
     * enables download commands, and flags the project as not exited safely.
     */
    exports.on(EVENT_PROJECT_OPEN, (_evt, projectRoot) => {
        _reloadProjectPreferencesScope();
        _saveProjectPath();
        _setProjectDownloadCommandEnabled(_evt, projectRoot);
        _flagProjectNotExitedSafely(projectRoot.fullPath);
    });

    /**
     * Handles project close events.
     *
     * @param {Object} _evt - The event object.
     * @param {Object} projectRoot - The root object of the closed project.
     *
     * Flags the project as exited safely.
     */
    exports.on(EVENT_PROJECT_CLOSE, (_evt, projectRoot) => {
        _flagProjectExitedSafely(projectRoot.fullPath);
    });


    /**
     * Handles actions before the application closes.
     * Saves the current project path and flags the project as safely exited.
     */
    exports.on("beforeAppClose", () => {
        _saveProjectPath();
        _flagProjectExitedSafely(getProjectRoot().fullPath);
        _unwatchProjectRoot();
    });


    let startupFilesLoaded = false;

    /**
     * Sets the startupFilesLoaded flag to true after the files have been loaded following application startup.
     */
    exports.on(EVENT_AFTER_STARTUP_FILES_LOADED, () => {
        startupFilesLoaded = true;
    });

    /**
     * Checks if the startup files have been loaded.
     * @returns {boolean} True if startup files are loaded, otherwise false.
     */
    function isStartupFilesLoaded() {
        return startupFilesLoaded;
    }

    // Due to circular dependencies, not safe to call on() directly for other modules' events
    EventDispatcher.on_duringInit(FileViewController, "documentSelectionFocusChange", _documentSelectionFocusChange);
    EventDispatcher.on_duringInit(FileViewController, "fileViewFocusChange", _fileViewControllerChange);
    EventDispatcher.on_duringInit(MainViewManager, "currentFileChange", _currentFileChange);

    // Commands
    CommandManager.register(Strings.CMD_OPEN_FOLDER, Commands.FILE_OPEN_FOLDER, openProject);
    CommandManager.register(Strings.CMD_PROJECT_SETTINGS, Commands.FILE_PROJECT_SETTINGS, _projectSettings);
    CommandManager.register(Strings.CMD_FILE_REFRESH, Commands.FILE_REFRESH, refreshFileTree);
    CommandManager.register(Strings.CMD_FILE_CUT, Commands.FILE_CUT, _cutFileCMD);
    CommandManager.register(Strings.CMD_FILE_COPY, Commands.FILE_COPY, _copyFileCMD);
    CommandManager.register(Strings.CMD_FILE_COPY_PATH, Commands.FILE_COPY_PATH, _copyProjectRelativePath);
    CommandManager.register(Strings.CMD_FILE_PASTE, Commands.FILE_PASTE, _pasteFileCMD);
    CommandManager.register(Strings.CMD_FILE_DUPLICATE, Commands.FILE_DUPLICATE, _duplicateFileCMD);
    CommandManager.register(Strings.CMD_FILE_DUPLICATE_FILE, Commands.FILE_DUPLICATE_FILE, _duplicateFileCMD);
    CommandManager.register(Strings.CMD_FILE_DOWNLOAD_PROJECT, Commands.FILE_DOWNLOAD_PROJECT, _downloadFolderCommand);
    CommandManager.register(Strings.CMD_FILE_DOWNLOAD, Commands.FILE_DOWNLOAD, _downloadCommand);

    // Define the preference to decide how to sort the Project Tree files
    PreferencesManager.definePreference(SORT_DIRECTORIES_FIRST, "boolean", true, {
        description: Strings.DESCRIPTION_SORT_DIRECTORIES_FIRST
    })
        .on("change", function () {
            let sortPref = PreferencesManager.get(SORT_DIRECTORIES_FIRST);
            actionCreator.setSortDirectoriesFirst(sortPref);
            CommandManager.get(Commands.FILE_SHOW_FOLDERS_FIRST).setChecked(sortPref);
        });
    CommandManager.register(Strings.CMD_FILE_SHOW_FOLDERS_FIRST, Commands.FILE_SHOW_FOLDERS_FIRST, _showFolderFirst);
    CommandManager.get(Commands.FILE_SHOW_FOLDERS_FIRST).setChecked(PreferencesManager.get(SORT_DIRECTORIES_FIRST));

    actionCreator.setSortDirectoriesFirst(PreferencesManager.get(SORT_DIRECTORIES_FIRST));

    /**
     * Gets the filesystem object for the current context in the file tree.
     */
    function getContext() {
        return model.getContext();
    }

    /**
     * Starts a rename operation, completing the current operation if there is one.
     *
     * The Promise returned is resolved with an object with a `newPath` property with the renamed path. If the user cancels the operation, the promise is resolved with the value RENAME_CANCELLED.
     *
     * @param {FileSystemEntry} entry file or directory filesystem object to rename
     * @param {boolean=} isMoved optional flag which indicates whether the entry is being moved instead of renamed
     * @return {$.Promise} a promise resolved when the rename is done.
     */
    function renameItemInline(entry, isMoved) {
        var d = new $.Deferred();

        model.startRename(entry, isMoved)
            .done(function () {
                d.resolve();
            })
            .fail(function (errorInfo) {
                // Need to do display the error message on the next event loop turn
                // because some errors can come up synchronously and then the dialog
                // is not displayed.
                window.setTimeout(function () {
                    if (isMoved) {
                        switch (errorInfo.type) {
                            case FileSystemError.ALREADY_EXISTS:
                                _showErrorDialog(ERR_TYPE_MOVE, errorInfo.isFolder, Strings.FILE_EXISTS_ERR, errorInfo.fullPath);
                                break;
                            case ProjectModel.ERROR_NOT_IN_PROJECT:
                                _showErrorDialog(ERR_TYPE_MOVE, errorInfo.isFolder, Strings.ERROR_MOVING_NOT_IN_PROJECT, errorInfo.fullPath);
                                break;
                            default:
                                _showErrorDialog(ERR_TYPE_MOVE, errorInfo.isFolder, FileUtils.getFileErrorString(errorInfo.type), errorInfo.fullPath);
                        }
                    } else {
                        switch (errorInfo.type) {
                            case ProjectModel.ERROR_INVALID_FILENAME:
                                _showErrorDialog(ERR_TYPE_INVALID_FILENAME, errorInfo.isFolder, ProjectModel._invalidChars);
                                break;
                            case FileSystemError.ALREADY_EXISTS:
                                _showErrorDialog(ERR_TYPE_RENAME, errorInfo.isFolder, Strings.FILE_EXISTS_ERR, errorInfo.fullPath);
                                break;
                            case ProjectModel.ERROR_NOT_IN_PROJECT:
                                _showErrorDialog(ERR_TYPE_RENAME, errorInfo.isFolder, Strings.ERROR_RENAMING_NOT_IN_PROJECT, errorInfo.fullPath);
                                break;
                            default:
                                _showErrorDialog(ERR_TYPE_RENAME, errorInfo.isFolder, FileUtils.getFileErrorString(errorInfo.type), errorInfo.fullPath);
                        }
                    }
                }, 10);
                d.reject(errorInfo);
            });
        return d.promise();
    }

    /**
     * Returns an Array of all files for this project, optionally including
     * files in the working set that are *not* under the project root. Files are
     * filtered first by ProjectModel.shouldShow(), then by the custom filter
     * argument (if one was provided).
     *
     * @param {function (File, number):boolean=} filter Optional function to filter
     *          the file list (does not filter directory traversal). API matches Array.filter().
     * @param {boolean=} includeWorkingSet If true, include files in the working set
     *          that are not under the project root (*except* for untitled documents).
     * @param {boolean=} sort If true, The files will be sorted by their paths
     * @param {Object} options optional path within project to narrow down the search
     * @param {File} options.scope optional path within project to narrow down the search
     *
     * @return {$.Promise} Promise that is resolved with an Array of File objects.
     */
    function getAllFiles(filter, includeWorkingSet, sort, options) {
        var viewFiles, deferred;

        // The filter and includeWorkingSet params are both optional.
        // Handle the case where filter is omitted but includeWorkingSet is
        // specified.
        if (typeof (filter) !== "function") {
            options = sort;
            sort = includeWorkingSet;
            includeWorkingSet = filter;
            filter = null;
        }
        options = options || {};

        if (includeWorkingSet) {
            viewFiles = MainViewManager.getWorkingSet(MainViewManager.ALL_PANES);
        }

        deferred = new $.Deferred();
        model.getAllFiles(filter, viewFiles, sort, { scope: options.scope })
            .done(function (fileList) {
                deferred.resolve(fileList);
            })
            .fail(function (err) {
                if (err === FileSystemError.TOO_MANY_ENTRIES && !_projectWarnedForTooManyFiles) {
                    _showErrorDialog(ERR_TYPE_MAX_FILES);
                    _projectWarnedForTooManyFiles = true;
                }
                // resolve with empty list
                deferred.resolve([]);
            });
        return deferred.promise();
    }

    /**
     * Adds an icon provider. The callback is invoked before each working set item is created, and can
     * return content to prepend to the item if it supports the icon.
     *
     * @param {!function(!{name:string, fullPath:string, isFile:boolean}):?string|jQuery|DOMNode} callback
     * Return a string representing the HTML, a jQuery object or DOM node, or undefined. If undefined,
     * nothing is prepended to the list item and the default or an available icon will be used.
     * @param {number} [priority] optional priority. 0 being lowest. The icons with the highest priority wins if there
     * are multiple callback providers attached. icon providers of the same priority first valid response wins.
     */
    function addIconProvider(callback, priority = 0) {
        WorkingSetView.addIconProvider(callback, priority);
        FileTreeView.addIconProvider(callback, priority);
        rerenderTree();
    }

    /**
     * Adds a CSS class provider, invoked before each working set item is created or updated. When called
     * to update an existing item, all previously applied classes have been cleared.
     *
     * @param {!function(!{name:string, fullPath:string, isFile:boolean}):?string} callback
     * Return a string containing space-separated CSS class(es) to add, or undefined to leave CSS unchanged.
     * @param {number} [priority] optional priority. 0 being lowest. The class with the highest priority wins if there
     * are multiple callback classes attached. class providers of the same priority will be appended.
     */
    function addClassesProvider(callback, priority) {
        WorkingSetView.addClassProvider(callback, priority);
        FileTreeView.addClassesProvider(callback, priority);
        rerenderTree();
    }

    /**
     * Forces the file tree to rerender. Typically, the tree only rerenders the portions of the
     * tree that have changed data. If an extension that augments the tree has changes that it
     * needs to display, calling rerenderTree will cause the components for the whole tree to
     * be rerendered.
     */
    function rerenderTree() {
        _renderTree(true);
    }


    // Private API helpful in testing
    exports._actionCreator = actionCreator;
    exports._RENDER_DEBOUNCE_TIME = _RENDER_DEBOUNCE_TIME;

    // Private API for use with SidebarView
    exports._setFileTreeSelectionWidth = _setFileTreeSelectionWidth;

    // Define public API
    exports.getProjectRoot = getProjectRoot;
    exports.getBaseUrl = getBaseUrl;
    exports.setBaseUrl = setBaseUrl;
    exports.isWithinProject = isWithinProject;
    exports.filterProjectFiles = filterProjectFiles;
    exports.makeProjectRelativeIfPossible = makeProjectRelativeIfPossible;
    exports.shouldShow = ProjectModel.shouldShow;
    exports.shouldIndex = ProjectModel.shouldIndex;
    exports.openProject = openProject;
    exports.getFileTreeContext = getFileTreeContext;
    exports.getSelectedItem = getSelectedItem;
    exports.getContext = getContext;
    exports.getInitialProjectPath = getInitialProjectPath;
    exports.getStartupProjectPath = getStartupProjectPath;
    exports.getProjectRelativePath = getProjectRelativePath;
    exports.getProjectRelativeOrDisplayPath = getProjectRelativeOrDisplayPath;
    exports.getWelcomeProjectPath = getWelcomeProjectPath;
    exports.getPlaceholderProjectPath = getPlaceholderProjectPath;
    exports.getExploreProjectPath = getExploreProjectPath;
    exports.getLocalProjectsPath = getLocalProjectsPath;
    exports.isWelcomeProjectPath = isWelcomeProjectPath;
    exports.updateWelcomeProjectPath = updateWelcomeProjectPath;
    exports.createNewItem = createNewItem;
    exports.renameItemInline = renameItemInline;
    exports.deleteItem = deleteItem;
    exports.moveToTrash = moveToTrash;
    exports.forceFinishRename = forceFinishRename;
    exports.showInTree = showInTree;
    exports.shouldShowFileNameInTree = ProjectModel._shouldShowName;
    exports.refreshFileTree = refreshFileTree;
    exports.getAllFiles = getAllFiles;
    exports.getLanguageFilter = getLanguageFilter;
    exports.addIconProvider = addIconProvider;
    exports.addClassesProvider = addClassesProvider;
    exports.rerenderTree = rerenderTree;
    exports.setProjectBusy = setProjectBusy;
    exports.isStartupFilesLoaded = isStartupFilesLoaded;

    // public events
    exports.EVENT_PROJECT_BEFORE_CLOSE = EVENT_PROJECT_BEFORE_CLOSE;
    exports.EVENT_PROJECT_CLOSE = EVENT_PROJECT_CLOSE;
    exports.EVENT_PROJECT_OPEN = EVENT_PROJECT_OPEN;
    exports.EVENT_AFTER_PROJECT_OPEN = EVENT_AFTER_PROJECT_OPEN;
    exports.EVENT_AFTER_STARTUP_FILES_LOADED = EVENT_AFTER_STARTUP_FILES_LOADED;
    exports.EVENT_PROJECT_REFRESH = EVENT_PROJECT_REFRESH;
    exports.EVENT_CONTENT_CHANGED = EVENT_CONTENT_CHANGED;
    exports.EVENT_PROJECT_FILE_CHANGED = EVENT_PROJECT_FILE_CHANGED;
    exports.EVENT_PROJECT_FILE_RENAMED = EVENT_PROJECT_FILE_RENAMED;
    exports.EVENT_PROJECT_CHANGED_OR_RENAMED_PATH = EVENT_PROJECT_CHANGED_OR_RENAMED_PATH;
    exports.EVENT_PROJECT_OPEN_FAILED = EVENT_PROJECT_OPEN_FAILED;
});
