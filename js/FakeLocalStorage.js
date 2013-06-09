(function (root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	if (typeof exports === 'object') {
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		define(factory);
	} else {
		root.SyncIt_FakeLocalStorage = factory();
	}
}(this, function () {
	
// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

"use strict";

var FakeLocalStorage = function() {
    this.data = {};
	this.keys = [];
};

FakeLocalStorage.prototype.setItem = function(k,v) {
	this.data[k] = v;
	this._regen();
};

FakeLocalStorage.prototype._regen = function() {
	this.keys = [];
	this.length = 0;
	for (var k in this.data) {
		if (this.data.hasOwnProperty(k)) {
			this.keys.push(k);
		}
	}
	this.length = this.keys.length;
};

FakeLocalStorage.prototype.clear = function() {
    this.data = {};
	this._regen();
};

FakeLocalStorage.prototype.key = function(i) {
	return this.keys[i];
};

FakeLocalStorage.prototype.getItem = function(k) {
    if (!this.data.hasOwnProperty(k)) {
        return null;
    }
    return this.data[k];
};

FakeLocalStorage.prototype.removeItem = function(key) {
	if (this.data.hasOwnProperty(key)) {
		delete this.data[key];
		this._regen();
	}
};

return FakeLocalStorage;

}));
