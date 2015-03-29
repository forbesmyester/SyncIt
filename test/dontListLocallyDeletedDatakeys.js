(function (
	expect,
	SyncIt,
	SyncIt_AsyncLocalStorage,
	NodestyleAsyncLocalStorage,
	SyncIt_LocalForage,
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
		1
	);

	var nodestyleAsyncLocalStorage = new NodestyleAsyncLocalStorage(
		localStorage,
		'aa',
		JSON.stringify,
		JSON.parse
	);

	var myLocalForage = new SyncIt_LocalForage(
		nodestyleAsyncLocalStorage,
		'bb',
		JSON.stringify,
		JSON.parse,
		1
	);

	var storage = asyncLocalStorage;
	if (process && process.env && process.env.USE_LOCALFORAGE) {
		storage = myLocalForage;
	}

	var pathStore = new SyncIt_Path_AsyncLocalStorage(
		storage,
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

}(
	require('expect.js'),
	require('../SyncIt.js'),
	require('../AsyncLocalStorage.js'),
	require('../NodestyleAsyncLocalStorage.js'),
	require('../LocalForage.js'),
	require('get_tlid_encoder_decoder'),
	require('../Path/AsyncLocalStorage.js'),
	require('../FakeLocalStorage.js'),
	require('../Constant.js'),
	require('../updateResult.js'),
	require('../Unsupported/PathStorageAnalysis'),
	require('../dontListLocallyDeletedDatakeys')
));
