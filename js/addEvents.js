(function (root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
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
  
};

return addEvents;

});
