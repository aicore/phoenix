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

/*global less */

/**
 * main integrates LiveDevelopment into Brackets
 *
 * This module creates two menu items:
 *
 *  "Go Live": open or close a Live Development session and visualize the status
 *  "Highlight": toggle source highlighting
 */
define(function main(require, exports, module) {


    const Commands            = require("command/Commands"),
        AppInit             = require("utils/AppInit"),
        MultiBrowserLiveDev = require("LiveDevelopment/LiveDevMultiBrowser"),
        CommandManager      = require("command/CommandManager"),
        PreferencesManager  = require("preferences/PreferencesManager"),
        UrlParams           = require("utils/UrlParams").UrlParams,
        Strings             = require("strings"),
        ExtensionUtils      = require("utils/ExtensionUtils"),
        StringUtils         = require("utils/StringUtils");

    const isTestWindow = (new window.URLSearchParams(window.location.search || "")).get("testEnvironment");
    var params = new UrlParams();
    var config = {
        experimental: false, // enable experimental features
        debug: true, // enable debug output and helpers
        highlight: true, // enable highlighting?
        highlightConfig: { // the highlight configuration for the Inspector
            borderColor:  {r: 255, g: 229, b: 153, a: 0.66},
            contentColor: {r: 111, g: 168, b: 220, a: 0.55},
            marginColor:  {r: 246, g: 178, b: 107, a: 0.66},
            paddingColor: {r: 147, g: 196, b: 125, a: 0.66},
            showInfo: true
        }
    };
    // Status labels/styles are ordered: error, not connected, progress1, progress2, connected.
    var _status,
        _allStatusStyles = ["warning", "info", "success", "out-of-sync", "sync-error"].join(" ");

    var _$btnGoLive; // reference to the GoLive button

    // current selected implementation (LiveDevelopment | LiveDevMultiBrowser)
    var LiveDevImpl;

    var prefs = PreferencesManager.getExtensionPrefs("livedev");

    // "livedev.remoteHighlight" preference
    var PREF_REMOTEHIGHLIGHT = "remoteHighlight";
    var remoteHighlightPref = prefs.definePreference(PREF_REMOTEHIGHLIGHT, "object", {
        animateStartValue: {
            "background-color": "rgba(0, 162, 255, 0.5)",
            "opacity": 0
        },
        animateEndValue: {
            "background-color": "rgba(0, 162, 255, 0)",
            "opacity": 0.6
        },
        "paddingStyling": {
            "border-width": "1px",
            "border-style": "dashed",
            "border-color": "rgba(0, 162, 255, 0.5)"
        },
        "marginStyling": {
            "background-color": "rgba(21, 165, 255, 0.58)"
        },
        "borderColor": "rgba(21, 165, 255, 0.85)",
        "showPaddingMargin": true
    }, {
        description: Strings.DESCRIPTION_LIVE_DEV_HIGHLIGHT_SETTINGS
    });

    /** Load Live Development LESS Style */
    function _loadStyles() {
        var lessText = require("text!LiveDevelopment/main.less");

        less.render(lessText, function onParse(err, tree) {
            console.assert(!err, err);
            ExtensionUtils.addEmbeddedStyleSheet(tree.css);
        });
    }

    /**
     * Change the appearance of a button. Omit text to remove any extra text; omit style to return to default styling;
     * omit tooltip to leave tooltip unchanged.
     */
    function _setLabel($btn, text, style, tooltip) {
        // Clear text/styles from previous status
        $("span", $btn).remove();
        $btn.removeClass(_allStatusStyles);

        // Set text/styles for new status
        if (text && text.length > 0) {
            $("<span class=\"label\">")
                .addClass(style)
                .text(text)
                .appendTo($btn);
        } else {
            $btn.addClass(style);
        }

        if (tooltip) {
            $btn.attr("title", tooltip);
        }
    }

    function closeLivePreview() {
        if (LiveDevImpl.status >= LiveDevImpl.STATUS_ACTIVE) {
            LiveDevImpl.close();
        }
    }

    function openLivePreview() {
        if (LiveDevImpl.status <= LiveDevImpl.STATUS_INACTIVE && !isTestWindow) {
            LiveDevImpl.open();
        }
    }

    /** Called on status change */
    function _showStatusChangeReason(reason) {
        // Destroy the previous twipsy (options are not updated otherwise)
        _$btnGoLive.twipsy("hide").removeData("twipsy");

        // If there was no reason or the action was an explicit request by the user, don't show a twipsy
        if (!reason || reason === "explicit_close") {
            return;
        }

        // Translate the reason
        var translatedReason = Strings["LIVE_DEV_" + reason.toUpperCase()];
        if (!translatedReason) {
            translatedReason = StringUtils.format(Strings.LIVE_DEV_CLOSED_UNKNOWN_REASON, reason);
        }

        // Configure the twipsy
        var options = {
            placement: "left",
            trigger: "manual",
            autoHideDelay: 5000,
            title: function () {
                return translatedReason;
            }
        };

        // Show the twipsy with the explanation
        _$btnGoLive.twipsy(options).twipsy("show");
    }

    /** Create the menu item "Go Live" */
    function _setupGoLiveButton() {
        if (!_$btnGoLive) {
            _$btnGoLive = $("#toolbar-go-live");
        }
        LiveDevImpl.on("statusChange", function statusChange(event, status, reason) {
            // status starts at -1 (error), so add one when looking up name and style
            // See the comments at the top of LiveDevelopment.js for details on the
            // various status codes.
            _setLabel(_$btnGoLive, null, _status[status + 1].style, _status[status + 1].tooltip);
            _showStatusChangeReason(reason);
        });

        // Initialize tooltip for 'not connected' state
        _setLabel(_$btnGoLive, null, _status[1].style, _status[1].tooltip);
    }

    /** Maintains state of the Live Preview menu item */
    function _setupGoLiveMenu() {
        LiveDevImpl.on("statusChange", function statusChange(event, status) {
            // Update the checkmark next to 'Live Preview' menu item
            // Add checkmark when status is STATUS_ACTIVE; otherwise remove it
            CommandManager.get(Commands.FILE_LIVE_FILE_PREVIEW).setChecked(status === LiveDevImpl.STATUS_ACTIVE);
            CommandManager.get(Commands.FILE_LIVE_HIGHLIGHT).setEnabled(status === LiveDevImpl.STATUS_ACTIVE);
        });
    }

    function _updateHighlightCheckmark() {
        CommandManager.get(Commands.FILE_LIVE_HIGHLIGHT).setChecked(config.highlight);
    }

    function _handlePreviewHighlightCommand() {
        config.highlight = !config.highlight;
        _updateHighlightCheckmark();
        if (config.highlight) {
            LiveDevImpl.showHighlight();
        } else {
            LiveDevImpl.hideHighlight();
        }
        PreferencesManager.setViewState("livedev.highlight", config.highlight);
    }

    /** Setup window references to useful LiveDevelopment modules */
    function _setupDebugHelpers() {
        window.report = function report(params) { window.params = params; console.info(params); };
    }

    /** force reload the live preview currently only with shortcut ctrl-shift-R */
    function _handleReloadLivePreviewCommand() {
        if (LiveDevImpl.status >= LiveDevImpl.STATUS_ACTIVE) {
            LiveDevImpl.reload();
        }
    }

    /** Initialize LiveDevelopment */
    AppInit.appReady(function () {
        params.parse();
        config.remoteHighlight = prefs.get(PREF_REMOTEHIGHLIGHT);

        // init experimental multi-browser implementation
        // it can be enable by setting 'livedev.multibrowser' preference to true.
        // It has to be initiated at this point in case of dynamically switching
        // by changing the preference value.
        MultiBrowserLiveDev.init(config);

        _loadStyles();
        _updateHighlightCheckmark();

        // set implemenation
        LiveDevImpl = MultiBrowserLiveDev;
        // update styles for UI status
        _status = [
            { tooltip: Strings.LIVE_DEV_STATUS_TIP_NOT_CONNECTED, style: "warning" },
            { tooltip: Strings.LIVE_DEV_STATUS_TIP_NOT_CONNECTED, style: "" },
            { tooltip: Strings.LIVE_DEV_STATUS_TIP_PROGRESS1, style: "info" },
            { tooltip: Strings.LIVE_DEV_STATUS_TIP_CONNECTED, style: "success" },
            { tooltip: Strings.LIVE_DEV_STATUS_TIP_OUT_OF_SYNC, style: "out-of-sync" },
            { tooltip: Strings.LIVE_DEV_STATUS_TIP_SYNC_ERROR, style: "sync-error" },
            { tooltip: Strings.LIVE_DEV_STATUS_TIP_PROGRESS1, style: "info" },
            { tooltip: Strings.LIVE_DEV_STATUS_TIP_PROGRESS1, style: "info" }
        ];
        // setup status changes listeners for new implementation
        _setupGoLiveButton();
        _setupGoLiveMenu();

        if (config.debug) {
            _setupDebugHelpers();
        }

        remoteHighlightPref
            .on("change", function () {
                config.remoteHighlight = prefs.get(PREF_REMOTEHIGHLIGHT);
                if (LiveDevImpl && LiveDevImpl.status >= LiveDevImpl.STATUS_ACTIVE) {
                    LiveDevImpl.agents.remote.call("updateConfig",JSON.stringify(config));
                }
            });

    });

    // init prefs
    PreferencesManager.stateManager.definePreference("livedev.highlight", "boolean", true)
        .on("change", function () {
            config.highlight = PreferencesManager.getViewState("livedev.highlight");
            _updateHighlightCheckmark();
        });

    config.highlight = PreferencesManager.getViewState("livedev.highlight");

    // init commands
    CommandManager.register(Strings.CMD_LIVE_HIGHLIGHT, Commands.FILE_LIVE_HIGHLIGHT, _handlePreviewHighlightCommand);
    CommandManager.register(Strings.CMD_RELOAD_LIVE_PREVIEW, Commands.CMD_RELOAD_LIVE_PREVIEW, _handleReloadLivePreviewCommand);

    CommandManager.get(Commands.FILE_LIVE_HIGHLIGHT).setEnabled(false);

    // Export public functions
    exports.openLivePreview = openLivePreview;
    exports.closeLivePreview = closeLivePreview;
});
