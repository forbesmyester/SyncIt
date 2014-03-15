(function (root, factory) {
	
	"use strict";

	if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		module.exports = factory(
			require('expect.js'),
			require('../SyncIt.js'),
			require('../AsyncLocalStorage.js'),
			require('get_tlid_encoder_decoder'),
			require('../Path/AsyncLocalStorage.js'),
			require('../FakeLocalStorage.js'),
			require('../Constant.js'),
			require('../updateResult.js'),
			require('../Unsupported/PathStorageAnalysis'),
			require('../dontListLocallyDeletedDatakeys')
		);
	} else {
		// AMD. Register as an anonymous module.
		define(
			[
				'../SyncIt',
				'../AsyncLocalStorage.js',
				'get_tlid_encoder_decoder',
				'../Path/AsyncLocalStorage.js',
				'../FakeLocalStorage',
				'../Constant',
				'../updateResult',
				'../Unsupported/PathStorageAnalysis',
				'../dontListLocallyDeletedDatakeys'
			],
			factory.bind(this, expect)
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
