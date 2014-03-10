/*jshint smarttabs:true */
require([
	'../../js/SyncIt',
	'../../js/Constant',
	'../../js/AsyncLocalStorage',
	'get_tlid_encoder_decoder',
	'../../js/Path/AsyncLocalStorage',
	'../../js/FakeLocalStorage',
	'../../js/Unsupported/SyncItStore',
	"dojo/_base/array",
	"dojo/promise/all",
	'expect.js'
],
function(SyncIt, SyncIt_Constant, SyncIt_AsyncLocalStorage, SyncIt_getTLIdEncoderDecoder, SyncIt_Path_AsyncLocalStorage, SyncIt_FakeLocalStorage, SyncItStore, dojoBaseArray, dojoPromiseAll, expect) {

"use strict";

var dataToLoad = [
	{
		s: 'household',
		k: 'a-query',
		o: 'set',
		m: 'matt',
		b: 0,
		r: false,
		t: (new Date().getTime()-1000*60*15),
		u: {
			msg: 'Do we need any shopping?',
			imp: false
		}
	},
	{
		s: 'household',
		k: 'b-look',
		o: 'set',
		m: 'rei',
		b: 0,
		r: false,
		t: (new Date().getTime()-1000*60*7),
		u: {
			msg: 'Just looking in cupboards...',
			imp: false
		}
	},
	{
		s: 'household',
		k: 'c-emergency',
		o: 'set',
		m: 'rei',
		b: 0,
		r: false,
		t: (new Date().getTime()-1000*60*5),
		u: {
			msg: 'I\'m out of cakes! Buy Cakes',
			imp: true
		}
	},
	{
		s: 'household',
		k: 'd-going',
		o: 'set',
		m: 'matt',
		b: 0,
		r: false,
		t: (new Date().getTime()-1000*60*3),
		u: {
			msg: 'OK I\'ll go',
			imp: false
		}
	},
	{
		s: 'household',
		k: 'e-yay',
		o: 'set',
		m: 'rei',
		b: 0,
		r: false,
		t: (new Date().getTime()-1000*60*1),
		u: {
			msg: 'Cakes Yummy!',
			imp: true
		}
	}
];

var syncItFeeder = function(syncIt,allData,next) {
	
	return syncIt.feed(
		allData,
		function(err) {
			expect(err).to.equal(0);
		},
		function(err) {
			expect(err).to.equal(0);
			next();
		}
	);
	
};

describe('SyncItStore.js',function() {
	it('get should return a promise that resolves to a value',function(done) {
		var syncIt = new SyncIt(
			new SyncIt_Path_AsyncLocalStorage(
				new SyncIt_AsyncLocalStorage(
					new SyncIt_FakeLocalStorage(),
					'test',
					JSON.stringify,
					JSON.parse,
					10
				),
				new SyncIt_getTLIdEncoderDecoder(new Date(2010,1,1).getTime())
			)
		);

		syncItFeeder(syncIt,dataToLoad,function() {
			var syncItStore = new SyncItStore(syncIt,'household',[]);
			syncItStore.startup(function() {
				syncItStore.get('household.b-look').then(
					function(r) {
						expect(r.i.msg).to.eql('Just looking in cupboards...');
						expect(r.id).to.eql('household.b-look');
						done();
					},
					function() { }
				);
			});
		});
	});
	
	it('should be able to navigate to a path',function(done) {
		var syncIt = new SyncIt(
			new SyncIt_Path_AsyncLocalStorage(
				new SyncIt_AsyncLocalStorage(
					new SyncIt_FakeLocalStorage(),
					'test',
					JSON.stringify,
					JSON.parse,
					10
				),
				new SyncIt_getTLIdEncoderDecoder(new Date(2010,1,1).getTime())
			)
		);
		var syncItStore = new SyncItStore(syncIt,'household',[]);
		syncItStore.startup(function() {
			expect(
				syncItStore._navigateToPath({a:{b:'ab'},c:'c'},'a.b')
			).to.equal('ab');
			expect(
				syncItStore._navigateToPath({a:{b:'ab'},c:'c'},'c')
			).to.equal('c');
			expect(
				syncItStore._navigateToPath({a:{b:'ab'},c:'c'},'d')
			).to.equal(null);
			done();
		});
	});
	
	it('should return results from a query',function(done) {
		var syncIt = new SyncIt(
			new SyncIt_Path_AsyncLocalStorage(
				new SyncIt_AsyncLocalStorage(
					new SyncIt_FakeLocalStorage(),
					'test',
					JSON.stringify,
					JSON.parse,
					10
				),
				new SyncIt_getTLIdEncoderDecoder(new Date(2010,1,1).getTime())
			)
		);
		syncItFeeder(syncIt,dataToLoad,function() {
			var syncItStore = new SyncItStore(
				syncIt,
				'household',
				['i.msg']
			);
			syncItStore.startup(function() {
				
				var promises = [
					syncItStore.query({},{sort:[{attribute:'m',descending:false}]}),
					syncItStore.query({},{sort:[{attribute:'t',descending:true}]})
				];
				
				dojoPromiseAll(promises).then(function(results) {
					expect(
						dojoBaseArray.map(results[0],function(jrec) { return jrec.m; } )
					).to.eql(
						['matt','matt','rei','rei','rei']
					);
					expect(
						dojoBaseArray.map(results[1],function(jrec) { return jrec.id; } )
					).to.eql(
						['household.e-yay','household.d-going','household.c-emergency','household.b-look','household.a-query']
					);
					done();
				});
				
			});
			
		});
	});
	
	//it('wrapped in an Observable should dynamically update!',function(done) {
	//	var syncIt = new SyncIt(new Store(new Persist()),new Queue(new Persist()),'rei');
	//	syncItFeeder(syncIt,'household',dataToLoad,function() {
	//		var syncItStoreObservable = new Observable(
	//			new SyncItStore(syncIt,'household',['modifier','info.msg','modificationtime'])
	//		);
	//		syncItStoreObservable.startup(function() {
	//		
	//			var query = syncItStoreObservable.query(
	//				{},
	//				{sort:[{attribute:'modificationtime',descending:true}]}
	//			);
	//			
	//			query.then(function(results) {
	//				expect(
	//					dojoBaseArray.map(results,function(jrec) { return jrec._id; } )
	//				).to.eql(
	//					['household.e-yay','household.d-going','household.c-emergency','household.b-look','household.a-query']
	//				);
	//				syncIt.set(
	//					'household',
	//					'f_waiting',
	//					{msg:'I wonder where he is...',imp:false},
	//					function(err) {
	//						expect(err).to.equal(SyncItLib.SyncItError.OK);
	//					});
	//			});
	//			
	//			query.observe(function(ob,removedFrom,insertedInto) {
	//				done();
	//			});
	//		
	//		});
	//	});
	//});
	
});

});
