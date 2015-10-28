/*
 *  EVG - Basic Time Core
 *
 *  By Eugen Eistrach
 *  BasicTimeCore.js
 *  Version: 1.0.4
 *  Free for commercial and non commercial use.
 */
/*:
 * @plugindesc This adds a basic time system to your game. It does not do anything on its own and serves as a core.
 *
 * @author Eugen Eistrach
 *
 * @param Update Interval
 * @desc The time update interval in milliseconds.
 * @default 1000
 *
 * @param Update during message
 * @desc Update time flow during an open message? (Use true or false)
 * @default false
 *
 * @param Switch ID
 * @desc If switch with the specified id is turned on the time flow will progress.
 * @default 1
 *
 * @param Units
 * @desc unitName: [startValue, maxValue], ...                         The units are processed in the same order they are defined.
 * @default minute: [0, 60], hour: [6, 24]
 *
 * @help
 *
 *  You need to specify your indoor maps with <indoor> on your maps notefield.
 *
 * Plugin Commands:
 *  - Time setUnit unitName value
 *  - Time changeUnit unitName amount
 *  - Time changeUpdateInterval value
 *
 * Scriptcalls:
 *  - BasicTimeCore.GetUnitValue("unitName") # returns current value of the unit
 *  - BasicTimeCore.unitName                 # same as above
 *  - BasicTimeCore.IsIndoor()               # returns true if current map is indoor
 */
var EVGUtils = {};

(function ($) {
    "use strict";

    var inArrayRegex = /\[(.*)\]/i;
    var assignRegex = /(\w+) *: *(\[? *[-?\w+, *?]+ *\]?)/gi;
    var arrayRegex = /(\[ *[-?\w+, *?]+ *\])/gi;

    $.tryArrayConverting = function (string) {
        var result = inArrayRegex.exec(string);
        if (result === undefined || result === null)
            return string;
        return result[1].replace(/ /g, "").split(",");
    };

    $.convertArrayConfig = function (configString) {
        arrayRegex.lastIndex = 0;
        var result = arrayRegex.exec(configString);
        var config = [];
        var i = 0;
        while (result !== undefined && result !== null) {
            config[i] = $.tryArrayConverting(result[1]);
            i++;
            var result = arrayRegex.exec(configString);
        }
        return config;
    }

    $.getNumberArray = function (configString) {
        return $.tryArrayConverting(configString).map(function (i) { return Number(i); })
    }

    $.convertAssignConfig = function (configString) {
        assignRegex.lastIndex = 0;
        var result = assignRegex.exec(configString);
        var config = {};
        while (result !== undefined && result !== null) {
            config[result[1]] = $.tryArrayConverting(result[2]);
            var result = assignRegex.exec(configString);
        }
        return config;
    };

    $.isSwitchOn = function (switchId) {
        return $gameSwitches !== undefined && $gameSwitches !== null && $gameSwitches.value(switchId);
    }
})(EVGUtils);

var BasicTimeCore = {};
(function ($) {
    "use strict";
    $.IsIndoor = function () {
        return $dataMap.meta.indoor;
    }

    $.Parameters = PluginManager.parameters('BasicTimeCore');
    $.UnitConfig = EVGUtils.convertAssignConfig($.Parameters['Units']);
    $.ControlSwitchID = Number($.Parameters['Switch ID']);
    $.UpdateInterval = Number($.Parameters['Update Interval']);
    $.UpdateDuringMessage = $.Parameters['Update during message'] === "true";

    $._interval = null;
    $._units = [];
    $._maxUnitValue = {};
    $._notifyUnitEvent = {};
    $._onUnitChangeEvents = {}; // Funcs in Array

    // Funcs
    $.updateUnit = {};
    $.clampUnit = {};
    $.onUnitChange = {};

    var createUpdateUnitFunc = function (unit, prevUnit, nextUnit) {
        var func = function (amount) {
            $[unit] += amount;
            $._notifyUnitEvent[unit] = true;
            if ($[unit] > $._maxUnitValue[unit]) {
                $[unit] = 0;
                if (nextUnit !== undefined) {
                    $.updateUnit[nextUnit](1);
                }
            } else if ($[unit] < 0) {
                $[unit] = $._maxUnitValue[unit];
                if (prevUnit !== undefined) {
                    $.updateUnit[prevUnit](-1);
                }
            }
        }
        return func;
    };

    var createClampUnitFunc = function (unit) {
        var func = function () {
            $[unit] = $[unit].clamp(0, $._maxUnitValue[unit]);
        }
        return func;
    };

    var createOnUnitChangeFunc = function (unit) {
        var func = function () {
            var events = $._onUnitChangeEvents[unit];
            if (events !== undefined && events !== null) {
                for (var i = 0; i < events.length; i++)
                    events[i]();
            }
        }
        return func;
    };

    $.InitializeConfig = function () {
        // Create units with normal funcs
        Object.keys($.UnitConfig).forEach(function (key) {
            $[key] = Number($.UnitConfig[key][0]);
            $._units.push(key);
            $._maxUnitValue[key] = Number($.UnitConfig[key][1]) - 1;
            $._notifyUnitEvent[key] = true;
            $.clampUnit[key] = createClampUnitFunc(key);
            $.onUnitChange[key] = createOnUnitChangeFunc(key);
            $.clampUnit[key]();
        });
        // Create update funcs for units
        for (var i = 0; i < $._units.length; i++) {
            var unit = $._units[i];
            $.updateUnit[unit] = createUpdateUnitFunc(unit, $._units[i - 1] || undefined, $._units[i + 1] || undefined);
        }
        $.updateUnits = $.updateUnit[$._units[0]];
        $.onUnitChange._any_ = createOnUnitChangeFunc("_any_");
        $.run();
    };

    $.run = function () {
        $._interval = setInterval(function () {
            $.update();
        }, $.UpdateInterval);
    };

    $.setUpdateInterval = function (newInterval) {
        clearInterval($._interval);
        $.UpdateInterval = newInterval;
        $.run();
    };

    $.setData = function (data) {
        for (var i = 0; i < $._units.length; i++) {
            var unit = data[$._units[i]];
            if (unit !== undefined && unit !== null)
                $[$._units[i]] = unit;
        }
    };

    $.getData = function (data) {
        var data = {};
        for (var i = 0; i < $._units.length; i++)
            data[$._units[i]] = $[$._units[i]];
        return data;
    };

    $.eventUpdate = function () {
        var anyChange = false;
        for (var i = 0; i < $._units.length; i++) {
            var unit = $._units[i];
            if ($._notifyUnitEvent[unit]) {
                $.onUnitChange[unit]();
                $._notifyUnitEvent[unit] = false;
                anyChange = true;
            }
        }
        if (anyChange)
            $.onUnitChange._any_();
    }

    $.update = function () {
        var sceneCondition = SceneManager._scene instanceof Scene_Map;
        var switchCondition = EVGUtils.isSwitchOn($.ControlSwitchID);
        var messageCondition = $gameMessage && !$gameMessage.isBusy() || $.UpdateDuringMessage;

        if (sceneCondition && switchCondition && messageCondition) {
            $.updateUnits(1);
            $.eventUpdate();
        }
    };

    $.registerOnChangeEvent = function (unit, func) {
        var events = $._onUnitChangeEvents[unit]
        if (events === undefined || events === null)
            $._onUnitChangeEvents[unit] = [];
        if (!$._onUnitChangeEvents[unit].contains(func))
            $._onUnitChangeEvents[unit].push(func);
    }

    $.setUnit = function (unit, value) {
        $[unit] = value;
        $.clampUnit[unit]();
    }

    $.changeUnit = function (unit, amount) {
        var sign = amount.sign;
        var times = amount.abs;
        for (var i = 0; i < times; i++)
            $.updateUnit[unit](sign);
        $.eventUpdate();
    }

    $.GetUnitValue = function (unit) {
        return $[unit];
    }

    var oldDM_makeSaveContents = DataManager.makeSaveContents;
    DataManager.makeSaveContents = function () {
        var contents = oldDM_makeSaveContents.call(this);
        contents.basicTimeDataEVG = $.getData();
        return contents;
    }

    var oldDM_extractSaveContents = DataManager.extractSaveContents;
    DataManager.extractSaveContents = function (contents) {
        oldDM_extractSaveContents.call(this, contents);
        if (contents.basicTimeDataEVG !== undefined)
            $.setData(contents.basicTimeDataEVG);
    }

    // Plugin commands
    var oldGI_pluginCommand =
      Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function (command, args) {
        oldGI_pluginCommand.call(this, command, args);
        if (command === 'Time') {
            switch (args[0]) {
                case 'setUnit':
                    $.setUnit(args[1], Number(args[2]));
                    break;
                case 'changeUnit':
                    $.updateUnit[args[1]](Number(args[2]));
                    break;
                case 'changeTimeInterval':
                    $.setUpdateInterval(Number(args[1]));
                    break;
            }
        }
    };
    $.InitializeConfig();
})(BasicTimeCore);
