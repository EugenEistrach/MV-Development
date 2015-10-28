/*
 *  EVG - Basic Time Hud
 *
 *  By Eugen Eistrach
 *  BasicTimeHud.js
 *  Version: 1.0.1
 *  Free for commercial and non commercial use.
 */
/*:
 * @plugindesc BasicTimeCore.js is required. Adds a simple Hud to your game.
 *
 * @author Eugen Eistrach
 *
 * @param Hud Switch Id
 * @desc Switch Id for controlling the visibility of the hud
 * @default 1
 *
 * @param Hud X
 * @desc X-Position of the hud
 * @default 0
 *
 * @param Hud Y
 * @desc Y-Position of the hud
 * @default 0
 *
 * @param Hud Width
 * @desc Width of the hud
 * @default 144
 *
 * @param Hud Height
 * @desc Height of the hud
 * @default 72
 *
 * @param Hud Text
 * @desc The text the hud should show. See help for detailed information on how to use this.
 * @default (hour, 2) : (minute, 2)
 *
 * @help
 * To change the Hud Text you need to know this things:
 * You can use the unit name which will be replaced with the corresponding number.
 * If you put your unit name into parentheses followed by a comma and a number, you
 * can control how the number will look like.
 * Examples(With following units defined in the core script: minute, hour):
 *  The current values of your units are: minute = 8 and hour = 6
 *
 *  hour, minute            = 6, 8
 *  hour : minute           => 6 : 8
 *  hour : (minute, 2)      => 6 : 08
 *  (hour, 2) : (minute, 2) => 06 : 08
 *  (hour, 3) : (minute, 2) => 006 : 08
 *
 *  I hope this makes it clear.
 *
 *  You can also display variables with v[id].
 *  The Hud-Window updates when any of the units changes. So if you use it
 *  to draw variables, you need to refresh the Hud manually after you have
 *  changed the value of the variables you are using.
 *
 *  Just use this PluginCommand: Time refreshHud
 *
 */
if (!PluginManager._scripts.contains("BasicTimeCore")) {
    throw new Error("This plugin needs BasicTimeCore to work properly!");
}

var BasicTimeHud = {};
(function ($) {
    "use strict";

    $.Parameters = PluginManager.parameters("BasicTimeHud");
    $.X                 = Number($.Parameters["Hud X"]);
    $.Y                 = Number($.Parameters["Hud Y"]);
    $.Width             = Number($.Parameters["Hud Width"]);
    $.Height            = Number($.Parameters["Hud Height"]);
    $.ControllSwitchID  = Number($.Parameters["Hud Switch Id"]);
    $.TextToFormat      = $.Parameters["Hud Text"];

    $.onAnyChange = function () {
        if (SceneManager._scene instanceof Scene_Map) {
            var window = SceneManager._scene._basicTimeHudWindow;
            if (window !== undefined && window !== null)
                window.refresh();
        }
    };
    BasicTimeCore.registerOnChangeEvent("_any_", $.onAnyChange.bind($));

    var oldSM_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function () {
        oldSM_createAllWindows.call(this);
        this.createBasicTimeHudWindow();
    }

    Scene_Map.prototype.createBasicTimeHudWindow = function () {
        this._basicTimeHudWindow = new Window_BasicTimeHud();
        this.addWindow(this._basicTimeHudWindow);
    }

    function Window_BasicTimeHud() {
        this.initialize.apply(this, arguments);
    }

    Window_BasicTimeHud.prototype = Object.create(Window_Base.prototype);
    Window_BasicTimeHud.prototype.constructor = Window_BasicTimeHud;

    Window_BasicTimeHud.prototype.initialize = function (x, y) {
        Window_Base.prototype.initialize.call(this, $.X, $.Y, $.Width, $.Height);
        this.visible = EVGUtils.isSwitchOn($.ControllSwitchID);
        this.refresh();
    }

    Window_BasicTimeHud.prototype.refresh = function () {
        this.contents.clear();
        var text = this.formatText($.TextToFormat); 
        this.drawText(text, 0, 0, this.contents.width, this.contents.height, 1);
    }

    Window_BasicTimeHud.prototype.update = function () {
        Window_Base.prototype.update.call(this);
        if (this.visible != EVGUtils.isSwitchOn($.ControllSwitchID)) {
            this.visible = EVGUtils.isSwitchOn($.ControllSwitchID);
            this.refresh();
        }
    }

    Window_BasicTimeHud.prototype.formatText = function(text) {
        var newText = this.formatUnits(text);
        newText = this.formatVariables(newText);
        return this.formatNumbers(newText);
    }

    Window_BasicTimeHud.prototype.formatUnits = function (text) {
        var units = BasicTimeCore._units;
        var newText = text;
        for (var i = 0; i < units.length; i++) {
            var unit = units[i];
            newText = newText.replace(new RegExp(unit, "g"), BasicTimeCore[unit]);
        }
        return newText;
    }

    Window_BasicTimeHud.prototype.formatVariables = function(text) {
        var regex = /v\[(\d+)\]/gi;
        var regex1 = /v\[(\d+)\]/i;
        function getVariable(match) {
            var result = regex.exec(match);
            return $gameVariables.value(Number(reuslt[1]));
        }
        return text.replace(regex, getVariable);
    }

    Window_BasicTimeHud.prototype.formatNumbers = function (text) {
        var regex = /\( *(\d+) *, *(\d+) *\)/gi;
        var regex1 = /\( *(\d+) *, *(\d+) *\)/;
        function format(match) {
            var result = regex1.exec(match);
            return EVGUtils.formatNumber(Number(result[1]), Number(result[2]));
        }
        return text.replace(regex, format);
    }

    // Plugin commands
    var oldGI_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        oldGI_pluginCommand.call(this, command, args);
        if (command === 'Time') {
            switch (args[0]) {
                case 'refreshHud':
                    $.onAnyChange();
                    break;
            }
        }
    };
})(BasicTimeHud);
