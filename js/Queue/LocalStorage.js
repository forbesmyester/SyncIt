/*jshint smarttabs:true */
(function (root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	if (typeof exports === 'object') {
		module.exports = factory(
			require('./Constant.js')
		);
	} else if (typeof define === 'function' && define.amd) {
		define(
			['syncit/Constant'],
			factory
		);
	} else {
		root.SyncIt_LocalStorageQueue = factory(
			root.SyncIt_Constant
		);
	}
})(this, function (Constant) {

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

"use strict";

var Lsq = new function(namespace) {
	this._namespace = namespace
};

Lsq.prototype.remove = function(dataset,datakey,next) {
};

Lsq.prototype.push = function(queueitem,next) {
};

Lsq.prototype.advance = function(next) {
};

Lsq.prototype.getFirst = function(next) {
};

Lsq.prototype.getDatasetNames = function(next) {
};

Lsq.prototype.getItemsForDatasetAndDatakey = function(dataset,datakey,next) {
};

Lsq.prototype.getAll = function(dataset,datakey,next) {
};

return Lsq;

});
