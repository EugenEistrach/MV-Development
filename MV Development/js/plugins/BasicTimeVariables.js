/*
 *  EVG - Basic Time Variables
 *
 *  By Eugen Eistrach
 *  BasicTimeVariables.js
 *  Version: 1.0.0
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
 * @help
 * Do not change the variables with the configured ids manually, cause this will
 * cause unexpected behaviour.
 */
if (!PluginManager._scripts.contains("BasicTimeCore")){
  throw new Error("This plugin needs BasicTimeCore to work properly!");
}
var BasicTimeVariables = {};

(function($) {
  "use strict";
  $.Parameters = PluginManager.parameters("BasicTimeVariables");
  var regex = /\[*(\w+) *, *(\d+) *\]/ig;
  var match = regex.exec($.Parameters['Unit Variables Connections']);
  $.unitsToUpdate = [];

  var createUpdateVariablesFunc = function(unit, variableID){
      return function(){
        $gameVariables.setValue(variableID, BasicTimeCore[unit]);
      }
  }

  $.UpdateAllVariables = function(){
    for (var i = 0; i < this.unitsToUpdate.length; i++)
    {
      var funcName = "update_" + this.unitsToUpdate[i] + "_variable";
      $[funcName]();
    }
  }

  while (match !== null) {
    var funcName = "update_" + match[1] + "_variable";
    $.unitsToUpdate.push(match[1]);
    $[funcName] = createUpdateVariablesFunc(match[1], Number(match[2]))
    match = regex.exec($.Parameters['Unit Variables Connections'])
  }

  var oldDM_setupNewGame = DataManager.setupNewGame;
  DataManager.setupNewGame = function() {
      oldDM_setupNewGame.call(this);
      $.UpdateAllVariables();
  };

  var oldDM_extractSaveContents = DataManager.extractSaveContents;
  DataManager.extractSaveContents = function(contents) {
    oldDM_extractSaveContents.call(this, contents);
    $.UpdateAllVariables();
  }

  BasicTimeCore.RegisterOnChangeEvent("_any_", $.UpdateAllVariables.bind($));
})(BasicTimeVariables);
