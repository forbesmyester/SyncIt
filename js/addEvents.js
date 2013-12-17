(function (root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	"use strict";
	if (typeof exports === 'object') {
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		define(factory);
	} else {
		root.SyncIt_addEvents = factory();
	}
})(this, function () {
	
// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

"use strict";

/**
 * # addEvents()
 *
 * Adds events to an existing pseudo-classical Javascript class
 * 
 * ## Example
 *
 * ```javascript
 * var MyClass = function() {
 * };
 *
 * MyClass.prototype.doSomething = function() {
 *	return this._emit('doneit','a','b');
 * };
 *
 * addEvents(MyClass,['doneit']);
 *
 * var myClass = new MyClass();
 * myClass.on('doneit',function (a, b) {
 *	console.log('a = ' + a + ', b = ' + b);
 * }
 * myClass.doSomething();
 * ```
 *
 * ## Parameters
 * * **@param {Function} `classFunc`** The class to add events to.
 * * **@param {Array} `events`** The events you want the class to support.
 */
var addEvents = function(classFunc,events) {

	classFunc.prototype._eventTypes = events;
	
	classFunc.prototype._emit = function(event /*, other arguments */) {

		var i = 0,
			args = Array.prototype.slice.call(arguments, 1);

		if (this._eventTypes.indexOf(event) === -1) {
			throw "SyncIt._emit(): Attempting to fire unknown event '"+event+"'";
		}
		
		if (
			!this.hasOwnProperty('_listeners') ||
			!this._listeners.hasOwnProperty(event)
		) { return; }

		for (i=0; i<this._listeners[event].length; i++) {
			this._listeners[event][i].apply(this, args);
		}
	};
	
	/**
	 * ### CLASS.on()
	 * 
	 * Adds an event listeners to an event
	 * 
	 * #### Parameters
	 * 
	 * * **@param {String} `event`** The name of the event to listen for
	 * * **@param {Function} `listener`** The listener to fire when event occurs.
	 * 
	 * #### Returns
	 * 
	 * * **@return {Boolean}** True if that event is available to listen to.
	 */
	classFunc.prototype.on = function(event,func) {
		
		if (this._eventTypes.indexOf(event) === -1) {
			throw "SyncIt._emit(): Attempting to listen for unknown event '"+event+"'";
		}
		
		if (!this.hasOwnProperty('_listeners')) {
			this._listeners = {};
		}
		
		if (!this._listeners.hasOwnProperty(event)) {
			this._listeners[event] = [];
		}
		
		this._listeners[event].push(func);
		
	};
	classFunc.prototype.listen = classFunc.prototype.on;
	
	/**
	 * ### CLASS.removeAllListeners()
	 *
	 * #### Parameters
	 * 
	 * * **@param {String} `event`** The name of the event you want to remove all listeners for.
	 * 
	 * #### Returns
	 * 
	 * * **@return {Array}** The listeners that have just been removed.
	 */
	classFunc.prototype.removeAllListeners = function(event) {
		
		var propertyNames = (function(ob) {
			var r = [];
			for (var k in ob) { if (ob.hasOwnProperty(k)) {
				r.push(k);
			} }
			return r;
		})(this._listeners);
		
		if (propertyNames.indexOf(event) == -1) {
			return [];
		}
		
		var r = this._listeners[event];
		this._listeners[event] = [];
		return r;
	};

	/**
	 * ### CLASS.removeListener()
	 *
	 * Removes a specific listener from an event.
	 *
	 * #### Parameters
	 * 
	 * * **@param {String} `event`** The name of the event you want to remove a listener from.
	 * * **@param {Function} `listener`** The listener you want to remove.
	 * 
	 * #### Returns
	 * 
	 * * **@return {Boolean}** True if the listener was removed, false otherwise.
	 */
	classFunc.prototype.removeListener = function(event, listener) {
		
		var i = 0,
			replacement = [],
			successful = false;
		
		var propertyNames = (function(ob) {
			var r = [];
			for (var k in ob) { if (ob.hasOwnProperty(k)) {
				r.push(k);
			} }
			return r;
		})(this._listeners);
		
		if (propertyNames.indexOf(event) == -1) {
			return false;
		}
		
		for (i=0; i<this._listeners[event].length; i++) {
			if (this._listeners[event][i] !== listener) {
				replacement.push(this._listeners[event][i]);
			} else {
				successful = true;
			}
		}
		this._listeners[event] = replacement;
		
		return successful;
	};




};

return addEvents;

});
