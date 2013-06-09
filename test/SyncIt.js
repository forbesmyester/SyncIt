/*jshint smarttabs:true */
(function (root, factory) {
	if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		module.exports = factory(
			require('../node_modules/expect.js/expect.js'),
			require('../js/SyncIt.js'),
			require('../js/Queue/Persist.js'),
			require('../js/Queue/LocalStorage.js'),
			require('../js/Store/Persist.js'),
			require('../js/FakeLocalStorage.js'),
			require('../js/Constant.js'),
			require('../js/updateResult.js'),
			require('../js/Persist/Memory.js'),
			require('../js/Persist/MemoryAsync.js')
		);
	} else if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(
			[
				'expect.js',
				'syncit/SyncIt',
				'syncit/Queue/Persist',
				'syncit/Queue/LocalStorage',
				'syncit/Store/Persist',
				'syncit/FakeLocalStorage',
				'syncit/Constant',
				'syncit/updateResult',
				'syncit/Persist/Memory',
				'syncit/Persist/MemoryAsync'
			],
			factory
		);
	} else {
		// Browser globals (root is window)
		root.returnExports = factory(
			root.expect,
			root.SyncIt,
			root.SyncIt_Queue_Persist,
			root.SyncIt_Queue_LocalStorage,
			root.SyncIt_Store_Persist,
			root.SyncIt_FakeLocalStorage,
			root.SyncIt_Constant,
			root.SyncIt_updateResult,
			root.SyncIt_Persist_Memory,
			root.SyncIt_Persist_MemoryAsync
		);
	}
})(this, function (
	expect,
	SyncIt,
	SyncIt_Queue_Persist,
	SyncIt_Queue_LocalStorage,
	SyncIt_Store_Persist,
	SyncIt_FakeLocalStorage,
	SyncIt_Constant,
	updateResult,
	SyncIt_Persist_Memory,
	SyncIt_Persist_MemoryAsync
) {
// =============================================================================

var Queue = SyncIt_Queue_Persist;
var Store = SyncIt_Store_Persist;
var Persist = SyncIt_Persist_MemoryAsync;

describe('_cloneObj',function() {
	var source = {color: 'blue', size: 'large'},
		syncIt = new SyncIt();
	it('should be able to clone',function() {
		expect(syncIt._cloneObj(source).color).to.equal(source.color);
	});
	it('should be a clone, not a reference to the same object',function() {
		var clone = syncIt._cloneObj(source);
		clone.color = 'red';
		expect(source.color).to.equal('blue');
		expect(clone.color).to.equal('red');
	});
});

describe('updateResult op="set"',function() {
	var syncIt = new SyncIt(null,null,'bob');
	it(
		'should overwrite all data and increment the version, update the modifier and perform an undelete',
		function() {
			var queueitem = {
				u:{color:'blue',size:'bigger'},
				m:'bob',
				b:3,
				o:'set'
			};
			var original = {
				i:{
					color:'blue',
					size:'large'
				},
				v:3,
				r:true,
				m:'aa'
			};
			var r = updateResult(original, queueitem, syncIt._cloneObj);
			delete r.t;
			expect(r).to.eql({i:{color:'blue',size:'bigger'},v:4,r:false,m:'bob'}); 
		}
	);
});

describe('updateResult op="remove"',function() {
	var syncIt = new SyncIt(null,null,'bob');
	it('be able to remove an existing field',function() {
		var update = {m:'james',b:3,o:'remove',u:{x:'x'}},
			original = {i:{color:'blue',size:'large'},v:3,r:false},
			r = updateResult(original, update, syncIt._cloneObj);
			delete r.t;
		expect(
			r
		).to.eql({i:{color:'blue',size:'large'},r:true,v:4,m:'james'});
	});
});

describe('_versionCheck',function() {
	var storedData = {
			i: {color: 'blue', size: 'large'},
			v: 3,
			m: 'mister sync it',
			r: false
		};
	it('should apply initial versions',function() {
		expect(
			SyncIt._versionCheck(null,{b:0,m:'sync dude',i:{gender:'M'}})
		).to.equal(SyncIt_Constant.Error.OK);
	});
	it(
		'should not apply initial versions if based on a version higher than 0',
		function() {
			expect(
				SyncIt._versionCheck(null,{b:1,m:'sync dude',i:{gender:'M'}})
			).to.equal(SyncIt_Constant.Error.TRYING_TO_APPLY_TO_FUTURE_VERSION);
		}
	);
	describe('should reject applying old versions',function() {
		it('usually',function() {
			var i = 0;
			for (i=0;i<storedData.v;i++) {
				expect(
					SyncIt._versionCheck(
						storedData,
						{b:i,m:'sync dude',i:{gender:'M'}}
					)
				).to.equal(SyncIt_Constant.Error.STALE_FOUND_IN_QUEUE);
			}
		});
	});
	it('will also reject applications to versions in the future',function() {
		var i=0;
		for (i=storedData.v+1;i<(storedData.v+10);i++) {
			expect(
				SyncIt._versionCheck(
					storedData,
					{b:i,m:'jack',i:{gender:'M'}}
				)
			).to.equal(SyncIt_Constant.Error.TRYING_TO_APPLY_TO_FUTURE_VERSION);
		}
	});
	describe('will apply changes that are based on the current version',function() {
		it('by the same modifier',function() {
			expect(
				SyncIt._versionCheck(
					storedData,
					{b:storedData.v,m:storedData.m,i:{gender:'M'}}
				)
			).to.equal(SyncIt_Constant.Error.OK);
		});
		it('by a different modifier',function() {
			expect(
				SyncIt._versionCheck(
					storedData,
					{b:storedData.v,m:'jack',i:{gender:'M'}}
				)
			).to.equal(SyncIt_Constant.Error.OK);
		});
	});
});

describe('Persist',function() {
	it('Can list keys',function(done) {
		var keys = ['dog','giraffe','monkey','penguin','monkey'],
			p = new Persist(),
			i = 0,
			j = 0;
		var doIt = function() {
			p.set(keys[i],i++,function() {
				if (i == keys.length) {
					return p.getKeys(function(err,keys) {
						expect(keys.length).to.equal(4);
						for (j=0;i<keys.length;j++) {
							expect((p.getKeys().indexOf(keys[i]) > -1)).to.be(true);
						}
						return done();
					});
				}
				doIt();
			});
		};
		doIt();
	});
});

var carAndAnimalTestData = {
	cars: {
		bmw: { price:'medium', size:'medium', status:'high' },
		ford: { price:'affordable', size:'mixed', status:'medium' },
		kia: { price:'low', size:'small', status:'low' }
	},
	animals: {
		frog: { surface:'slimy', coolness:'supercool', size:'small' },
		horse: { surface:'shorthair', coolness:'high', size:'medium' },
		elephant: { surface:'roughskin', coolness:'low', size:'large' }
	}
};

var checkAllDataInStore = function(store,done) {
	var checkCount = 0;
	store.getDatasetNames(function(err,sets) {
		var i = 0;
		expect(sets).to.eql(['cars','animals']);
		checkCount++;
		for (i=0;i<sets.length;i++) {
			/*jshint -W083 */ // Don't create functions in a loop
			(function(setname) {
				store.getDatakeyNames(setname,function(err,keys) {
					if (setname == 'cars') {
						expect(keys).to.eql(['bmw','ford','kia']);
						if (++checkCount == 3) {
							done();
						}
					}
					if (setname == 'animals') {
						expect(keys).to.eql(['frog','horse','elephant']);
						if (++checkCount == 3) {
							done();
						}
					}
				});
			})(sets[i]);
		}
	});
};

describe('Store',function() {
	it('Can get the Dataset and Datakey it has stored with',function(done) {
		
		var i = 0,
			storeCount = 0;
		var store = new Store(new Persist());
		var data = carAndAnimalTestData;
		var toUpload = (function(data) {
			var k1 = '',
				k2 = '',
				r = [];
			for (k1 in data) { if (data.hasOwnProperty(k1)) {
				for (k2 in data[k1]) { if (data[k1].hasOwnProperty(k2)) {
					r.push(k1+'.'+k2);
				} }
			} }
			return r;
		})(data);
		
		var doIt = function() {
			var dataset = toUpload[i].split('.')[0];
			var datakey = toUpload[i].split('.')[1];
			store.set(dataset,datakey,data[dataset][datakey],function() {
				if (++i == toUpload.length) {
					return checkAllDataInStore(store,done);
				}
				doIt();
			});
		};
		doIt();
		
	});
});


describe('SyncIt',function() {
	describe('Support API',function() {
		var testAddListeners = function() {
			var syncIt = new SyncIt(
				new Store(new Persist()),
				new Queue(new Persist()),
				'aa'
			);
			syncIt.listenForAddedToQueue(function() {
				// listener
			});
			expect(syncIt._events.added_to_queue.length).to.equal(1);
			return syncIt;
		};
		it('can add listeners',testAddListeners);
		it('can remove listeners',function() {
			var syncIt = testAddListeners();
			var x = 0;
			var removable = function() {
				x = x + 1;
			};
			syncIt.listenForAddedToQueue(removable);
			expect(syncIt._events.added_to_queue.length).to.equal(2);
			expect(
				syncIt.removeListener('added_to_queue',function() { return 3; })
			).to.equal(false);
			expect(syncIt.removeListener('added_to_queue',removable)).to.equal(true);
			expect(syncIt._events.added_to_queue.length).to.equal(1);
		});
	});
	describe('can add events',function() {
		var queue = new Queue(new Persist());
		var store = new Store(new Persist());
		var syncIt = new SyncIt(store,queue,'aa');
		it('can add events',function() {
			var count = 0;
			var func1 = function(a) { count = count + 1; };
			var func2 = function(a) { count = count + 2; };
			var func3 = function(a) { count = count + 3; };
			expect(syncIt._events.added_to_queue.length).to.equal(0);
			syncIt.listenForAddedToQueue(func1);
			expect(syncIt._events.added_to_queue.length).to.equal(1);
			syncIt.listen('added_to_queue',func2);
			expect(syncIt._events.added_to_queue.length).to.equal(2);
			syncIt.listen('added_to_queue',func3);
			expect(syncIt._events.added_to_queue.length).to.equal(3);
			syncIt.removeListener('added_to_queue',func2);
			expect(syncIt._events.added_to_queue.length).to.equal(2);
			expect(syncIt._events.added_to_queue[0]).to.equal(func1);
			expect(syncIt._events.added_to_queue[1]).to.equal(func3);
			syncIt.removeAllListeners('added_to_queue');
			expect(syncIt._events.added_to_queue.length).to.equal(0);
		});
	});
	describe('has validation when',function() {
		var syncItV = new SyncIt(
			new Store(new Persist()),
			new Queue(new Persist()),
			'aa'
		);
		it('is fed bad datasets and datakey',function() {
			var original = {
				s: 'cars',
				k: 'excalibur',
				o: 'set',
				u: {drive: 'rear'},
				m: 'ben',
				b: 0,
				t: new Date().getTime() - 1000
			};
			var failures = [{s:'1cars'},{s:'a'},{s:'ca.rs'},{k:'1go'},{k:'g'},
				{k:'gg.oo'}];
			for (var i = 0; i < failures.length; i++) {
				var ob = JSON.parse(JSON.stringify(original));
				for (var k in failures[i]) {
					ob[k] = failures[i][k];
					syncItV.feed(
						[ob],
						function() { expect().fail("This should not have been called"); },
						function(err) {
							if (err != (k == 's' ?
								SyncIt_Constant.Error.INVALID_DATASET :
								SyncIt_Constant.Error.INVALID_DATAKEY)) {
							}
							expect(err).to.equal(
								k == 's' ?
									SyncIt_Constant.Error.INVALID_DATASET :
									SyncIt_Constant.Error.INVALID_DATAKEY
							);
						}
					);
				}
			}
		});
		it('has had a set (or update) operation, but has been given an invalid key',function(done) {
			syncItV.set('cars','4',{'a':'b'},function(err) {
				expect(err).to.equal(SyncIt_Constant.Error.INVALID_DATAKEY);
				expect(syncItV._locked).to.equal(0);
				done();
			});
		});
	});
	describe('feed can write from scratch',function() {
		var queue = new Queue(new Persist());
		var store = new Store(new Persist());
		var syncIt = new SyncIt(store,queue,'aa');
		var feedData = {hair:{length:'long',color:'red'},eyes:'blue'};
		var modificationtime = new Date().getTime()-5;
		var dataWhenStored = null;
		it('so will be able to add ...',function(done) {
			syncIt.set('user','bob',{hair: 'short'},function(err) {
				syncIt.apply(function(err) {
					expect(err).to.equal(0);
					var doneCount = 0;
					syncIt.listenForFed(function(dataset, datakey, queueitem) {
						{
							
							if (
								((new Persist()) instanceof SyncIt_Persist_Memory) &&
								(queueitem.basedonversion === 0)
							) {
								return;
							}
						}
						expect(dataset).to.equal('user');
						expect(datakey).to.equal('bob');
						expect(queueitem.o).to.equal('set');
							expect(queueitem.m).to.equal('bb');
						expect(queueitem.b).to.equal(1);
						expect(queueitem.u.hair.length).to.equal('long');
						if (++doneCount == 2) {
							done();
						}
					});
					var checks = function(err,fedFailed,conflictFailed,jrec) {
						expect(err).to.equal(0);
						queue.getCountInQueue(function(l) {
							expect(l).to.equal(SyncIt_Constant.Error.OK);
								syncIt.getFull('user','bob',function(err,jread) {
									if (++doneCount == 2) {
										done();
									}
									dataWhenStored = jread;
								});
						});
					};
					syncIt.feed(
						[{
							o: 'set',
							s: 'user',
							k: 'bob',
							u: feedData,
							m: 'bb',
							b: 1,
							t: modificationtime
						}],
						function() { expect().fail("This should not have been called"); },
						checks
					);
				});
			});
		});

		// TEST MULTIPLE FEEDONE (and that it trust the "b")

		it('... then read all',function(done) {
			syncIt.getFull('user','bob',function(e,jread) {
				expect(jread.i).to.eql(
					{hair:{length:'long',color:'red'},eyes:'blue'}
				);
				expect(jread.m).to.eql('bb');
				expect(jread.t).to.equal(modificationtime);
				expect(jread.v).to.eql(2);
				expect(e).to.eql(SyncIt_Constant.Error.OK);
				done();
			});
		});
		it('... then read',function(done) {
			syncIt.get('user','bob',function(e,jreadinfo) {
				expect(jreadinfo).to.eql(
					{hair:{length:'long',color:'red'},eyes:'blue'}
				);
				expect(e).to.eql(SyncIt_Constant.Error.OK);
				done();
			});
		});
		it('... is really stored',function(done) {
			syncIt.getFull('user','bob',function(e,jrec) {
				expect(jrec.i.hair.color).to.eql('red');
				queue.getCountInQueue(function(e,l) {
					expect(l).to.equal(0);
					done();
				});
			});
		});
		it('... will return QUEUE_EMPTY, when it is',function(done) {
			syncIt.apply(function(errorCode) {
				expect(errorCode).to.equal(SyncIt_Constant.Error.QUEUE_EMPTY);
				done();
			});
		});
		describe('... perhaps can handle not being able advance the queue but',function() {

			var prepare = function(dupSyncIt,next) {

				var dupQueue = dupSyncIt._queue;

				dupQueue.insertAt = function(value,index,whenAdded) {
					var inst = this;
					inst.getFullQueue(function(e,queue) {
						var newQueue = queue.slice(0,index);
						newQueue.push(value);
						var applyItems = queue.slice(index);
						applyItems.splice(0,0,index+1,0);
						newQueue.splice.apply(
							newQueue,
							applyItems
						);
						return inst._setQueue(newQueue,whenAdded);
					});
				};
				
				dupSyncIt.set('user','jack',{'hair':'brown'},function(e,dataset,datakey,firstQueueitem) {
					dupSyncIt.apply(function(e) {
						dupQueue.getFullQueue(function(e,items) {
						expect(e).to.equal(SyncIt_Constant.Error.OK);
							var length = items.length;
							dupQueue.insertAt(firstQueueitem,0,function() {
								dupQueue.getFullQueue(function(e,items) {
									expect(e).to.equal(SyncIt_Constant.Error.OK);
									expect(items.length).to.equal(length + 1);
									next();
								});
							});
						});
					});
				});

			};
			
			it('can still read propertly',function(done) {

				var dupQueue = new Queue(new Persist());
				var dupStore = new Store(new Persist());
				var dupSyncIt = new SyncIt(dupStore,dupQueue,'aa');
			
				prepare(dupSyncIt,function() {
					dupSyncIt.getFull('user','jack',function(e,jread) {
						expect(e).to.equal(SyncIt_Constant.Error.OK);
						expect(jread.v).to.eql(1);
						expect(jread.m).to.eql('aa');
						expect(jread.i.hair).to.equal('brown');
						dupQueue.advance(function() {
							done();
						});
					});
				});
			});

			it('will be told it\'s stale on feed',function(done) {

				var dupQueue = new Queue(new Persist());
				var dupStore = new Store(new Persist());
				var dupSyncIt = new SyncIt(dupStore,dupQueue,'aa');
			
				prepare(dupSyncIt,function() {
					dupSyncIt.feed(
						[{
							o: 'update',
							s: 'user',
							k: 'jack',
							u: {'$set':{'eyes':'blue'}},
							m: 'bob',
							b: 1,
							t: (new Date().getTime())-5000
						}],
						function() { expect().fail("This should not have been called"); },
						function(err) {
							expect(err).to.equal(SyncIt_Constant.Error.STALE_FOUND_IN_QUEUE)
							done();
						}
					);
				});

			});

			it('will still be able to use update - tested, set and remove - untested',function(done) {

				var dupQueue = new Queue(new Persist());
				var dupStore = new Store(new Persist());
				var dupSyncIt = new SyncIt(dupStore,dupQueue,'aa');
				var conflictResolutionCalled = false
			
				prepare(dupSyncIt,function() {
					dupSyncIt.update('user','jack',{'$set':{'age':43}},function(err,dataset,datakey,queueitem) {
						expect(err).to.equal(SyncIt_Constant.Error.OK);
						expect(queueitem.b).to.equal(1);
						done();
					});
				});

			});

			it('can be removed it with removeStaleFromQueue',function(done) {

				var dupQueue = new Queue(new Persist());
				var dupStore = new Store(new Persist());
				var dupSyncIt = new SyncIt(dupStore,dupQueue,'aa');

				prepare(dupSyncIt,function() {
					dupSyncIt.removeStaleFromQueue(function(err) {
						expect(err).to.equal(SyncIt_Constant.Error.OK);
						dupSyncIt._queue.getFullQueue(function(e,queueitems) {
							expect(e).to.equal(SyncIt_Constant.Error.OK);
							expect(queueitems.length).to.equal(0);
							done();
						});
					});
				});
			});

		});
	});
	describe(
		'will error when items still in queue',
		function() {
			var queue = new Queue(new Persist());
			var store = new Store(new Persist());
			var syncIt = new SyncIt(store,queue,'aa');
			it('can use set',function(done) {
				syncIt.set(
					'user',
					'jack',
					{'hair':'blonde','eyes':'brown'},
					function(err) {
						expect(err).to.equal(SyncIt_Constant.Error.OK);
						syncIt.get('user','jack',function(err,jread) {
							expect(err).to.equal(SyncIt_Constant.Error.OK);
							expect(jread.hair).to.equal('blonde');
							done();
						});
					}
				);
			});
			it('can use update',function(done) {
				syncIt.update(
					'user',
					'jack',
					{'$set':{'eyes':'blue'}},
					function(err) {
						expect(err).to.equal(SyncIt_Constant.Error.OK);
						syncIt.get('user','jack',function(err,jread) {
							expect(err).to.equal(SyncIt_Constant.Error.OK);
							expect(jread.hair).to.equal('blonde');
							expect(jread.eyes).to.equal('blue');
							done();
						});
					}
				);
			});
			it('errors when feeding if overwrite is not set and queue not empty',function(done) {
				syncIt.feed(
					[{
						o: 'set',
						s: 'user',
						k: 'jack',
						u: {'hair':'white','eyes':'red'},
						m: 'bob',
						b: 0,
						t: (new Date().getTime())-5000
					}],
					function(dataset, datakey, jrec, localQueueItems, serverQueueItems, resolved) {
						return resolved(false);
					},
					function(err) {
						expect(err).to.equal(SyncIt_Constant.Error.NOT_RESOLVED);
						syncIt.getFull('user','jack',function(err,jread) {
							expect(jread.i.hair).to.equal('blonde');
							done();
						});
					}
				);
			});
		}
	);
	it('Can retrieve dataset and datakey',function(done) {
		var queue = new Queue(new Persist());
		var store = new Store(new Persist());
		var syncIt = new SyncIt(store,queue,'aa');
		var i = 0;
		var inQueueAndStore = SyncIt_Constant.Location.IN_QUEUE + SyncIt_Constant.Location.IN_STORE;
		
		var data = carAndAnimalTestData;
		
		var toUploadList = (function(data) {
			var k1 = '',
				k2 = '',
				r = [];
			for (k1 in data) { if (data.hasOwnProperty(k1)) {
				for (k2 in data[k1]) { if (data[k1].hasOwnProperty(k2)) {
					r.push(k1+'.'+k2);
				} }
			} }
			return r;
		})(data);
		
		var checksDone = 0;
		
		var check = function(next) {
			syncIt.getDatasetNames(inQueueAndStore,function(err,names) {
				expect(names.sort()).to.eql(['animals','cars']);
				var count = 0;
				var testDatakeys = function(datasetName) {
					syncIt.getDatakeysInDataset(datasetName,inQueueAndStore,function(err,keys) {
						if (datasetName == 'cars') {
							expect(keys.sort()).to.eql(['bmw','ford','kia']);
						}
						if (datasetName == 'animals') {
							expect(keys.sort()).to.eql(['elephant','frog','horse']);
						}
						if (++count == 2) {
							next();
						}
					});
				};
				testDatakeys('cars');
				testDatakeys('animals');
			});
		};
		
		var checkAllMovedToStore = function() {
			
		};
		
		var applySome = function() {
			check(function() {
				syncIt.apply(function(err) {
					expect(err).to.equal(0);
					syncIt.apply(function(err) {
						expect(err).to.equal(0);
						check(function() {
							syncIt.apply(function(err) {
								expect(err).to.equal(0);
								syncIt.apply(function(err) {
									expect(err).to.equal(0);
									check(function() {
										syncIt.apply(function(err) {
											expect(err).to.equal(0);
											syncIt.apply(function(err) {
												expect(err).to.equal(0);
												check(function() {
													checkAllDataInStore(
														store,
														done
													);
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
		};
		
		var upload = function() {
			var dataset = toUploadList[i].split('.')[0];
			var datakey = toUploadList[i].split('.')[1];
			syncIt.set(dataset,datakey,data[dataset][datakey],function(err) {
				expect(err).to.equal(SyncIt_Constant.Error.OK);
				if (++i == toUploadList.length) {
					return applySome();
				}
				upload();
			});
		};
		upload();
		
	});
});

describe('SyncIt when confronted by a set (or update) on a removed dataset/datakey',function() {
	it('will return if locked (by a non feed operation)',function(done) {
		var queue = new Queue(new Persist());
		var store = new Store(new Persist());
		var syncIt = new SyncIt(store,queue,'aa');
		syncIt.set('cars','bmw',{'a':'b'},function(err) {
			expect(err).to.equal(SyncIt_Constant.Error.OK);
			syncIt.remove('cars','bmw',function(err) {
				expect(err).to.equal(SyncIt_Constant.Error.OK);
				syncIt.set('cars','bmw',{'a':'b'},function(err) {
					expect(err).to.equal(SyncIt_Constant.Error.DATA_ALREADY_REMOVED);
					syncIt.getFull('cars','bmw',function(err,jread) {
						expect(err).to.equal(SyncIt_Constant.Error.OK);
						expect(jread.v).to.equal(2);
						done();
					});
				});
			});
		});
	});
});
	
describe('SyncItFeeder can manage Data from a server when',function() {
	
	var carAndAnimalTestData = {
		cars: {
			bmw: { price:'medium', size:'medium', status:'high' },
			ford: { price:'affordable', size:'mixed', status:'medium' },
			kia: { price:'low', size:'small', status:'low' }
		},
		animals: {
			frog: { surface:'slimy', coolness:'supercool', size:'small' },
			horse: { surface:'shorthair', coolness:'high', size:'medium' },
			elephant: { surface:'roughskin', coolness:'low', size:'large' }
		}
	};
	
	var addTestDataToQueue = function(testData,queue,done) {
		
		var datasetNames = Object.getOwnPropertyNames(testData),
			i = 0,
			j = 0,
			datakeyNames = [],
			dataToAdd = [];
		
		for (i=0; i<datasetNames.length; i++) {
			datakeyNames = Object.getOwnPropertyNames(testData[datasetNames[i]]);
			for (j=0; j<datakeyNames.length; j++) {
				dataToAdd.push({
					o:'set',
					s:datasetNames[i],
					k:datakeyNames[j],
					u:testData[datasetNames[i]][datakeyNames[j]],
					m: 'abc',
					t:new Date().getTime(),
					b:0
				});
			}
		}
		
		i = 0;
		var doIt = function() {
			queue.push(dataToAdd[i],function(err) {
				expect(err).to.equal(SyncIt_Constant.Error.OK);
				if (++i == dataToAdd.length) {
					return done();
				}
				doIt();
			});
		};
		doIt();
		
	};
	
	var syncItSetter = function(syncIt,dataToAdd,done) {
		
		var processOne = function() {
			var u = dataToAdd.shift();
			syncIt.set(
				u.dataset,
				u.datakey,
				u.update,
				function(err) {
					expect(err).to.equal(SyncIt_Constant.Error.OK);
					if (dataToAdd.length) {
						processOne();
					} else {
						done();
					}
				}
			);
		};
		
		if (!dataToAdd.length) {
			done();
		}
		
		processOne();
	};
	
	var applyQueue = function(syncIt,done) {
		
		var doIt = function() {
			syncIt.apply(function(err) {
				if (err === SyncIt_Constant.Error.QUEUE_EMPTY) {
					return done();
				}
				expect(err).to.equal(SyncIt_Constant.Error.OK);
				doIt();
			});
		};
		doIt();
	};
	
	it('can feed from empty',function(done) {
		
		var queue = new Queue(new Persist());
		var store = new Store(new Persist());
		var syncIt = new SyncIt(store,queue,'aa');
		var feedData = [
			{
				s: 'cars',
				k: 'bmw',
				o: 'set',
				u: {
					price:'medium',
					size:'mixed',
					speed: 'medium',
					drive: 'rear'
				},
				m: 'ben',
				b: 0,
				t: new Date().getTime() - 1000
			},
			{
				s: 'cars',
				k: 'ford',
				o: 'set',
				u: {
					price:'affordable',
					size:'mixed',
					speed: 'medium',
					drive: 'usually front'
				},
				m: 'ben',
				b: 0,
				t: new Date().getTime() - 1000
			}
		];
		var feedDataClone = JSON.parse(JSON.stringify(feedData));
		syncIt.feed(
			feedData,
			function() { expect().fail("This should not have been called"); },
			function() {
				syncIt.getFull('cars','bmw',function(err,jread) {
					expect(err).to.equal(0);
					expect(jread.v).to.equal(1);
					expect(jread.i.drive).to.equal('rear');
					syncIt.getFull('cars','ford',function(err,jread) {
						expect(err).to.equal(0);
						expect(jread.v).to.equal(1);
						expect(jread.i.drive).to.equal('usually front');
						expect(feedData).to.eql(feedDataClone);
						done();
					});
				});
			}
		);
	});

	it('will send null as the root jrec when there is no root jrec (both edited new with same dataset / datakey',function(done) {

		var queue = new Queue(new Persist());
		var store = new Store(new Persist());
		var syncIt = new SyncIt(store,queue,'aa');
		var feedData = [
			{
				s: 'cars',
				k: 'bmw',
				o: 'set',
				u: {
					price:'medium',
					size:'mixed',
					speed: 'medium',
					drive: 'rear'
				},
				m: 'ben',
				b: 0,
				t: new Date().getTime() - 1000
			}
		];

		var conflictCalled = false;
		syncIt.set('cars','bmw',{'a':'b'},function(err) {
			syncIt.feed(
				feedData,
				function(dataset, datakey, jrec, localQueueItems, serverQueueItems, resolved) {
					expect(jrec).to.equal(null);
					conflictCalled = true;
					resolved(false);
				},
				function(err) {
					expect(err).to.equal(SyncIt_Constant.Error.NOT_RESOLVED);
					expect(conflictCalled).to.equal(true);
					done();
				}
			);
		});
	
	});
	
	it('when it does not have conflicts',function(done) {
		
		var queue = new Queue(new Persist());
		var store = new Store(new Persist());
		var syncIt = new SyncIt(store,queue,'aa');
		
		var fedCheck = function(err) {
			
			var todo = 2;
			
			expect(err).to.equal(SyncIt_Constant.Error.OK);
			
			var amIDone = function() {
				if (--todo === 0) {
					done();
				}
			};
			
			syncIt.get('cars','bmw',function(err,jread) {
				expect(err).to.equal(SyncIt_Constant.Error.OK);
				expect(jread.speed).to.equal('medium');
				amIDone();
			});
			syncIt.get('cars','ford',function(err,jread) {
				expect(err).to.equal(SyncIt_Constant.Error.OK);
				expect(jread.drive).to.equal('usually front');
				amIDone();
			});
		};
		
		addTestDataToQueue(carAndAnimalTestData,queue,function() {
			// Data loaded into queue
			applyQueue(syncIt,function() {
				// Queue applied, so data now in store
				
				syncItSetter(
					syncIt,
					[
						{
							dataset:'cars',
							datakey: 'bmw',
							update: {price:'medium', size:'medium',
								speed: 'medium', drive: 'rear'}
						}
					],
					function() {
						syncIt.getFull('cars','ford',function(err,allData) {
							// Check that we are at version 1 for cars.ford
							expect(err).to.equal(SyncIt_Constant.Error.OK);
							expect(allData.v).to.equal(1);
							// now we will use syncIt, as if data came from
								syncIt.feed(
								[{
									s: 'cars',
									k: 'ford',
									o: 'set',
									u: {
										price:'affordable',
										size:'mixed',
										speed: 'medium',
										drive: 'usually front'
									},
									m: 'ben',
									b: 1,
									t: new Date().getTime() - 1000
								}],
							function() {
								expect().fail("This should not have been called");
							},
							fedCheck);
						});
					}
				);
			});
		});
	});

	it('can handle a conflict where the resolution function applies no updates afterwards',function(done) {
		var queue = new Queue(new Persist());
		var store = new Store(new Persist());
		var syncIt = new SyncIt(store,queue,'aa');
		
		addTestDataToQueue(carAndAnimalTestData,queue,function() {
			// Data loaded into queue
			applyQueue(syncIt,function() {
				syncItSetter(
					syncIt,
					[
						{
							dataset:'cars',
							datakey: 'bmw',
							update: {price:'medium', size:'medium',
								speed: 'medium', drive: 'rear'}
						}
					],
					function() {
						syncIt.feed(
							[{
								s: 'cars',
								k: 'bmw',
								o: 'set',
								u: {
									price:'medium',
									size:'medium',
									status:'high',
									seats: 'leather'
								},
								m: 'ben',
								b: 1,
								t: new Date().getTime() - 1000
							}],
							function(dataset, datakey, jrec, localQueueItems, serverQueueItems, resolved ) {
								resolved(true,[]);
							},
							function(err) {
								expect(err).to.equal(SyncIt_Constant.Error.OK);
								queue.getCountInQueue(function(err,length) {
									expect(length).to.equal(0);
									syncIt.getFull('cars','bmw',function(err,jread) {
										expect(jread.v).to.equal(2);
										expect(jread.i.seats).to.equal('leather');
										done();
									});
								});
							}
						);
					}
				);
			});
		});
	});


	it('can will do nothing if resolution function does not resolve',function(done) {
		var queue = new Queue(new Persist());
		var store = new Store(new Persist());
		var syncIt = new SyncIt(store,queue,'aa');
		
		addTestDataToQueue(carAndAnimalTestData,queue,function() {
			// Data loaded into queue
			applyQueue(syncIt,function() {
				syncItSetter(
					syncIt,
					[
						{
							dataset:'cars',
							datakey: 'bmw',
							update: {price:'medium', size:'medium',
								speed: 'medium', drive: 'rear'}
						}
					],
					function() {
						syncIt.feed(
							[{
								s: 'cars',
								k: 'bmw',
								o: 'set',
								u: {
									price:'medium',
									size:'medium',
									status:'high',
									seats: 'leather'
								},
								m: 'ben',
								b: 1,
								t: new Date().getTime() - 1000
							}],
							function(dataset, datakey, jrec, localQueueItems, serverQueueItems, resolved ) {
								resolved(false,[]);
							},
							function(err) {
								expect(err).to.equal(SyncIt_Constant.Error.NOT_RESOLVED);
								expect(syncIt._locked).to.equal(0);
								queue.getCountInQueue(function(err,length) {
									expect(length).to.equal(1);
									syncIt.getFull('cars','bmw',function(err,jread) {
										expect(jread.v).to.equal(2);
										expect(jread.i.speed).to.equal('medium');
										done();
									});
								});
							}
						);
					}
				);
			});
		});
	});

	it('Will filter out updates from the server where are already in the store',function(done) {
		var queue = new Queue(new Persist());
		var store = new Store(new Persist());
		var syncIt = new SyncIt(store,queue,'aa');
		
		var doFeed = function() {
			syncIt.feed(
				[
					{
						s: 'cars',
						k: 'bmw',
						o: 'set', // Trying to reapply our own update
						u: {
							price:'medium',
							size:'medium',
							speed: 'medium',
							drive: 'rear'
						},
						m: 'bob',
						b: 1,
						t: new Date().getTime() - 1000
					},
					{
						s: 'cars',
						k: 'bmw',
						o: 'set', // this conflicts with our queued
						u: {
							price:'medium',
							size:'medium',
							status:'high',
							seats: 'leather',
							wheels: 'alloy'
						},
						m: 'bob',
						b: 2,
						t: new Date().getTime() - 500
					},
					{
						s: 'cars',
						k: 'bmw',
						o: 'set', // the is in addition to our queued
						u: {
							price:'medium',
							size:'medium',
							status:'high',
							seats: 'leather',
							wheels: 'alloy'
						},
						m: 'bob',
						b: 3,
						t: new Date().getTime() - 500
					}
				],
				function(dataset, datakey, jrec, localQueueitems, serverQueueitems, resolved ) {
					return resolved(true,[]);
					expect().fail("This should not have been called");
				},
				function(err,stillToProcess) {
					expect(err).to.equal(SyncIt_Constant.Error.OK);
					expect(stillToProcess.length).to.equal(0);
					store.get('cars','bmw',function(err,jrec) {
						expect(jrec.v).to.equal(4);
						done();
					});
				}
			);
		};
		
		addTestDataToQueue(carAndAnimalTestData,queue,function() {
			// Data loaded into queue
			applyQueue(syncIt,function() {
				syncItSetter(
					syncIt,
					[
						{
							dataset:'cars',
							datakey: 'bmw',
							update: {price:'medium', size:'medium',
								speed: 'medium', drive: 'rear'}
						},
						{
							dataset:'cars',
							datakey: 'bmw',
							update: {price:'medium', size:'medium',
								speed: 'medium', drive: 'rear',color:'green'}
						}
					],
					function() {
						syncIt.apply(function(err,done) {
							expect(err).to.equal(0);
							// three BMW now process now, one in store (2), one in queue(3)..
							queue.getCountInQueue(function(err,len) {
								expect(err).to.equal(0);
								expect(len).to.equal(1);
								syncIt.getFull('cars','bmw',function(err,jread) {
									expect(jread.v).to.equal(3);
									doFeed();
								});
							});
						});
					}
				);
			});
		});
	});

	it('will return if locked (by a non feed operation)',function(done) {
		var queue = new Queue(new Persist());
		var store = new Store(new Persist());
		var syncIt = new SyncIt(store,queue,'aa');
		syncIt._locked = SyncIt_Constant.Locking.PROCESSING;
		syncIt.feed([
			{
				s: 'cars',
				k: 'bmw',
				o: 'set',
				u: {
					price:'medium',
					size:'medium',
					status:'high',
					seats: 'leather'
				},
				m: 'ben',
				b: 0,
				t: new Date().getTime() - 1000
			},{a:1}],
			function() {},
			function(err,stillToProcess) {
				expect(err).to.equal(SyncIt_Constant.Error.UNABLE_TO_PROCESS_BECAUSE_LOCKED);
				expect(stillToProcess.length).to.equal(2);
				done();
			}
		);
	});
	

	it('will conflict if it is just queue',function(done) {
		var queue = new Queue(new Persist());
		var store = new Store(new Persist());
		var syncIt = new SyncIt(store,queue,'aa');
		
		var beenResolved = false;
		
		syncItSetter(
			syncIt,
			[
				{
					dataset:'cars',
					datakey:'bmw',
					update: { price:'medium', size:'medium',
						speed: 'medium', drive: 'rear'} 
				}
			],
			function() {
				syncIt.feed(
					[
						{
							s: 'cars',
							k: 'bmw',
							o: 'set',
							u: {
								price:'medium',
								size:'medium',
								status:'high',
								seats: 'leather'
							},
							m: 'ben',
							b: 0,
							t: new Date().getTime() - 1000
						}
					],
					function(dataset ,datakey ,jrec ,serverQueueItems ,localQueueItems ,resolved) {
						beenResolved = true;
						resolved(true,[]);
					},
					function(err,stillToProcess) {
						expect(beenResolved).to.equal(true);
						done();
					}
				);
			}
		);
	});


	it('will skip over your own changes when feeding',function(done) {
		var queue = new Queue(new Persist());
		var store = new Store(new Persist());
		var syncIt = new SyncIt(store,queue,'aa');
		
		syncIt.listenForAddedToQueue(function() {
			syncIt._locked = SyncIt_Constant.Locking.PROCESSING;
		});
		
		syncIt.feed(
			[
				{
					s: 'cars',
					k: 'bmw',
					o: 'set',
					u: {
						price:'medium',
						size:'medium',
						status:'high',
						seats: 'leather'
					},
					m: 'aa',
					b: 0,
					t: new Date().getTime() - 1000
				}
			],
			function() {},
			function(err,stillToProcess) {
				expect(err).to.equal(SyncIt_Constant.Error.OK);
				syncIt.getFull('cars','bmw',function(err,jread) {
					expect(err).to.equal(SyncIt_Constant.Error.NO_DATA_FOUND);
					expect(jread).to.equal(null);
					syncIt.getFull('cars','bmw',function(err,jread) {
						expect(err).to.equal(SyncIt_Constant.Error.NO_DATA_FOUND);
						expect(jread).to.equal(null);
						done();
					});
				});
			}
		);
	});
	
	it('will error with BASED_ON_IN_QUEUE_LESS_THAN_BASED_IN_BEING_FED if being fed versions over what is in the local queue',function(done) {
		var queue = new Queue(new Persist());
		var store = new Store(new Persist());
		var syncIt = new SyncIt(store,queue,'aa');
		
		syncIt.listenForAddedToQueue(function() {
			syncIt._locked = SyncIt_Constant.Locking.PROCESSING;
		});
		
		syncIt.set('cars','bmw',{'a':'b'},function(err) {
			expect(err).to.equal(SyncIt_Constant.Error.OK);
			syncIt.apply(function(err) {
				expect(err).to.equal(SyncIt_Constant.Error.OK);
				syncIt.set('cars','bmw',{'c':'d'},function(err) {
					expect(err).to.equal(SyncIt_Constant.Error.OK);
					syncIt.set('cars','bmw',{'e':'f'},function(err) {
						syncIt.feed(
							[
								{
									s: 'cars',
									k: 'bmw',
									o: 'set',
									u: {
										price:'medium',
										size:'medium',
										status:'high',
										seats: 'leather'
									},
									m: 'bob',
									b: 2,
									t: new Date().getTime() - 1000
								}
							],
							function() {},
							function(err) {
								expect(err).to.equal(SyncIt_Constant.Error.BASED_ON_IN_QUEUE_LESS_THAN_BASED_IN_BEING_FED);
								done();
							}
						);
					});
				});
			});
		});
		
	});

	it('will return if error occurs in middle',function(done) {
		var queue = new Queue(new Persist());
		var store = new Store(new Persist());
		var syncIt = new SyncIt(store,queue,'aa');
		
		syncIt.listenForAddedToQueue(function() {
			syncIt._locked = SyncIt_Constant.Locking.PROCESSING;
		});
		
		syncIt.feed(
			[
				{
					s: 'cars',
					k: 'bmw',
					o: 'set',
					u: {
						price:'medium',
						size:'medium',
						status:'high',
						seats: 'leather'
					},
					m: 'ben',
					b: 0,
					t: new Date().getTime() - 1000
				},
				{
					s: 'cars',
					k: 'bmw',
					o: 'set',
					u: {
						price:'medium/high',
						size:'medium',
						status:'high',
						seats: 'leather'
					},
					m: 'ben',
					b: 9,
					t: new Date().getTime() - 1000
				}
			],
			function() {},
			function(err,stillToProcess) {
				expect(err).to.equal(SyncIt_Constant.Error.TRYING_TO_APPLY_TO_FUTURE_VERSION);
				expect(syncIt._locked).to.equal(0);
				expect(stillToProcess.length).to.equal(1);
				done();
			}
		);
	});

	it('when it has a mix of conflicts (non conflicting first)',function(done) {
		var queue = new Queue(new Persist());
		var store = new Store(new Persist());
		var syncIt = new SyncIt(store,queue,'aa');
		var resolvedCalledCount = 0;

		var resolver = function(dataset, datakey, jrec, localQueueitems, serverQueueitems, resolved ) {
			expect(++resolvedCalledCount).to.equal(1);
			expect(serverQueueitems.length).to.equal(1);
			expect(localQueueitems.length).to.equal(2);
			expect(serverQueueitems[0].u.seats).to.equal('leather');
			expect(localQueueitems[0].u.drive).to.equal('rear');
			expect(localQueueitems[0].u.hasOwnProperty('color')).to.equal(false);
			expect(localQueueitems[1].u.drive).to.equal('rear');
			expect(localQueueitems[1].u.color).to.equal('blue');
			var r0 = syncIt._cloneObj(localQueueitems[0]);
			r0.u.seats = 'leather';
			r0.o = 'set';
			r0.m = 'this_should_revert_to_aa';
			r0.original = syncIt._cloneObj(localQueueitems[0]);
			var r1 = syncIt._cloneObj(localQueueitems[1]);
			r1.u.seats = 'leather';
			r1.m = 'this_should_revert_to_aa';
			r1.original = syncIt._cloneObj(localQueueitems[1]);
			resolved(true,[r0,r1]);
		};
		
		addTestDataToQueue(carAndAnimalTestData,queue,function() {
			// Data loaded into queue
			applyQueue(syncIt,function() {
				// Queue applied, so data now in store, set new data
				syncItSetter(
					syncIt,
					[
						{
							dataset:'cars',
							datakey:'bmw',
							update: { price:'medium', size:'medium',
								speed: 'medium', drive: 'rear'} 
						},
						{
							dataset:'cars',
							datakey:'ford',
							update: { price:'affordable', size:'mixed', 
								speed: 'medium', drive: 'usually front' }
						},
						{
							dataset:'cars',
							datakey:'bmw',
							update: { price:'medium', size:'medium',
								speed: 'medium', drive: 'rear', color: 'blue'} 
						}
					],
					function() {
						syncIt.feed(
							[
								{
									s: 'cars',
									k: 'bmw',
									o: 'set',
									u: {
										price:'medium',
										size:'medium',
										status:'high',
										seats: 'leather'
									},
									m: 'aben',
									b: 1,
									t: new Date().getTime() - 1000
								},
								{
									s: 'cars',
									k: 'austin',
									o: 'set',
									u: {
										price:'low',
										size:'mixed'
									},
									m: 'ben',
									b: 0,
									t: new Date().getTime() - 1000
								},
								{
									s: 'cars',
									k: 'bmw',
									o: 'set',
									u: {
										price:'medium',
										size:'medium',
										status:'high',
										seats: 'leather'
									},
									m: 'ben',
									b: 2,
									t: new Date().getTime() - 1000
								}
							],
							resolver,
							function(err) {
								expect(err).to.equal(SyncIt_Constant.Error.OK);
								var toCheck = 2;
								syncIt.getFull('cars','ford',function(err,jread) {
									expect(jread.i).to.eql({
										price:'affordable',
										size:'mixed',
										speed: 'medium',
										drive: 'usually front'
									});
									expect(jread.m).to.equal('aa');
									expect(jread.v).to.equal(2);
									if (--toCheck === 0) {
										done();
									}
								});
								syncIt.getFull('cars','bmw',function(err,jread) {
									expect(jread.i).to.eql({
										price:'medium',
										size:'medium',
										speed: 'medium',
										drive: 'rear',
										color: 'blue',
										seats: 'leather'
									});
									expect(jread.m).to.equal('aa');
									expect(jread.v).to.equal(5); // original, 2 set, 2 conflict resolution
									if (--toCheck === 0) {
										done();
									}
								});
							}
						);
					}
				);
			});
		});
	});
	it('will ignore duplicate requests',function(done) {
		var toCheck = 1;
		var checker = function() {
			syncIt.getFull('cars','bmw',function(err,jread) {
				expect(err).to.equal(0);
				expect(jread.i).to.eql({
					price:'medium',
					size:'medium',
					status: 'high',
					seats: 'leather'
				});
				// expect(jread.modifier).to.equal('aa');
				if (--toCheck === 0) {
					done();
				}
			});
		};
		var queue = new Queue(new Persist());
		var store = new Store(new Persist());
		var syncIt = new SyncIt(store,queue,'aa');
		syncIt.feed(
			[{
				s: 'cars',
				k: 'bmw',
				o: 'set',
				u: {
					price:'medium',
					size:'medium',
					status:'high',
					seats: 'leather'
				},
				m: 'ben',
				b: 0,
				t: new Date().getTime() - 1000
			}],
			function() {},
			checker
		);
	});
});


// =============================================================================

});
