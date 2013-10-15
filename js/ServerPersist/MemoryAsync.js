/*jshint smarttabs:true */
(function (root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	if (typeof exports === 'object') {
		module.exports = factory(
			require('../Constant.js'),
			require('../updateResult.js')
		);
	} else if (typeof define === 'function' && define.amd) {
		define(
			['syncit/Constant','syncit/updateResult'],
			factory
		);
	} else {
		root.SyncIt_ServerPersist_MemoryAsync = factory(
			root.SyncIt_Constant,
			root.SyncIt_updateResult
		);
	}
})(this, function (SyncIt_Constant,updateResult) {
	
// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: 2013 Matthew Forrester
// License: MIT/BSD-style

/**
 * ## SyncIt_ServerPersist_MemoryAsync
 * 
 * An Asynchronous Memory based Persistance for SyncItTestServ suitable for testing.
 */

/**
 * **makeLaggy()**
 * 
 * Takes a function and makes it Asynchrounous by wrapping it in a `setTimeout()`.
 * 
 * **Parameters**
 * 
 * * **@param {} `func`** The function to make Asynchronous.
 * * **@param {} `factor`** Will use an asynchronous timeout of `([random] * factor`) + 2`.
 * * **@return {Function}** An Asynchrounous version of the Function.
 */
var makeLaggy = function(func,factor) {
	return function() {
		var args = Array.prototype.slice.call(arguments);
		setTimeout(function() {
			func.apply(this,args);
		},Math.floor(Math.random() * factor) + 2);
	};
};

/**
 * **onlyInsert()**
 * 
 * Adds a value to the Array `d` if value.b is one higher than storedValue.b
 * 
 * **Parameters**
 * 
 * * **@param {Array} `d`** Data - An array
 * * **@param {Object} `value`** Must include keys `s`, `k` and `b`
 * * **@param {Function} `done`** Callback. Signature: `function(successful)`
 * * **@param {Boolean} `done.successful`** True if the value was wrote, false otherwise.
 */
var onlyInsert = makeLaggy(function(d,value,done) {
	findHighestInstant(d, {s:value.s,k:value.k}, 'b', function(success,storedQueueitem) {
		if (value.b == (((storedQueueitem === null) ? -1 : storedQueueitem.b))+1) {
			d.push(value);
			return done(true);
		}
		return done(false);
	});
},100);

/**
 * **filterFunc()**
 * 
 * Will return true if `item` has the same keys with values as `filter`.
 * 
 * **Parameters**
 * 
 * * **@param {Queueitem} `item`** Must `have all the`** keys in `filter` with the same values.
 * * **@param {Object} `filter`**
 * * **@return {Boolean}** True if it matches.
 */
var filterFunc = function(item,filter) {
	var filterkeys = Object.getOwnPropertyNames(filter),
		filterkeysL = filterkeys.length,
		filterkeysI = 0;
	
	for (filterkeysI=0; filterkeysI<filterkeysL; filterkeysI++) {
		if (!item.hasOwnProperty(filterkeys[filterkeysI])) {
			return false;
		}
		if (item[filterkeys[filterkeysI]] != filter[filterkeys[filterkeysI]]) {
			return false;
		}
	}
	return true;
};

/**
 * **findHighestInstant()**
 * 
 * Scans `d` for data that matches the filter `filter` and returns the item with the highest field `field`.
 * 
 * **Parameters**
 * 
 * * **@param {Array} `d`** should be `this._d`
 * * **@param {Object} `filter`** Takes the form of an object, for example `{field_i_want: to_have_this_value}`.
 * * **@param {String} `field`** The field that you are looking to have the highest Number of.
 * * **@param {Function} `done`** Signature: `function (successful, highestObject)`
 * * **@param {Boolean} `done.successful`** True on success
 * * **@param {Queueitem} `done.highestObject`** The data which matches `filter` with the highest `field`.
 */ 
var findHighestInstant = function(d,filter,field,done) {
	var storekeysL = d.length,
		storekeysI = 0,
		ok = true,
		highest = null;
		
	for (storekeysI = 0; storekeysI<storekeysL; storekeysI++) {
		ok = true;
		if (!d[storekeysI].hasOwnProperty(field)) {
			continue;
		}
		if (!filterFunc(d[storekeysI],filter)) {
			continue;
		}
		if ((highest === null) || highest[field] < d[storekeysI][field]) {
			highest = d[storekeysI];
		}
	}
	return done(true,highest);
};

/**
 * **findHighest()**
 * 
 * Laggy version of findHighestInstant.
 */
var findHighest = makeLaggy(findHighestInstant,100);

/**
 * **getIdFromQueueitem()**
 * 
 * Returns a unique (to the server) identifier for a Queueitem.
 */
var getIdFromQueueitem = function(queueitem) {
	return queueitem.s+'.'+queueitem.k+'@'+(parseInt(queueitem.b,10)+1);
};

var SyncIt_ServerPersist_MemoryAsync = function(cloneFunc) {
	this._d = [];
	if (this._cloneFunc === undefined) {
		this._cloneFunc = function(v) {
			return JSON.parse(JSON.stringify(v));
		};
	}
};

/**
 * **SyncIt_ServerPersist_MemoryAsync.getDatasetNames()**
 * 
 * #### Parameters
 * 
 * * **@param {Function} `done`** Signature: `function (err, datasetNames)`
 *   * **@param {Errorcode} `done.err`**
 *   * **@param {Array} `done.datasetNames`** The names of all Dataset
 */
SyncIt_ServerPersist_MemoryAsync.prototype.getDatasetNames = function(done) {
	(makeLaggy(function() {
		var r = [];
		var n = '';
		for (var i=0,l=this._d.length;i<l;i++) {
			n = this._d[i].s;
			if (r.indexOf(n) == -1) { r.push(n); }
		}
		return done(SyncIt_Constant.Error.OK,r);
	}.bind(this),200))();
};

/**
 * ### SyncIt_ServerPersist_MemoryAsync.getQueueitem()
 * 
 * #### Parameters
 * 
 * * **@param {String} `dataset`**
 * * **@param {Number|null} `fromVersion`** Where to read Queueitem from (not inclusive).
 * * **@param {Function} `done`** Signature: `done(err, queueitems, lastQueueitemIdentifier)`
 *   * **@param {Number} `done.err`** See SyncIt_Constant.Error
 *   * **@param {Array} `done.queueitems`** An array of Queueitem
 *   * **@param {Object} `done.lastQueueitemIdentifier`** The internal reference of that last item, passing this to this function again will lead to continual reading.
 */
SyncIt_ServerPersist_MemoryAsync.prototype.getQueueitem = function(dataset,fromVersion,done) {
	
	var r = [];
	
	(makeLaggy(function() {
		var r = [],
			l = 0,
			i = 0,
			lastId = false,
			foundFirst = (
					(fromVersion === null) ||
					(fromVersion === undefined) ||
					(fromVersion === '')
				) ? true : false;
		for (
			i=0,l=this._d.length;
			i<l;
			i++
		) {
			if (foundFirst && (this._d[i].s == dataset)) {
				r.push({
					s: this._d[i].s,
					k: this._d[i].k,
					b: this._d[i].b,
					m: this._d[i].m,
					r: this._d[i].r ? true : false,
					u: this._d[i].u,
					o: this._d[i].o,
					t: this._d[i].t
				});
			}
			lastId = getIdFromQueueitem(this._d[i]);
			if (lastId == fromVersion) {
				foundFirst = true;
			}
		}
		return done(SyncIt_Constant.Error.OK, r, lastId);
	}.bind(this),200))();
	
};

/**
 * ### SyncIt_ServerPersist_MemoryAsync.getValue()
 * 
 * #### Parameters
 * 
 * * **@param {String} `dataset`**
 * * **@param {String} `datakey`**
 * * **@param {Function} `done`** Signature: `function (err, jrec)`
 *   * **@param {Number} `done.err`** See SyncIt_Constant.Error
 *   * **@param {Jrec} `done.jrec`** The result of all the Queueitem.
 */
SyncIt_ServerPersist_MemoryAsync.prototype.getValue = function(dataset,datakey,done) {
	findHighest(
		this._d,
		{s:dataset, k:datakey},
		'b',
		function(success,storedQueueitem) {
			if (!success) {
				throw new Error("findHighest did not return properly");
			}
			if (storedQueueitem === null) {
				return done(SyncIt_Constant.Error.NO_DATA_FOUND);
			}
			return done(SyncIt_Constant.Error.OK,storedQueueitem.j);
		}
	);
};

/**
 * ### SyncIt_ServerPersist_MemoryAsync.push()
 * 
 * #### Parameters
 * 
 * * **@param {Queueitem} `queueitem`**
 * * **@param {Function} `done`** Signature: `function (err, queueitem, jrec)`
 *   * **@param {Number} `done.err`** See SyncIt_Constant.Error
 *   * **@param {Queueitem} `done.queueitem`** The Queueitem passed in (successful or not)
 *   * **@param {Jrec} `done.jrec`** If successul, a Jrec, otherwise `undefined`
 */
SyncIt_ServerPersist_MemoryAsync.prototype.push = function(queueitem,done) {
	
	var inst = this;
	var attempts = 0;
	
	var doIt = function() {
		
		findHighest(
			inst._d,
			{"s":queueitem.s,"k":queueitem.k},
			'b',
			function(success,storedQueueitem) {
				
				// The starting queueitem (previous which does not exist) is 
				// based on -1, because the first queueitem would be based on 0.
				var highestBasedOn = -1,
					resultingJrec;
					
				var _getEmptyJrec = function() {
					return {
						i:{},
						v:0,
						r:false,
						t:(new Date()).getTime(),
						m:null
					};
				};
				
				if (!success) {
					throw new Error("findHighest did not return properly");
				}
				
				// If there is something stored at that dataset/datakey we want
				// a to look for one over that based on.
				if (storedQueueitem !== null) {
					highestBasedOn = storedQueueitem.b;
				}
				
				// Check that we have not been given a future queueitem.
				if (queueitem.b > highestBasedOn + 1) {
					return done(SyncIt_Constant.Error.TRYING_TO_ADD_FUTURE_QUEUEITEM,queueitem);
				}
				
				// Check that we are not adding a out of data queueitem
				if (queueitem.b <= highestBasedOn) {
					// If we are, it is the last one with the same modifier and 
					// basedonversion then we send something about it being
					// a duplicate.
					if ((storedQueueitem.m == queueitem.m) && (storedQueueitem.b == queueitem.b)) {
						return done(SyncIt_Constant.Error.TRYING_TO_ADD_ALREADY_ADDED_QUEUEITEM,queueitem);
					}
					// otherwise send back just a normal version conflict error.
					return done(SyncIt_Constant.Error.TRYING_TO_ADD_QUEUEITEM_BASED_ON_OLD_VERSION,queueitem);
				}
				
				// If we have a stored queueitem which had a remove operation, 
				// the item will always stay removed.
				if ((storedQueueitem !== null) && (storedQueueitem.o == 'remove')) {
					return done(SyncIt_Constant.Error.DATA_ALREADY_REMOVED,queueitem);
				}
				
				// Calculate the result
				resultingJrec = updateResult(
					(storedQueueitem === null) ? _getEmptyJrec() : storedQueueitem.j,
					queueitem,
					inst._cloneFunc
				);
				
				// Try and insert the record.
				onlyInsert(
					inst._d,
					{
						s: queueitem.s,
						k: queueitem.k,
						b: queueitem.b,
						m: queueitem.m,
						r: queueitem.r,
						u: queueitem.u,
						o: queueitem.o,
						t: queueitem.t,
						j: resultingJrec
					},
					function(success) {
						
						// If it passed all the tests above, but was not 
						// successful writing, it might well be that we are in
						// some form or race condition... going around again
						// should pick up the real reason.
						if (!success) {
							if (++attempts == 2) {
								throw new Error("SyncIt_ServerPersist_MemoryAsync.push(): Maximum number attempts used.");
							}
							return doIt();
						}
						return done(
							SyncIt_Constant.Error.OK,
							queueitem,
							resultingJrec,
							getIdFromQueueitem(queueitem)
						);
					}
				);
				
			}
		);
	
	};
	
	doIt();
};

return SyncIt_ServerPersist_MemoryAsync;
	
});
