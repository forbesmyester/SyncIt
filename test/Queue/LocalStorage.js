/*jshint smarttabs:true */
(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(
			require('../../js/Queue/LocalStorage.js')
		);
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['../../js/Queue/LocalStorage.js'],factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(root.SyncIt_Queue_LocalStorage);
    }
})(this, function (Queue) {

console.log(arguments);

var LocalStorage = function() {
    this.data = {};
	this.keys = [];
};

LocalStorage.prototype.setItem = function(k,v) {
	this.data[k] = v;
	this._regen();
};

LocalStorage.prototype._regen = function() {
	this.keys = [];
	this.length = 0;
	for (var k in this.data) {
		if (this.data.hasOwnProperty(k)) {
			this.keys.push(k);
		}
	}
	this.length = this.keys.length;
}

LocalStorage.prototype.clear = function() {
    this.data = {};
	this._regen();
}

LocalStorage.prototype.key = function(i) {
	return this.keys[i];
}

LocalStorage.prototype.getItem = function(k) {
    if (!this.data.hasOwnProperty(k)) {
        return null;
    }
    return this.data[k];
}

LocalStorage.prototype.removeItem = function(key) {
	if (this.data.hasOwnProperty(key)) {
		delete this.data[key];
		this._regen();
	}
}

describe('Queue/LocalStorage can get a compressed list of keys when',function() {
	it('is asked to!',function() {
		var ls = new LocalStorage();
		ls.setItem('a.ds.dk3.4',1);
		ls.setItem('a.ds.dk3.5',1);
		ls.setItem('a.ds.dk3.6',1);
		ls.setItem('a.ds.dk6.4',1);
		var q = new Queue('a',ls);
		console.log(q._getLocalStorageRanges());
	});
});

});
