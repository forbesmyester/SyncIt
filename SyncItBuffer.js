(function (root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	"use strict";
	if (typeof exports === 'object') {
		module.exports = factory(
			require('./Constant.js'),
			require('./SyncIt.js')
		);
	} else {
		define(['./Constant', './SyncIt'], factory);
	}
}(this, function (SyncItConstant, SyncIt) {
	
"use strict";

/**
 * ## SyncItBuffer
 *
 * A wrapper that can be used around SyncIt so you can blindly call functions 
 * that lock SyncIt and they will queue up. 
 *
 * NOTE: This is not unit tested and is perhaps subject to change (may have bugs).
 */

var SyncItBuffer = function(syncIt) {
	/* global setInterval */
	this._syncIt = syncIt;
	this._instructions = [];
	this._current = null;
	setInterval(function() {
		var args, c;
		if ((this._current === null) && this._instructions.length) {
			this._current = this._instructions.shift();
			args = Array.prototype.slice.call(this._current.a);
			args.push(function(e) {
				if (e !== SyncItConstant.Error.UNABLE_TO_PROCESS_BECAUSE_LOCKED) {
					c = this._current.c;
					this._current = null;
					c.apply(
						this._syncIt,
						arguments
					);
				}
			}.bind(this));
			this._current.f.apply(this._syncIt, args);
		}
	}.bind(this), 50);
};

var mapNonBuffered = function(k) {
	SyncItBuffer.prototype[k] = function() {
		this._syncIt[k].apply(
			this._syncIt,
			Array.prototype.slice.call(arguments)
		);
	};
};

var mapBuffered = function(k) {
	SyncItBuffer.prototype[k] = function() {
		this._instructions.push({
			f: this._syncIt[k],
			a: Array.prototype.slice.call(arguments,0,arguments.length - 1),
			c: Array.prototype.slice.call(arguments,arguments.length - 1)[0]
		});
	};
};

var k,
	bufferedFuncs = ['update', 'remove', 'set', 'purge', 'clean', 'feed', 'advance'];
for (k in SyncIt.prototype) {
	if (SyncIt.prototype.hasOwnProperty(k)) {
		if (k.match(/^_/)) { continue; }
		if (bufferedFuncs.indexOf(k) > -1) {
			mapBuffered(k);
		} else {
			mapNonBuffered(k);
		}
	}
}

return SyncItBuffer;

}));
