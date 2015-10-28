/*
 *  EVG - Basic Time Variables
 *
 *  By Eugen Eistrach
 *  BasicTimeVariables.js
 *  Version: 1.0.1
 *  Free for commercial and non commercial use.
 */
/*:
 * @plugindesc BasicTimeCore.js is required. This scripts exports unit values to variables to make access of the data easier.
 *
 * @author Eugen Eistrach
 *
 * @param Unit Variables Connections
 * @desc Define connections between units and rpg maker mv variables. [unit, variableID], ...
 * @default [minute, 1], [hour, 2]
 * 
 * @param Switch ID
 * @desc Switch ID for enabling or disabling this plugin ingame
 * @default 1
 * 
 *
 * @help
 * Do not change the variables with the configured ids manually, cause this will
 * cause unexpected behaviour.
 */
if (!PluginManager._scripts.contains("BasicTimeCore")) {
    throw new Error("This plugin needs BasicTimeCore to work properly!");
}
var BasicTimeVariables = {};
(function ($) {
    "use strict";

    $.Parameters = PluginManager.parameters("BasicTimeVariables");
    $.Connections       = EVGUtils.convertArrayConfig($.Parameters['Unit Variables Connections']);
    $.ControllSwitchID  = Number($.Parameters['Switch ID']);

    $._units = [];
    $.updateUnit = {};

    var createUpdateFunc = function (variableID, unit) {
        return function () {$gameVariables.setValue(variableID, BasicTimeCore[unit])}
    }

    $.InitializeConfig = function () {
        for (var i = 0; i < $.Connections.length; i++) {
            var unit = $.Connections[i][0]
            $._units.push(unit);
            $.updateUnit[unit] = createUpdateFunc(Number($.Connections[i][1]), unit);
        }
    }

    $.updateAll = function () {
        if (EVGUtils.isSwitchOn($.ControllSwitchID)) {
            for (var i = 0; i < $._units.length; i++) {
                $.updateUnit[$._units[i]]();
            }
        } 
    }
    BasicTimeCore.registerOnChangeEvent("_any_", $.updateAll.bind($));

    var oldDM_setupNewGame = DataManager.setupNewGame;
    DataManager.setupNewGame = function () {
        oldDM_setupNewGame.call(this);
        $.updateAll();
    };

    var oldDM_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function (contents) {
        oldDM_extractSaveContents.call(this, contents);
        $.updateAll();
    }

    $.InitializeConfig();
})(BasicTimeVariables);
