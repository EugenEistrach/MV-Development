/*
 *  EVG - Splash Screen
 *
 *  By Eugen Eistrach
 *  SplashScreen.js
 *  Version: 1.0.0
 *  Free for commercial and non commercial use.
 */
/*:
 * @plugindesc Fügt dem Spiel ein Splash Screen hinzu.
 *
 * @author Eugen Eistrach
 *
 * @param Splash Duration
 * @desc Dauer pro Splash in Frames
 * @default 60
 *
 * @param Fade Duration
 * @desc Fade-in und Fade-out Dauer in Frames
 * @default 30
 *
 * @param Splash Picture 1      
 * @desc Erstes Splash Bild. (Leer lassen für kein Bild)               
 * @default
 * 
 * @param Splash Picture 2     
 * @desc Zweites Splash Bild. (Leer lassen für kein Bild)                
 * @default
 *
 * @param Splash Picture 3      
 * @desc Drittes Splash Bild. (Leer lassen für kein Bild)                
 * @default
 * 
 * @param Splash Picture 4 
 * @desc Viertes Splash Bild. (Leer lassen für kein Bild)               
 * @default
 * 
 * @param Splash Picture 5      
 * @desc Fünftes Splash Bild. (Leer lassen für kein Bild)               
 * @default
 * 
 * @help
 *  Alle Splash Bilder müssen im Ordner img/pictures liegen.
 *  
 */

var EVGUtils = EVGUtils || {};
(function ($) {
    "use strict";

    $.getMultipleConfigParams = function (parameters, regex) {
        var params = [];
        Object.keys(parameters).forEach(function (p) {
            if (p.match(regex)) {
                var value = parameters[p];
                if (value.length !== 0 && value.trim())
                    params.push(value);
            }
        });
        return params;
    };
})(EVGUtils);

var SplashScreen = SplashScreen || {};
(function ($) {

    $.Parameters = PluginManager.parameters('SplashScreen');
    $.SplashDuration = Number($.Parameters['Splash Duration']);
    $.FadeDuration   = Number($.Parameters['Fade Duration']);
    $.SplashPictures = EVGUtils.getMultipleConfigParams($.Parameters, /Splash Picture.*/i);
    $.Enabled = true;

    var old_sb_start = Scene_Boot.prototype.start;
    Scene_Boot.prototype.start = function () {
        if ($.Enabled) {
            Scene_Base.prototype.start.call(this);
            SoundManager.preloadImportantSounds();
            if (DataManager.isBattleTest()) {
                DataManager.setupBattleTest();
                SceneManager.goto(Scene_Battle);
            } else if (DataManager.isEventTest()) {
                DataManager.setupEventTest();
                SceneManager.goto(Scene_Map);
            } else {
                this.checkPlayerLocation();
                DataManager.setupNewGame();
                SceneManager.goto(Scene_SplashScreen);
            }
            this.updateDocumentTitle();
        } else {
            old_sb_start.call(this);
        }     
    };

    function Scene_SplashScreen() {
        this.initialize.apply(this, arguments);
    };

    Scene_SplashScreen.prototype = Object.create(Scene_Base.prototype);
    Scene_SplashScreen.prototype.constructor = Scene_SplashScreen;

    Scene_SplashScreen.prototype.create = function () {
        Scene_Base.prototype.create.call(this);
        this._splashIndex = 0;
        this._picture = new Sprite(ImageManager.loadPicture($.SplashPictures[this._splashIndex]));
        this.addChild(this._picture);
        this._counter = 0;
        this._maxDuration = $.FadeDuration * 2 + $.SplashDuration;
        this._doFadeIn = false;
        this.startFadeIn($.FadeDuration);
    };

    Scene_SplashScreen.prototype.goToTitle = function () {
        SceneManager.goto(Scene_Title);
        Window_TitleCommand.initCommandPosition();
    };

    Scene_SplashScreen.prototype.update = function () {
        Scene_Base.prototype.update.call(this);
        this.updatePicture();
    };

    Scene_SplashScreen.prototype.updatePicture = function () {
        if (this.isBusy())
            return;
        if (this._doFadeIn) {
            this.nextPicture();
            this._doFadeIn = false;
        }
        if (this._counter > $.SplashDuration) {
            this.startFadeOut($.FadeDuration);
            this._doFadeIn = true;
            this._counter = 0;
        }
        this._counter++;
    };

    Scene_SplashScreen.prototype.nextPicture = function () {
        this._splashIndex++;
        if (this._splashIndex >= $.SplashPictures.length) {
            this.goToTitle();
        } else {
            this._picture.bitmap = ImageManager.loadPicture($.SplashPictures[this._splashIndex]);
            this.startFadeIn($.FadeDuration);
        }
    };
})(SplashScreen);