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
		root.SyncIt_Store_LocalStorage = factory(
			root.SyncIt_Constant
		);
	}
})(this, function (SyncIt_Constant) {

"use strict";

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

// For all docs, please see Queue/Persist at present

var Store = function(namespace,localStorage,stringifyFunc,parseFunc) {
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
};

Store.prototype._keyCheck = function(dataset, datakey) {
	var checkRe = /(\.)|(^[0-9])|(^_)/,
		toCheck = {Dataset: dataset, Datakey: datakey},
		msg = '',
		k=0;
		
	for (k in toCheck) {
		if (toCheck.hasOwnProperty(k)) {
			if (checkRe.test(toCheck[k])) {
				msg = 'SyncIt.Store does not support '+k+' '+
					'which includes a "." or starts with a "_" or number';
			}
			if (toCheck[k].length < 2) {
				msg = 'SyncIt.Store does not support '+k+' '+
					'with a length less than 2';
			}
			if (msg) {
				throw 'SyncIt.Store.Invalid'+k+': '+msg;
			}
		}
	}
};

Store.prototype.get = function(dataset, datakey, whenRetrieved) {
	this._keyCheck(dataset,datakey);
	var item = this._parseFunc(this._ls.getItem(
		this._ns + '.' + dataset + '.' + datakey
	));
	if (!item) {
		return whenRetrieved(SyncIt_Constant.Error.NO_DATA_FOUND,null);
	}
	item.s = dataset;
	item.k = datakey;
	whenRetrieved(SyncIt_Constant.Error.OK,item);
};

Store.prototype.set = function(dataset, datakey, value, whenSet) {
	this._keyCheck(dataset,datakey);
	this._ls.setItem(
		this._ns + '.' + dataset + '.' + datakey,
		this._stringifyFunc({
			i: value.i,
			t: value.t,
			m: value.m,
			v: value.v,
			o: value.o
		})
	);
	whenSet(SyncIt_Constant.Error.OK);
};

Store.prototype._extractFromKey = function(key) {
	var keyInfo = key.split('.');
	if (keyInfo.length != 3) {
		return false;
	}
	if (keyInfo[0] != this._ns) {
		return false;
	}
	keyInfo = {
		s: keyInfo[1],
		k: keyInfo[2]
	};
	try {
		this._keyCheck(keyInfo.s,keyInfo.k)
	} catch(e) {
		return false;
	}
	return keyInfo;
};

Store.prototype.getDatasetNames = function(setsRetrieved) {
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
	
	setsRetrieved(SyncIt_Constant.Error.OK,r);
};

Store.prototype.getDatakeyNames = function(dataset, keysRetrieved) {
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

	keysRetrieved(SyncIt_Constant.Error.OK,r);
};

return Store;

});
