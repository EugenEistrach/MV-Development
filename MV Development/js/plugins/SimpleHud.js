/*
 *  EVG - Simple Hud
 *
 *  By Eugen Eistrach
 *  SimpleHud.js
 *  Version: 0.0.1
 *  Free for commercial and non commercial use.
 */
/*:
 * @plugindesc Zeigt eine simple Hud auf der Map an
 *
 * @author Eugen Eistrach
 *
 * @param Position
 * @desc Top, Bot, Left oder Right auswählen
 * @default Top
 * 
 * @param Show HP   
 * @desc Sollen HP angezeigt werden? (true oder false)            
 * @default true
 *
 * @param Show MP     
 * @desc Sollen MP angezeigt werden? (true oder false)            
 * @default true
 * 
 * @param Show TP
 * @desc Sollen TP angezeigt werden? (true oder false)
 * @default true
 * 
 * @param Show Name
 * @desc Sollen die Namen der Actors angezeigt werden? (true oder false)
 * @default true
 * 
 * @param Show Face
 * @desc Soll das Face angezeigt werden? (true oder false)    
 * @default true
 * 
 * 
 * @param Controll Switch
 * @desc Switch ID zum aus und anschalten des Huds
 * @default 1
 * 
 * @help
 *  
 *  
 */

var EVGSimpleHUD = EVGSimpleHUD || {};

(function ($) {
    "use strict";
    $.Parameters = PluginManager.parameters('SimpleHud');
    $.Position = $.Parameters['Position'];
    $.MaxActors = 4//Number($.Parameters['Max Actors']).clamp(0, 4);
    $.ShowHP = $.Parameters['Show HP'] == 'true';
    $.ShowMP = $.Parameters['Show MP'] == 'true';
    $.ShowTP = $.Parameters['Show TP'] == 'true';
    $.ShowName = $.Parameters['Show Name'] == 'true';
    $.ShowFace = $.Parameters['Show Face'] == 'true';
    $.ControllSwitchID = Number($.Parameters['Controll Switch']);
    //$.ShowChar = $.Parameters['Show Character'] == 'true';

    var oldSM_createAllWindows = Scene_Map.prototype.createAllWindows;
    Scene_Map.prototype.createAllWindows = function () {
        oldSM_createAllWindows.call(this);
        this.createSimpleHudWindow();
    }

    Scene_Map.prototype.createSimpleHudWindow = function () {
        this._simpleHudWindow = new Window_SimpleHud();
        this.addWindow(this._simpleHudWindow);
    }

    function Window_SimpleHud() {
        this.initialize.apply(this, arguments);
    };

    Window_SimpleHud.prototype = Object.create(Window_Base.prototype);
    Window_SimpleHud.prototype.constructor = Window_SimpleHud;

    Window_SimpleHud.prototype.initialize = function () {
        Window_Base.prototype.initialize.call(this, this.windowX(), this.windowY(), this.windowWidth(), this.windowHeight());
        this._bitmaps = [];
        this._finishedLoading = false;
        this.loadImages();
        this.oldData = [];
    };

    Window_SimpleHud.prototype.windowX = function () {
        switch ($.Position.toLowerCase()) {
            case 'top':
            case 'bot':
            case 'left':
                return 0;
                break;
            case 'right':
                return Graphics.boxWidth - this.windowWidth();
                break;
        };
    };

    Window_SimpleHud.prototype.windowY = function () {
        switch ($.Position.toLowerCase()) {
            case 'bot':
                return Graphics.boxHeight - this.windowHeight();
                break;
            case 'left':
            case 'right':
            case 'top':
                return 0;
                break;
        };
    };

    Window_SimpleHud.prototype.windowWidth = function () {
        switch ($.Position.toLowerCase()) {
            case 'bot':
            case 'top':
                return Graphics.boxWidth;
                break;
            case 'left':
            case 'right':
                return Graphics.boxWidth / 4;
                break;
        };
    };

    Window_SimpleHud.prototype.windowHeight = function () {
        switch ($.Position.toLowerCase()) {
            case 'bot':
            case 'top':
                return this.cHeight() + this.standardPadding() * 2;
                break;
            case 'left':
            case 'right':
                return Graphics.boxHeight;
                break;
        };
    };

    Window_SimpleHud.prototype.cMaxHeight = function () {
        switch ($.Position.toLowerCase()) {
            case 'bot':
            case 'top':
                return Window_Base._faceHeight;
                break;
            case 'left':
            case 'right':
                return this.contentsHeight() / 4 - 12;
                break;
        };
    };

    Window_SimpleHud.prototype.cHeight = function () {
        var height = 0;
        if ($.ShowHP)
            height += this.lineHeight();
        if ($.ShowMP)
            height += this.lineHeight();
        if ($.ShowTP)
            height += this.lineHeight();
        if ($.ShowName)
            height += this.lineHeight();
        if ($.ShowFace && height < this.cMaxHeight())
            height = this.cMaxHeight();
        return height;
    };

    Window_SimpleHud.prototype.cWidth = function () {
        switch ($.Position.toLowerCase()) {
            case 'bot':
            case 'top':
                return this.contentsWidth() / 4 - 12;
                break;
            case 'left':
            case 'right':
                return this.contentsWidth();
                break;
        };
        
    };

    Window_SimpleHud.prototype.lineHeight = function () {
        switch ($.Position.toLowerCase()) {
            case 'bot':
            case 'top':
                return Window_Base.prototype.lineHeight.call(this);
                break;
            case 'left':
            case 'right':
                return this.cMaxHeight() / 4;
                break;
        };
    }

    Window_SimpleHud.prototype.contentPositionX = function (i) {
        switch ($.Position.toLowerCase()) {
            case 'bot':
            case 'top':
                return (this.cWidth() + 12) * i + 6;
                break;
            case 'left':
            case 'right':
                return 0;
                break;
        };

    };

    Window_SimpleHud.prototype.contentPositionY = function (i) {
        switch ($.Position.toLowerCase()) {
            case 'bot':
            case 'top':
                return 0;
                break;
            case 'left':
            case 'right':
                return (this.cMaxHeight() + 12) * i + 6;
                break;
        };

    };

    Window_SimpleHud.prototype.loadImages = function () {
        var max = this.maxActors();
        for (var i = 0; i < max; i++) {
            this._bitmaps.push(ImageManager.loadFace($gameParty.members()[i].faceName()));
        };
    };

    Window_SimpleHud.prototype.update = function () {
        Window_Base.prototype.update.call(this);
        if (!this._finishedLoading) {
            this._finishedLoading = true;
            for (var i = 0; i < this._bitmaps.length; i++) {
                if (!this._bitmaps[i].isReady())
                    this._finishedLoading = false;
            };
            if (this._finishedLoading)
                this.refresh();
        };
        if (this.needRefresh()) {
            this.refresh();
        };
        this.visible = $gameSwitches.value($.ControllSwitchID)
    };

    Window_SimpleHud.prototype.needRefresh = function () {
        if (this.oldData.length != this.maxActors())
            return true;
        for (var i = 0; i < this.maxActors() ; i++) {
            var data = this.oldData[i];
            var actor = $gameParty.members()[i];
            if (!data)
                return true;
            if (data.hp !== actor.hp || data.mp !== actor.mp || data.tp !== actor.tp)
                return true;
        }
        return false;
    };

    Window_SimpleHud.prototype.refresh = function () {
        if (this.contents) {
            this.contents.clear();
            var max = this.maxActors();
            for (var i = 0; i < max; i++) {
                var x = this.contentPositionX(i);
                var y = this.contentPositionY(i);
                var actor = $gameParty.members()[i];
                var data = this.oldData[i];
                if (!data)
                    data = {};
                this.drawActorInfo(actor, x, y, this.cWidth());
                data.hp = actor.hp;
                data.mp = actor.mp;
                data.tp = actor.tp;
                this.oldData[i] = data;
            };
        };
    };

    Window_SimpleHud.prototype.maxActors = function () {
        var max = $.MaxActors;
        if (max > $gameParty.members().length)
            max = $gameParty.members().length;
        return max;
    }

    Window_SimpleHud.prototype.drawActorInfo = function (actor, x, y, width) {
        var yPlus = 0;
        var maxY = this.lineHeight() * 3;
        if ($.ShowFace) {
            this.drawActorFace(actor, x, y, this.cMaxHeight(), Window_Base._faceWidth);
        };
        if ($.ShowName) {
            this.drawActorName(actor, x, y, width);
        };
        if ($.ShowTP) {
            this.drawActorTp(actor, x, y + maxY - yPlus, width);
            yPlus += this.lineHeight();
        };
        if ($.ShowMP) {
            this.drawActorMp(actor, x, y + maxY - yPlus, width);
            yPlus += this.lineHeight();
        };
        if ($.ShowHP) {
            this.drawActorHp(actor, x, y + maxY - yPlus, width);
            yPlus += this.lineHeight();
        };      
    };

})(EVGSimpleHUD);