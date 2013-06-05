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

var Lsq = new function(namespace,localStorage) {
	this._ns = namespace;
    this._ls = localStorage;

};

Lsq.prototype._getLocalStorageKeys = function() {
    
    if (this._ls.getKeys) {
        return this._ls.getKeys();
    }

    return (function() {
        var r = [],
            i = 0,
            val = false;

        while (val = this.ls.get(i++)) {
            r.push(val);
        }

        return r;

    }.bind(this))();

};

Lsq.prototype.remove = function(dataset,datakey,next) {
    this._ls.removeItem(this._ns + dataset + datakey);
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
