/*
 *  EVG - Global Data
 *
 *  By Eugen Eistrach
 *  GlobalData.js
 *  Version: 1.0.0
 *  Free for commercial and non commercial use.
 */
/*:
 * @plugindesc This allows you to save and load global variables which are the same between all saves.
 *
 * @author Eugen Eistrach
 *
 * @help
 * Plugin Commands:
 *
 *  // Saves session variable with localID to the global variable list with globalID
 *  GlobalData setVariable globalID, localID
 *  // Saves session switch with localID to the global switch list with globalID
 *  GlobalData setSwitch globalID, localID
 *
 * Scriptcalls:
 *
 *  // Returns value of global variable with globalID as id
 *  GlobalData.getVariable(globalID);
 *  // Returns value of global switch with globalID as id
 *  GlobalData.getSwitch(globalID);
 *
 */
var GlobalData = {};
(function($) {
  "use strict";
  $.loadGlobalInfo = function() {
      var json;
      var global = {};
      global.variables = [];
      global.switches = [];
      try {
          json = StorageManager.load("evgGlobalData");
      } catch (e) {
          console.error(e);
          return global;
      }
      if (json) {
          return JSON.parse(json);
      } else {
          return global;
      }
  };

  $.getVariable = function(id) {
    return $.global.variables[id];
  }

  $.setVariable = function(globalId, localId) {
    $.global.variables[globalId] = $gameVariables.value(localId);
    StorageManager.save("evgGlobalData", JSON.stringify($.global));
  }

  $.getSwitch = function(id) {
    return $.global.switches[id]
  }

  $.setSwitch = function(globalId, localId) {
    $.global.switches[globalId] = $gameSwitches.value(localId);
    StorageManager.save("evgGlobalData", JSON.stringify($.global));
  }

  var oldSM_localFilePath = StorageManager.localFilePath;
  StorageManager.localFilePath = function(savefileId) {
      if (savefileId === "evgGlobalData") {
        return this.localFileDirectoryPath() + 'globaldataevg.rpgsave';
      } else {
        return oldSM_localFilePath.call(this, savefileId);
      }
  };

  var oldSM_webStorageKey = StorageManager.webStorageKey;
  StorageManager.webStorageKey = function(savefileId) {
    if (savefileId === "evgGlobalData") {
      return 'RPG Global Data EVG';
    } else {
      return oldSM_webStorageKey.call(this, savefileId);
    }
  };

  // Plugin commands
  var oldGI_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function(command, args) {
    oldGI_pluginCommand.call(this, command, args);
    if (command === 'GlobalData') {
      switch (args[0]) {
        case 'setVariable':
          $.setVariable(args[1], args[2]);
          break;
        case 'setSwitch':
          $.setSwitch(args[1], args[2]);
          break;
      }
    }
  };

  $.global = $.loadGlobalInfo();
})(GlobalData);
