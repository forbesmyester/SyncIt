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
		root.SyncIt_Queue_LocalStorage = factory(
			root.SyncIt_Constant
		);
	}
})(this, function (Constant) {

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

"use strict";

var Lsq = function(namespace,localStorage) {
	this._ns = namespace;
    this._ls = localStorage;
};

Lsq.prototype._getLocalStorageRanges = function() {
    
    return (function() {
        var r = {},
            i = 0,
			l = 0,
            val = false,
			key = '';

		for (i=0, l=this._ls.length; i<l ;i++) {
			val = this._ls.key(i);
			if (val.substr(0,this._ns.length+1) == this._ns + '.') {
				val = val.split('.');
				val.shift();
				key = val[0] + "." + val[1];
				if (!r.hasOwnProperty(key)) {
					r[key] = [null,null];
				}
				if ( (r[key][0] === null) || (r[key][0] > parseInt(val[2],10)) ) {
					r[key][0] = parseInt(val[2],10);
				}
				if ( (r[key][1] === null) || (r[key][0] < parseInt(val[2],10)) ) {
					r[key][1] = parseInt(val[2],10);
				}
			}
        }

        return r;

    }.bind(this))();

};

Lsq.prototype.remove = function(dataset,datakey,next) {
    this._ls.removeItem(this._ns + "." + dataset + "." + datakey);
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
