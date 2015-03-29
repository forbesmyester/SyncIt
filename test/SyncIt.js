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
	SyncIt_Unsupported_PathStorageAnalysis
) {
// =============================================================================

"use strict";

var _cloneObj = function(ob) {
	return JSON.parse(JSON.stringify(ob));
};

var ERROR = SyncIt_Constant.Error;

var getNewPathStore = function() {

	var localStorage = new SyncIt_FakeLocalStorage();
	var asyncLocalStorage = new SyncIt_AsyncLocalStorage(
		localStorage,
		'aa',
		JSON.stringify,
		JSON.parse,
		10
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

var checkKeysFromSyncIt = function(readitem,keys) {
	var i = 0;
	for (i=0;i<keys.length;i++) {
		expect(readitem.hasOwnProperty(keys[i])).to.equal(true);
		if (keys[i] != 'r') {
			expect(readitem[i] !== false).to.equal(true);
		}
	}
};
var checkIsFullRead = function(readitem) {
	checkKeysFromSyncIt(readitem,['p','q','r','s','k','i','t','m','v']);
};
var checkQueueitemRead = function(readitem) {
	checkKeysFromSyncIt(readitem,['o','u','s','k','t','m','b']);
};
var checkStoreRead = function(readitem) {
	checkKeysFromSyncIt(readitem,['r','s','k','i','t','m','v']);
};

var runSequence = function(syncIt,sequence,next) {

	var funcMaps = {
		set: ['dataset', 'datakey', 'update'],
		update: ['dataset', 'datakey', 'update'],
		remove: ['dataset', 'datakey'],
		advance: [],
		feed: ['feedQueueitems', 'resolutionFunction']
	};

	var pos = 0;

	var processOne = function() {
		if (pos == sequence.length) { return next(); }
		var seqItem = sequence[pos++];
		var map = [];
		var args = [];
		if (!funcMaps.hasOwnProperty(seqItem.func)) {
			throw "Invalid sequence item "+JSON.stringify(seqItem);
		}
		map = funcMaps[seqItem.func];
		for (var i=0;i<map.length;i++) {
			if (!seqItem.hasOwnProperty(map[i])) {
				throw "Invalid sequence item "+JSON.stringify(seqItem);
			}
			args.push(seqItem[map[i]]);
		}
		args.push(function(err) {
			if (err) {
				throw "Error running "+JSON.stringify(seqItem)+" - return code "+err;
			}
			if (pos == sequence.length) {
				return next.apply(this,Array.prototype.slice.call(arguments));
			}
			processOne();
		});
		syncIt[seqItem.func].apply(syncIt,args);
	};

	processOne();

};

describe('When SyncIt wants a copy it calls _cloneObj and ',function() {
	this.timeout(60000);
	var source = {color: 'blue', size: 'large'},
		syncIt = new SyncIt();
	it('should have the same value',function() {
		expect(syncIt._cloneObj(source).color).to.equal(source.color);
	});
	it('must really be a copy',function() {
		var clone = syncIt._cloneObj(source);
		clone.color = 'red';
		expect(source.color).to.equal('blue');
		expect(clone.color).to.equal('red');
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
describe('SyncIt Tests',function() {
	this.timeout(60000);
	it('Can run a sequence',function(done) {
		var syncIt = getFreshSyncIt();
		runSequence(syncIt,[
			{func:'set',dataset:"animals",datakey:"frog",update:{color:'green'}},
			{func:'update',dataset:"animals",datakey:"frog",update:{$set:{skin:'slimy'}}}
		],function(err) {
			expect(err).to.equal(ERROR.OK);
			done();
		});
	});
});
describe('When I want to add data to SyncIt I can call set and',function() {
	this.timeout(60000);

	var multiData = [
		{func: 'set', dataset: 'cars', datakey: 'bmw', update: carAndAnimalTestData.cars.bmw},
		{func: 'update', dataset: 'cars', datakey: 'bmw', update: {'$set':{'color':'white'}}},
		{func: 'set', dataset: 'cars', datakey: 'ford', update: carAndAnimalTestData.cars.ford}
	];

	it('will add the data',function(done) {
		var syncIt = getFreshSyncIt();
		var eventOccured = false;
		syncIt.listenForAddedToPath(function(dataset,datakey,queueitem,storerecord) {
			expect(dataset).to.equal('cars');
			expect(datakey).to.equal('bmw');
			expect(queueitem.b).to.equal(0);
			expect(storerecord.v).to.equal(1);
			expect(queueitem.u.status).to.equal('high');
			expect(storerecord.i.status).to.equal('high');
			checkQueueitemRead(queueitem);
			eventOccured = true;
		});
		syncIt.set(
			'cars',
			'bmw',
			carAndAnimalTestData.cars.bmw,
			function(err,dataset,datakey,queueitem,readitem) {
				expect(err).to.equal(ERROR.OK);
				expect(dataset).to.equal('cars');
				expect(datakey).to.equal('bmw');
				expect(readitem.i).to.eql(carAndAnimalTestData.cars.bmw);
				expect(readitem.q.length).to.equal(1);
				expect(readitem.m).to.equal('bob');
				expect(readitem.t > (new Date().getTime()-1000)).to.equal(true);
				expect(readitem.t < (new Date().getTime()+1000)).to.equal(true);
				expect(readitem.r).to.equal(false);
				expect(eventOccured).to.equal(true);
				syncIt.getFull(dataset,datakey,function(err,readitem) {
					expect(err).to.equal(ERROR.OK);
					checkIsFullRead(readitem);
					done();
				});
			}
		);
	});

	it('SyncIt.getFirst will only call callback once if no root data',function(done) {
		var syncIt = getFreshSyncIt();
		syncIt.set(
			'cars',
			'bmw',
			carAndAnimalTestData.cars.bmw,
			function(err) {
				expect(err).to.equal(ERROR.OK);
				syncIt.getFirst(function(err,queueitem) {
					expect(err).to.equal(ERROR.OK);
					expect(queueitem.u.status).to.eql('high');
					expect(queueitem.b).to.equal(0);
					checkQueueitemRead(queueitem);
					done();
				});
			}
		);
	});

	it('can add multiple items of data',function(done) {
		var syncIt = getFreshSyncIt();
		var eventOccuredCount = 0;
		syncIt.listenForAddedToPath(function() {
			eventOccuredCount = eventOccuredCount + 1;
		});
		runSequence(syncIt,multiData,function(err) {
			expect(err).to.equal(ERROR.OK);
			syncIt.getFull('cars','bmw',function(err,readitem) {
				expect(err).to.equal(ERROR.OK);
				expect(readitem.q.length).to.equal(2);
				var expectedRead = _cloneObj(carAndAnimalTestData.cars.bmw);
				expectedRead.color = 'white';
				expect(readitem.i).to.eql(expectedRead);
				expect(eventOccuredCount).to.equal(3);
				done();
			});
		});
	});

	it('can advance the queue',function(done) {
		var syncIt = getFreshSyncIt();
		var expectedRead = _cloneObj(carAndAnimalTestData.cars.bmw);
		var eventOccuredCount = 0;
		syncIt.listenForAdvanced(function(dataset,datakey,queueitem,storerecord) {
			if (eventOccuredCount === 0) {
				expect(dataset).to.equal('cars');
				expect(datakey).to.equal('bmw');
				expect(queueitem.o).to.equal('set');
				expect(queueitem.u.status).to.equal('high');
				checkQueueitemRead(queueitem);
				expect(storerecord.i.status).to.equal('high');
				checkStoreRead(storerecord);
			}
			eventOccuredCount = eventOccuredCount + 1;
		});
		expectedRead.color = 'white';
		runSequence(syncIt,multiData,function(err) {
			expect(err).to.equal(ERROR.OK);
			syncIt.advance(function(err) {
				expect(err).to.equal(ERROR.OK);
				expect(eventOccuredCount).to.equal(1);
				syncIt.getFull('cars','bmw',function(err,readitem) {
					expect(readitem.q.length).to.equal(1);
					expect(readitem.i).to.eql(expectedRead);
					expect(readitem.i.status).to.eql('high');
					syncIt.getFirst(function(err,queueitem) {
						expect(err).to.equal(ERROR.OK);
						expect(queueitem.u).to.eql({$set:{color:'white'}});
						expect(queueitem.b).to.equal(1);
						checkQueueitemRead(queueitem);
						syncIt.advance(function(err,dataset,datakey,readitem) {
							expect(readitem.u).to.eql({$set:{color:'white'}});
							expect(eventOccuredCount).to.equal(2);
							syncIt.advance(function(err) {
								expect(err).to.equal(ERROR.OK);
								expect(eventOccuredCount).to.equal(3);
								syncIt.advance(function(err) {
									expect(err).to.equal(ERROR.PATH_EMPTY);
									expect(eventOccuredCount).to.equal(3);
									syncIt.getFull('cars','bmw',function(err,readitem) {
										expect(err).to.equal(ERROR.OK);
										expect(readitem.q.length).to.equal(0);
										checkIsFullRead(readitem);
										expect(readitem.i).to.eql(expectedRead);
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

describe('Deleted data',function() {
	this.timeout(60000);

	var multiData = [
		{func: 'set', dataset: 'cars', datakey: 'bmw', update: carAndAnimalTestData.cars.bmw},
		{func: 'remove', dataset: 'cars', datakey: 'bmw', update: {}}
	];

	it('cannot be added to while in a Pathitem',function(done) {
		var syncIt = getFreshSyncIt();
		runSequence(syncIt,multiData,function(err) {
			expect(err).to.equal(ERROR.OK);
			syncIt.set('cars','bmw',{'a':'b'},function(err) {
				expect(err).to.equal(ERROR.DATA_ALREADY_REMOVED);
				done();
			});
		});
	});

	it('cannot be added to while in a Pathitem2',function(done) {
		var syncIt = getFreshSyncIt();
		runSequence(syncIt,multiData,function(err) {
			expect(err).to.equal(ERROR.OK);
			syncIt.advance(function(err) {
				expect(err).to.equal(ERROR.OK);
				syncIt.advance(function(err) {
					expect(err).to.equal(ERROR.OK);
					syncIt.set('cars','bmw',{'a':'b'},function(err) {
						expect(err).to.equal(ERROR.DATA_ALREADY_REMOVED);
						done();
					});
				});
			});
		});
	});
});
describe('when feeding',function() {
	this.timeout(60000);
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
			k: 'bmw',
			o: 'update',
			u: {$set:{'seats':'leather'}},
			m: 'ben',
			b: 1,
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
	it('can be done from empty',function(done) {
		var syncIt = getFreshSyncIt();
		var eventOccuredCount = 0;
		syncIt.listenForFed(function(dataset,datakey,queueitem,storerecord) {
			if (eventOccuredCount === 0) {
				expect(dataset).to.equal('cars');
				expect(datakey).to.equal('bmw');
				expect(queueitem.o).to.equal('set');
				expect(queueitem.u.drive).to.equal('rear');
				checkQueueitemRead(queueitem);
				expect(storerecord.i.drive).to.equal('rear');
				checkStoreRead(storerecord);
			}
			eventOccuredCount = eventOccuredCount + 1;
		});
		var feedDataClone = JSON.parse(JSON.stringify(feedData));
		syncIt.feed(
			feedData,
			function() { expect().fail("This should not have been called"); },
			function(err) {
				expect(err).to.equal(ERROR.OK);
				expect(eventOccuredCount).to.equal(3);
				syncIt.getFull('cars','bmw',function(err,jread) {
					checkIsFullRead(jread);
					expect(err).to.equal(ERROR.OK);
					expect(jread.q.length).to.equal(0);
					expect(jread.v).to.equal(2);
					expect(jread.s).to.equal('cars');
					expect(jread.k).to.equal('bmw');
					expect(jread.i.drive).to.equal('rear');
					syncIt.getFull('cars','ford',function(err,jread) {
						checkIsFullRead(jread);
						expect(err).to.equal(ERROR.OK);
						expect(jread.q.length).to.equal(0);
						expect(jread.v).to.equal(1);
						expect(jread.i.drive).to.equal('usually front');
						expect(feedData).to.eql(feedDataClone);
						done();
					});
				});
			}
		);
	});

	it('can detect being fed old and new...',function(done) {
		var syncIt = getFreshSyncIt();
		var eventOccuredCount = 0;
		syncIt.listenForFed(function() {
			eventOccuredCount = eventOccuredCount + 1;
		});
		runSequence(
			syncIt,
			[{func: 'feed', feedQueueitems: feedData, resolutionFunction: function() {} }],
			function(err) {
				expect(err).to.equal(ERROR.OK);
				expect(eventOccuredCount).to.equal(3);
				var feedData2 = [{
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
					b: 9,
					t: new Date().getTime() - 1000
				}];
				syncIt.feed(
					feedData2,
					function() { expect().fail("This should not have been called"); },
					function(err) {
						expect(err).to.equal(ERROR.FEED_VERSION_ERROR);
						expect(eventOccuredCount).to.equal(3);
						feedData2[0].b = 0;
						syncIt.feed(
							feedData,
							function() { expect().fail("This should not have been called"); },
							function(err) {
								expect(err).to.equal(ERROR.OK); // We skip over
																// out of date
																// items
								expect(eventOccuredCount).to.equal(3);
								syncIt.getFull('cars','ford',function(err,jread) {
									checkIsFullRead(jread);
									expect(err).to.equal(ERROR.OK);
									expect(jread.v).to.equal(1);
									expect(jread.i.drive).to.equal('usually front');
									done();
								});
							}
						);
					}
				);
			}
		);
	});

	it('will skip over feeds which have items behind',function(done) {
		var syncIt = getFreshSyncIt();
		var eventOccuredCount = 0;
		syncIt.listenForFed(function() {
			eventOccuredCount = eventOccuredCount + 1;
		});
		runSequence(
			syncIt,
			[{func: 'set', dataset: 'cars', datakey: 'bmw', update: {wheels:'black'}},
			{func: 'advance'}],
			function(err) {
				expect(err).to.equal(ERROR.OK);
				syncIt.feed(
					feedData,
					function() { expect().fail("This should not have been called"); },
					function() {
						syncIt.getFull('cars','bmw',function(err,jread) {
							expect(err).to.equal(ERROR.OK);
							expect(eventOccuredCount).to.equal(2);
							checkIsFullRead(jread);
							expect(jread.v).to.equal(2);
							expect(jread.q.length).to.equal(0);
							expect(jread.i.hasOwnProperty('drive')).to.equal(false);
							expect(jread.i.wheels).to.equal('black');
							expect(jread.i.seats).to.equal('leather');
							syncIt.getFull('cars','ford',function(err,jread) {
								checkIsFullRead(jread);
								expect(err).to.equal(ERROR.OK);
								expect(jread.v).to.equal(1);
								expect(jread.i.drive).to.equal('usually front');
								expect(feedData).to.eql(feedData);
								done();
							});
						});
					}
				);
			}
		);
	});

	it('can handle a conflict when there are no changes in conflict resolution',function(done) {
		var syncIt = getFreshSyncIt();
		var eventOccuredCount = 0;
		var expectedBVer = 0;
		syncIt.listenForFed(function() {
			eventOccuredCount = eventOccuredCount + 1;
		});
		syncIt.listenForAddedToPath(function(s, k, queueitem) {
			expect(queueitem.b).to.equal(expectedBVer++);
		});

		runSequence(
			syncIt,
			[{func: 'set', dataset: 'cars', datakey: 'bmw', update: {wheels:'black'}},
			{func: 'advance'},
			{func: 'set', dataset: 'cars', datakey: 'bmw', update: {dice:'fluffy'}}],
			function(err) {
				expect(err).to.equal(ERROR.OK);
				syncIt.feed(
					feedData,
					function(dataset,datakey,storerecord,localQueueitems,fedQueueitems,resolved) {
						expect(eventOccuredCount).to.equal(0);
						checkStoreRead(storerecord);
						expect(dataset).to.equal('cars');
						expect(datakey).to.equal('bmw');
						expect(storerecord.r).to.equal(false);
						expect(storerecord.v).to.equal(1);
						expect(storerecord.i.wheels).to.equal('black');
						expect(localQueueitems.length).to.equal(1);
						expect(localQueueitems[0].u.dice).to.equal('fluffy');
						expect(fedQueueitems.length).to.equal(1);
						expect(fedQueueitems[0].u.$set.seats).to.equal('leather');
						resolved(true,[]);
					},
					function(err) {
						expect(err).to.equal(ERROR.OK);
						syncIt.getFull('cars','bmw',function(err,jread) {
							expect(err).to.equal(ERROR.OK);
							expect(eventOccuredCount).to.equal(2);
							checkIsFullRead(jread);
							expect(jread.v).to.equal(2);
							expect(jread.i.hasOwnProperty('drive')).to.equal(false);
							expect(jread.i.wheels).to.equal('black');
							expect(jread.i.seats).to.equal('leather');
							syncIt.getFull('cars','ford',function(err,jread) {
								expect(err).to.equal(ERROR.OK);
								checkIsFullRead(jread);
								expect(jread.v).to.equal(1);
								expect(jread.i.drive).to.equal('usually front');
								expect(feedData).to.eql(feedData);
								done();
							});
						});
					}
				);
			}
		);
	});

	it('On feed can resolve conflicts',function(done) {
		var syncIt = getFreshSyncIt();
		var eventOccuredCount = 0;
		var expectedDataAt = [
			{
				queueitem: { o: 'set', m: 'bob', u: { wheels: 'black' } },
				storerecord: { wheels: 'black' }
			},
			{
				queueitem: { o: 'update', m: 'bob', u: { $set: { dice: 'fluffy' } } },
				storerecord: { wheels: 'black', dice: 'fluffy' }
			},
			{
				queueitem: { o: 'update', m: 'ben', u: { $set: { seats: 'leather' } } },
				storerecord: { wheels: 'black', seats: 'leather' }
			},
			{
				queueitem: { o: 'update', m: 'bob', u: { $set: { dice: 'fluffy' } } },
				storerecord: { wheels: 'black', seats: 'leather', dice: 'fluffy' }
			}
		];
		var dataChange = 0;
		syncIt.listenForFed(function() {
			eventOccuredCount = eventOccuredCount + 1;
		});
		syncIt.listenForDataChange(function(storerecord, queueitem) {
			if (storerecord.k !== 'bmw') { return; }
			expect(storerecord.i).to.eql(expectedDataAt[dataChange].storerecord);
			expect(queueitem.o).to.eql(expectedDataAt[dataChange].queueitem.o);
			expect(queueitem.m).to.eql(expectedDataAt[dataChange].queueitem.m);
			expect(queueitem.u).to.eql(expectedDataAt[dataChange].queueitem.u);
			dataChange = dataChange + 1;
		});
		runSequence(
			syncIt,
			[{func: 'set', dataset: 'cars', datakey: 'bmw', update: {wheels:'black'}},
			{func: 'advance'},
			{func: 'update', dataset: 'cars', datakey: 'bmw', update: {$set:{dice:'fluffy'}}}
			],function(err) {
				expect(err).to.equal(ERROR.OK);
				var addedEventFired = false;
				syncIt.listenForConflictResolutionAddedToPath(function(dataset,datakey) {
					expect(dataset).to.equal('cars');
					expect(datakey).to.equal('bmw');
					addedEventFired = true;
				});
				syncIt.feed(
					feedData,
					function(
						dataset,
						datakey,
						storerecord,
						localQueueitems,
						fedQueueitems,
						resolved
					) {
						resolved(true,[{o:'update',u:{$set:{'dice':'fluffy'}}}]);
					},
					function(err) {
						expect(err).to.equal(ERROR.OK);
						expect(addedEventFired).to.equal(true);
						expect(dataChange).to.equal(4);
						syncIt.getFull('cars','bmw',function(err,jread) {
							expect(err).to.equal(ERROR.OK);
							checkIsFullRead(jread);
							expect(jread.v).to.equal(3);
							expect(jread.i.hasOwnProperty('drive')).to.equal(false);
							expect(jread.i.wheels).to.equal('black');
							expect(jread.i.seats).to.equal('leather');
							expect(jread.i.dice).to.equal('fluffy');
							done();
						});
					}
				);
			}
		);
	});

	it('On feed will skip already applied',function(done) {
		var syncIt = getFreshSyncIt();
		var eventOccuredCount = 0;
		syncIt.listenForFed(function() {
			eventOccuredCount = eventOccuredCount + 1;
		});
		runSequence(
			syncIt,
			[{func: 'set', dataset: 'cars', datakey: 'bmw', update: {wheels:'black'}},
			{func: 'advance'},
			{func: 'update', dataset: 'cars', datakey: 'bmw', update: {$set:{dice:'fluffy'}}},
			{
				func: 'feed',
				feedQueueitems: feedData,
				resolutionFunction: function(
					dataset,
					datakey,
					storerecord,
					localQueueitems,
					fedQueueitems,
					resolved
				) {
					resolved(true,[{o:'update',u:{$set:{'dice':'fluffy'}}}]);
				}
			},
			{func: 'update', dataset: 'cars', datakey: 'bmw', update: {$set:{model:'5 series'}}}],
			function(err) {
				expect(err).to.equal(ERROR.OK);
				expect(eventOccuredCount).to.equal(2);
				syncIt.getFull('cars','bmw',function(err,jread) {
					expect(err).to.equal(ERROR.OK);
					checkIsFullRead(jread);
					expect(jread.v).to.equal(4);
					expect(jread.i.hasOwnProperty('drive')).to.equal(false);
					expect(jread.i.wheels).to.equal('black');
					expect(jread.i.seats).to.equal('leather');
					expect(jread.i.dice).to.equal('fluffy');
					expect(jread.i.model).to.equal('5 series');
					syncIt.getFull('cars','ford',function(err,jread) {
						expect(err).to.equal(ERROR.OK);
						expect(jread.q.length).to.equal(0);
						checkIsFullRead(jread);
						expect(jread.v).to.equal(1);
						expect(jread.i.drive).to.equal('usually front');
						expect(feedData).to.eql(feedData);
						expect(eventOccuredCount).to.equal(2);
						syncIt.feed(
							[{
								s: 'cars',
								k: 'bmw',
								o: 'update',
								u: { $set: { alloys: false } },
								m: 'ben',
								b: 1,
								t: new Date().getTime() - 10
							}],
							function() {},
							function(err) {
								expect(err).to.equal(ERROR.OK);
								syncIt.getFull('cars','bmw',function(err,jread) {
									expect(err).to.equal(ERROR.OK);
									expect(eventOccuredCount).to.equal(2);
									expect(jread.q.length).to.equal(2);
									expect(jread.v).to.equal(4);
									done();
								});
							}
						);
					});
				});
			}
		);
	});

	it('Can clean',function(done) {
		var pathStore = getNewPathStore();
		var syncIt = new SyncIt(pathStore,'jane');
		runSequence(
			syncIt,
			[{func: 'set', dataset: 'cars', datakey: 'bmw', update: {wheels:'black'}},
			{func: 'advance'},
			{func: 'update', dataset: 'cars', datakey: 'bmw', update: {$set:{dice:'fluffy'}}},
			{
				func: 'feed',
				feedQueueitems: feedData,
				resolutionFunction: function(
					dataset,
					datakey,
					storerecord,
					localQueueitems,
					fedQueueitems,
					resolved
				) {
					resolved(true,[{o:'update',u:{$set:{'dice':'fluffy'}}}]);
				}
			},
			{func: 'update', dataset: 'cars', datakey: 'bmw', update: {$set:{model:'5 series'}}}],
			function(err) {
				// now mangle the data so there is something wrong to clean up!
				expect(err).to.equal(ERROR.OK);
				pathStore.push('cars','bmw','c',{c:'d'},false,function() { return ERROR.OK; },function(err) {
					expect(err).to.equal(ERROR.OK);
					pathStore.pushPathitemsToNewPath('cars','ford','c',[{e:'f'},{g:'h'}],function(err) {
						expect(err).to.equal(ERROR.OK);
						pathStore.removePath('cars','ford','c',false,function(err) {
							expect(err).to.equal(ERROR.OK);
							syncIt.clean(function(err) {
								expect(err).to.equal(ERROR.OK);
								var syncLocalStorage = pathStore._ls._inst;
								var prequel = '';
								var postGetItem = function(v) { return v; };
								if (!syncLocalStorage) {
									syncLocalStorage = pathStore._ls._lf._inst; // For LocalForage test.
									prequel = 'aa.';
									postGetItem = JSON.parse;
								}
								var allRefs = syncLocalStorage.findKeys(prequel + '*.*.*');
								var allRootsKeys = syncLocalStorage.findKeys(prequel + '*.*');

								var collectRefsFromPathitem = function(rootK,startPathitem) {
									var r = [],
										dataset = rootK.split('.')[rootK.split('.').length - 2],
										datakey = rootK.split('.').pop();
									while (startPathitem.hasOwnProperty('_n')) {
										r.push(
											dataset + '.' +
											datakey + '.' +
											startPathitem._n
										);
										startPathitem = postGetItem(syncLocalStorage.getItem(
											prequel +
											dataset + '.' +
											datakey + '.' +
											startPathitem._n
										));
									}
									return r;
								};
								var followedKeys = (function(sls,rootKeys) {
									var followedKeys = [];
									for (var i=0; i<rootKeys.length; i++) {
										var root = postGetItem(sls.getItem(rootKeys[i]));
										expect(root.hasOwnProperty('_i')).to.equal(false);
										for (var k in root) {
											if (root.hasOwnProperty(k) && k.match(/^[a-z]/)) {
												followedKeys = followedKeys.concat(
													collectRefsFromPathitem(rootKeys[i],root[k])
												);
											}
										}
									}
									return followedKeys;
								}(syncLocalStorage,allRootsKeys));
								expect(
									followedKeys.sort(pathStore._ed.sort)
								).to.eql(
									allRefs.sort(pathStore._ed.sort)
								);
								done();
							});
						});
					});
				});
			}
		);
	});

});

// =============================================================================

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
	require('../Unsupported/PathStorageAnalysis')
));
