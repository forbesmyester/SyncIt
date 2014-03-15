/*jshint smarttabs:true */
(function (root, factory) {
	
	"use strict";

	if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		module.exports = factory(
			require('expect.js'),
			require('../../Constant.js'),
			require('../../FakeLocalStorage.js'),
			require('../../AsyncLocalStorage.js'),
			require('get_tlid_encoder_decoder'),
			require('../../Path/AsyncLocalStorage.js'),
			require('../../Unsupported/PathStorageAnalysis.js')
		);
	} else {
		// AMD. Register as an anonymous module.
		define(
			[
				'../../Constant',
				'../../FakeLocalStorage.js',
				'../../AsyncLocalStorage.js',
				'get_tlid_encoder_decoder',
				'../../Path/AsyncLocalStorage.js',
				'../../Unsupported/PathStorageAnalysis.js'
			],
			factory.bind(this, expect)
		);
	}
})(this, function (
	expect,
	SyncIt_Constant,
	SyncIt_FakeLocalStorage,
	AsyncLocalStorage,
	SyncIt_getTLIdEncoderDecoder,
	SyncIt_Path_AsyncLocalStorage,
	SyncIt_Unsupported_PathStorageAnalysis
) {

"use strict";

// =============================================================================

var USE_REAL_ENCODER_DECODER=false;

var FOLLOW_INFORMATION_TYPE = SyncIt_Constant.FollowInformationType;
var ERROR = SyncIt_Constant.Error;

var visualizeData = SyncIt_Unsupported_PathStorageAnalysis.visualizeData;
var getPaths = SyncIt_Unsupported_PathStorageAnalysis.getPaths;

var EncoderDecoder = function() {
	this.index = 0;
};

EncoderDecoder.prototype.encode = function() {
	return '_'+(this.index++);
};

EncoderDecoder.prototype.sort = function(a,b) {
	a = a.replace(/.*\._/,'');
	b = b.replace(/.*\._/,'');
	return parseInt(a,10) - parseInt(b,10);
};

if (USE_REAL_ENCODER_DECODER) {
	EncoderDecoder = SyncIt_getTLIdEncoderDecoder;
}

describe('SyncIt_Path_AsyncLocalStorage',function() {
	
	it('can stop pushing when paths',function(done) {
		this.timeout(60000);
		var localStorage = new SyncIt_FakeLocalStorage();
		var asyncLocalStorage = new AsyncLocalStorage(
			localStorage,
			'aa',
			JSON.stringify,
			JSON.parse
		);
		var pathStore = new SyncIt_Path_AsyncLocalStorage(
			asyncLocalStorage,
			new EncoderDecoder(new Date(1980,1,1).getTime()),
			'aa'
		);
		visualizeData('graph',pathStore,localStorage,'aa');
		pathStore.push('cars','subaru','p',{a:'b'},false,function() { return ERROR.OK; },function(err) {
			expect(err).to.equal(0);
			expect(
				getPaths(localStorage,'aa','p')
			).to.eql([
				{from:'cars.subaru._0',to:null},
				{from:'cars.subaru:p',to:'_0'}
			]);
			pathStore.push('cars','subaru','c',{c:'d'},false,function() { return ERROR.OK; },function(err) {
				expect(err).to.equal(0);
				expect(
					getPaths(localStorage,'aa','p')
				).to.eql([
					{from:'cars.subaru._0',to:null},
					{from:'cars.subaru._1',to:null},
					{from:'cars.subaru:c',to:'_1'},
					{from:'cars.subaru:p',to:'_0'}
				]);
				pathStore.push('cars','subaru','p',{c:'d'},true,function() { return ERROR.OK; },function(err) {
					expect(err).to.equal(SyncIt_Constant.Error.MULTIPLE_PATHS_FOUND);
					done();
				});
			});
		});
	});

	it('can add roots, push and advance',function(done) {
		this.timeout(60000);
		var localStorage = new SyncIt_FakeLocalStorage();
		var asyncLocalStorage = new AsyncLocalStorage(
			localStorage,
			'aa',
			JSON.stringify,
			JSON.parse
		);
		var pathStore = new SyncIt_Path_AsyncLocalStorage(
			asyncLocalStorage,
			new EncoderDecoder(new Date(1980,1,1).getTime()),
			'aa'
		);
		visualizeData('graph',pathStore,localStorage,'aa');
		pathStore.setInfo('cars','subaru',{some:'info'},function(err) {
			expect(err).to.equal(0);
			pathStore.push('cars','subaru','p',{a:'b'},false,function() { return ERROR.OK; },function(err) {
				expect(err).to.equal(0);
				expect(
					getPaths(localStorage,'aa','p')
				).to.eql([
					{from:'cars.subaru._0',to:null},
					{from:'cars.subaru:p',to:'_0'}
				]);
				pathStore.push('cars','subaru','p',{$set:{c:'d'}},false,function() { return ERROR.OK; },function(err) {
					expect(err).to.equal(0);
					expect(
						getPaths(localStorage,'aa','p')
					).to.eql([
						{from:'cars.subaru._0',to:'_1'},
						{from:'cars.subaru._1',to:null},
						{from:'cars.subaru:p',to:'_0'}
					]);
					pathStore.push('cars','subaru','p',{e:'f'},false,function() { return ERROR.OK; },function(err) {
						expect(err).to.equal(0);
						expect(
							getPaths(localStorage,'aa','p')
						).to.eql([
							{from:'cars.subaru._0',to:'_1'},
							{from:'cars.subaru._1',to:'_2'},
							{from:'cars.subaru._2',to:null},
							{from:'cars.subaru:p',to:'_0'}
						]);
						pathStore.advance('cars','subaru',true,function(key,rootOfPath,firstPathitem,next) {
							return next({a:'b', z:"x"});
						},function(err,queueitem,storerecord) {
							expect(err).to.eql(SyncIt_Constant.Error.OK);
							expect(queueitem).to.eql({a:'b'});
							expect(storerecord).to.eql({a:'b',z:'x'});
							expect(
								getPaths(localStorage,'aa','p')
							).to.eql([
								{from:'cars.subaru._0',to:'_1'},
								{from:'cars.subaru._1',to:'_2'},
								{from:'cars.subaru._2',to:null},
								{from:'cars.subaru:p',to:'_1'}
							]);
							pathStore.on('remove-item',function() {
								expect(err).to.eql(SyncIt_Constant.Error.OK);
								expect(
									getPaths(localStorage,'aa','p')
								).to.eql([
									{from:'cars.subaru._1',to:'_2'},
									{from:'cars.subaru._2',to:null},
									{from:'cars.subaru:p',to:'_1'}
								]);
								var pathInfo = [null,null,[]];
								pathStore.followPath('cars','subaru','p',
									function(key,item,itemtype) {
										if (itemtype != FOLLOW_INFORMATION_TYPE.PATHITEM) {
											pathInfo[itemtype-1] = item;
											return;
										}
										return pathInfo[itemtype-1].push(item);
									},
									function(err) {
										expect(pathInfo[1]).to.eql({a:'b',z:'x'});
										expect(pathInfo[0]).to.eql({some:'info'});
										expect(pathInfo[2].length).to.eql(2);
										expect(pathInfo[2][0]).to.eql({$set:{c:'d'}});
										expect(pathInfo[2][1]).to.eql({e:'f'});
										expect(pathInfo[3].length).to.eql(0);
										expect(err).to.equal(0);
										done();
									}
								);
							});
						});
					});
				});
			});
		});
	});
	
	it('can switch path',function(done) {
		this.timeout(60000);
		var localStorage = new SyncIt_FakeLocalStorage();
		var asyncLocalStorage = new AsyncLocalStorage(
			localStorage,
			'aa',
			JSON.stringify,
			JSON.parse
		);
		var pathStore = new SyncIt_Path_AsyncLocalStorage(
			asyncLocalStorage,
			new EncoderDecoder(new Date(1980,1,1).getTime()),
			'aa'
		);
		visualizeData('graph',pathStore,localStorage,'aa');
		pathStore.push('cars','subaru','p',{a:'b'},false,function() { return ERROR.OK; },function(err) {
			expect(err).to.equal(ERROR.OK);
			expect(
				getPaths(localStorage,'aa','p')
			).to.eql([
				{from:'cars.subaru._0',to:null},
				{from:'cars.subaru:p',to:'_0'}
			]);
			pathStore.push('cars','subaru','p',{c:'d'},false,function() { return ERROR.OK; },function(err) {
				expect(err).to.equal(ERROR.OK);
				expect(
					getPaths(localStorage,'aa','p')
				).to.eql([
					{from:'cars.subaru._0',to:'_1'},
					{from:'cars.subaru._1',to:null},
					{from:'cars.subaru:p',to:'_0'}
				]);
				pathStore.push('cars','subaru','c',{e:'f'},false,function() { return ERROR.OK; },function(err) {
					expect(err).to.equal(ERROR.OK);
					expect(
						getPaths(localStorage,'aa','p')
					).to.eql([
						{from:'cars.subaru._0',to:'_1'},
						{from:'cars.subaru._1',to:null},
						{from:'cars.subaru._2',to:null},
						{from:'cars.subaru:c',to:'_2'},
						{from:'cars.subaru:p',to:'_0'}
					]);
					var pathItems = [null,null,[]];
					pathStore.push('cars','subaru','c',{e:'f2'},false,function(key,item,itemtype) {
						if (itemtype != FOLLOW_INFORMATION_TYPE.PATHITEM) {
							pathItems[itemtype-1] = item;
							return ERROR.OK;
						}
						pathItems[itemtype-1].push(item);
						return ERROR.OK;
					},function(err) {
						expect(err).to.equal(ERROR.OK);
						expect(pathItems[3]).to.eql(['p']);
						expect(pathItems[2].length).to.equal(2);
						expect(pathItems[2].map(
							function(pi) { return pi.e; }
						)).to.eql(['f','f2']);
						expect(
							getPaths(localStorage,'aa','p')
						).to.eql([
							{from:'cars.subaru._0',to:'_1'},
							{from:'cars.subaru._1',to:null},
							{from:'cars.subaru._2',to:'_3'},
							{from:'cars.subaru._3',to:null},
							{from:'cars.subaru:c',to:'_2'},
							{from:'cars.subaru:p',to:'_0'}
						]);
						pathStore.changePath('cars','subaru','c','p',true,function(err) {
							expect(err).to.equal(SyncIt_Constant.Error.OK);
							expect(
								getPaths(localStorage,'aa','p')
							).to.eql([
								{from:'cars.subaru._0',to:'_1'},
								{from:'cars.subaru._1',to:null},
								{from:'cars.subaru._2',to:'_3'},
								{from:'cars.subaru._3',to:null},
								{from:'cars.subaru:p',to:'_2'}
							]);
							var callCount = 0;
							pathStore.on('remove-item',function() {
								expect(err).to.eql(SyncIt_Constant.Error.OK);
								var expected = [
									{from:'cars.subaru._1',to:null},
									{from:'cars.subaru._2',to:'_3'},
									{from:'cars.subaru._3',to:null},
									{from:'cars.subaru:p',to:'_2'}
								];
								if (++callCount == 2) {
									expected = [
										{from:'cars.subaru._2',to:'_3'},
										{from:'cars.subaru._3',to:null},
										{from:'cars.subaru:p',to:'_2'}
									];
								}
								expect(
									getPaths(localStorage,'aa','p')
								).to.eql(expected);
								if (callCount == 2) { done(); }
							});
						});
					});
				});
			});
		});
	});
	

	it('can list dataset and datakey',function(done) {
		this.timeout(60000);
		var localStorage = new SyncIt_FakeLocalStorage();
		var asyncLocalStorage = new AsyncLocalStorage(
			localStorage,
			'aa',
			JSON.stringify,
			JSON.parse
		);
		var pathStore = new SyncIt_Path_AsyncLocalStorage(
			asyncLocalStorage,
			new EncoderDecoder(new Date(1980,1,1).getTime()),
			'aa'
		);
		visualizeData('graph',pathStore,localStorage,'aa');
		pathStore.push('cars','subaru','p',{a:'b'},false,function() { return ERROR.OK; },function(err) {
			expect(err).to.equal(ERROR.OK);
			expect(
				getPaths(localStorage,'aa','p')
			).to.eql([
				{from:'cars.subaru._0',to:null},
				{from:'cars.subaru:p',to:'_0'}
			]);
			pathStore.push('cars','subaru','p',{c:'d'},false,function() { return ERROR.OK; },function(err) {
				expect(err).to.equal(ERROR.OK);
				expect(
					getPaths(localStorage,'aa','p')
				).to.eql([
					{from:'cars.subaru._0',to:'_1'},
					{from:'cars.subaru._1',to:null},
					{from:'cars.subaru:p',to:'_0'}
				]);
				pathStore.push('bikes','harley','p',{t:1},false,function() { return ERROR.OK; },function(err) {
					expect(err).to.equal(SyncIt_Constant.Error.OK);
					pathStore.push('bikes','harley','p',{t:1},false,function() { return ERROR.OK; },function(err) {
						expect(err).to.equal(SyncIt_Constant.Error.OK);
						expect(
							getPaths(localStorage,'aa','p')
						).to.eql([
							{from:'cars.subaru._0',to:'_1'},
							{from:'cars.subaru._1',to:null},
							{from:'bikes.harley._2',to:'_3'},
							{from:'bikes.harley._3',to:null},
							{from:'cars.subaru:p',to:'_0'},
							{from:'bikes.harley:p',to:'_2'}
						]);
						pathStore.push('bikes','kawasaki','p',{s:1},false,function() { return ERROR.OK; },function(err) {
							expect(err).to.equal(ERROR.OK);
							expect(
								getPaths(localStorage,'aa','p')
							).to.eql([
								{from:'cars.subaru._0',to:'_1'},
								{from:'cars.subaru._1',to:null},
								{from:'bikes.harley._2',to:'_3'},
								{from:'bikes.harley._3',to:null},
								{from:'bikes.kawasaki._4',to:null},
								{from:'cars.subaru:p',to:'_0'},
								{from:'bikes.harley:p',to:'_2'},
								{from:'bikes.kawasaki:p',to:'_4'}
							]);
							pathStore.getDatasetNames(function(err,datasets) {
								expect(err).to.equal(0);
								datasets = datasets.sort();
								expect(datasets).to.eql(['bikes','cars']);
								pathStore.getDatakeysInDataset('bikes',function(err,datakeys) {
									expect(err).to.equal(0);
									datakeys = datakeys.sort();
									expect(datakeys).to.eql(['harley','kawasaki']);
									done();
								});
							});
						});
					});
				});
			});
		});
	});

	it('can clean and get first queueitem',function(done) {
		this.timeout(60000);
		var localStorage = new SyncIt_FakeLocalStorage();
		var asyncLocalStorage = new AsyncLocalStorage(
			localStorage,
			'aa',
			JSON.stringify,
			JSON.parse
		);
		var pathStore = new SyncIt_Path_AsyncLocalStorage(
			asyncLocalStorage,
			new EncoderDecoder(new Date(1980,1,1).getTime()),
			'aa'
		);
		visualizeData('graph',pathStore,localStorage,'aa');
		pathStore.push('cars','subaru','p',{a:'b'},false,function() { return ERROR.OK; },function(err) {
			expect(err).to.equal(ERROR.OK);
			expect(
				getPaths(localStorage,'aa','p')
			).to.eql([
				{from:'cars.subaru._0',to:null},
				{from:'cars.subaru:p',to:'_0'}
			]);
			pathStore.push('cars','subaru','p',{c:'d'},false,function() { return ERROR.OK; },function(err) {
				expect(err).to.equal(ERROR.OK);
				expect(
					getPaths(localStorage,'aa','p')
				).to.eql([
					{from:'cars.subaru._0',to:'_1'},
					{from:'cars.subaru._1',to:null},
					{from:'cars.subaru:p',to:'_0'}
				]);
				pathStore.push('cars','subaru','c',{e:'f'},false,function() { return ERROR.OK; },function(err) {
					expect(err).to.equal(ERROR.OK);
					expect(
						getPaths(localStorage,'aa','p')
					).to.eql([
						{from:'cars.subaru._0',to:'_1'},
						{from:'cars.subaru._1',to:null},
						{from:'cars.subaru._2',to:null},
						{from:'cars.subaru:c',to:'_2'},
						{from:'cars.subaru:p',to:'_0'}
					]);
					pathStore.push('cars','subaru','c',{e:'f'},false,function() { return ERROR.OK; },function(err) {
						expect(err).to.equal(ERROR.OK);
						expect(
							getPaths(localStorage,'aa','p')
						).to.eql([
							{from:'cars.subaru._0',to:'_1'},
							{from:'cars.subaru._1',to:null},
							{from:'cars.subaru._2',to:'_3'},
							{from:'cars.subaru._3',to:null},
							{from:'cars.subaru:c',to:'_2'},
							{from:'cars.subaru:p',to:'_0'}
						]);
						pathStore.changePath('cars','subaru','c','p',false,function(err) {
							expect(err).to.equal(SyncIt_Constant.Error.OK);
							expect(
								getPaths(localStorage,'aa','p')
							).to.eql([
								{from:'cars.subaru._0',to:'_1'},
								{from:'cars.subaru._1',to:null},
								{from:'cars.subaru._2',to:'_3'},
								{from:'cars.subaru._3',to:null},
								{from:'cars.subaru:p',to:'_2'}
							]);
							pathStore.push('bikes','harley','p',{t:1},false,function() { return ERROR.OK; },function(err) {
								expect(err).to.equal(SyncIt_Constant.Error.OK);
								pathStore.push('bikes','harley','p',{t:1},false,function() { return ERROR.OK; },function(err) {
									expect(err).to.equal(SyncIt_Constant.Error.OK);
									expect(
										getPaths(localStorage,'aa','p')
									).to.eql([
										{from:'cars.subaru._0',to:'_1'},
										{from:'cars.subaru._1',to:null},
										{from:'cars.subaru._2',to:'_3'},
										{from:'cars.subaru._3',to:null},
										{from:'bikes.harley._4',to:'_5'},
										{from:'bikes.harley._5',to:null},
										{from:'cars.subaru:p',to:'_2'},
										{from:'bikes.harley:p',to:'_4'}
									]);
									pathStore.push('bikes','kawasaki','p',{s:1},false,function() { return ERROR.OK; },function(err) {
										expect(err).to.equal(ERROR.OK);
										expect(
											getPaths(localStorage,'aa','p')
										).to.eql([
											{from:'cars.subaru._0',to:'_1'},
											{from:'cars.subaru._1',to:null},
											{from:'cars.subaru._2',to:'_3'},
											{from:'cars.subaru._3',to:null},
											{from:'bikes.harley._4',to:'_5'},
											{from:'bikes.harley._5',to:null},
											{from:'bikes.kawasaki._6',to:null},
											{from:'cars.subaru:p',to:'_2'},
											{from:'bikes.harley:p',to:'_4'},
											{from:'bikes.kawasaki:p',to:'_6'}
										]);
										pathStore.findFirstDatasetDatakey('p',function(err,dataset,datakey) {
											expect(err).to.equal(ERROR.OK);
											expect([dataset,datakey]).to.eql(['cars','subaru']);
											pathStore.clean(function(err) {
												expect(err).to.equal(SyncIt_Constant.Error.OK);
												expect(
													getPaths(localStorage,'aa','p')
												).to.eql([
													{from:'cars.subaru._2',to:'_3'},
													{from:'cars.subaru._3',to:null},
													{from:'bikes.harley._4',to:'_5'},
													{from:'bikes.harley._5',to:null},
													{from:'bikes.kawasaki._6',to:null},
													{from:'cars.subaru:p',to:'_2'},
													{from:'bikes.harley:p',to:'_4'},
													{from:'bikes.kawasaki:p',to:'_6'}
												]);
												done();
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
	
	it('will exit when nothing to clean',function(done) {
		this.timeout(6000);
		var localStorage = new SyncIt_FakeLocalStorage();
		var asyncLocalStorage = new AsyncLocalStorage(
			localStorage,
			'aa',
			JSON.stringify,
			JSON.parse
		);
		var pathStore = new SyncIt_Path_AsyncLocalStorage(
			asyncLocalStorage,
			new EncoderDecoder(new Date(1980,1,1).getTime()),
			'aa'
		);
		pathStore.clean(function(err) {
			expect(err).to.equal(ERROR.OK);
			done();
		});
	});
	
	it('can purge datasets',function(done) {
		this.timeout(60000);
		var localStorage = new SyncIt_FakeLocalStorage();
		var asyncLocalStorage = new AsyncLocalStorage(
			localStorage,
			'aa',
			JSON.stringify,
			JSON.parse
		);
		var pathStore = new SyncIt_Path_AsyncLocalStorage(
			asyncLocalStorage,
			new EncoderDecoder(new Date(1980,1,1).getTime()),
			'aa'
		);
		visualizeData('graph',pathStore,localStorage,'aa');
		pathStore.push('cars','subaru','p',{a:'b'},false,function() { return ERROR.OK; },function(err) {
			expect(err).to.equal(ERROR.OK);
			pathStore.push('cars','subaru','p',{c:'d'},false,function() { return ERROR.OK; },function(err) {
				expect(err).to.equal(ERROR.OK);
				pathStore.push('cars','subaru','c',{e:'f'},false,function() { return ERROR.OK; },function(err) {
					expect(err).to.equal(ERROR.OK);
					asyncLocalStorage.findKeys('*.*.*', function(keys) {
						expect(keys.length).to.equal(3);
						pathStore.purge('cars', function(err) {
							expect(err).to.equal(ERROR.OK);
							asyncLocalStorage.findKeys('*.*.*', function(keys) {
								expect(keys.length).to.equal(0);
								asyncLocalStorage.findKeys(
									'*.*',
									function(keys) {
										expect(keys.length).to.equal(0);
										done();
									}
								);
							});
						});
					});
				});
			});
		});
	});
	
	describe('removal of whole dataset and datakey', function() {
		it('is possible', function(done) {
			this.timeout(60000);
			var localStorage = new SyncIt_FakeLocalStorage();
			var asyncLocalStorage = new AsyncLocalStorage(
				localStorage,
				'aa',
				JSON.stringify,
				JSON.parse
			);
			var pathStore = new SyncIt_Path_AsyncLocalStorage(
				asyncLocalStorage,
				new EncoderDecoder(new Date(1980,1,1).getTime()),
				'aa'
			);
			visualizeData('graph',pathStore,localStorage,'aa');
			pathStore.push('cars','subaru','p',{a:'b'},false,function() { return ERROR.OK; },function(err) {
				expect(err).to.equal(0);
				expect(
					getPaths(localStorage,'aa','p')
				).to.eql([
					{from:'cars.subaru._0',to:null},
					{from:'cars.subaru:p',to:'_0'}
				]);
				pathStore.push('cars','subaru','p',{$set:{c:'d'}},false,function() { return ERROR.OK; }, function(err) {
					expect(err).to.equal(ERROR.OK);
					pathStore.push('cars','subaru','q',{$set:{c:'d'}},false,function() { return ERROR.OK; }, function(err) {
						expect(err).to.equal(ERROR.OK);
						pathStore.getDatakeysInDataset('cars', function(err, datakeys) {
							expect(datakeys).to.eql(['subaru']);
							pathStore.removeDatasetDatakey(
								'cars',
								'subaru',
								true,
								function(err) {
									expect(err).to.equal(ERROR.OK);
									pathStore.getDatakeysInDataset(
										'cars',
										function(err, datakeys) {
											expect(datakeys).to.eql([]);
											expect(localStorage.length).to.equal(0); // naughty check, but useful
											done();
										}
									);
								}
							);
						});
					});
				});		
			});
		});
	});
	
	describe('promotePathToOrRemove', function() {
		it('will remove if no path to promote', function(done) {
			this.timeout(60000);
			var localStorage = new SyncIt_FakeLocalStorage();
			var asyncLocalStorage = new AsyncLocalStorage(
				localStorage,
				'aa',
				JSON.stringify,
				JSON.parse
			);
			var pathStore = new SyncIt_Path_AsyncLocalStorage(
				asyncLocalStorage,
				new EncoderDecoder(new Date(1980,1,1).getTime()),
				'aa'
			);
			visualizeData('graph',pathStore,localStorage,'aa');
			pathStore.push('cars','subaru','p',{a:'b'},false,function() { return ERROR.OK; },function(err) {
				expect(err).to.equal(ERROR.OK);
				expect(
					getPaths(localStorage,'aa','p')
				).to.eql([
					{from:'cars.subaru._0',to:null},
					{from:'cars.subaru:p',to:'_0'}
				]);
				pathStore.push('cars','subaru','p',{$set:{c:'d'}},false,function() { return ERROR.OK; }, function(err) {
					expect(err).to.equal(ERROR.OK);
					pathStore.push('cars','subaru','q',{$set:{c:'d'}},false,function() { return ERROR.OK; }, function(err) {
						expect(err).to.equal(ERROR.OK);
						pathStore.getDatakeysInDataset('cars', function(err, datakeys) {
							expect(datakeys).to.eql(['subaru']);
							pathStore.promotePathToOrRemove(
								'cars',
								'subaru',
								'x',
								'p',
								true,
								function(err) {
									expect(err).to.equal(ERROR.OK);
									pathStore.getDatakeysInDataset(
										'cars',
										function(err, datakeys) {
											expect(datakeys).to.eql([]);
											expect(localStorage.length).to.equal(0); // naughty check, but useful
											done();
										}
									);
								}
							);
						});
					});
				});		
			});
		});

		it('will move the path to be promoted', function(done) {
			this.timeout(60000);
			var localStorage = new SyncIt_FakeLocalStorage();
			var asyncLocalStorage = new AsyncLocalStorage(
				localStorage,
				'aa',
				JSON.stringify,
				JSON.parse
			);
			var pathStore = new SyncIt_Path_AsyncLocalStorage(
				asyncLocalStorage,
				new EncoderDecoder(new Date(1980,1,1).getTime()),
				'aa'
			);
			visualizeData('graph',pathStore,localStorage,'aa');
			pathStore.push('cars','subaru','p',{a:'b'},false,function() { return ERROR.OK; },function(err) {
				expect(err).to.equal(0);
				expect(
					getPaths(localStorage,'aa','p')
				).to.eql([
					{from:'cars.subaru._0',to:null},
					{from:'cars.subaru:p',to:'_0'}
				]);
				pathStore.push('cars','subaru','p',{$set:{c:'d'}},false,function() { return ERROR.OK; }, function(err) {
					expect(err).to.equal(ERROR.OK);
					pathStore.push('cars','subaru','q',{$set:{c:'d'}},false,function() { return ERROR.OK; }, function(err) {
						expect(err).to.equal(ERROR.OK);
						pathStore.getDatakeysInDataset('cars', function(err, datakeys) {
							expect(datakeys).to.eql(['subaru']);
							pathStore.promotePathToOrRemove(
								'cars',
								'subaru',
								'q',
								'p',
								true,
								function(err) {
									expect(err).to.equal(ERROR.OK);
									pathStore.getDatakeysInDataset(
										'cars',
										function(err, datakeys) {
											expect(datakeys).to.eql(['subaru']);
											expect(localStorage.length).to.equal(2); // naughty check, but useful
											done();
										}
									);
								}
							);
						});
					});
				});		
			});
		});

	});

});



});
