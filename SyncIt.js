(function(root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	"use strict";
	/* jshint strict: false */
	/* globals module: false, require: false, define: true */
	if (typeof define === 'function' && define.amd) {
		define(
			[
				'./Constant',
				'add-events',
				'./addLocking',
				'./updateResult'
			],
			factory
		);
	} else {
		module.exports = factory(
			require('./Constant.js'),
			require('add-events'),
			require('./addLocking.js'),
			require('./updateResult.js')
		);
	}
}(this, function(SyncIt_Constant, addEvents, addLocking, updateResult) {

"use strict";

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

var LOCKING = SyncIt_Constant.Locking;
var ERROR = SyncIt_Constant.Error;
var FOLLOW_INFORMATION_TYPE = SyncIt_Constant.FollowInformationType;

/**
 * **_map()**
 *
 * Simple map function for when Array.map() is not available.
 *
 * * **@param {Array} `arr`** The array to filter.
 * * **@param {Function} `filterFunc`** The function to use for filtering
 */
var _map = function(arr, func) {
	
	if (arr.map) { return arr.map(func); }
	
	var i, l,
		r = [];
	
	for (i=0, l=arr.length; i<l; i++) {
		r.push(func(arr[i]));
	}
	return r;
};

/**
 * **_filter()**
 *
 * Simple filter function for when Array.filter() is not available.
 *
 * * **@param {Array} `arr`** The array to filter.
 * * **@param {Function} `filterFunc`** The function to use for filtering
 */
var _filter = function(arr,filterFunc) {
	
	if (arr.filter) { return arr.filter(filterFunc); }
	
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

/**
 * **_shallowCopyKeys()**
 *
 * Will make a shallow copy of `ob` containing `keysToCopy`. If `copyNullEtc`
 * is true it will not copy `null` or `undefined` values.
 *
 * * **@param {Object} `ob`**
 * * **@param {Array} `keysToCopy`**
 * * **@param {Boolean} `copyNullEtc`**
 */
var _shallowCopyKeys = function(ob,keysToCopy,copyNullEtc) {
	var k = '',
		r = {};
	for (k in ob) {
		if (
			ob.hasOwnProperty(k) &&
			(
				(keysToCopy === undefined) ||
				(keysToCopy.indexOf(k) > -1)
			)
		) {
			if (copyNullEtc || ((ob[k] !== null) && (ob[k] !== undefined))) {
				r[k] = ob[k];
			}
		}
	}
	return r;
};

/**
 * ## SyncIt
 * 
 * ### new SyncIt()
 * 
 * Constructor
 * 
 * #### Parameters
 * 
 * * **@param {SyncIt_Path_AsyncLocalStorage} `pathstore`** The instance to use for storage.
 * * **@param {Modifier} `modifier`** The UNIQUE User/Device which is using the instance of SyncIt.
 */
var SyncIt = function(pathstore, modifier) {
	this._ps = pathstore;
	this._modifier = modifier;
	this._cloneObj = function(ob) { return JSON.parse(JSON.stringify(ob)); };
	this._autoClean = true;
};

/**
 * **SyncIt._getPathWatcher()**
 *
 * This is used within SyncIt to connect information about that data stored in
 * SyncIt._ps (An instance of SyncIt_Path_AsyncLocalStorage) and the logical
 * values that are stored should all Pathitem be processed.
 */
SyncIt.prototype._getPathWatcher = function() {
	var val = this._getEmptyStorerecord();
	return {

		/**
		 * **getWatcher()**
		 *
		 * Watches as SyncIt_Path_AsyncLocalStorage follows the path of Pathitem
		 * and collects information.
		 *
		 * This will also prevent
		 */
		getWatcher: function() { return function(key,item,inWhere) {
			var k = '';

			var keyInfo = key.split('.');

			// Info stored at the root only exists once and can probably be
			// seen as metadata, so just connect it.
			if (inWhere == FOLLOW_INFORMATION_TYPE.INFO) {
				val.j = item;
				return ERROR.OK;
			}
			// This is not infact the true root, but the root of the Path, if
			// the `dataset`/`datakey` has never been `SyncIt.advance()`'d then
			// there will be no root so this will not be called.
			if (inWhere == FOLLOW_INFORMATION_TYPE.ROOTITEM) {
				for (k in item) {
					if (item.hasOwnProperty(k)) {
						val[k] = item[k];
					}
				}
				val.s = keyInfo[0];
				val.k = keyInfo[1];
				if (item.hasOwnProperty('r') && item.r) {
					return ERROR.DATA_ALREADY_REMOVED ;
				}
				return ERROR.OK;
			}
			// getWatcher is always used for collecting information about one
			// path inside a `dataset`/`datakey`, however there is an
			// opportunity to collect information about whether other paths
			// exist or not. This will be an array of the non-follwed path.
			if (inWhere == FOLLOW_INFORMATION_TYPE.OTHER_PATHS) {
				val.p = item;
			}
			// For every Pathitem that is encounted, we will use updateResult
			// to figure out the logical value should all the Pathitem be
			// applied.
			if (inWhere == FOLLOW_INFORMATION_TYPE.PATHITEM) {
				if (!item.hasOwnProperty('t')) {
					item.t = this._ps.getKeyTimeDecoder().call(
						this._ps,
						key
					);
				}
				if (!item.hasOwnProperty('m')) {
					item.m = this.getModifier();
				}
				val.q.push(item);
				val = updateResult(
					val,
					item,
					this._cloneObj
				);
				val.s = keyInfo[0];
				val.k = keyInfo[1];
				if (item.o == 'remove') {
					return ERROR.DATA_ALREADY_REMOVED ;
				}
			}
			return ERROR.OK;
		}.bind(this); }.bind(this),

		/**
		 * **getReaditem**
		 *
		 * Returns the data collected by `getWatcher`.
		 */
		getReaditem: function() {
			return val;
		}
	};
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
 * ### SyncIt.listenForAddedToPath()
 * 
 * Adds a listener for when data is added to the *Queue*.
 * 
 * #### Parameters
 * 
 * * **@param {Function} `listener`** Signature: `function(operation, dataset, datakey)`.
 *   * **@param {Dataset} `listener.dataset`** The *dataset* of the updated.
 *   * **@param {Datakey} `listener.datakey`** The *datakey* that was updated.
 *   * **@param {Pathitem} `listener.queueitem`** The *queueitem* that was just added.
 */
SyncIt.prototype.listenForAddedToPath = function(listener) {
	return this.listen('added_to_queue', listener);
};

/**
 * ### SyncIt.listenForAdvanced()
 * 
 * Adds a listener for when data is advanced to the *Store*.
 * 
 * #### Parameters
 * 
 * * **@param {Function} `listener`** Signature: `function(queueitem, newStorerecord)`.
 *   * **@param {Dataset} `listener.dataset`** The *dataset* of the advanced.
 *   * **@param {Datakey} `listener.datakey`** The *datakey* that was advanced.
 * *   **@param {Pathitem} `listener.queueitem`** The *queueitem* that was advanced.
 * *   **@param {Storerecord} `listener.newStorerecord`** The *storerecord* which is now stored.
 */
SyncIt.prototype.listenForAdvanced = function(listener) {
	return this.listen('advanced', listener);
};


/**
 * ### SyncIt.listenForFed()
 * 
 * Adds a listener for when data is fed using [SyncIt.feed()](#syncit.feed--)
 * 
 * #### Parameters
 * 
 * * **@param {Function} `listener`** Signature: `function(queueitem, newStorerecord)`.
 *   * **@param {String} `listener.dataset`** The dataset of the just fed Queueitem.
 *   * **@param {String} `listener.datakey`** The datakey of the just fed Queueitem.
 * *   **@param {Queueitem} `listener.queueitem`** The *queueitem* that was advanced.
 * *   **@param {Storerecord} `listener.newStorerecord`** The *storerecord* which is now stored.
 */
SyncIt.prototype.listenForFed = function(listener) {
	return this.listen('fed', listener);
};

/**
 * ### SyncIt.set()
 * 
 * Will add a *Pathitem* that represents a complete overwrite of any existing data.
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
		whenAddedToQueue
	);
};

/**
 * ### SyncIt.remove()
 * 
 * This will add a Pathitem to the Queue that represents the removal of data stored at a Dataset/Datakey.
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
 * * **@param {Function} `resolutionFunction`** Called when conflict occurs, Signature: `function(dataset, datakey, storerecord, serverQueueitems, localPathitems, resolved)`.
 *   * **@param {Array} `resolutionFunction.dataset`** The *Dataset* of the conflict.
 *   * **@param {Array} `resolutionFunction.datakey`** The *Datakey* of the conflict.
 *   * **@param {Array} `resolutionFunction.storerecord`** What is in the local *Store* for that *Dataset* / *Datakey*.
 *   * **@param {Array} `resolutionFunction.localPathitems`** The *Pathitem* that has been added using functions such as [SyncIt.set()](#syncit.set--) but is now conflicting with the data from the *Server*.
 *   * **@param {Array} `resolutionFunction.serverQueueitems`** The extra *Queueitem* that are on the Server.
 *   * **@param {Function} `resolutionFunction.resolved`** This should be called from inside resolutionFunction and will add *Pathitem* after the *Server* supplied *Queueitem*. Signature: `function(resolved, mergedLocalsToDoAfterwards)`
 *      * **@param {Boolean} `resolutionFunction.resolved.resolved`** use false to halt the feeding, true otherwise
 *      * **@param {Array} `resolutionFunction.resolved.mergedLocalsToDoAfterwards`** These will be added to the *Queue* __after__ (currently) all serverPathitems have been advanced to the *Store*.
 * * **@param {Function} `feedDone`** Callback for when done. Signature: `function(err, fedItemsFailed)`;
 *   * **@param {Errorcode} `feedDone.err`** See SyncIt_Constant.Error.
 *   * **@param {Array} `feedDone.fedItemsFailed`** Array of items fed from the *Server* which could not be processed.
 */
SyncIt.prototype.feed = function(feedQueueitems, resolutionFunction, feedDone) {
	
	// Make a shallow copy of feedQueueitems so when we `shift()` we are not
	// fiddling with users data.
	var feedQueue = (function(items) {
		var r = [];
		for (var i = 0, l = items.length; i < l; i++) {
			r.push(_shallowCopyKeys(
				items[i],
				['s','k','u','t','m','o','b'],
				false
			));
		}
		return r;
	})(feedQueueitems);

	// If a conflict occurs we want to feed the resolutionFunction only items from
	// the same dataset / datakey that are based on a version higher than the one
	// currently in the Pathroot.
	var prepareServerQueueItemForResolutionFunction = function(storerecord, feedQueue) {
		var r = [],
			i = 0,
			l = 0,
			firstQueueitem = feedQueue[0];
		
		var filterFunc = function(elem) {
			if (storerecord === null) {
				return true;
			}
			return (elem.b >= storerecord.v);
		};
		
		for (i=0, l=feedQueue.length; i<l; i++) {
			if (
				(feedQueue[i].s != firstQueueitem.s) ||
				(feedQueue[i].k != firstQueueitem.k)
			) {
				return _filter(r,filterFunc);
			}
			r.push(feedQueue[i]);
		}
		return _filter(r,filterFunc);
	};
	
	// Simple helper function that will unlock SyncIt and call the feedDone callback.
	var unlockAndError = function(err) {
		this._unlockFor(LOCKING.FEEDING);
		return feedDone(
			err,
			feedQueue
		);
	}.bind(this);
	
	// This function is called from resolutionFunction.resolved and will check
	// that resolutionFunction actually did resolve the conflict, if it did it
	// will add any resolving PathItem to the "c" (conflict) branch so they can
	// be applied later and remove all local Pathitem from the "a" branch as 
	// they conflict with the items sent from the server.
	var perhapsResolved = function(storedrecord,fedForSameDatasetAndDatakey,resolved,mergePathitem,next) {
		
		var sanatizeMergeItem = function(queueitem) {
			var r = {},
				copyKeys = ['o','u','t'],
				disallowedKeys = ['i','j','q','r','v'],
				i;
			for (i=0; i<disallowedKeys.length; i++) {
				if (queueitem.hasOwnProperty(disallowedKeys[i])) {
					throw "Merge queue cannot include any " + disallowedKeys.join(', ');
				}
			}
			for (i=0; i<copyKeys.length; i++) {
				if (queueitem.hasOwnProperty(copyKeys[i])) {
					r[copyKeys[i]] = queueitem[copyKeys[i]];
				}
			}
			if (queueitem.hasOwnProperty('s') && (queueitem.s != storedrecord.s)) {
				throw "Merge queue cannot use different dataset to stored record";
			}
			if (queueitem.hasOwnProperty('k') && (queueitem.k != storedrecord.k)) {
				throw "Merge queue cannot use different datakey to stored record";
			}
			return r;
		};
		
		if (!resolved) {
			unlockAndError(ERROR.NOT_RESOLVED);
		}

		if (!mergePathitem.length) {
			return this._ps.removePathitemFromPath(feedQueue[0].s,feedQueue[0].k,'a',this._autoClean,next);
		}

		// TODO: Sanitize the merge queue

		this._ps.pushPathitemsToNewPath(
			feedQueue[0].s,
			feedQueue[0].k,
			'c',
			_map(mergePathitem,sanatizeMergeItem),
			function(err) {
				if (err) {
					return unlockAndError(err,feedQueue);
				}
				var info = {cv: storedrecord.v + fedForSameDatasetAndDatakey.length};
				this._ps.setInfo(feedQueue[0].s,feedQueue[0].k,info,function(err) {
					if (err !== ERROR.OK) {
						unlockAndError(err);
					}
					return this._ps.removePathitemFromPath(
						feedQueue[0].s,
						feedQueue[0].k,
						'a',
						this._autoClean,
						next
					);
				}.bind(this));
			}.bind(this)
		);
		
	}.bind(this);

	// One by one, process the Pathitem which have been fed.
	var feedOne = function() {
		
		if (feedQueue.length === 0) {
			this._unlockFor(LOCKING.FEEDING);
			return feedDone(ERROR.OK,[]);
		}

		var storerecord = this._getEmptyStorerecord();
		var otherpaths = [];
		var queue = [];
		var info = {};

		// Read the path, collecting information.
		this._ps.followPath(
			feedQueue[0].s,
			feedQueue[0].k,
			'a',
			function(key,item,inWhere) {
				if (inWhere == FOLLOW_INFORMATION_TYPE.INFO) {
					info = item;
					return;
				}
				if (inWhere == FOLLOW_INFORMATION_TYPE.ROOTITEM) {
					storerecord = item;
					return;
				}
				if (inWhere == FOLLOW_INFORMATION_TYPE.OTHER_PATHS) {
					otherpaths = item;
				}
				if (inWhere == FOLLOW_INFORMATION_TYPE.PATHITEM) {
					queue.push(item);
				}
			},
			function(err) {
				if ((err !== ERROR.NO_DATA_FOUND) && (err !== ERROR.OK)) {
					unlockAndError(err);
				}

				// It might be that we are trying to feed data which is 
				// based on an old storerecord, if we are just skip over it
				if (feedQueue[0].b < storerecord.v) {
					feedQueue.shift();
					return feedOne();
				}

				// If we have items in our local queue with a basedonversion which is
				// lower than what we are being fed, it is likely that we have unadvanced
				// items which we have already uploaded.
				if (queue.length && (queue[0].b < feedQueue[0].b)) {
					return unlockAndError(
						Error.BASED_ON_IN_QUEUE_LESS_THAN_BASED_IN_BEING_FED,
						feedQueue
					);
				}

				// Continue with the Feed passing the information found from 
				// this._ps.followPath();Continue with the Feed.
				return feedOneWorker(storerecord,queue,info,otherpaths);

			}.bind(this)
		);
		
	}.bind(this);
	
	// All data is now collected about what is in the Path so we can go ahead and
	// take appropriate action...
	var feedOneWorker = function(storerecord,queue,info) {

		// If there is items in the Path then feed them into resolutionFunction
		if (queue.length) {

			var fedForSameDatasetAndDatakey = prepareServerQueueItemForResolutionFunction(
				storerecord,
				feedQueue
			);

			return resolutionFunction.call(
				this,
				feedQueue[0].s,
				feedQueue[0].k,
				(function() {
					if (storerecord.v === 0) {
						return null;
					}
					storerecord.s = feedQueue[0].s;
					storerecord.k = feedQueue[0].k;
					if (!storerecord.hasOwnProperty('m')) {
						storerecord.m = this.getModifier();
					}
					return storerecord;
				}.bind(this)()),
				queue,
				fedForSameDatasetAndDatakey,
				function(resolved,mergePathitem) {
					perhapsResolved(storerecord,fedForSameDatasetAndDatakey,resolved,mergePathitem,feedOne);
				}
			);
		}

		// Just make sure that the Pathitem is the correct version to apply.
		if (storerecord.v != feedQueue[0].b) {
			return unlockAndError(
				ERROR.FEED_VERSION_ERROR,
				feedQueue
			);
		}

		// This will basically apply the first Pathitem to the existing
		// Pathroot, giving the new Pathroot
		var newRoot = _shallowCopyKeys(
			updateResult(
				storerecord,
				feedQueue[0],
				this._cloneObj
			),
			['i','v','m','t','r']
		);
		
		if (feedQueue[0].o == 'remove') {
			return this._ps.promotePathToOrRemove(feedQueue[0].s,feedQueue[0].k,'c','a',false,function(err) {
				if (err !== ERROR.OK) {
					return unlockAndError(err);
				}
				var dataset = feedQueue[0].s;
				var datakey = feedQueue[0].k;
				this._emit(
					'fed',
					dataset,
					datakey,
					feedQueue[0],
					null
				);
				feedQueue.shift();
				feedOne();
			}.bind(this));
		}
		
		var joinCPathToA = function(dataset,datakey,baseV,next) {
			return this._ps.changePath(dataset,datakey,'c','a',this._autoClean,function(err) {
				if (err) {
					return unlockAndError(err,feedQueue);
				}
				return this._ps.followPath(
					dataset,
					datakey,
					'a',
					function(storagekey,item,itemtype) {
						if (itemtype !== FOLLOW_INFORMATION_TYPE.PATHITEM) {
							return ERROR.OK;
						}
						this._emit(
							'added_to_queue',
							dataset,
							datakey,
							this._addObviousInforation(
								dataset,
								datakey,
								storagekey.replace(/.*\./,''),
								item,
								{ b: baseV++ }
							)
						);
						return ERROR.OK;
					}.bind(this),
					function(err) {
						if (err) {
							return unlockAndError(err,feedQueue);
						}
						next();
					}
				);
			}.bind(this));
		}.bind(this);
		
		// Set the new Pathroot, once this is done, emit the fact an item has
		// been fed and check that if we should be applying the conflict path
		// (c), if we should, do so. Once all this is done, go back and call
		// `feedOne()` to go and get the next item.
		this._ps.setPathroot(
			feedQueue[0].s,
			feedQueue[0].k,
			'a',
			newRoot,
			function(err) {
				if (err !== ERROR.OK) {
					return unlockAndError(err);
				}
				var dataset = feedQueue[0].s;
				var datakey = feedQueue[0].k;
				this._emit(
					'fed',
					dataset,
					datakey,
					feedQueue[0],
					this._addObviousInforation(
						feedQueue[0].s,
						feedQueue[0].k,
						null,
						newRoot
					)
				);
				feedQueue.shift();
				if (newRoot.v == info.cv) {
					return joinCPathToA(dataset,datakey,newRoot.v,feedOne);
				}
				feedOne();
			}.bind(this)
		);
	}.bind(this);
	
	var i=0,
		l=0,
		queueitemValidationError = 0;
	
	// If locked, just exit.
	if (this.isLocked()) {
		return feedDone(
			SyncIt_Constant.Error.UNABLE_TO_PROCESS_BECAUSE_LOCKED,
			feedQueueitems
		);
	}
	
	// Perform basic validation.
	for (i=0, l=feedQueueitems.length;i<l;i++) {
		queueitemValidationError = this._basicValidationForQueueitem(feedQueueitems[i]);
		if (queueitemValidationError != SyncIt_Constant.Error.OK) {
			return feedDone(
				queueitemValidationError,
				feedQueueitems
			);
		}
	}
	
	// Then lock
	this._lockFor(LOCKING.FEEDING);
	
	// Process the first item.
	feedOne();
	
};

SyncIt.prototype._basicValidationForQueueitem = function(queueitem,skips) {
	var k,
		requiredFields = {
			s: SyncIt_Constant.Error.INVALID_DATASET,
			k: SyncIt_Constant.Error.INVALID_DATAKEY,
			o: SyncIt_Constant.Error.INVALID_OPERATION
		};
	for (k in requiredFields) {
		if (
			requiredFields.hasOwnProperty(k) && 
			!queueitem.hasOwnProperty(k)
		) {
			return requiredFields[k];
		}
	}
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
 * Adds a Pathitem to the Queue.
 * 
 * **Parameters**
 * 
 * * **@param {Operation} `operation`**
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Update} `update`**
 * * **@param {Modifier} `modifier`**
 * * **@param {Basedonversion} `basedonversion`**
 * * **@param {Function} `whenAddedToQueue`** Callback for when adding is complete. Signature: `function(errorCode, dataset, datakey, queueitem)`
 *   * **@param {Errorcode} `whenAddedToQueue.errorCode`** See SyncIt_Constant.Error.
 *   * **@param {Dataset} `whenAddedToQueue.dataset`** The Dataset of the Pathitem.
 *   * **@param {Datakey} `whenAddedToQueue.datakey`** The Datakey of the Pathitem.
 *   * **@param {Pathitem} `whenAddedToQueue.queueitem`** The Pathitem that has just been added.
 *   * **@param {Readrecord} `whenAddedToQueue.readrecord`** The now logical value of the data.
 */
SyncIt.prototype._addToQueue = function(operation, dataset, datakey, update, whenAddedToQueue) {

	// If locked, exit.
	if (this.isLocked()) {
		whenAddedToQueue(ERROR.UNABLE_TO_PROCESS_BECAUSE_LOCKED);
		return false;
	}
	
	var queueitem = {
		o: operation, 
		u: update
	};

	// Adds information which is not necessary to store in the Pathitems itself.
	var _makeFullReaditem = function(dataFromStore) {
		var k = '';
		var defaults = {
			m: this.getModifier(),
			r: false
		};
		for (k in defaults) {
			if (!dataFromStore.hasOwnProperty(k)) {
				dataFromStore[k] = defaults[k];
			}
		}
		return dataFromStore;
	}.bind(this);

	var pathWatcher = this._getPathWatcher();
	
	this._lockFor(LOCKING.ADDING_TO_QUEUE);

	this._ps.push(
		dataset,
		datakey,
		'a',
		queueitem,
		true,
		pathWatcher.getWatcher(),
		function(err,ref) {
			var pathWatchedItem = pathWatcher.getReaditem();
			this._unlockFor(LOCKING.ADDING_TO_QUEUE);
			if (err !== ERROR.OK) {
				return whenAddedToQueue(err);
			}
			this._emit(
				'added_to_queue',
				dataset,
				datakey,
				this._addObviousInforation(dataset,datakey,ref,queueitem,pathWatchedItem)
			);
			whenAddedToQueue(
				err,
				dataset,
				datakey,
				queueitem,
				_makeFullReaditem(pathWatchedItem)
			);
		}.bind(this)
	);
};

/**
 * **SyncIt._getEmptyStorerecord()**
 *
 * When advancing a *Pathitem* either because SyncIt is moving data from the *Queue* to the *Store* or just because it is processing a `[SyncIt.get()](#syncit.get--) it is possible that no data already exists at the *Store* for that *Dataset* / *Datakey*. It's handy to use this function to get something that looks like stored data to limit code complexity.
 */
SyncIt.prototype._getEmptyStorerecord = function() {
	return {
		i:{},
		v:0,
		j:{},
		p:[],
		q:[],
		r:false,
		t:(new Date()).getTime()
	};
};

/**
 * ### SyncIt.advance()
 *
 * Applies the very first *Pathitem* in the *Queue* onto the data already in the *Store* for that *Dataset* / *Datakey*.
 *
 * #### Parameters
 * 
 * * **@param {Function} `done`** Callback when the operation is complete (or not). Signature: `function(errorCode, queueitem, storerecord)`
 *   * **@param {ErrorCode} `done.errorCode`** See SyncIt_Constant.Error.
 *   * **@param {Dataset} `done.dataset`**
 *   * **@param {Datakey} `done.datakey`**
 *   * **@param {Pathitem} `done.queueitem`** The *Pathitem* that was just advanced
 *   * **@param {Storerecord} `done.storerecord`** The new *Storerecord*
 */
SyncIt.prototype.advance = function(done) {
	
	if (this.isLocked()) {
		done(ERROR.UNABLE_TO_PROCESS_BECAUSE_LOCKED);
		return false;
	}
	
	this._lockFor(LOCKING.ADVANCING);
	var addedPathkey = '';
	
	this._ps.findFirstDatasetDatakey('a',function(err,dataset,datakey) {
		if (err !== ERROR.OK) {
			this._unlockFor(LOCKING.ADVANCING);
			return done(err);
		}
		var newRoot = {};
		this._ps.advance(
			dataset, 
			datakey,
			this._autoClean,
			function(pathRoot,key,item,newRootCb) {
				if (pathRoot === null) {
					pathRoot = this._getEmptyStorerecord();
				}
				addedPathkey = key;
				// Filter to just keys r, v, i and possibly t anything else can
				// be recreated.
				if (item.o === 'remove') {
					return newRootCb(null);
				}
				newRoot = updateResult(pathRoot,item,this._cloneObj);
				newRoot = _shallowCopyKeys(
					this._addObviousInforation(dataset,datakey,addedPathkey,newRoot),
					['i','t','v','r'],
					false
				);
				newRootCb(newRoot);
			}.bind(this),
			function(err,item) {
				this._unlockFor(LOCKING.ADVANCING);
				if (err !== ERROR.OK) {
					return done(err,dataset,datakey);
				}
				this._emit(
					'advanced',
					dataset,
					datakey,
					this._addObviousInforation(dataset,datakey,addedPathkey,item,newRoot),
					this._addObviousInforation(dataset,datakey,addedPathkey,newRoot)
				);
				return done(
					err,
					dataset,
					datakey,
					this._addObviousInforation(dataset,datakey,addedPathkey,item,newRoot),
					this._addObviousInforation(dataset,datakey,addedPathkey,newRoot)
				);
			}.bind(this)
		);
	}.bind(this));
	
};

/**
 * **SyncIt._addObviousInforation**
 *
 * Maybe, all the information got here is not obvious, but it can be calculated
 * from other information... Every Pathitem must have been created locally so
 * we must be the modifier, so we don't store that. The modificationtime is 
 * can also be retrieved from the Pathitem reference.
 *
 * **@param {Dataset} `dataset`**
 * **@param {Datakey} `datakey`**
 * **@param {Pathref} `reference`**
 * **@param {Pathitem} `ob`** The item to add the "obvious" information to.
 * **@return {Object} `ob` with the "obvious" information.
 */
SyncIt.prototype._addObviousInforation = function(dataset,datakey,reference,ob,extra) {
	var r = _shallowCopyKeys(ob),
		k = '';
	r.s = dataset;
	r.k = datakey;
	if (!r.hasOwnProperty('m')) {
		r.m = this.getModifier();
	}
	if (!r.hasOwnProperty('t')) {
		if ((reference === undefined) || (reference === null)) {
			throw "No time and no time found in key";
		}
		r.t = (this._ps.getKeyTimeDecoder())(reference);
	}
	if (extra !== undefined) {
		if (!r.hasOwnProperty('b') && extra.hasOwnProperty('b')) {
			r.b = parseInt(extra.b,10);
		}
		if (!r.hasOwnProperty('b') && extra.hasOwnProperty('v')) {
			r.b = parseInt(extra.v,10) - 1;
		}
	}
	for (k in r) {
		if (k.match(/^_/)) {
			delete r[k];
		}
	}
	return r;
};

/**
 * ### SyncIt.get()
 * 
 * Will retrieve information from SyncIt by reading what is first in the *Store* and then every *Pathitem* for the same Dataset / Datakey.
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
		if (e === ERROR.DATA_ALREADY_REMOVED) {
			return whenDataRetrieved(e, null);
		}
		if (e === ERROR.OK) {
			return whenDataRetrieved(e, r.i);
		}
		whenDataRetrieved(e);
	});
};

/**
 * ### SyncIt.getVersion()
 * 
 * Will retrieve information about the version in the store.
 * 
 * #### Parameters
 * 
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Function} `whenVersionFound`** Signature: `function(err, version)`
 *   * **@param {ErrorCode} `whenDataRetrieved.err`** See SyncIt_Constant.Error.
 *   * **@param {Number} `whenDataRetrieved.version`** The version of the data, 0 means no data found found, 1 is the first version.
 */
SyncIt.prototype.getVersion = function(dataset, datakey, whenVersionFound) {
	this.getFull(dataset, datakey, function(e, r) {
		if (e === ERROR.NO_DATA_FOUND) {
			return whenVersionFound(ERROR.OK, 0);
		}
		if ([ERROR.OK,ERROR.DATA_ALREADY_REMOVED].indexOf(e) > -1) {
			return whenVersionFound(e, r.b + 1);
		}
		whenVersionFound(e);
	});
};


/**
 * ### SyncIt.getFirst()
 *
 * Gets the Pathitem which should be next uploaded to the server or will be advanced
 * should `SyncIt.advance()` be called.
 *
 * #### Parameters
 * 
 * * **@param {Function} `done`** Callback. Signature: Function(err, pathitem)
 *   * **@param {ErrorCode} `done.err`** See SyncIt_Constant.Error.
 *   * **@param {Pathitem} `done.pathitem`** The Pathitem.
 */
SyncIt.prototype.getFirst = function(done) {
	
	this._ps.getFirstPathitem(
		'a',
		function(err,dataset,datakey,reference,queueitem) {

			if (err !== ERROR.OK) {
				if (err === ERROR.PATH_EMPTY) {
					return done(ERROR.NO_DATA_FOUND);
				}
				return done(err);
			}

			var qi = this._addObviousInforation(dataset,datakey,reference,queueitem);
			this._ps.getRootItem(dataset,datakey,'a',function(err,root) {
				if (err === ERROR.NO_DATA_FOUND) {
					err = ERROR.OK;
					root = this._getEmptyStorerecord();
				}

				if (err !== ERROR.OK) {
					return done(err);
				}
				qi.b = root.v;
				return done(err,qi);
			}.bind(this));
		}.bind(this)
	);
	
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
	
	var pathWatcher = this._getPathWatcher();
	
	this._ps.followPath(dataset,datakey,'a',pathWatcher.getWatcher(),function(err) {
		
		var fullData;
		
		if (err !== ERROR.OK) {
			return whenDataRetrieved(err);
		}
		
		fullData = this._addObviousInforation(dataset,datakey,null,pathWatcher.getReaditem());
		if (fullData.r === true) {
			err = ERROR.DATA_ALREADY_REMOVED;
		}
		return whenDataRetrieved(err,fullData);
	}.bind(this));
};

/**
 * ### SyncIt.getDatasetNames()
 * 
 * Lists all dataset names in the *Store*, *Queue* or both.
 * 
 * #### Parameters
 * 
 * * **@param {Function} `whenDatasetsKnown`** Signature: `function(err, arrayOfNames)`
 *   * **@param {ErrorCode} `whenDatasetsKnown.err`** See `SyncIt_Constant.Error`.
 *   * **@param {Array} `whenDatasetsKnown.arrayOfNames`** An array of *dataset* names
 */
SyncIt.prototype.getDatasetNames = function(whenDatasetsKnown) {
	
	this._ps.getDatasetNames(whenDatasetsKnown);
	
};

/**
 * ### SyncIt.getDatakeysInDataset()
 * 
 * Lists Datakeys in a Dataset.
 * 
 * #### Parameters
 * 
 * * **@param {Dataset} `datasetName`**
 * * **@param {Function} `whenDatakeysKnown`** Signature: `function(err, arrayOfNames)`
 *   * **@param {ErrorCode} `whenDatakeysKnown.err`** See SyncIt_Constant.Error.
 *   * **@param {Array} `whenDatakeysKnown.arrayOfNames`** An array of *Datakey* names
 */
SyncIt.prototype.getDatakeysInDataset = function(datasetName, whenDatakeysKnown) {
	
	this._ps.getDatakeysInDataset(datasetName, whenDatakeysKnown);
	
};

/**
 * ### Remove any outstanding uploads for a specific Dataset / Datakey.
 *
 * #### Parameters
 *
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Function} `next`** Signature: Function(err)
 *   * **@param {ErrorCode} `next.err`** See SyncIt_Constant.Error.
 */
SyncIt.prototype.purge = function(dataset, next) {
	if (this.isLocked()) {
		next(ERROR.UNABLE_TO_PROCESS_BECAUSE_LOCKED);
		return false;
	}
	this._lockFor(LOCKING.CLEANING);
	return this._ps.purge(dataset, function(err) {
		this._unlockFor(LOCKING.CLEANING);
		next(err);
	}.bind(this));
};

/**
 * ### SyncIt.clean()
 *
 * Will remove the remnants of conflict resolution, these __should__ only be
 * `cv` Info in Root of a Dataset/Datakey but should there be any 
 * disconnected Pathitem from unsafe shutdowns it will remove those too. Note
 * that these disconnected Pathitem or old `cv` records in the Info of the
 * Dataset / Datakey Root's do not cause ill effects, except for the tiny
 * amounts of space.
 *
 * #### Parameters
 *
 * * **@param {Function} `done`** Signature: `function(err)`
 */
SyncIt.prototype.clean = function(done) {

	if (this.isLocked()) {
		done(ERROR.UNABLE_TO_PROCESS_BECAUSE_LOCKED);
		return false;
	}
	
	this._lockFor(LOCKING.CLEANING);
	
	var cleanDatakey = function(dataset,datakey,next) {

		var pathWatcher = this._getPathWatcher();

		this._ps.followPath(dataset,datakey,'a',pathWatcher.getWatcher(),function(err) {
			var info = pathWatcher.getReaditem();
			var removeConflictInfo = function() {
				if (!info.j.hasOwnProperty('cv')) {
					return next(err);
				}
				delete info.j.cv;
				this._ps.setInfo(dataset,datakey,info.j,function(err) {
					next(err);
				});
			}.bind(this);
			var removeCPath = function() {
				this._ps.removePath(dataset,datakey,'c',false,removeConflictInfo);
			}.bind(this);
			if (err !== ERROR.OK) {
				return next(err);
			}
			if (info.p.length > 1) {
				throw "How did we end up with more than two paths?";
			}
			if (info.p.length) {
				if (info.p[0] !== 'c') {
					throw "How did we end up with paths other than 'c' and 'a'?";
				}
				return removeCPath();
			}
			return removeConflictInfo();
		}.bind(this));

	}.bind(this);

	var cleanDataset = function(dataset,next) {
		this.getDatakeysInDataset(dataset,function(err,datakeys) {
			if (err !== ERROR.OK) { return next(err); }
			var i = 0,
				todo = datakeys.length,
				terminated = false;

			var cleanDatakeyCallback = function(err) {
				if (err !== ERROR.OK) {
					if (terminated) {
						return;
					}
					terminated = true;
					return next(err);
				}
				if ((--todo === 0) && (!terminated)) {
					next(ERROR.OK);
				}
			};
			for (i=todo-1; i>=0; i--) {
				cleanDatakey(dataset,datakeys[i],cleanDatakeyCallback );
			}
		});
	}.bind(this);

	this._ps.getDatasetNames(function(err,datasets) {
		var i = 0,
			terminated = false,
			todo = datasets.length;

		var cleanDatasetCallback = function(err) {
			if (err !== ERROR.OK) {
				if (terminated) {
					return;
				}
				terminated = true;
				this._unlockFor(LOCKING.CLEANING);
				return done(err);
			}
			if ((--todo === 0) && (!terminated)) {
				this._ps.clean(function(err) {
					this._unlockFor(LOCKING.CLEANING);
					done(err);
				}.bind(this));
			}
		}.bind(this);
		if (err !== ERROR.OK) { 
			this._unlockFor(LOCKING.CLEANING);
			return done(err); 
		}
		for (i=todo-1; i>=0; i--) {
			cleanDataset(datasets[i],cleanDatasetCallback);
		}
		
	}.bind(this));

};

addEvents(SyncIt,['fed','advanced','added_to_queue']);
addLocking(SyncIt,LOCKING.MAXIMUM_BIT_PATTERN);

return SyncIt;

}));
