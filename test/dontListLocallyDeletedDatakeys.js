(function (root, factory) {
	
	"use strict";

	if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		module.exports = factory(
			require('../node_modules/expect.js/expect.js'),
			require('../js/SyncIt.js'),
			require('../js/AsyncLocalStorage.js'),
			require('../js/getTLIdEncoderDecoder.js'),
			require('../js/Path/AsyncLocalStorage.js'),
			require('../js/FakeLocalStorage.js'),
			require('../js/Constant.js'),
			require('../js/updateResult.js'),
			require('../js/Unsupported/PathStorageAnalysis'),
			require('../js/dontListLocallyDeletedDatakeys')
		);
	} else if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(
			[
				'expect.js',
				'syncit/SyncIt',
				'syncit/AsyncLocalStorage.js',
				'syncit/getTLIdEncoderDecoder',
				'syncit/Path/AsyncLocalStorage.js',
				'syncit/FakeLocalStorage',
				'syncit/Constant',
				'syncit/updateResult',
				'syncit/Unsupported/PathStorageAnalysis',
				'syncit/dontListLocallyDeletedDatakeys'
			],
			factory
		);
	} else {
		// Browser globals (root is window)
		root.returnExports = factory(
			root.expect,
			root.SyncIt,
			root.SyncIt_AsyncLocalStorage,
			root.SyncIt_getTLIdEncoderDecoder,
			root.SyncIt_Path_AsyncLocalStorage,
			root.SyncIt_FakeLocalStorage,
			root.SyncIt_Constant,
			root.SyncIt_updateResult,
			root.SyncIt_Unsupported_PathStorageAnalysis,
			root.SyncIt_dontListLocallyDeletedDatakeys
		);
	}
})(this, function (
	expect,
	SyncIt,
	SyncIt_AsyncLocalStorage,
	SyncIt_getTLIdEncoderDecoder,
	SyncIt_Path_AsyncLocalStorage,
	SyncIt_FakeLocalStorage,
	SyncIt_Constant,
	updateResult,
	SyncIt_Unsupported_PathStorageAnalysis,
	dontListLocallyDeletedDatakeys
) {

"use strict";

var getNewPathStore = function() {

	var localStorage = new SyncIt_FakeLocalStorage();
	var asyncLocalStorage = new SyncIt_AsyncLocalStorage(
		localStorage,
		'aa',
		JSON.stringify,
		JSON.parse,
		10
	);
	var pathStore = new SyncIt_Path_AsyncLocalStorage(
		asyncLocalStorage,
		new SyncIt_getTLIdEncoderDecoder(new Date(1980,1,1).getTime())
	);
	SyncIt_Unsupported_PathStorageAnalysis.visualizeData('graph',pathStore,localStorage,'aa');
	return pathStore;
};

var getFreshSyncIt = function() {

	return new SyncIt(
		getNewPathStore(),
		'bob'
	);

};

describe('dontListLocallyDeletedDatakeys',function() {
	
	
	it('will not list deleted',function(done) {
		
		var syncIt = dontListLocallyDeletedDatakeys(getFreshSyncIt());
		
		syncIt.set('cars','bmw',{color: 'blue'},function(err) {
			expect(err).to.eql(SyncIt_Constant.Error.OK);
			syncIt.set('cars','ford',{color: 'red'},function(err) {
				expect(err).to.eql(SyncIt_Constant.Error.OK);
				syncIt.remove('cars','bmw',function(err) {
					expect(err).to.eql(SyncIt_Constant.Error.OK);
					syncIt.getDatakeysInDataset('cars', function(err, datakeys) {
						expect(err).to.eql(SyncIt_Constant.Error.OK);
						expect(datakeys).to.eql(['ford']);
						done();					
					});
				});
			});
		});
	});
	
	it('will still fire callback when no datakeys',function(done) {
		
		var syncIt = dontListLocallyDeletedDatakeys(getFreshSyncIt());

		syncIt.getDatakeysInDataset('cars', function(err, datakeys) {
			expect(err).to.eql(SyncIt_Constant.Error.OK);
			expect(datakeys).to.eql([]);
			done();					
		});
		
	});
});

});
