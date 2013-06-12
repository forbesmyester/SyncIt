(function (root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	if (typeof exports === 'object') {
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		define(factory);
	} else {
		root.SyncIt_AsyncLocalStorage = factory();
	}
}(this, function () {
	
// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

"use strict";

var AsyncLocalStorage = function(localStorage,serialize,unserialize,delay) {
	this._ls = localStorage;
	this._serialize = serialize;
	this._unserialize = unserialize;
	this._delay = delay;
};

AsyncLocalStorage.prototype._delayReturn = function(r,next) {
	if (this._delay === false) {
		return next(r);
	}
	setTimeout(function() {
		next(r);
	}.bind(this),this._delay);
};

AsyncLocalStorage.prototype.setItem = function(k,v,next) {
	this._delayReturn(this._ls.setItem(k,this._serialize(v)),next);
};

AsyncLocalStorage.prototype.clear = function(next) {
	this._delayReturn(this._ls.clear(),next);
};

AsyncLocalStorage.prototype.key = function(i,next) {
	this._delayReturn(this._ls.key(k,v),next);
};

AsyncLocalStorage.prototype.getItem = function(k,next) {
	this._delayReturn(this._unserialize(this._ls.getItem(k)),next);
};

AsyncLocalStorage.prototype.removeItem = function(key,next) {
	this._delayReturn(this._ls.removeItem(key),next);
};

AsyncLocalStorage.prototype.getAllKeys = function(next) {
	this._delayReturn(function() {
		var i = 0,
			l = 0,
			r = [];

		for (i=0, l=this._ls.length; i<l; i++) {
			r.push(this._ls.key(i));
		}
		return r;

	}.call(this),next);
};

return AsyncLocalStorage;

}));
