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
	this._listening = false;
};

	Lsq.prototype._serialize = function(queueitem) {
		return {
			u: queueitem.u,
			t: queueitem.t,
			m: queueitem.m,
			z: 0
		};
	};

	Lsq.prototype._unserialize = function(stored,key) {
		var info = key.split('.');
		return {
			u: stored.u,
			t: stored.t,
			m: stored.m,
			s: info[1],
			k: info[2],
			b: info[3]
		};
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
				if (val.length != 4) { continue; }
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
	next(SyncIt_Constant.Error.OK);
};

Lsq.prototype.push = function(queueitem,next) {
	this._ls.setItem(
		[this._ns,queueitem.s,queueitem.k,queueitem.b].join('.'),
		this._serialize(queueitem)
	);
	next(SyncIt_Constant.Error.OK);
};

Lsq.prototype.advance = function(next) {
	var k = this.getFirst(function(e,queueitem) {});
	if (k === null) {
		return next(SyncIt_Constant.Error.NO_DATA_FOUND,null);
	}
	this._ls.removeItem(k);
	return next(SyncIt_Constant.Error.OK);
};

Lsq.prototype.getFirst = function(next) {
	
	var i = 0,
		l = 0,
		k = '';
	for (i=0, l=this._ls.length; i<l; i++) {
		k = this._ls.key(i);
		if (k.substr(0,this._ns.length+1) == this._ns+'.') {
			next(
				SyncIt_Constant.Error.OK,
				this._unserialize(
					this._ls.getItem(k),
					k
				)
			);
			return k;
		}
	}

	next(SyncIt_Constant.Error.NO_DATA_FOUND,null);
	return null;
};

Lsq.prototype.getDatasetNames = function(next) {
	var r = [],
		struct = this._getLocalStorageRanges(),
		k = '',
		tmp = '';
	
	for (k in struct) {
		if (struct.hasOwnProperty(k)) {
			tmp = k.split('.')[0];
			if (r.indexOf(tmp) === -1) {
				r.push(tmp);
			}
		}
	}

	next(SyncIt_Constant.Error.OK,r);
	
};

Lsq.prototype.getItemsForDatasetAndDatakey = function(dataset,datakey,next) {

	var r = [],
		struct = this._getLocalStorageRanges(),
		k = '',
		tmp = '',
		l = 0,
		i = 0,
		storeKey = '';
	
	for (k in struct) {
		if (struct.hasOwnProperty(k)) {
			tmp = k.split('.');
			if ((tmp[0] == dataset) && (tmp[1] == datakey)){
				for (var i=struct[k][0]; i<=struct[k][1]; i++) {
					storeKey = this._ns +
						'.' +
						tmp[0] + '.' +
						tmp[1] + '.' +
						i;
					r.push(
						this._unserialize(
							this._ls.getItem(storeKey),
							storeKey
						)
					);
				}
			}
		}
	}

	next(SyncIt_Constant.Error.OK,r);
};

return Lsq;

});
