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
