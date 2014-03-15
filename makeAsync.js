(function (root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	"use strict";
	if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		define([],factory);
	}
})(this, function () {

"use strict";

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

/**
 * # makeAsync(classFunc, asynchronousDelay)
 *
 * Takes a pseudo-classical Javascript class and converts that class into an 
 * asynchronous version.
 * 
 * ## Example
 * ```javascript
 * var MyClass = function(property) {
 *	this.property = property;
 * };
 *
 * MyClass.prototype.getProperty = function() {
 *	return this.property + 3;
 * };
 *
 * var AsyncMyClass = makeAsync(MyClass);
 * var asyncMyClass = new AsyncMyClass(4);
 * asyncMyClass.getProperty(function(property) {
 *	// Outputs "Property is 7"
 *	console.log('Property is '+property);
 * });
 * ```
 *
 * ## Parameters
 * * **@param {Function} `classFunc`**
 * * **@param {Number} `asynchronousDelay`**
 */
return function(classFunc,asynchronousDelay) {
	
	// This will create the constructor
	var constructorFunc  = function() {
		var args = Array.prototype.slice.call(arguments);
		args.unshift(null);
		var Factory = classFunc.bind.apply(
			classFunc,
			args
		);
		this._inst = new Factory();
	};

	var k = '';
	
	// Takes a function and a factor and returns an asynchronous 
	// (if factor != false) function which wraps the func and passes 
	// it's parameters through with the addition of a callback
	var makeLaggy = function(func,factor) {
		return function() {
			
			/* globals setTimeout: false */

			var args = Array.prototype.slice.call(arguments);
			var cb = args.pop();
			if (factor === false) {
				return cb(func.apply(this._inst,args));
			}
			setTimeout(function() {
				cb(func.apply(this._inst,args));
			}.bind(this),Math.floor(Math.random() * factor) + 1);
		};
	};

	// This should be an IIFE in the for loop below, except that JSHint complains
	// about functions in loops
	var proc = function(k) {
		constructorFunc.prototype[k] = makeLaggy(classFunc.prototype[k],asynchronousDelay);
	};

	// Look at classFunc and use makeLaggy to attach a asynchronous version of
	// the function.
	for (k in classFunc.prototype) {
		if (classFunc.prototype.hasOwnProperty(k)) {
			proc(k);
		}
	}
	
	return constructorFunc;
	
};

});
