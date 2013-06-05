/*jshint smarttabs:true */
(function (root, factory) {
	if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		module.exports = factory(
			require('../node_modules/expect.js/expect.js'),
			require('../js/Constant.js'),
			require('../js/Persist/Memory.js'),
			require('../js/Persist/MemoryAsync.js'),
			require('../js/Queue/LocalStorage.js'),
			require('../js/Queue/Persist.js')
		);
	} else if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(
			[
				'expect.js',
				'syncit/Constant',
				'syncit/Persist/Memory',
				'syncit/Persist/MemoryAsync',
				'syncit/Queue/LocalStorage.js',
				'syncit/Queue/Persist.js'
			],
			factory
		);
	} else {
		// Browser globals (root is window)
		root.returnExports = factory(
			root.expect,
			root.SyncIt_Constant,
			root.SyncIt_Persist_Memory,
			root.SyncIt_Persist_MemoryAsync,
			root.SyncIt_Queue_LocalStorage,
			root.SyncIt_Queue_Persist
		);
	}
})(this, function (
	expect,
	SyncIt_Constant,
	SyncIt_Persist_Memory,
	SyncIt_Persist_MemoryAsync,
	SyncIt_Queue_LocalStorage,
	SyncIt_Queue_Persist
) {
// =============================================================================

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

describe('Queue',function() {

	var INSTANCE_COUNT = 1;
	
	var dataToAdd = [];
	dataToAdd.push({s:'car',k:'skoda',b:0});
	dataToAdd.push({s:'car',k:'bmw',b:0});
	dataToAdd.push({s:'car',k:'ford',b:0});
	dataToAdd.push({s:'animal',k:'tiger',b:0});
	dataToAdd.push({s:'animal',k:'lion',b:0});
	dataToAdd.push({s:'animal',k:'domestic cat',b:0});
	dataToAdd.push({s:'car',k:'bmw',b:1});

	var addArrayToQueue = function(queue,data,next) {
		queue.push(data.shift(),function() {
			if (!data.length) {
				return next(queue);
			}
			addArrayToQueue(queue,data,next);
		});
	};

	var prepareForTest = function(next) {

		var queueAsync = new SyncIt_Queue_Persist(new SyncIt_Persist_MemoryAsync());
		var queueSync = new SyncIt_Queue_Persist(new SyncIt_Persist_Memory());
		var queueLocalStorage = new SyncIt_Queue_LocalStorage('aabbcc',new LocalStorage());

		//addArrayToQueue(queueAsync,JSON.parse(JSON.stringify(dataToAdd)),next);
		//addArrayToQueue(queueSync,JSON.parse(JSON.stringify(dataToAdd)),next);
		addArrayToQueue(queueLocalStorage,JSON.parse(JSON.stringify(dataToAdd)),next);
		
	};

	var callWhenAllInstancesDone = function(doneFunc) {
		var i = 0;
		return function() {
			if (++i == INSTANCE_COUNT) {
				doneFunc();
			}
		};
	};

	var getFullQueue = function(queue,next) {
		var r = [];


		var doIt = function(queue) {
			queue.getFirst(function(e,queueitem) {
				if (e) {
					return addArrayToQueue(
						queue,
						JSON.parse(JSON.stringify(r)),
						function() {
							next(e == -1 ? 0 : e,r);
						}
					);
				}
				r.push(queueitem);
				queue.advance(function(e) {
					if (e) {
						return next(e,r);
					}
					doIt(queue);
				});
			});
		};
		doIt(queue);
	};
	
	var filterToJustDatasetAndDataKey = function(results) {
		var r = [];
		for (var i=0;i<results.length;i++) {
			r.push({s:results[i].s,k:results[i].k});
		}
		return r;
	};
	
	it('can list queueitems unfiltered (after advance)',function(fullDone) {
		
		var done = callWhenAllInstancesDone(fullDone);

		var check = function(queue) {
			queue.advance(function(err) {
				expect(err).to.equal(SyncIt_Constant.Error.OK);
				var expectedMangled = filterToJustDatasetAndDataKey(dataToAdd);
				expectedMangled.shift();
				getFullQueue(queue,function(err,queueitems) {
					expect(err).to.equal(SyncIt_Constant.Error.OK);
					var resultMangled = filterToJustDatasetAndDataKey(queueitems);
					expect(resultMangled).to.eql(expectedMangled);
					done();
				});
			});
		};
		prepareForTest(check);
	});
	
	it('can list queueitems in dataset and datakey (after advance)',function(fullDone) {
		
		var done = callWhenAllInstancesDone(fullDone);

		var check = function(queue) {
			queue.advance(function(err) {
				expect(err).to.equal(SyncIt_Constant.Error.OK);
				var expectedMangled = filterToJustDatasetAndDataKey(dataToAdd);
				expectedMangled.shift();
				expectedMangled = expectedMangled.filter(function(itm) {
					if (itm.s != 'car') {
						return false;
					}
					return true;
				});
				queue.getItemsForDatasetAndDatakey('car', 'bmw', function(err,queueitems) {
					expectedMangled = expectedMangled.filter(function(itm) {
						if ((itm.s == 'car') && (itm.k == 'bmw')) {
							return true;
						}
						return false;
					});
					var resultMangled = filterToJustDatasetAndDataKey(queueitems);
					expect(resultMangled).to.eql(expectedMangled);
					done();
				});
			});
		};
		prepareForTest(check);
	});

	it('can return unfiltered queues, advance, push and get queues again',function(fullDone) {
		
		var done = callWhenAllInstancesDone(fullDone);
		
		var check = function(queue) {
			
			getFullQueue(queue,function(err,queueitems) {
				
				var expected = filterToJustDatasetAndDataKey(dataToAdd);
				var unfiltered = filterToJustDatasetAndDataKey(queueitems);
				
				expect(unfiltered).to.eql(expected);
				
				queue.advance(function() {
					getFullQueue(queue,function(err,newQueueitems) {
						expected.shift();
						var unfiltered = filterToJustDatasetAndDataKey(newQueueitems);
						expect(unfiltered).to.eql(expected);
						queue.push({s:'car',k:'lotus',i:9},function() {
							expected.push({s:'car',k:'lotus'});
							getFullQueue(queue,function(err,newNewQueueitems) {
								expect(
									filterToJustDatasetAndDataKey(newNewQueueitems)
								).to.eql(expected);
								done();
							});
						});
					});
				});
				
			});
			
		};
		
		prepareForTest(check);
		
	});

});

});
