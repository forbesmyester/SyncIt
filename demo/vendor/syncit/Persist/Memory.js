/*jshint smarttabs:true */
(function (root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	if (typeof exports === 'object') {
		module.exports = factory(require('../Constant.js'));
	} else if (typeof define === 'function' && define.amd) {
		define(['syncit/Constant'], factory);
	} else {
		root.SyncIt_Persist_Memory = factory(root.SyncIt_Constant);
	}
}(this, function (SyncIt_Constant) {

/**
 * ## Persist_Memory
 * 
 * An in memory store, see [the generic Persist](Persist.js.html) for all documentation
 */
var Persist = function() {
	this._data = {};
};
Persist.prototype.set = function(key,value,done) {
	this._data[key] = value;
	return done(SyncIt_Constant.Error.OK);
};
Persist.prototype.get = function(key,done) {
	if (this._data.hasOwnProperty(key)) {
		return done(SyncIt_Constant.Error.OK,this._data[key]);
	}
	return done(SyncIt_Constant.Error.NO_DATA_FOUND,null);
};
Persist.prototype.remove = function(key,done) {
	if (!this._data.hasOwnProperty(key)) {
		return done(SyncIt_Constant.Error.NO_DATA_FOUND);
	}
	delete this._data[key];
	return done(SyncIt_Constant.Error.OK);
};
Persist.prototype.getKeys = function(done) {
	var k,
		r = [];
	for (k in this._data) {
		if (this._data.hasOwnProperty(k)) {
			r.push(k);
		}
	}
	return done(SyncIt_Constant.Error.OK,r);
};

return Persist;

}));