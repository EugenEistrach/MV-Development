/*
 *  EVG - Basic Time Common Events
 *
 *  By Eugen Eistrach
 *  BasicTimeCommonEvents.js
 *  Version: 1.0.1
 *  Kommerziel und nicht kommerziel frei benutzbar.
 */
/*:
 * @plugindesc Dieses Plugin erlaubt es dass bei Änderung einer Zeiteinheit ein Common Event ausgeführt wird.
 *
 * @author Eugen Eistrach
 *
 * @param Unit CE Connections
 * @desc Definiere Verbindungen zwischen Zeiteinheit und CommonEvent. [Zeiteinheit, commonEventID], ...
 * @default [minute, 1], [hour, 2]
 *
 * @param Switch ID
 * @desc Switch ID for enabling or disabling this plugin ingame
 * @default 1
 * 
 * @help
 * BasicTimeCore.js wird benötigt und muss im PluginManager über diesem Plugin liegen.
 *
 */
if (!PluginManager._scripts.contains("BasicTimeCore")) {
    throw new Error("This plugin needs BasicTimeCore to work properly!");
}
var BasicTimeCommonEvents = {};
(function ($) {
    "use strict";

    $.Parameters = PluginManager.parameters("BasicTimeCommonEvents");
    $.Connections = EVGUtils.convertArrayConfig($.Parameters['Unit CE Connections']);
    $.ControllSwitchID = Number($.Parameters['Switch ID']);

    $.updateUnit = {};

    var createUpdateFunc = function (variableID) {
        return function () {
            if (EVGUtils.isSwitchOn($.ControllSwitchID))
                $gameTemp.reserveCommonEvent(variableID);
        }
    }

    $.InitializeConfig = function () {
        for (var i = 0; i < $.Connections.length; i++) {
            var unit = $.Connections[i];
            $.updateUnit[unit] = createUpdateFunc(Number($.Connections[i][1]));
            BasicTimeCore.registerOnchangeEvent(unit, $.updateUnit[unit].bind($));
        }
    }
    $.InitializeConfig();
})(BasicTimeCommonEvents);
