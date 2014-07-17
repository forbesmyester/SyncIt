module.exports = (function (SyncItConstant, SyncIt) {
	
"use strict";

/**
 * ## SyncItSynchronous
 *
 * A wrapper that can be used around SyncIt making some callbacks take immediate effect and return values instead of firing callbacks
 *
 * NOTE: To use this you will need to use a Synchronous data store conforming to the API in AsyncLocalStorage.js
 */

var SyncItSynchronous = function(syncIt) {
	this._syncIt = syncIt;
};

var mapAsNormal = function(k) {
	SyncItSynchronous.prototype[k] = function() {
		this._syncIt[k].apply(
			this._syncIt,
			Array.prototype.slice.call(arguments)
		);
	};
};

var mapAsSynchronous = function(k) {
	SyncItSynchronous.prototype[k] = function() {
		var args = Array.prototype.slice.call(arguments);
		var toReturn = null;
		args.push(function() {
			toReturn = Array.prototype.slice.call(arguments);
		});
		this._syncIt[k].apply(this._syncIt, args);
		return toReturn;
	};
};

var k,
	synchronousFuncs = ['update', 'remove', 'set'];
for (k in SyncIt.prototype) {
	if (SyncIt.prototype.hasOwnProperty(k)) {
		if (k.match(/^_/)) { continue; }
		if (synchronousFuncs.indexOf(k) > -1) {
			mapAsSynchronous(k);
		} else {
			mapAsNormal(k);
		}
	}
}

return SyncItSynchronous;

}(require('./Constant.js'), require('./SyncIt.js')));
