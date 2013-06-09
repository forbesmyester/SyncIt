
/*jshint smarttabs:true */
(function (root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	if (typeof exports === 'object') {
		module.exports = factory(
			require('../Constant.js')
		);
	} else if (typeof define === 'function' && define.amd) {
		define(
			['syncit/Constant'],
			factory
		);
	} else {
		root.SyncIt_Queue_Persist = factory(
			root.SyncIt_Constant
		);
	}
})(this, function (SyncIt_Constant) {

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

"use strict";

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

/**
 * ## Queue
 * 
 * *Queue* stores *operation*s which have been performed locally but are still waiting to
 * be applied to the *Server*.
 * 
 * Currently Queue is a bit basic in that it stores a giant array in the key `_queue` instead of storing them seperately. This is fine for Persists that use Memory and I have seen people saying that is the fastest way to use LocalStorage (though I wonder if it's size dependant). Still I do feel this is a bit of an overly basic implementation. I expect to improve this soon.
 * 
 * Note: All *Queue* must support at least the *Dataset* and *Datakey* filters. This class only supports those.
 */

/**
 * ### new Queue()
 * 
 * #### Parameters
 * 
 * * **@param {Persist} `persist`**
 * 
 * #### See
 * 
 * See [Persist](Persist.js) for more information
 */
var Queue = function(persist) {
	this._persist = persist;
};

/**
 * Queue._basicFilterMethod()
 * 
 * Filter out items based on a *Dataset* and *Datakey*.
 * 
 * Parameters
 * 
 * * **@param {Object} `filter`** Takes an Object like `{dataset: 'dataset_name', datakey: 'datakey_name`'} to filter by *Dataset* and *Datakey*.
 * * **@param {Array} `queueitems`** An array of *Queueitem* to filter.
 * * **@return {Array}** The *Queueitem* that passed the filter.
 */
Queue.prototype._basicFilterMethod = function(filter, queueitems) {
	
	var i = 0,
		l = 0,
		r = [];
	
	var filterFunc = function(queueitem) {
		if (filter.hasOwnProperty('dataset')) {
			if (queueitem.s !== filter.dataset) {
				return false;
			}
		}
		if (filter.hasOwnProperty('datakey')) {
			if (queueitem.k !== filter.datakey) {
				return false;
			}
		}
		return true;
	};
	
	var propertyNames = (function(ob) {
		var r = [];
		for (var k in ob) { if (ob.hasOwnProperty(k)) {
			r.push(k);
		} }
		return r;
	})(filter);
	
	for (i=0, l=propertyNames.length; i<l; i++) {
		if ((propertyNames[i] != 'dataset') && (propertyNames[i] != 'datakey')) {
			throw "Queue._basicFilterMethod: Can only filter on dataset and datakey";
		}
	}
	
	for (i=0, l=queueitems.length; i<l ;i++) {
		if (filterFunc(queueitems[i])) {
			r.push(queueitems[i]);
		}
	}
	return r;
};

/**
 * ### Queue.getFullQueue()
 * 
 * Gets all items from the Queue.
 * 
 * #### Parameters
 * 
 * * **@param {Function} `callback`** To get the results. Signature `function(err, results)`.
 *   * **@param {ErrorCode} `callback.err`** See SyncIt_Constant.Error.
 *   * **@param {Array} `callback.results`** An array of `queueitem`
 */
Queue.prototype.getFullQueue = function(callback) {
	return this._getQueue({}, callback);
};

/**
 * ### Queue.getItemsForDatasetAndDatakey()
 * 
 * Gets the items from the Queue which match both the Dataset and Datakey.
 * 
 * #### Parameters
 * 
 * * **@param {String} `dataset`**
 * * **@param {String} `datakey`**
 * * **@param {Function} `callback`** To get the results. Signature `function(err, results)`.
 *   * **@param {ErrorCode} `callback.err`** See SyncIt_Constant.Error.
 *   * **@param {Array} `callback.results`** An array of `queueitem`
 */
Queue.prototype.getItemsForDatasetAndDatakey = function(dataset, datakey, callback) {
	return this._getQueue({dataset: dataset, datakey: datakey}, callback);
};

/**
 * ### Queue.getDatakeyInDataset()
 * 
 * List all the Datakeys from a specific Dataset
 * 
 * #### Parameters
 * 
 * * **@param {String} `dataset`**
 * * **@param {Function} `callback`** To get the results. Signature `function(err, results)`.
 *   * **@param {ErrorCode} `callback.err`** See SyncIt_Constant.Error.
 *   * **@param {Array} `callback.results`** An array of Datakey
 */
Queue.prototype.getDatakeyInDataset = function(dataset, callback) {
	return this._getQueue({dataset: dataset}, function(err,queueitems) {
		if (err) {
			callback(err);
		};
		var i = 0,
			l = 0,
			r = [];
		for (i=0, l=queueitems.length; i<l; i++) {
			r.push(queueitems[i].k);
		}
		callback(err,r);
	});
};

/**
 * ### Queue._getQueue()
 * 
 * Gets the items from the Queue, respecting the supplied filter
 * 
 * #### Parameters
 * 
 * * **@param {Object} `filter`** Filtering parameters. See [basic filtering method](#queue._basicfiltermethod--)
 * * **@param {Function} `callback`** To get the results. Signature `function(err, results)`.
 *   * **@param {ErrorCode} `callback.err`** See SyncIt_Constant.Error.
 *   * **@param {Array} `callback.results`** An array of `queueitem`
 */
Queue.prototype._getQueue = function(filter, callback) {
	this._persist.get('_queue', function(err, queueitems) {
		
		if (err == SyncIt_Constant.Error.NO_DATA_FOUND) {
			queueitems = [];
			err = SyncIt_Constant.Error.OK;
		}
		
		if (err !== SyncIt_Constant.Error.OK) {
			callback(err);
		}
		
		callback(
			err,
			Queue.prototype._basicFilterMethod(filter, queueitems)
		);
	});
};

/**
 * **Queue._setQueue()**
 * 
 * **Parameters**
 * 
 * * **@param {Array} `queueitem`** The new `Queueitem`s
 * * **@param {Function} `callback`** Called when done
 */
Queue.prototype._setQueue = function(queueitem, callback) {
	return this._persist.set(
		'_queue',
		queueitem,
		callback
	);
};

/**

 * ### Queue.getCountInQueue()
 * 
 * Gets the count of items matching a Filter in the *Queue*.
 * 
 * #### Parameters
 * 
 * * **@param {Function} `retrieved`** Called when count retrieved. Signature: `function(err, length)`
 *   * **@param {ErrorCode} `retrieved.err`**
 *   * **@param {Number} `retrieved.length`** The amount of items in the list matching the filter
 */
Queue.prototype.getCountInQueue = function(retrieved) {
	this._getQueue({}, function(e, queue) {
		if (e !== SyncIt_Constant.Error.OK) {
			retrieved(e);
		}
		retrieved(e, queue.length);
	});
};

/**
 * ### Queue._removeByDatasetAndDatakey
 * 
 * Removes all *Queueitem* that have a specified *Dataset* and *Datakey*.
 * 
 * #### Parameters
 * 
 * * **@param {String} `dataset`**
 * * **@param {String} `datakey`**
 * * **@param {String} `whenRemoved`** Called when done. Signature: `function(err)`
 *   * **@param {ErrorCode} `whenRemoved.err`**
 */
Queue.prototype._removeByDatasetAndDatakey = function(dataset, datakey, whenRemoved) {
	var inst = this;
	inst._getQueue({}, function(e, queue) {
		if (e == SyncIt_Constant.Error.NO_DATA_FOUND) {
			return whenRemoved(e);
		}
		inst._setQueue(
			_filter(queue,function(update) {
				if (
					(update.s == dataset) && 
					(update.k == datakey)
				) {
					return false;
				}
				return true;
			}),
			whenRemoved
		);
	});
};

/**
 * ### Queue.push()
 * 
 * Add an item onto the end of the *Queue*.
 * 
 * #### Parameters
 * 
 * * **@param {queueitem} `value`**
 * * **@param {Function} `whenAddedAtEnd`** Called when added, Signature: `function(err)`
 *   * **@param {ErrorCode} `whenAddedAtEnd.err`**
 */
Queue.prototype.push = function(value, whenAddedAtEnd) {
	var inst = this;
	inst._getQueue({}, function(e, queue) {
		if (e) {
			whenAddedAtEnd(e);
		}
		queue.push(value);
		return inst._setQueue(queue, whenAddedAtEnd);
	});
};

/**

 * ### Queue.advance()
 * 
 * Remove the first value from the *Queue*, like `Array.shift()` except it does not
 * return the removed item.
 * 
 * #### Parameters
 * 
 * * **@param {Function} `done`** Called when complete. Signature: `function(err)`
 *   * **@param {ErrorCode} `done.err`**
 */
Queue.prototype.advance = function(done) {
	var inst = this;
	inst._getQueue({}, function(e, queue) {
		queue.shift();
		return inst._setQueue(queue, done);
	});
};

/**

 * ### Queue.getFirst()
 * 
 * Gets the first item in the *Queue*.
 * 
 * #### Parameters
 * 
 * * **@param {Function} `whenFirstElementRetrieved`** Called when got. Signature: `function(err, queueitem)`
 *   * **@param {ErrorCode} `whenFirstElementRetrieved.err`**
 *   * **@param {Queueitem} `whenFirstElementRetrieved.queueitem`**
 */
Queue.prototype.getFirst = function(whenFirstElementRetrieved) {
	this._getQueue({}, function(e, queue) {
		if (queue.length > 0) {
			return whenFirstElementRetrieved(e, queue[0]);
		}
		return whenFirstElementRetrieved(SyncIt_Constant.Error.NO_DATA_FOUND, null);
	});
};

/**

 * ### Queue.getDatasetNames()
 * 
 * Gets the names of *Dataset* within the *Queue*.
 * 
 * #### Parameters
 * 
 * * **@param {Function} `whenRetrieved`** Called when got. Signature: `function(err, datasets)`.
 *   * **@param {ErrorCode} `whenRetrieved.err`**
 *   * **@param {Array} `whenRetrieved.datasets`** An array of Dataset names.
 */
Queue.prototype.getDatasetNames = function(whenRetrieved) {
	this._getQueue({}, function(err, queue) {
		if (err) {
			return whenRetrieved(err);
		}
		var i = 0,
			r = [];
		for (i=0;i<queue.length;i++) {
			if (!r.hasOwnProperty(queue[i].s)) {
				r.push(queue[i].s);
			}
		}
		return whenRetrieved(err, r);
	});
};

return Queue;

});
