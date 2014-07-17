(function (
	expect,
	SyncIt,
	makeAsync,
	SyncIt_SyncLocalStorage,
	SyncIt_getTLIdEncoderDecoder,
	SyncIt_Path_AsyncLocalStorage,
	SyncIt_FakeLocalStorage,
	SyncIt_Constant,
	updateResult,
	SyncIt_Unsupported_PathStorageAnalysis,
	SyncItSynchronous
) {

"use strict";

var getNewPathStore = function() {

	var localStorage = new SyncIt_FakeLocalStorage();
	var SyncIt_AsyncLocalStorage_Sync = makeAsync(SyncIt_SyncLocalStorage, false);
	var syncLocalStorage = new SyncIt_AsyncLocalStorage_Sync(
		localStorage,
		'aa',
		JSON.stringify,
		JSON.parse,
		false
	);
	var pathStore = new SyncIt_Path_AsyncLocalStorage(
		syncLocalStorage,
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

describe('SyncItSynchronous',function() {
	
	
	it('will behave synchronously',function() {
		
		var r;
		var syncIt = new SyncItSynchronous(getFreshSyncIt());
		r = syncIt.set('cars','bmw',{color: 'blue'});
		expect(r[0]).to.equal(SyncIt_Constant.Error.OK);
		expect(r[1]).to.equal('cars');
		expect(r[2]).to.equal('bmw');
		expect(r[4].i).to.eql({color: 'blue'});
		expect(r[4].r).to.eql(false);
		r = syncIt.update('cars','bmw',{$set:{wheels: 4}});
		expect(r[0]).to.equal(SyncIt_Constant.Error.OK);
		expect(r[1]).to.equal('cars');
		expect(r[2]).to.equal('bmw');
		expect(r[4].i).to.eql({color: 'blue', wheels: 4});
		expect(r[4].r).to.eql(false);
		r = syncIt.remove('cars','bmw');
		expect(r[0]).to.equal(SyncIt_Constant.Error.OK);
		expect(r[1]).to.equal('cars');
		expect(r[2]).to.equal('bmw');
		expect(r[4].r).to.eql(true);
	});
	
});

}(
	require('expect.js'),
	require('../SyncIt.js'),
	require('../makeAsync.js'),
	require('../SyncLocalStorage.js'),
	require('get_tlid_encoder_decoder'),
	require('../Path/AsyncLocalStorage.js'),
	require('../FakeLocalStorage.js'),
	require('../Constant.js'),
	require('../updateResult.js'),
	require('../Unsupported/PathStorageAnalysis'),
	require('../SyncItSynchronous')
));
