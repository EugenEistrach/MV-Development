/*
 *  EVG - Basic Time Common Events
 *
 *  By Eugen Eistrach
 *  BasicTimeCommonEvents.js
 *  Version: 1.0.0
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
 * @help
 * BasicTimeCore.js wird benötigt und muss im PluginManager über diesem Plugin liegen.
 *
 */
if (!PluginManager._scripts.contains("BasicTimeCore")){
  throw new Error("This plugin needs BasicTimeCore to work properly!");
}
var BasicTimeCommonEvents = {};

(function($) {
  "use strict";
  $.Parameters = PluginManager.parameters("BasicTimeCommonEvents");
  var regex = /\[*(\w+) *, *(\d+) *\]/ig;
  var match = regex.exec($.Parameters['Unit CE Connections']);

  var createCallbackFunc = function(id){
      return function(){
        $gameTemp.reserveCommonEvent(id);
      }
  }

  while (match !== null) {
    var funcName = "notify_" + match[1] + "_ce";
    $[funcName] = createCallbackFunc(Number(match[2]));
    BasicTimeCore.RegisterOnChangeEvent(match[1], $[funcName].bind($));
    match = regex.exec($.Parameters['Unit CE Connections']);
  }
})(BasicTimeCommonEvents);
