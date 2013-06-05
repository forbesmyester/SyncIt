/* jshint strict: true, smarttabs: true, es3: true, forin: true, immed: true, latedef: true, newcap: true, noarg: true, undef: true, unused: true, es3: true, bitwise: false, curly: true, latedef: true, newcap: true, noarg: true, noempty: true */

(function(root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	/* jshint strict: false */
	/* globals module: false, require: false, define: true */
	if (typeof exports === 'object') {
		module.exports = factory(
			require('./Constant.js'),
			require('./updateResult.js')
		);
	} else if (typeof define === 'function' && define.amd) {
		define(
			['syncit/Constant', 'syncit/updateResult'],
			factory
		);
	} else {
		root.SyncItLib = factory(
			root.SyncIt_Constant,
			root.SyncIt_updateResult
		);
	}
})(this, function(SyncIt_Constant, updateResult) {

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

var _filter = function(arr,filterFunc) {
	var i = 0,
		l = 0,
		r = [];
	
	for (i = 0, l = arr.length; i < l; i++) {
		if (filterFunc(arr[i])) {
			r.push(arr[i]);
		}
	}
	
	return r;
};

"use strict";

/**
 * ## Dictionary
 *
 *  * **`persist`** - Storage for both *queue* and `store`
 *  * **`store/data`** - Contains information that has been processed from the 
 *    queue
 *  * **`queueitem`** - An *update* as well as some metadata.
 *  * **`outqueueitem`** - An *update* but made more readable.
 *  * **`queue`** - A queue that modification instructions are added to and which
 *    will eventually need applying so it can be stored in the `store`
 *  * **`s/dataset`** - A categorization of the data you are storing, similar to
 *    an SQL table.
 *  * **`k/datakey`** - Something that uniquely identifies a unique thing within
 *    a *dataset*, simalar to a primary key within SQL.
 *  * **`jrec`** - All the data stored within a *datakey*.
 *  * **`jread`** - All the data stored within a *datakey* as well as outstanding
 *    in the *queue*.
 *  * **`metadata`** - Stores data about *info* for data maintenance/tracking
 *    purposes.
 *  * **`i/info`** - Stored within a *jrec* and holds the real data as apposed to
 *    *metadata*.
 *  * **`u/update`** - A *update* is the data portion of an *update*.
 *  * **`e/fed`** - Boolean stored in queueitem to mark an update as coming from
 *    feed.
 *  * **`f/fieldpath`** - Stored within an *updateDataField* *update* descibing
 *    a path within the *info*, to update for example *eyes* in the a 
 *    dataset/datakey *person*, but you could have `hair.color` and `hair.length`
 *    which would describe a structre simiar to `{hair:{color:red, length:long}}`.
 *  * **`g/fieldvalue`** - Stored within an *updateDataField* *update* and is the 
 *    data which will be put into the *fieldpath*.
 *  * **`v/version`** - The version of a *jrec*.
 *  * **`b/basedonversion`** - An *update* is based on a *jrec* *version* and
 *    preceding `queueitem`
 *  * **`m/modifier`** Stored within both `update`s and *jrec* and is a unique
 *    reference on the entity that is modifying data. It could be potentially be a
 *    *user* but more likely is unique to a user/device combination.
 *  * **`r/removed`** - Stored in *jrec* and denotes that the data has been
 *    removed.
 *  * **`o/operation`** - Describes the type of *operation* that an *update* will
 *    perform.
 *  * **`t/modificationtime`** - Both *jrec* and *update* include a 
 *    *modificationtime*, this is what is returned from `(new Date).getTime()`
 *    
 *    
 * Classes are documented like `ThisIsAClass`
 * Variables are documented like `theVariable`
 * 
 */

/**
 * ## SyncIt
 * 
 * ### new SyncIt()
 * 
 * Constructor
 * 
 * #### Parameters
 * 
 * * **@param {Store} `store`** Used to store data which is known to be synced onto the *Server*.
 * * **@param {Queue} `queue`** Used to store data which is still to be synced to the *Server*.
 * * **@param {Modifier} `modifier`** The User/Device which is using the instance of SyncIt.
 */
var SyncIt = function(store, queue, modifier) {
	this._store = store;
	this._queue = queue;
	this._locked = 0;
	this._modifier = modifier;
	this._events = {
		'added_to_queue': [],
		'applied': [],
		'fed': []
	};
	this._cloneObj = function(ob) { return JSON.parse(JSON.stringify(ob)); };
};

/**
 * ### SyncIt.setCloneFunction()
 * 
 * Sometimes, SyncIt wants a deep copy of an Object, this function will allow 
 * you to change what function does that deep copying.
 * 
 * #### Parameters
 * 
 * @param {Function} cloneFunction
 */
SyncIt.prototype.setCloneFunction = function(cloneFunction) {
	this._cloneObj = cloneFunction;
};

/**
 * ### SyncIt.getModifier()
 * 
 * #### Returns
 * 
 * * **@return {Modifier}** The User/Device which is using the instance of SyncIt.
 */
SyncIt.prototype.getModifier = function() {
	return this._modifier;
};

/**
 * ### SyncIt.isLocked()
 * 
 * #### Returns
 * 
 * * **@return {Boolean}** SyncIt will use an internal lock to deny changes while engaged in modifications to either the *Queue* or the *Store*. This function will return `true` if SyncIt is locked.
 */
SyncIt.prototype.isLocked = function() {
	return (this._locked > 0);
};

/**
 * ### SyncIt.listen()
 * 
 * The following events are emitted by SyncIt.
 * 
 * * added_to_queue - See [SyncIt.listenForAddedToQueue()](#syncit.listenforaddedtoqueue--)
 * * applied - See [SyncIt.listenForApplied()](#syncit.listenforapplied--)
 * * fed - See [SyncIt.listenForFed()](#syncit.listenforfed--)
 * 
 * #### Parameters
 * 
 * * **@param {String} `event`** The name of the event to listen for
 * * **@param {Function} `listener`** The listener to fire when event occurs.
 * 
 * #### Returns
 * 
 * * **@return {Boolean}** True if that event is available to listen to.
 */
SyncIt.prototype.listen = function(event, listener) {
	
	var propertyNames = (function(ob) {
		var r = [];
		for (var k in ob) { if (ob.hasOwnProperty(k)) {
			r.push(k);
		} }
		return r;
	})(this._events);
	
	if (propertyNames.indexOf(event) == -1) {
		return false;
	}
	
	this._events[event].push(listener);
	return true;
};

/**
 * ### SyncIt.removeAllListeners()
 *
 * #### Parameters
 * 
 * * **@param {String} `event`** The name of the event you want to remove all listeners for.
 * 
 * #### Returns
 * 
 * * **@return {Array}** The listeners that have just been removed.
 */
SyncIt.prototype.removeAllListeners = function(event) {
	
	var propertyNames = (function(ob) {
		var r = [];
		for (var k in ob) { if (ob.hasOwnProperty(k)) {
			r.push(k);
		} }
		return r;
	})(this._events);
	
	if (propertyNames.indexOf(event) == -1) {
		return [];
	}
	
	var r = this._events[event];
	this._events[event] = [];
	return r;
};

/**
 * ### SyncIt.removeListener()
 *
 * Removes a specific listener from an event.
 *
 * #### Parameters
 * 
 * * **@param {String} `event`** The name of the event you want to remove a listener from.
 * * **@param {Function} `listener`** The listener you want to remove.
 * 
 * #### Returns
 * 
 * * **@return {Boolean}** True if the listener was removed, false otherwise.
 */
SyncIt.prototype.removeListener = function(event, listener) {
	
	var i = 0,
		replacement = [],
		successful = false;
	
	var propertyNames = (function(ob) {
		var r = [];
		for (var k in ob) { if (ob.hasOwnProperty(k)) {
			r.push(k);
		} }
		return r;
	})(this._events);
	
	if (propertyNames.indexOf(event) == -1) {
		return false;
	}
	
	for (i=0; i<this._events[event].length; i++) {
		if (this._events[event][i] !== listener) {
			replacement.push(this._events[event][i]);
		} else {
			successful = true;
		}
	}
	this._events[event] = replacement;
	
	return successful;
};

/**
 * ### SyncIt.listenForAddedToQueue()
 * 
 * Adds a listener for when data is added to the *Queue*.
 * 
 * #### Parameters
 * 
 * * **@param {Function} `listener`** Signature: `function(operation, dataset, datakey)`.
 *   * **@param {Dataset} `listener.dataset`** The *dataset* of the updated.
 *   * **@param {Datakey} `listener.datakey`** The *datakey* that was updated.
 *   * **@param {Queueitem} `listener.queueitem`** The *queueitem* that was just added.
 */
SyncIt.prototype.listenForAddedToQueue = function(listener) {
	return this.listen('added_to_queue', listener);
};

/**
 * ### SyncIt.listenForApplied()
 * 
 * Adds a listener for when data is applied to the *Store*.
 * 
 * #### Parameters
 * 
 * * **@param {Function} `listener`** Signature: `function(queueitem, newStoredJrec)`.
 * *   **@param {Queueitem} `listener.queueitem`** The *queueitem* that was applied.
 * *   **@param {Jrec} `listener.newStoredJrec`** The *jrec* which is now stored.
 */
SyncIt.prototype.listenForApplied = function(listener) {
	return this.listen('applied', listener);
};


/**
 * ### SyncIt.listenForFed()
 * 
 * Adds a listener for when data is fed using [SyncIt.feed()](#syncit.feed--)
 * 
 * #### Parameters
 * 
 * * **@param {Function} `listener`** Signature: `function(queueitem, newStoredJrec)`.
 * *   **@param {Queueitem} `listener.queueitem`** The *queueitem* that was applied.
 * *   **@param {Jrec} `listener.newStoredJrec`** The *jrec* which is now stored.
 */
SyncIt.prototype.listenForFed = function(listener) {
	return this.listen('fed', listener);
};

/**
 * ### SyncIt.set()
 * 
 * Will add a *Queueitem* to the *Queue* that represents a complete overwrite of any existing data.
 *
 * #### Parameters
 * 
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Update} `update`**
 * * **@param {Function} `whenAddedToQueue`** Fired after the *Queue* has been updated. See [SyncIt._addToQueue()](#syncit._addtoqueue--)** for documentation.
 */
SyncIt.prototype.set = function(dataset, datakey, update, whenAddedToQueue) {
	return this._addToQueue(
		'set',
		dataset,
		datakey,
		update,
		new Date().getTime(),
		false,
		whenAddedToQueue
	);
};

/**
 * ### SyncIt.remove()
 * 
 * This will add a Queueitem to the Queue that represents the removal of data stored at a Dataset/Datakey.
 *
 * #### Parameters
 * 
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Function} `whenAddedToQueue`** Fired after the *Queue* has been updated. See [SyncIt._addToQueue()](#syncit._addtoqueue--)** for documentation.
 */
SyncIt.prototype.remove = function(dataset, datakey, whenAddedToQueue) {
	return this._addToQueue(
		'remove',
		dataset,
		datakey,
		{},
		new Date().getTime(),
		false,
		whenAddedToQueue
	);
};

/**
 * ### SyncIt.update()
 * 
 * This can update one or more parts of the the data at a single *dataset* / *datakey* using something similar to the MongoDB update syntax.
 * 
 * #### Example
 * 
 * ```
 * syncIt.update(
 *     'user',
 *     'jack',
 *     {'$set': {'eyes.color': 'blue'}},
 *     function(err, dataset, datakey, queueitem) {
 *         // The data now includes { eyes: { color: "blue" } } but the rest of
 *         // the data has been preserved
 *     }
 * );
 * ```
 * 
 * #### Parameters
 * 
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Update} `update`**
 * * **@param {Function} `whenAddedToQueue`** Fired after the *Queue* has been updated. See [SyncIt._addToQueue()](#syncit._addtoqueue--) for documentation.
 */
SyncIt.prototype.update = function(dataset, datakey, update, whenAddedToQueue) {
	return this._addToQueue(
		'update',
		dataset,
		datakey,
		update,
		new Date().getTime(),
		false,
		whenAddedToQueue
	);
};

/**
 * ### SyncIt.feed()
 * 
 * This function is for feeding in external Queueitem from the *Respository*.
 * 
 * #### Parameters
 * 
 * * **@param {Array} `feedQueueitems`** These are the items which are being fed from the *Server*.
 * * **@param {Function} `resolutionFunction`** Called when conflict occurs, Signature: `function(dataset, datakey, jrec, serverQueueitems, localQueueitems, resolved)`.
 *   * **@param {Array} `resolutionFunction.dataset`** The *Dataset* of the conflict.
 *   * **@param {Array} `resolutionFunction.datakey`** The *Datakey* of the conflict.
 *   * **@param {Array} `resolutionFunction.jrec`** What is in the local *Store* for that *Dataset* / *Datakey*.
 *   * **@param {Array} `resolutionFunction.localQueueitems`** The *Queueitem* that has been added using functions such as [SyncIt.set()](#syncit.set--) but is now conflicting with the data from the *Server*.
 *   * **@param {Array} `resolutionFunction.serverQueueitems`** The extra *Queueitem* that are on the Server.
 *   * **@param {Function} `resolutionFunction.resolved`** This should be called from inside resolutionFunction and will add *Queueitem* after the *Server* supplied *Queueitem*. Signature: `function(resolved, mergedLocalsToApplyAfterwards)`
 *      * **@param {Boolean} `resolutionFunction.resolved.resolved`** use false to halt the feeding, true otherwise
 *      * **@param {Array} `resolutionFunction.resolved.mergedLocalsToApplyAfterwards`** These will be added to the *Queue* __after__ (currently) all serverQueueitems have been applied to the *Store*.
 * * **@param {Function} `feedDone`** Callback for when done. Signature: `function(err, fedItemsFailed, conflictResolutionQueueitemFailed, resultingJrec)`;
 *   * **@param {Errorcode} `feedDone.err`** See SyncIt_Constant.Error.
 *   * **@param {Array} `feedDone.fedItemsFailed`** Array of items fed from the *Server* which could not be processed.
 *   * **@param {Array} `feedDone.conflictResolutionQueueitemFailed`** Array of items created in conflict resolution (using `resolutionFunction.resolved`) which have failed to be added to the local *Queue*.
 */
SyncIt.prototype.feed = function(feedQueueitems, resolutionFunction, feedDone) {
	
	var inst = this;

	// Make a shallow copy of feedQueueitems so when we `shift()` we are not
	// fiddling with users data.
	var applyQueue = (function(items) {
		var r = [];
		for (var i = 0, l = items.length; i < l; i++) {
			r.push(items[i]);
		}
		return r;
	})(feedQueueitems);

	//It could be that you're feeding (some) of your own Queueitem.
	applyQueue = _filter(applyQueue,function(queueitem) {
		if (queueitem.m == this.getModifier()) {
			return false;
		}
		return true;
	}.bind(this));
	
	var allLocalToApplyAfterwards = [];
	
	var prepareServerQueueItemForResolutionFunction = function(jrec, applyQueue) {
		var r = [],
			i = 0,
			l = 0,
			firstQueueitem = applyQueue[0];
		
		var filterFunc = function(elem) {
			if (jrec === null) {
				return true;
			}
			return (elem.b >= jrec.v);
		};
		
		for (i=0, l=applyQueue.length; i<l; i++) {
			if (
				(applyQueue[i].s != firstQueueitem.s) ||
				(applyQueue[i].k != firstQueueitem.k)
			) {
				return _filter(r,filterFunc);
			}
			r.push(applyQueue[i]);
		}
		return _filter(r,filterFunc);
	};
	
	var unlockAndError = function(err) {
		inst._locked = inst._locked & (SyncIt_Constant.Locking.MAXIMUM_BIT_PATTERN ^ SyncIt_Constant.Locking.FEEDING);
		return feedDone(
			err,
			applyQueue,
			allLocalToApplyAfterwards
		);
	};
	
	var addToStoreAndContinue = function(applyQueue) {
		inst._addQueueitemToStore(applyQueue[0], function(err, appliedQueueitem, jrec) {
			if (err !== SyncIt_Constant.Error.OK) {
				return unlockAndError(err, applyQueue);
			}
			applyQueue.shift();
			inst._emit('fed', appliedQueueitem, jrec);
			return feedOne(false);
		});
	};
		
	var fireConflictResolution = function(jrec, applyQueue, queueitemInQueue) {
		resolutionFunction.call(
			inst,
			applyQueue[0].s,
			applyQueue[0].k,
			jrec.v === 0 ? null : jrec,
			queueitemInQueue,
			prepareServerQueueItemForResolutionFunction(
				jrec,
				applyQueue
			),
			function(resolved, localsToApplyAfterwards) {
				
				if (!resolved) {
					inst._locked = inst._locked & (SyncIt_Constant.Locking.MAXIMUM_BIT_PATTERN ^ SyncIt_Constant.Locking.FEEDING);
					return feedDone(
						SyncIt_Constant.Error.NOT_RESOLVED,
						applyQueue,
						allLocalToApplyAfterwards
					);
				}
				
				while (localsToApplyAfterwards.length) {
					var v = localsToApplyAfterwards.shift();
					v.m = inst.getModifier();
					if (!v.hasOwnProperty('t')) {
						v.t = new Date().getTime();
					}
					v.b = null;
					allLocalToApplyAfterwards.push(v);
				}
				return feedOne(true);
			}
		);
	};
	
	var queueitemsRetrieved = function(err, queueitemInQueue, removeSameDatasetDatakeyFromQueue) {
		
		queueitemInQueue.sort(function(localQiA, localQiB) {
			return localQiA.b - localQiB.b;
		});
		
		var removeQueueitemInQueueForDatasetDatakeyAndStore = function() {
			return inst._queue._removeByDatasetAndDatakey(
				applyQueue[0].s,
				applyQueue[0].k,
				function(err) {
					if (err !== SyncIt_Constant.Error.OK) {
						return unlockAndError(err, applyQueue);
					}
					return addToStoreAndContinue(applyQueue);
				}
			);
		};
		
		if (err !== SyncIt_Constant.Error.OK) {
			return unlockAndError(err, applyQueue);
		}
		
		if (queueitemInQueue.length === 0) {
			return addToStoreAndContinue(applyQueue);
		}
		
		
		// If conflict resolution has already cleared, we remove items in 
		// the same Dataset / Datakey
		if (removeSameDatasetDatakeyFromQueue) {
			return removeQueueitemInQueueForDatasetDatakeyAndStore();
		}
		
		inst._store.get(
			applyQueue[0].s,
			applyQueue[0].k,
			function(err, jrec) {
				
				// It is quite likely that we are feeding data into a 
				// dataset / datakey that does not already exist.
				if (err === SyncIt_Constant.Error.NO_DATA_FOUND) {
					jrec = inst._getEmptyJrec();
				}

				// It is possible we have stale items in our queue, if so, we just skip
				// over them
				while (
					queueitemInQueue.length && 
					(queueitemInQueue[0].b < jrec.v) &&
					(queueitemInQueue[0].m == jrec.m)) {
					queueitemInQueue.shift();
				}

				// It is quite possible all queueitem where stale, in which case just
				// go right ahead and process the fed queueitem!
				if (queueitemInQueue.length === 0) {
					return addToStoreAndContinue(applyQueue);
				}

				// If we have items in our local queue with a basedonversion which is
				// lower than what we are being fed, it is likely that we have unapplied
				// items which we have already uploaded.
				if (queueitemInQueue[0].b < applyQueue[0].b) {
					return unlockAndError(
						SyncIt_Constant.Error.BASED_ON_IN_QUEUE_LESS_THAN_BASED_IN_BEING_FED,
						applyQueue
					);
				}

				// It might be that we are trying to feed data which is 
				// based on an old version, if we are error with code to 
				// indicate whether it is a duplicate or not.
				if (jrec.v > applyQueue[0].b) {
					if (
						(jrec.v - 1 == applyQueue[0].b) &&
						(jrec.m == applyQueue[0].m)
					) {
						return unlockAndError(
							SyncIt_Constant.Error.TRYING_TO_APPLY_UPDATE_ALREADY_APPLIED,
							applyQueue
						);
					}
					return unlockAndError(
						SyncIt_Constant.Error.TRYING_TO_APPLY_UPDATE_BASED_ON_OLD_VERSION,
						applyQueue
					);
				}
				
				// fire conflict resolution with the item shifted. It does
				// not matter because it will either succeed, removing all
				// Queueitem for that dataset / datakey or fail.
				fireConflictResolution(jrec, applyQueue, queueitemInQueue);
			}
		);
		
	};
	
	var addConflictResolvingQueueitemToQueue = function(allLocalToApplyAfterwards) {
		
		if (allLocalToApplyAfterwards.length === 0) {
			return feedDone(
				SyncIt_Constant.Error.OK,
				[],
				allLocalToApplyAfterwards
			);
		}
		
		inst._addToQueue(
			allLocalToApplyAfterwards[0].o,
			allLocalToApplyAfterwards[0].s,
			allLocalToApplyAfterwards[0].k,
			allLocalToApplyAfterwards[0].u,
			allLocalToApplyAfterwards[0].t,
			true,
			function(err) {
				if (err === SyncIt_Constant.Error.OK) {
					allLocalToApplyAfterwards.shift();
					return addConflictResolvingQueueitemToQueue(allLocalToApplyAfterwards);
				}
				feedDone(
					err,
					[],
					allLocalToApplyAfterwards
				);
			}
			
		);
	};
	
	var feedOne = function(removeSameDatasetDatakeyFromQueue) {
		
		if (applyQueue.length === 0) {
			inst._locked = inst._locked & (SyncIt_Constant.Locking.MAXIMUM_BIT_PATTERN ^ SyncIt_Constant.Locking.FEEDING);
			return addConflictResolvingQueueitemToQueue(allLocalToApplyAfterwards);
		}
		
		inst._queue.getItemsForDatasetAndDatakey(
			applyQueue[0].s,
			applyQueue[0].k,
			function(err, queueitemInQueue) {
				queueitemsRetrieved(
					err,
					queueitemInQueue,
					removeSameDatasetDatakeyFromQueue
				);
			}
		);
	};
	
	var i=0,
		l=0,
		queueitemValidationError = 0;
	
	if (this._locked) {
		return feedDone(
			SyncIt_Constant.Error.UNABLE_TO_PROCESS_BECAUSE_LOCKED,
			feedQueueitems,
			allLocalToApplyAfterwards
		);
	}
	
	for (i=0, l=feedQueueitems.length;i<l;i++) {
		queueitemValidationError = this._basicValidationForQueueitem(feedQueueitems[i]);
		if (queueitemValidationError != SyncIt_Constant.Error.OK) {
			return feedDone(
				queueitemValidationError,
				feedQueueitems,
				allLocalToApplyAfterwards
			);
		}
	}
	
	inst._locked = inst._locked | SyncIt_Constant.Locking.FEEDING;
	
	feedOne(false);
	
};

/**
 * **SyncIt._emit()**
 * 
 * Emits an Event.
 * 
 * **Parameters**
 * 
 * * **@param {String} `event`** The name of the Event you wish to emit.
 * * **@param {} `param2, param3, ...`** Extra parameters will be passed to the event listener.
 */
SyncIt.prototype._emit = function(event /*, other arguments */) {
	
	var i = 0,
		args = Array.prototype.slice.call(arguments, 1);
	
	if (!this._events.hasOwnProperty(event)) {
		throw "SyncIt._emit(): Attempting to fire unknown event '"+event+"'";
	}
	
	for (i=0; i<this._events[event].length; i++) {
		this._events[event][i].apply(this, args);
	}
};

SyncIt.prototype._basicValidationForQueueitem = function(queueitem,skips) {
	if (queueitem.s.match(SyncIt_Constant.Validation.DATASET_REGEXP) === null) {
		return SyncIt_Constant.Error.INVALID_DATASET;
	}
	if (queueitem.k.match(SyncIt_Constant.Validation.DATAKEY_REGEXP) === null) {
		return SyncIt_Constant.Error.INVALID_DATAKEY;
	}
	if (queueitem.o.match(SyncIt_Constant.Validation.OPERATION_REGEXP) === null) {
		return SyncIt_Constant.Error.INVALID_OPERATION;
	}
	if ( (skips !== undefined) && (skips.indexOf('m') != -1) ) {
		return SyncIt_Constant.Error.OK;
	}
	if (queueitem.m.match(SyncIt_Constant.Validation.MODIFIER_REGEXP) === null) {
		return SyncIt_Constant.Error.INVALID_MODIFIER;
	}
	return SyncIt_Constant.Error.OK;
};

/**
 * **SyncIt._addToQueue()**
 * 
 * Adds a Queueitem to the Queue.
 * 
 * **Parameters**
 * 
 * * **@param {Operation} `operation`**
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Update} `update`**
 * * **@param {Modifier} `modifier`**
 * * **@param {Basedonversion} `basedonversion`**
 * * **@param {Modificationtime} `modificationtime`**
 * * **@param {Boolean} `allowFeedLock`** Usually adding to the *Queue* would be denied when feeding, but [SyncIt.feed()](#syncit.feed--) itself can add items to the *Queue* this parameter will enable that posibility.
 * * **@param {Function} `whenAddedToQueue`** Callback for when adding is complete. Signature: `function(errorCode, dataset, datakey, queueitem)`
 *   * **@param {Errorcode} `whenAddedToQueue.errorCode`** See SyncIt_Constant.Error.
 *   * **@param {Dataset} `whenAddedToQueue.dataset`** The Dataset of the Queueitem.
 *   * **@param {Datakey} `whenAddedToQueue.datakey`** The Datakey of the Queueitem.
 *   * **@param {Queueitem} `whenAddedToQueue.queueitem`** The Queueitem that has just been added.
 */
SyncIt.prototype._addToQueue = function(operation, dataset, datakey, update, modificationtime, allowFeedLock, whenAddedToQueue) {
	var inst = this;
	
	var amILocked = function() {
		if (allowFeedLock) {
			return inst._locked & SyncIt_Constant.Locking.PROCESSING;
		}
		return inst._locked > 0;
	};
	
	var extractInfoFromQueueitems = function(jrec, queueitems) {
		var info = {
			alreadyDone: false,
			removed: jrec.r,
			version: jrec.v
		};
		
		(function(queue) {
			var l = 0,
				i = 0;
			
			for (i=0, l=queue.length; i<l; i++) {
				info.version = queue[i].b + 1;
				if (queue[i].o == 'remove') {
					info.removed = true;
				}
				if (queue[i].m != inst.getModifier()) {
					if (
						(queue[i].m == queueitem.m) &&
						(queue[i].b == queueitem.b)
					) {
						info.alreadyDone = true;
					}
				}
			}
		})(queueitems);
		return info;
	};
	
	var storeIt = function(queueitem) {
		
		var unlockandComplete = function() {
			inst._locked = inst._locked & (SyncIt_Constant.Locking.MAXIMUM_BIT_PATTERN ^ SyncIt_Constant.Locking.PROCESSING);
			var r = [SyncIt_Constant.Error.OK, queueitem.s, queueitem.k, queueitem];
			whenAddedToQueue.apply(inst, r);
			r.shift();
			r.unshift('added_to_queue');
			inst._emit.apply(inst, r);
		};
		
		inst._queue.push(
			queueitem,
			unlockandComplete
		);
		
	};
	
	var checkAndStore = function(queueitem, jrec, existingQueueitems, whenAddedToQueue)
	{
		
		if (queueitem.t === null) {
			queueitem.t = (new Date()).getTime();
		}

		var info = extractInfoFromQueueitems(jrec, existingQueueitems);
		
		if (info.removed) {
			inst._locked = inst._locked & (SyncIt_Constant.Locking.MAXIMUM_BIT_PATTERN ^ SyncIt_Constant.Locking.PROCESSING);
			return whenAddedToQueue(SyncIt_Constant.Error.DATA_ALREADY_REMOVED);
		}
		
		queueitem.b = info.version;
		
		storeIt(queueitem);
		
	};

	
	if (amILocked()) {
		whenAddedToQueue(SyncIt_Constant.Error.UNABLE_TO_PROCESS_BECAUSE_LOCKED);
		return false;
	}
	
	
	var queueitem = {o:operation, s:dataset, k:datakey, u:update, t:modificationtime, m:this.getModifier()};

	var validateQueueitemErr = inst._basicValidationForQueueitem(queueitem,['m']);
	if (validateQueueitemErr !== SyncIt_Constant.Error.OK) {
		return whenAddedToQueue(validateQueueitemErr);
	}

	this._locked = this._locked | SyncIt_Constant.Locking.PROCESSING;
	
	inst._store.get(dataset, datakey, function(err, jrec) {
		
		if (err === SyncIt_Constant.Error.NO_DATA_FOUND) {
			jrec = inst._getEmptyJrec();
			err = SyncIt_Constant.Error.OK;
		}
		
		if (err !== SyncIt_Constant.Error.OK) {
			inst._locked = inst._locked & (SyncIt_Constant.Locking.MAXIMUM_BIT_PATTERN ^ SyncIt_Constant.Locking.PROCESSING);
			return whenAddedToQueue(err);
		}
		
		inst._queue.getItemsForDatasetAndDatakey(dataset, datakey, function(err, existingQueueitems) {
			
			if (err !== SyncIt_Constant.Error.OK) {
				inst._locked = inst._locked & (SyncIt_Constant.Locking.MAXIMUM_BIT_PATTERN ^ SyncIt_Constant.Locking.PROCESSING);
				return whenAddedToQueue(err);
			}
			
			checkAndStore(
				queueitem,
				jrec,
				existingQueueitems,
				whenAddedToQueue
			);
			
		});
	});

	return true;
};

/**
 * **SyncIt._getEmptyJrec()**
 *
 * When applying a *Queueitem* either because SyncIt is moving data from the *Queue* to the *Store* or just because it is processing a `[SyncIt.get()](#syncit.get--) it is possible that no data already exists at the *Store* for that *Dataset* / *Datakey*. It's handy to use this function to get something that looks like stored data to limit code complexity.
 */
SyncIt.prototype._getEmptyJrec = function() {
	return {
		i:{},
		v:0,
		r:false,
		t:(new Date()).getTime(),
		m:this._modifier
	};
};

/**
 * Will perform checks to determine whether a *Queueitem* can be applied 
 * based on versioning. returns {SyncIt_Constant.ErrorCode}**
 * 
 * Parameters
 * 
 * * **{Queueitem} `update`** The *Queueitem* we are testing to see if it can be applied.
 * * **{Jrec} `storeddata`** This is the data currently in the *Store* or null if there is nothing stored for that *Dataset* / *Datakey* currently.
 * 
 * Returns
 * 
 * * **{err} `next.err`** See SyncIt_Constant.Error.
 */ 
SyncIt._versionCheck = function(storeddata, update) {
	
	// If there is nothing in store at the location, then the version we
	// are applying must be to version 0;
	if (storeddata === null) {
		if (update.b !== 0) {
			return SyncIt_Constant.Error.TRYING_TO_APPLY_TO_FUTURE_VERSION;
		}
		return SyncIt_Constant.Error.OK;
	}
	
	// If something in store then we could be trying to re-apply the same
	// version if we are the author or it will be an error if we are not.
	if (storeddata.v == update.b + 1) {
		if (storeddata.m == update.m) {
			return SyncIt_Constant.Error.TRYING_TO_APPLY_UPDATE_ALREADY_APPLIED;
		}
	}
	
	// If we are trying to apply something old then we must fail.
	if (storeddata.v > update.b) {
		return SyncIt_Constant.Error.TRYING_TO_APPLY_UPDATE_BASED_ON_OLD_VERSION;
	}
	
	// Could be trying to apply something at a future version... This is silly
	if (storeddata.v < update.b) {
		return SyncIt_Constant.Error.TRYING_TO_APPLY_TO_FUTURE_VERSION;
	}
	
	return SyncIt_Constant.Error.OK;
};

/*
 * This function adds a *Queueitem* into the *Store* if it passes some version 
 * checking.
 * 
 * Parameters
 * 
 * * **{Queueitem} `firstInQueue`** The *Queueitem* to apply.
 * * **{Function} `next`** The function to fire when applied.
 *   * **{err} `next.err`** See SyncIt_Constant.Error.
 *   * **{Queueitem} `next.firstInQueue`** This is the Queueitem that was added.
 *   * **{Jrec} `next.jrec`** This is the new data stored in the *Store* or `undefined` on failure.
 */
SyncIt.prototype._addQueueitemToStore = function(firstInQueue, next) {
	
	var r = 0,
		storeItemRetrieved;
		
	storeItemRetrieved = function(e, jrec) {
		
		if (e === SyncIt_Constant.Error.NO_DATA_FOUND) {
			jrec = this._getEmptyJrec();
			e = SyncIt_Constant.Error.OK;
		}
		
		if (e !== SyncIt_Constant.Error.OK)
		{
			return next(r, firstInQueue);
		}
		
		r = SyncIt._versionCheck(jrec, firstInQueue);

		if (r !== SyncIt_Constant.Error.OK)
		{
			return next(r, firstInQueue);
		}
		
		var updatedJrec = updateResult(jrec, firstInQueue, this._cloneObj);
		
		this._store.set(
			firstInQueue.s,
			firstInQueue.k,
			updatedJrec,
			function(err) {
				next(err, firstInQueue, updatedJrec);
			}
		);
		
	}.bind(this);
	
	this._store.get(firstInQueue.s, firstInQueue.k, storeItemRetrieved);
};

/**
 * ### SyncIt.apply()
 *
 * Applies the very first *Queueitem* in the *Queue* onto the data already in the *Store* for that *Dataset* / *Datakey*.
 *
 * #### Parameters
 * 
 * * **@param {Function} `done`** Callback when the operation is complete (or not). Signature: `function(errorCode, queueitem, jrec)`
 *   * **@param {ErrorCode} `done.errorCode`** See SyncIt_Constant.Error.
 *   * **@param {Queueitem} `done.queueitem`** The *Queueitem* we are trying to apply. `Null` only if queue is empty.
 *   * **@param {Jrec} `done.jrec`** The new *Jrec* that is now in the Store, `undefined` on everything but success.
 */
SyncIt.prototype.apply = function(done) {
	var whenAddedToQueue,
		inst = this;
	
	whenAddedToQueue = function(e, firstInQueue, storedJrec) {

		// It could be that there is a stale item in the queue, in which case
		// we should advance the queue only.
		if (e == SyncIt_Constant.Error.TRYING_TO_APPLY_UPDATE_ALREADY_APPLIED) {
			return inst._queue.advance(function(e) {
				inst._locked = inst._locked & (SyncIt_Constant.Locking.MAXIMUM_BIT_PATTERN ^ SyncIt_Constant.Locking.PROCESSING);
				if (e !== SyncIt_Constant.Error.OK) {
					return done(SyncIt_Constant.Error.STALE_FOUND_QUEUE_COULD_NOT_ADVANCE, firstInQueue);
				}
				return done(SyncIt_Constant.Error.STALE_FOUND_QUEUE_ADVANCED, firstInQueue);
			});
		}
		
		if (e !== SyncIt_Constant.Error.OK) {
			inst._locked = inst._locked & (SyncIt_Constant.Locking.MAXIMUM_BIT_PATTERN ^ SyncIt_Constant.Locking.PROCESSING);
			return done(e, firstInQueue);
		}

		inst._queue.advance(function(e) {
			inst._locked = inst._locked & (SyncIt_Constant.Locking.MAXIMUM_BIT_PATTERN ^ SyncIt_Constant.Locking.PROCESSING);
			if (e !== 0) {
				return done(SyncIt_Constant.Error.COULD_NOT_ADVANCE_QUEUE, firstInQueue);
			}
			inst._emit('applied', firstInQueue, storedJrec);
			return done(SyncIt_Constant.Error.OK, firstInQueue, storedJrec);
		});

	};
	
	if (inst._locked) {
		done(SyncIt_Constant.Error.UNABLE_TO_PROCESS_BECAUSE_LOCKED);
		return false;
	}
	
	inst._locked = inst._locked | SyncIt_Constant.Locking.PROCESSING;
	
	inst._queue.getFirst(function(e, firstItem) {
		
		if (e == SyncIt_Constant.Error.NO_DATA_FOUND) {
			e = SyncIt_Constant.Error.QUEUE_EMPTY;
		}
		if (e !== SyncIt_Constant.Error.OK) {
			inst._locked = inst._locked & (SyncIt_Constant.Locking.MAXIMUM_BIT_PATTERN ^ SyncIt_Constant.Locking.PROCESSING);
			return done(e);
		}
		return inst._addQueueitemToStore(firstItem, whenAddedToQueue);
	});
	
	return true;
};

/**
 * ### SyncIt.get()
 * 
 * Will retrieve information from SyncIt by reading what is first in the *Store* and then applying *Queueitem* from the *Queue* on top of it.
 * 
 * #### Parameters
 * 
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Function} `whenDataRetrieved`** Signature: `function(err, jreadInfo)`
 *   * **@param {ErrorCode} `whenDataRetrieved.err`** See SyncIt_Constant.Error.
 *   * **@param {Object} `whenDataRetrieved.jreadInfo`** The requsted information.
 */
SyncIt.prototype.get = function(dataset, datakey, whenDataRetrieved) {
	this.getFull(dataset, datakey, function(e, r) {
		whenDataRetrieved(e, r.i);
	});
};

/**

 * ### SyncIt.getFull()
 * 
 * Will get ALL information for a *Dataset* / *Datakey* from SyncIt including metadata.
 * 
 * #### Parameters
 * 
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Function} `whenDataRetrieved`** Signature: Function(err, jreadh)
 *   * **@param {ErrorCode} `whenDataRetrieved.err`** See SyncIt_Constant.Error.
 *   * **@param {Jread} `whenDataRetrieved.jread`** The requsted information.
 */
SyncIt.prototype.getFull = function(dataset, datakey, whenDataRetrieved) {
	
	var inst = this;
	
	inst._queue.getItemsForDatasetAndDatakey(dataset, datakey, function(e, queue) {
		
		inst._store.get(dataset, datakey, function(e, r) {
			var len = queue.length,
				i = 0;
			
			if (e === SyncIt_Constant.Error.NO_DATA_FOUND) {
				r = inst._getEmptyJrec();
				e = SyncIt_Constant.Error.OK;
			}
			
			for (i=0;i<len;i++) {
				e = SyncIt_Constant.Error.OK;
				if (queue[i].b == r.v) {
					r = updateResult(r, queue[i], inst._cloneObj);
				}
			}

			r.s = dataset;
			r.k = datakey;

			if (r.v == 0) {
				return whenDataRetrieved(SyncIt_Constant.Error.NO_DATA_FOUND,null);
			}
			return whenDataRetrieved(e, r);
		});
	});
	
};

/**
 * _mergeArraysWhenCountIs()
 * 
 * Will merge and return all the sub array in `arrayOfArrays` if `targetResolved == isResolved`, otherwise it will return false.
 * 
 * This is only here because it's shared between `getDatasetNames.getDatasetNames()` and `SyncIt.getDatakeysInDataset()`. It does not form part of the API
 * 
 * Parameters
 * 
 * * **@param {Number} `targetResolved`** See result.
 * * **@param {Number} `isResolved`** See result.
 * * **@param {Array} `arrayOfArrays`** An array of sub arrays.
 * 
 * Returns
 * 
 * * **@return {False|Array}** False if `targetResolved` != `isResolved`, Array otherwise.
 */
var _mergeArraysWhenCountIs = function(targetResolved, isResolved, arrayOfArrays) {
	if (targetResolved != isResolved) { return false; }
	
	var vals = (function(ar) {
		while (ar.length > 1) {
			var toAdd = ar.pop();
			toAdd.unshift(0);
			toAdd.unshift(ar[0].length);
			ar[0].splice.apply(ar[0], toAdd);
		}
		return ar[0];
	})(arrayOfArrays);
	
	var r = [],
		i = 0,
		l = 0;
	
	for (i=0, l=vals.length; i<l; i++) {
		if (r.indexOf(vals[i]) === -1) {
			r.push(vals[i]);
		}
	}
	
	return r;
	
};

/**
 * ### SyncIt.getDatasetNames()
 * 
 * Lists all dataset names in the *Store*, *Queue* or both.
 * 
 * #### Parameters
 * 
 * * **@param {Number} `inWhere`** Selects if you want *Dataset* names in the *Queue*, *Store* or both, Sum your desired SyncIt_Constant.Location.IN_QUEUE + SyncIt_Constant.Location.IN_STORE
 * * **@param {Function} `whenDatasetsKnown`** Signature: `function(err, arrayOfNames)`
 *   * **@param {ErrorCode} `whenDatasetsKnown.err`** See `SyncIt_Constant.Error`.
 *   * **@param {Array} `whenDatasetsKnown.arrayOfNames`** An array of *dataset* names
 */
SyncIt.prototype.getDatasetNames = function(inWhere, whenDatasetsKnown) {
	
	var rs = [],
		resolved = 0,
		tmpR = false;
	
	var possiblySend = function() {
		tmpR = _mergeArraysWhenCountIs(inWhere, resolved, rs);
		if (tmpR !== false) {
			whenDatasetsKnown(SyncIt_Constant.Error.OK, tmpR);
		}
	};
	
	if (inWhere & SyncIt_Constant.Location.IN_STORE) {
		this._store.getDatasetNames(function(err, names) {
			if (err) {
				whenDatasetsKnown(err);
			}
			resolved = resolved + SyncIt_Constant.Location.IN_STORE;
			rs.push(names);
			possiblySend();
		});
	}
	
	if (inWhere & SyncIt_Constant.Location.IN_QUEUE) {
		this._queue.getDatasetNames(function(err, datasetNames) {
			if (err !== SyncIt_Constant.Error.OK) {
				whenDatasetsKnown(err);
			}
			resolved = resolved + SyncIt_Constant.Location.IN_QUEUE;
			rs.push(datasetNames);
			possiblySend();
		});
	}
	
};

/**
 * ### SyncIt.getDatakeysInDataset()
 * 
 * Lists Datakeys in a Dataset.
 * 
 * #### Parameters
 * 
 * * **@param {Dataset} `datasetName`**
 * * **@param {Number} `inWhere`** Selects if you want *Datakey* names in the Queue, Store or both. Sum your desired SyncIt_Constant.Location.IN_QUEUE + SyncIt_Constant.Location.IN_STORE
 * * **@param {Function} `whenDatakeysKnown`** Signature: `function(err, arrayOfNames)`
 *   * **@param {ErrorCode} `whenDatakeysKnown.err`** See SyncIt_Constant.Error.
 *   * **@param {Array} `whenDatakeysKnown.arrayOfNames`** An array of *Datakey* names
 */
SyncIt.prototype.getDatakeysInDataset = function(datasetName, inWhere, whenDatakeysKnown) {
	var rs = [],
		resolved = 0,
		tmpR = false;
	
	var possiblySend = function() {
		tmpR = _mergeArraysWhenCountIs(inWhere, resolved, rs);
		if (tmpR !== false) {
			whenDatakeysKnown(SyncIt_Constant.Error.OK, tmpR);
		}
	};
	
	if (inWhere & SyncIt_Constant.Location.IN_STORE) {
		this._store.getDatakeyNames(datasetName, function(err, names) {
			if (err !== SyncIt_Constant.Error.OK) {
				return whenDatakeysKnown(err);
			}
			resolved = resolved + SyncIt_Constant.Location.IN_STORE;
			rs.push(names);
			possiblySend();
		});
	}
	
	if (inWhere & SyncIt_Constant.Location.IN_QUEUE) {
		this._queue.getDatakeyInDataset(datasetName, function(err, datakeys) {
			if (err !== SyncIt_Constant.Error.OK) {
				return whenDatakeysKnown(err);
			}
			resolved = resolved + SyncIt_Constant.Location.IN_QUEUE;
			rs.push(datakeys);
			possiblySend();
		});
	}
	
};

/**
 * ## Store
 * 
 * *Store* is where the information that has been synced to the *Server* is stored.
 */

/**
 * ### new Store()
 * 
 * #### Parameters
 * 
 * * **@param {Persist} `persist`**
 */
var Store = function(persist) {
	this._persist = persist;
};
Store.prototype._keyCheck = function(dataset, datakey) {
	var checkRe = /(\.)|(^[0-9])|(^_)/,
		toCheck = {Dataset: dataset, Datakey: datakey},
		msg = '',
		k=0;
		
	for (k in toCheck) {
		if (toCheck.hasOwnProperty(k)) {
			if (checkRe.test(toCheck[k])) {
				msg = 'SyncIt.Store does not support '+k+' '+
					'which includes a "." or starts with a "_" or number';
			}
			if (toCheck[k].length < 2) {
				msg = 'SyncIt.Store does not support '+k+' '+
					'with a length less than 2';
			}
			if (msg) {
				throw 'SyncIt.Store.Invalid'+k+': '+msg;
			}
		}
	}
};

/**
 * ### Store.get()
 * 
 * Gets the data in the *Store* for a specfic *Dataset* / *Datakey*.
 * 
 * #### Parameters
 * 
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Function} `whenRetrieved`** Signature: `function(err, jrec)
 *   * **@param {Errorcode} `whenRetrieved.err`**
 *   * **@param {Jrec} `whenRetrieved.jrec`** The value stored at the *Dataset* / *Datakey*.
 */
Store.prototype.get = function(dataset, datakey, whenRetrieved) {
	this._keyCheck(dataset, datakey);
	this._persist.get(dataset+'.'+datakey, whenRetrieved);
};

/**
 * ### Store.set()
 * 
 * Sets the data in the *Store* for a specfic *Dataset* / *Datakey*.
 * 
 * #### Parameters
 * 
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Function} `whenSet`** Signature: `function(err)
 *   * **@param {Errorcode} `whenSet.err`**
 */
Store.prototype.set = function(dataset, datakey, value, whenSet) {
	this._keyCheck(dataset, datakey);
	this._persist.set(dataset+'.'+datakey, value, whenSet);
};

/**
 * **Store._getPersistStorageKeys()**
 * 
 * Returns the name of all keys stored in the *Persist*.
 * 
 * In practice the storage keys are the form [`Dataset`].[`Datakey`] so you are
 * getting a somewhat easy to parse list of the *Dataset* / *Datakey*.
 * 
 * **Parameters**	
 * 
 * * **@param {Function} `dataRetrieved`** Signature: `function(err, storageKeys)
 *   * **@param {Errocode} `dataRetrieved.err`**
 *   * **@param {Array} `dataRetrieved.storageKeys`** A list of all storage keys in the `Persist`
 */
Store.prototype._getPersistStorageKeys = function(dataRetrieved) {
	this._persist.getKeys(function(err, persistKeys) {
		if (err) {
			return dataRetrieved(err);
		}
		var r = [];
		for (var i = 0; i < persistKeys.length; i++) {
			if (persistKeys[i].match(/\S+\.\S+/)) {
				r.push(persistKeys[i]);
			}
		}
		dataRetrieved(SyncIt_Constant.Error.OK, r);
	});
};


/**
 * ### Store.getDatasetNames()
 * 
 * Will retrieve the `Dataset`s which are in use in the *Store*.
 * 
 * #### Parameters
 * 
 * * **@param {Function} `setsRetrieved`** Signature: `function(err, sets)`
 *   * **@param {Errorcode} `setsRetrieved.err`** 
 *   * **@param {Array} `setsRetrieved.sets`** An array of names of `Dataset`s
 */
Store.prototype.getDatasetNames = function(setsRetrieved) {
	this._getPersistStorageKeys(function(err, persistData) {
		var r = [];
		if (err) {
			return setsRetrieved(err);
		}
		for (var i = 0; i < persistData.length; i++) {
			var datasetName = persistData[i].replace(/\..*/, '');
			if (r.indexOf(datasetName) == -1) {
				r.push(datasetName);
			}
		}
		setsRetrieved(SyncIt_Constant.Error.OK, r);
	});
};


/**
 * ### Store.getDatakeyNames()
 * 
 * Will retrieve the Keys which are in use within a *Dataset* in the *Store*.
 * 
 * #### Parameters
 * 
 * * **@param {String} `dataset`**
 * * **@param {Function} `keysRetrieved`** Signature: function(err, keys)
 *   * **@param {Errorcode} `keysRetrieved.err`** 
 *   * **@param {Array} `keysRetrieved.keys`** An array of names of `Datakey`s
 */
Store.prototype.getDatakeyNames = function(dataset, keysRetrieved) {
	this._getPersistStorageKeys(function(err, persistData) {
		var r = [];
		if (err) {
			return keysRetrieved(err);
		}
		for (var i = 0; i < persistData.length; i++) {
			if (persistData[i].replace(/\..*/, '') == dataset) {
				r.push(persistData[i].replace(/.*\./, ''));
			}
		}
		keysRetrieved(SyncIt_Constant.Error.OK, r);
	});
};

return {
	SyncIt: SyncIt,
	Store: Store
};

});
