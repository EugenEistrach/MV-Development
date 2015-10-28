/*
 *  EVG - Basic Time Tints
 *
 *  By Eugen Eistrach
 *  BasicTimeTints.js
 *  Version: 1.0.4
 *  Free for commercial and non commercial use.
 */
/*:
 * @plugindesc BasicTimeCore.js is required. This script adds automatic tinting when time progresses.
 *
 * @author Eugen Eistrach
 *
 * @param Tinting Unit
 * @desc Specify the unit used for tinting
 * @default hour
 *
 * @param Tint Duration
 * @desc Tint duration in frames
 * @default 60
 *
 * @param Indoor Tint
 * @desc [red, green, blue, grey]
 * @default [0, 0, 0, 0]
 *
 * @param Tints
 * @desc tintName: [-51, -34, -17, 68], ...
 * @default morning: [-51, -34, -17, 68], noon: [0, 0, 0, 0], afternoon: [0, -17, -34, 0], evening: [0, -34, -68, 34], night: [-102, -85, -34, 85]
 *
 * @param Tinting Steps
 * @desc [minUnitValue, maxUnitValue, tintName], ...
 * @default [0, 5, night], [6, 11, morning], [12, 12, noon], [13, 16, afternoon], [17, 21, evening], [22, 23, night]
 *
 * @param Switch ID
 * @desc Only tint if switch with the specified id is turned on.
 * @default 1
 *
 */
if (!PluginManager._scripts.contains("BasicTimeCore")) {
    throw new Error("This plugin needs BasicTimeCore to work properly!");
}

var BasicTimeTints = {};
(function ($) {
    "use strict";

    $.Parameters = PluginManager.parameters('BasicTimeTints');
    $.Unit = $.Parameters['Tinting Unit'];
    $.ControlSwitchID = $.Parameters['Switch ID'];
    $.IndoorTint = EVGUtils.getNumberArray($.Parameters['Indoor Tint']);
    $.TintDuration = Number($.Parameters['Tint Duration']);
    $.TintSteps = EVGUtils.convertArrayConfig($.Parameters['Tinting Steps']);
    $.NamedTints = EVGUtils.convertAssignConfig($.Parameters['Tints'])

    $._tintSteps = [];
    $._namedTints = {};

    $.InitializeConfig = function () {
        Object.keys($.NamedTints).forEach(function (key) {
            $._namedTints[key] = EVGUtils.getNumberArray($.NamedTints[key]);
        });

        for (var i = 0; i < $.TintSteps.length; i++) {
            var start = Number($.TintSteps[i][0]);
            var end = Number($.TintSteps[i][1]);
            var tintName = $.TintSteps[i][2];
            for (var j = start; j <= end; j++) {
                $._tintSteps[j] = $._namedTints[tintName];
            }
        }
        BasicTimeCore.registerOnChangeEvent($.Unit, $.onTintUnitChange.bind($));
    }

    $.canTint = function () {
        var sceneCondition = SceneManager._scene instanceof Scene_Map;
        var switchCondition = EVGUtils.isSwitchOn($.ControlSwitchID);
        return sceneCondition && switchCondition;
    }

    $.onTintUnitChange = function () {
        var indoorCondition = !BasicTimeCore.IsIndoor();
        if ($.canTint() && indoorCondition) {
            $.doOutdoorTint($.TintDuration);
        }
    };

    $.doOutdoorTint = function (dur) {
        if ($._tintSteps[BasicTimeCore[$.Unit]] === undefined) {
            console.log($);
            console.log(BasicTimeCore);
        };
        $gameScreen.startTint($._tintSteps[BasicTimeCore[$.Unit]], dur)
    }

    $.doIndoorTint = function (dur) {
        $gameScreen.startTint($.IndoorTint, 0)
    }

    var oldGM_setup = Game_Map.prototype.setup;
    Game_Map.prototype.setup = function (mapId) {
        oldGM_setup.call(this, mapId);
        if ($.canTint()) {
            if (BasicTimeCore.IsIndoor())
                $.doIndoorTint(0);
            else
                $.doOutdoorTint(0);
        }
    }
    $.InitializeConfig();
})(BasicTimeTints);
