(function($){
  function Window_CraftingItemList() {
      this.initialize.apply(this, arguments);
  }

  Window_CraftingItemList.prototype = Object.create(Window_ItemList.prototype);
  Window_CraftingItemList.prototype.constructor = Window_CraftingItemList;

  Window_CraftingItemList.prototype.initialize = function(x, y, width, height) {
      Window_ItemList.prototype.initialize.call(this, x, y, width, height);
  };


  Window_CraftingItemList.prototype.maxCols = function() {
      return 2;
  };

  Window_CraftingItemList.prototype.spacing = function() {
      return 48;
  };

  Window_CraftingItemList.prototype.maxItems = function() {
      return this._data ? this._data.length : 1;
  };

  Window_CraftingItemList.prototype.item = function() {
      var index = this.index();
      return this._data && index >= 0 ? this._data[index] : null;
  };

  Window_CraftingItemList.prototype.includes = function(item) {
      switch (this._category) {
      case 'item':
          return DataManager.isItem(item) && item.itypeId === 1;
      case 'weapon':
          return DataManager.isWeapon(item);
      case 'armor':
          return DataManager.isArmor(item);
      case 'keyItem':
          return DataManager.isItem(item) && item.itypeId === 2;
      default:
          return false;
      }
  };

  Window_CraftingItemList.prototype.needsNumber = function() {
      return true;
  };

  Window_CraftingItemList.prototype.isEnabled = function(item) {
      return $gameParty.canUse(item);
  };

  Window_CraftingItemList.prototype.selectLast = function() {
      var index = this._data.indexOf($gameParty.lastItem());
      this.select(index >= 0 ? index : 0);
  };

  Window_CraftingItemList.prototype.drawItem = function(index) {
      var item = this._data[index];
      if (item) {
          var numberWidth = this.numberWidth();
          var rect = this.itemRect(index);
          rect.width -= this.textPadding();
          this.changePaintOpacity(this.isEnabled(item));
          this.drawItemName(item, rect.x, rect.y, rect.width - numberWidth);
          this.drawItemNumber(item, rect.x, rect.y, rect.width);
          this.changePaintOpacity(1);
      }
  };

  Window_CraftingItemList.prototype.numberWidth = function() {
      return this.textWidth('000');
  };

  Window_CraftingItemList.prototype.drawItemNumber = function(item, x, y, width) {
      if (this.needsNumber()) {
          this.drawText(':', x, y, width - this.textWidth('00'), 'right');
          this.drawText($gameParty.numItems(item), x, y, width, 'right');
      }
  };

  Window_CraftingItemList.prototype.updateHelp = function() {
      this.setHelpWindowItem(this.item());
  };

  Window_CraftingItemList.prototype.refresh = function() {
      this.makeItemList();
      this.createContents();
      this.drawAllItems();
  };
})
