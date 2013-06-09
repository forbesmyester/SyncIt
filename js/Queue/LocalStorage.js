/* jshint strict: true, smarttabs: true, es3: true, forin: true, immed: true, latedef: true, newcap: true, noarg: true, undef: true, unused: true, es3: true, bitwise: false, curly: true, latedef: true, newcap: true, noarg: true, noempty: true */
(function (root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	if (typeof exports === 'object') {
		module.exports = factory(
			require('../Constant.js')
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
})(this, function (SyncIt_Constant) {

"use strict";

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

// For all docs, please see Queue/Persist at present

var Lsq = function(namespace,localStorage,stringifyFunc,parseFunc,maxOrderDigitLength) {
	this._ns = namespace;
    this._ls = localStorage;
	this._stringifyFunc = stringifyFunc ?
		stringifyFunc : 
		function(ob) {
			return JSON.stringify(ob);
		};
	this._parseFunc = parseFunc ?
		parseFunc : 
		function(str) {
			return JSON.parse(str);
		};
	this.maxOrderDigitLength = maxOrderDigitLength ? maxOrderDigitLength : 8;
};

Lsq.prototype._serialize = function(queueitem) {
	return this._stringifyFunc ({
		u: queueitem.u,
		t: queueitem.t,
		m: queueitem.m,
		b: queueitem.b,
		o: queueitem.o
	});
};

Lsq.prototype._unserialize = function(stored,key) {
	var k = '';
	var ob = this._extractFromKey(key);
	var storedOb = this._parseFunc(stored);
	for (k in storedOb) {
		if (storedOb.hasOwnProperty(k)) {
			ob[k] = storedOb[k];
		}
	}
	delete ob.p
	return ob;
};

Lsq.prototype._extractFromKey = function(key) {
	var info = key.split('.');
	if (info[0] != this._ns) {
		return false;
	}
	return {
		p: parseInt(info[1],10),
		s: info[2],
		k: info[3]
	};
};

Lsq.prototype._findLowestKey = function() {
	var i = 0,
		k = '',
		l = 0;
	for ( i=0, l=this._ls.length; i<l; i++ ) {
		k = this._ls.key(i);
		if (this._extractFromKey(k) !== false) {
			return k;
		}
	}
	return false;
};

Lsq.prototype._findHighestOrderint = function() {
	var i = 0,
		keyInfo = {};
	for ( i=this._ls.length-1; i>=0; i-- ) {
		keyInfo = this._extractFromKey(this._ls.key(i));
		if (keyInfo !== false) {
			return keyInfo.p;
		}
	}
	return 1;
};

Lsq.prototype._pad = function(n) {
	n = ""+n;
	while (n.length < this.maxOrderDigitLength) {
		n = '0'+n;
	}
	return n;
};

Lsq.prototype._unpad = function(str) {
	while (str.substr(0,1) == '0') {
		str = str.substr(1);
	}
	return parseInt(str,10);
};

Lsq.prototype._constructKey = function(queueitem,orderInt) {
	return this._ns + '.' + this._pad(orderInt) + '.' + queueitem.s + '.' + queueitem.k;
};

Lsq.prototype._removeByDatasetAndDatakey = function(dataset,datakey,next) {
	var i = 0,
		l = 0,
		keyInfo = {};
	for ( i=0, l=this._ls.length; i<this._ls.length; i++) {
		if ((keyInfo = this._extractFromKey(this._ls.key(i))) !== false) {
			if ((keyInfo.s == dataset) && (keyInfo.k == datakey)) {
				this._ls.removeItem(this._ls.key(i));
			}
		}
	}
	next(SyncIt_Constant.Error.OK);
};

Lsq.prototype.push = function(queueitem,next) {
	this._ls.setItem(
		this._constructKey(queueitem,this._pad(this._findHighestOrderint()+1)),
		this._serialize(queueitem)
	);
	next(SyncIt_Constant.Error.OK);
};

Lsq.prototype.advance = function(next) {
	var k = this._findLowestKey();
	if (k === false) {
		return next(SyncIt_Constant.Error.NO_DATA_FOUND,null);
	}
	this._ls.removeItem(k);
	return next(SyncIt_Constant.Error.OK);
};

Lsq.prototype.getFirst = function(next) {
	
	var i = 0,
		l = 0,
		k = '';
	
	k = this._findLowestKey();
	if (k === false) {
		return next(SyncIt_Constant.Error.NO_DATA_FOUND,null);
	}
	return next(
		SyncIt_Constant.Error.OK,
		this._unserialize(this._ls.getItem(k),k)
	);
};

Lsq.prototype.getDatasetNames = function(next) {
	var r = [],
		i = 0,
		l = 0,
		keyInfo = {};
	
	for ( i=0, l=this._ls.length; i<l; i++ ) {
		keyInfo = this._extractFromKey(this._ls.key(i));
		if (keyInfo === false) { continue; }
		if (r.indexOf(keyInfo.s) === -1) {
			r.push(keyInfo.s);
		}
	}

	next(SyncIt_Constant.Error.OK,r);
	
};

Lsq.prototype.getDatakeyInDataset = function(dataset,next) {
	var r = [],
		i = 0,
		l = 0,
		keyInfo = {};
	
	for ( i=0, l=this._ls.length; i<l; i++ ) {
		keyInfo = this._extractFromKey(this._ls.key(i));
		if (keyInfo === false) { continue; }
		if ((keyInfo.s == dataset) && (r.indexOf(keyInfo.k) === -1)) {
			r.push(keyInfo.k);
		}
	}

	next(SyncIt_Constant.Error.OK,r);
	
};

Lsq.prototype.getFullQueue = function(next) {
	var r = [],
		i = 0,
		l = 0,
		k = '';
	
	for ( i=0, l=this._ls.length; i<l; i++ ) {
		k = this._ls.key(i)
		if (this._extractFromKey(k) === false) { continue; }
		r.push(this._unserialize(this._ls.getItem(k),k));
	}

	next(SyncIt_Constant.Error.OK,r);
	
};

Lsq.prototype.getCountInQueue = function(next) {
	var r = 0,
		i = 0,
		l = 0,
		k = '';
	
	for ( i=0, l=this._ls.length; i<l; i++ ) {
		k = this._ls.key(i)
		if (this._extractFromKey(this._ls.key(i)) === false) { continue; }
		r++;
	}
	
	return next(SyncIt_Constant.Error.OK,r);
}

Lsq.prototype.getItemsForDatasetAndDatakey = function(dataset,datakey,next) {

	var r = [],
		k = '',
		tmp = '',
		l = 0,
		i = 0,
		keyInfo = '';
	
	for ( i=0, l=this._ls.length; i<l; i++) {
		k = this._ls.key(i);
		keyInfo = this._extractFromKey(k);
		if ((keyInfo.s === dataset) && (keyInfo.k === datakey)) {
			r.push(this._unserialize(this._ls.getItem(k),k));
		}
	}
	
	next(SyncIt_Constant.Error.OK,r);
};

return Lsq;

});
