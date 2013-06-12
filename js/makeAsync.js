(function (root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	if (typeof exports === 'object') {
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		define(factory);
	} else {
		root.SyncIt_makeAsync = factory();
	}
})(this, function () {
	
// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

"use strict";

return function(inst,asynchronousDelay) {
	
	var r = {};
	var k = '';
	
	var makeLaggy = function(func,factor) {
		return function() {
			var args = Array.prototype.slice.call(arguments);
			var cb = args.pop();
			if (asynchronousDelay === false) {
				return cb(func.apply(inst,args));
			}
			setTimeout(function() {
				cb(func.apply(inst,args));
			},Math.floor(Math.random() * factor) + 1);
		};
	};

	for (k in inst) {
		if (Object.getPrototypeOf(inst).hasOwnProperty(k)) {
			r[k] = makeLaggy(Object.getPrototypeOf(inst)[k],asynchronousDelay);
		}
	}
	
	return r;
	
};





});
