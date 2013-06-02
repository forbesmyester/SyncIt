/*jshint smarttabs:true */
(function (root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	if (typeof exports === 'object') {
		module.exports = factory(
			require('../Constant.js'),
			require('./Memory.js')
		);
	} else if (typeof define === 'function' && define.amd) {
		define(
			['syncit/Constant','syncit/Persist/Memory'],
			factory
		);
	} else {
		root.SyncIt_Persist_MemoryAsync = factory(
			root.SyncIt_Constant,
			root.SyncIt_Persist_Memory
		);
	}
}(this, function (SyncIt_Constant,SyncIt_Persist_Memory) {

var makeLaggy = function(func,factor) {
	return function() {
		var args = Array.prototype.slice.call(arguments);
		setTimeout(function() {
			func.apply(this,args);
		},Math.floor(Math.random() * factor) + 2);
	};
};

/**
 * ## Persist_Memory
 * 
 * An in memory store store, but asynchronous... useful for testing...
 * 
 * See [the generic Persist](Persist.js.html) for all documentation
 */
var Persist = function() {
	this._data = {};
	
	var proto = ['set','get','remove','getKeys'];

	for (var i = 0, l = proto.length; i < l; i++) {
		this[proto[i]] = makeLaggy(
			SyncIt_Persist_Memory.prototype[proto[i]].bind(this),
			20
		);
	}
	
}

return Persist;

}));