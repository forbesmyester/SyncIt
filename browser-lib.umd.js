!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.SyncItLib=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
module.exports = (function (SyncLocalStorage,makeAsync) {

"use strict";

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

/**
 * # AsyncLocalStorage
 *
 * An Asynchronous version of SyncLocalStorage, this is the base storage driver
 * for SyncIt.
 */
return  makeAsync(SyncLocalStorage,0);

}(_dereq_('./SyncLocalStorage'), _dereq_('./makeAsync.js')));

},{"./SyncLocalStorage":7,"./makeAsync.js":11}],2:[function(_dereq_,module,exports){
module.exports = (function () {

"use strict";

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: 2013 Matthew Forrester
// License: MIT/BSD-style

var Error = {};

/**
 Everything was normal.
*/
Error.OK = 0;

/**
 A request was made for data at a location, but that location contains no data.
*/
Error.NO_DATA_FOUND = -1;

/**
 Data wrote from journal into store, but we could not clear the journal record.
*/
Error.COULD_NOT_ADVANCE_QUEUE = 1;

/**
 Data wrote from journal into store, but we could not clear the journal record.
*/
Error.NOTHING_TO_ADVANCE_TO = 21;
Error.TRYING_TO_ADD_NON_DEFAULT_ROOT = 22;
Error.PATH_DOES_NOT_EXISTS = 22;
Error.MULTIPLE_PATHS_FOUND = 23;
/**
 The data is currently locked, please try again.
*/
Error.UNABLE_TO_PROCESS_BECAUSE_LOCKED = 2;

/**
 The data is currently locked for feeding, please try again.
*/
Error.UNABLE_TO_PROCESS_BECAUSE_FEED_LOCKED = 10;
Error.FEED_VERSION_ERROR = 24;

/**
 Trying to apply an update based on a version number higher than the current.
*/
Error.TRYING_TO_ADVANCE_TO_FUTURE_VERSION = 3;

/**
 Trying to apply an update based on a version which is no longer current.
*/
Error.TRYING_TO_APPLY_UPDATE_BASED_ON_OLD_VERSION = 4;

/**
 We are trying to apply an update that has already been.
*/
Error.TRYING_TO_APPLY_UPDATE_ALREADY_APPLIED = -2;

/**
 Trying to change data post delete
 */
Error.DATA_ALREADY_REMOVED = 8;

/**
 Trying to change data post delete
 */
Error.FEEDING_OUT_OF_DATE_BASEDONVERSION = 9;

/**
 Failure writing update.
*/
Error.FAILURE_WRITING_UPDATE = 5;

/**
 * Trying to Feed data into SyncIt, but without a version
 */
Error.FEED_REQUIRES_BASED_ON_VERSION = 6;

/**
 * A request was made to add a Queueitem, but it is based on an outdated version.
 */
Error.TRYING_TO_ADD_QUEUEITEM_BASED_ON_OLD_VERSION = 11;

/**
 * A request was made to add a Queueitem, but we already have it (note this may only happen for the latest!)
 */
Error.TRYING_TO_ADD_ALREADY_ADDED_QUEUEITEM = 12;

/**
 * For some reason, we are trying to add an item based on something that does not yet exist!
 */
Error.TRYING_TO_ADD_FUTURE_QUEUEITEM = 20;

/**
 * It is only possible to use `SyncIt.feed()` for Queueitem coming from elsewhere.
 */
Error.YOU_CANNOT_FEED_YOUR_OWN_CHANGES = 13;

/**
 * If you have local Queueitem that have been put into the Repository and not
 * applied locally, but are feeding Queueitem with a higher version.
 */
Error.BASED_ON_IN_QUEUE_LESS_THAN_BASED_IN_BEING_FED = 18;

/**
 * It might be that SyncIt had an item in the Queue that was applied but could not
 * be cleared. At this point you should call SyncIt.removeStaleFromQueue.
 */
Error.STALE_FOUND_IN_QUEUE = 19;

/**
 * Validation Error
 */
Error.INVALID_DATASET = 14;

/**
 * Validation Error
 */
Error.INVALID_DATAKEY = 15;

/**
 * Validation Error
 */
Error.INVALID_MODIFIER = 16;

/**
 * Validation Error
 */
Error.INVALID_OPERATION = 17;

/**
 * Trying to apply an update, but the queue is empty.
 */
Error.PATH_EMPTY = -3;

/**
 * When resolving conflict, we were told not to continue
 */
Error.NOT_RESOLVED = -4;

/**
 Trying to apply an update based on a version number higher than the current.
*/
Error.MUST_APPLY_SERVER_PATCH_BEFORE_LOCAL = 7;

var Location = {};

Location.IN_QUEUE = 1;

Location.IN_STORE = 2;

var Locking = {};

Locking.ADDING_TO_QUEUE = 1;

Locking.ADVANCING = 2;

Locking.FEEDING = 4;

Locking.CLEANING = 8;

Locking.MAXIMUM_BIT_PATTERN = 15;

var Validation = {};

Validation.DATASET_REGEXP = /^[A-Za-z][A-Za-z0-9\-]+$/;

Validation.DATAKEY_REGEXP = /^[A-Za-z][A-Za-z0-9\-]+$/;

Validation.MODIFIER_REGEXP = /^[A-Za-z][A-Za-z0-9\-]+$/;

Validation.OPERATION_REGEXP = /^(set)|(update)|(remove)$/;

/**
 * These identify different types of information found while navigating a path.
 */
var FollowInformationType = {};
FollowInformationType.INFO = 1;
FollowInformationType.ROOTITEM = 2;
FollowInformationType.PATHITEM = 3;
FollowInformationType.OTHER_PATHS = 4;

return {
	Error: Error,
	Location: Location,
	Locking: Locking,
	Validation: Validation,
	FollowInformationType: FollowInformationType
};

}());

},{}],3:[function(_dereq_,module,exports){
module.exports = (function () {
	
"use strict";

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

/**
 * LocalStorage Mock
 */

var FakeLocalStorage = function() {
    this.data = {};
	this.keys = [];
};

FakeLocalStorage.prototype.setItem = function(k,v) {
	this.data[k] = v;
	this._regen();
};

FakeLocalStorage.prototype._regen = function() {
	this.keys = [];
	this.length = 0;
	for (var k in this.data) {
		if (this.data.hasOwnProperty(k)) {
			this.keys.push(k);
		}
	}
	this.keys = this.keys.sort();
	this.length = this.keys.length;
};

FakeLocalStorage.prototype.clear = function() {
    this.data = {};
	this._regen();
};

FakeLocalStorage.prototype.key = function(i) {
	if (i < this.length) {
		return this.keys[i];
	}
	return null;
};

FakeLocalStorage.prototype.getItem = function(k) {
    if (!this.data.hasOwnProperty(k)) {
        return null;
    }
    return this.data[k];
};

FakeLocalStorage.prototype.removeItem = function(key) {
	if (this.data.hasOwnProperty(key)) {
		delete this.data[key];
		this._regen();
	}
};

return FakeLocalStorage;

}());

},{}],4:[function(_dereq_,module,exports){
module.exports = (function(SyncIt_Constant,addEvents) {

"use strict";

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

var ERROR = SyncIt_Constant.Error;
var FOLLOW_INFORMATION_TYPE = SyncIt_Constant.FollowInformationType;

/**
 * ## new SyncIt_Path_AsyncLocalStorage()
 *
 * Constructor.
 *
 * * **@param {AsyncLocalStorage} `asyncLocalStorage`**
 * * **@param {TLEncoderDecoder} `tLEncoderDecoder`**
 */
var Als = function(asyncLocalStorage,tLEncoderDecoder) {
	this._ls = asyncLocalStorage;
	this._ed = tLEncoderDecoder;
};

/**
 * ## SyncIt_Path_AsyncLocalStorage.getKeyTimeDecoder()
 *
 * The instance has an internal Function that is used to generate a portion
 * of the keys based on the current time. This is Function externally 
 * accessible so that that key can be converted back into a timestamp.
 *
 * TODO: I don't think that this should be here really, look at removing it...
 *
 * * **@return {Function}**
 */
Als.prototype.getKeyTimeDecoder = function(){
	return function(key) {
		if ([1,3].indexOf(key.split(".").length) === -1) {
			return false;
		}
		return this._ed.decode(key.replace(/.*\./,''));
	}.bind(this);
};

/**
 * ## SyncIt_Path_AsyncLocalStorage.getRootItem()
 *
 * Gets a Pathroot stored at a specific Dataset / Datakey / Path.
 *
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Path} `path`**
 * * **@param {Function} `next`** Signature: Function(err, rootitem)
 *   * **@param {Errorcode} `err`**
 *   * **@param {Pathroot} `rootitem`**
 */
Als.prototype.getRootItem = function(dataset,datakey,path,next) {
	this._getRoot(dataset,datakey,function(err,root) {
		if (!root.hasOwnProperty(path)) {
			return next(ERROR.NO_DATA_FOUND);
		}
		if (!root[path].hasOwnProperty('_s')) {
			return next(ERROR.NO_DATA_FOUND);
		}
		return next(ERROR.OK,this._removePrivatePathStorageData(root[path]));
	}.bind(this));
};

/**
 * ## SyncIt_Path_AsyncLocalStorage.getInfo()
 *
 * The Root can store information, this will function retrieve that information.
 *
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Function} `next`** Signature: Function(err)
 *   * **@param {Errorcode} `err`**
 *   * **@param {Object} `info`** The information stored within the Root.
 */
Als.prototype.getInfo = function(dataset,datakey,next) {
	this._getRoot(dataset,datakey,function(err,root) {
		if (err === ERROR.NO_DATA_FOUND) {
			err = ERROR.OK;
			root = {};
		}
		if (err !== ERROR.OK) {
			return next(err);
		}
		if (!root.hasOwnProperty('_i')) {
			return next(err,{});
		}
		return next(err,root._i);
	}.bind(this));
};

/**
 * ## SyncIt_Path_AsyncLocalStorage.setInfo()
 *
 * The Root can store information, this will function set that information.
 *
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Object} `info`** The Information to put in the Root
 * * **@param {Function} `next`** Signature: Function(err)
 *   * **@param {Errorcode} `err`**
 */
Als.prototype.setInfo = function(dataset,datakey,info,next) {
	this._getRoot(dataset,datakey,function(err,root) {

		var empty = true,
			k = '';

		if (err === ERROR.NO_DATA_FOUND) {
			err = ERROR.OK;
			root = {};
		}
		if (err !== ERROR.OK) {
			return next(err);
		}
		root._i = info;
		for (k in info) {
			if (info.hasOwnProperty(k)) {
				empty = false;
			}
		}
		if (empty) {
			delete root._i;
		}
		this._setRoot(dataset,datakey,root,next);
	}.bind(this));

};

/**
 * ## SyncIt_Path_AsyncLocalStorage.setPathroot()
 *
 * Will set a Pathroot.
 *
 * Note. This is a low level function and it the Pathitem linked to it will be
 * lost.
 *
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Path} `path`**
 * * **@param {Object} `data`** What to put into the Pathroot
 * * **@param {Function} `next`** Signature: Function(err)
 *   * **@param {Errorcode} `err`**
 */
Als.prototype.setPathroot = function(dataset,datakey,path,data,next) {
	this._getRoot(dataset,datakey,function(err,root) {
		if (err === ERROR.NO_DATA_FOUND) {
			err = ERROR.OK;
			root = {};
		}
		if (err !== ERROR.OK) {
			return next(err);
		}
		root[path] = data;
		root[path]._s = true;
		this._setRoot(dataset,datakey,root,next);
	}.bind(this));
};

/**
 * ## SyncIt_Path_AsyncLocalStorage.advance()
 *
 * Will advance the Path (which is like a queue) for a specific Dataset / Datakey.
 *
 * This function will call `calcNewRootOfPath` with the Pathroot and first
 * Pathitem within that Dataset / Datakey which itself should should call it's
 * own callback with the result of applying the first Pathitem onto the
 * Pathroot. Once this callback has been called the Pathroot will be 
 * set to that result.
 *
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Boolean} `removeOld`** If this is True the old Pathitem will be
 *	removed, however this will be __after__ `next()` is called.
 * * **@param {Function} `calcNewRootOfPath`** This callback will be fired so
 *	that the new Pathroot can be calculated.
 * * **@param {Pathroot} `calcNewRootOfPath.pathroot`** The current Pathroot
 * * **@param {String} `calcNewRootOfPath.nameOfPath`** The name of the Path
 *	that is being advanced.
 * * **@param {Pathitem} `calcNewRootOfPath.firstPathitem`** The first
 *	PathItem in the Path.
 * * **@param {Function} `calcNewRootOfPath.newRootCalculated`**
 *	calcNewRootOfPath should call this function when the new Pathroot has been
 *	calculated. Signature: Function(newPathroot)
 * * **@param {Function} `calcNewRootOfPath.newRootCalculated.newPathroot`** The
 *	value that the new Pathroot will
 * * **@param {Function} `next`** Signature: Function(err)
 *   * **@param {Errorcode} `err`**
 */
Als.prototype.advance = function(dataset,datakey,removeOld,calcNewRootOfPath,next) {
	this._getRoot(dataset,datakey,function(err,root) {
		var path = null,
			k = '';
		if (err !== ERROR.OK) {
			return next(err);
		}
		for (k in root) {
			if (root.hasOwnProperty(k) && k.match(/^[a-z]$/)) {
				if (path !== null) {
					return next(ERROR.MULTIPLE_PATHS_FOUND);
				}
				path = k;
			}
		}
		if (path === null) {
			return next(ERROR.NOTHING_TO_ADVANCE_TO);
		}
		this._getPathItem(dataset,datakey,root[path]._n,function(err,item) {
			if (err !== ERROR.OK) {
				return next(err);
			}
			calcNewRootOfPath(
				root[path].hasOwnProperty('_s') ? this._removePrivatePathStorageData(root[path]) : null,
				root[path]._n,
				item,
				function(newRoot) {
					if (newRoot === null) {
						// This is a request to delete the whole Path
						return this.removeDatasetDatakey(dataset, datakey, function(err) {
							if (err) { return next(err); }
							next(
								err,
								this._removePrivatePathStorageData(item),
								null
							);
						}.bind(this));
					}
					newRoot._s = true;
					if (item.hasOwnProperty('_n')) {
						newRoot._n = item._n;
					}
					var toDelete = root[path]._n;
					root[path] = newRoot;
					this._setRoot(dataset,datakey,root,function(err) {
						this._emit('advance',dataset,datakey,root);
						next(
							err,
							this._removePrivatePathStorageData(item),
							this._removePrivatePathStorageData(root[path])
						);
						if ((err === ERROR.OK) && (removeOld)) {
							this._removePathItem(dataset,datakey,toDelete,function() {});
						}
					}.bind(this));
				}.bind(this)
			);
		}.bind(this));
	}.bind(this));
};

/**
 * ## SyncIt_Path_AsyncLocalStorage.removePathitemFromPath()
 *
 * Will remove all Pathitem in a specific Path for a Dataset / Datakey.
 *
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Path} `path`**
 * * **@param {Boolean} `removeOld`** If this is True the old Pathitem will be
 *	removed, however this will be __after__ `next()` is called.
 * * **@param {Function} `next`** Signature: Function(err)
 *   * **@param {Errorcode} `err`**
 */
Als.prototype.removePathitemFromPath = function(dataset,datakey,path,removeOld,next) {
	this._getRoot(dataset,datakey,function(err,root) {
		if (err !== ERROR.OK) {
			return next(err);
		}
		if (!root.hasOwnProperty(path)) {
			return next(ERROR.PATH_DOES_NOT_EXISTS );
		}
		if (!root[path].hasOwnProperty('_n')) {
			return next(ERROR.OK);
		}
		var toRemove = root[path]._n;
		delete root[path]._n;
		this._setRoot(dataset,datakey,root,function() {
			this._emit('change-root',dataset,datakey,root);
			next(ERROR.OK);
			if (removeOld) {
				this._removePathItems(dataset,datakey,toRemove,function() {});
			}
		}.bind(this));
	}.bind(this));
};

/**
 * ## SyncIt_Path_AsyncLocalStorage.changePath()
 * 
 * Will move all Pathitem from `fromPath` to `toPath`, unhooking and 
 * potentially removing all existing data in `toPath`
 *
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {String} `fromPath`** Items will be moved from this Path
 * * **@param {String} `toPath`** Items will be moved into this Path, unhooking
 *	and perhaps deleting (see `removeOld`) items already existing there.
 * * **@param {Boolean} `removeOld`** If this is True the old Pathitem will be
 *	removed, however this will be __after__ `next()` is called.
 * * **@param {Function} `next`** Signature: Function(err)
 *   * **@param {Errorcode} `err`**
 */
Als.prototype.changePath = function(dataset,datakey,fromPath,toPath,removeOld,next) {
	this._getRoot(dataset,datakey,function(err,root) {
		var toRemove = false;
		if (err !== ERROR.OK) {
			return next(err);
		}
		if (!root.hasOwnProperty(fromPath)) {
			return next(ERROR.PATH_DOES_NOT_EXISTS );
		}
		if (!root[fromPath].hasOwnProperty('_n')) {
			return next(ERROR.PATH_DOES_NOT_EXISTS );
		}
		if (
			removeOld &&
			root.hasOwnProperty(toPath) && 
			root[toPath].hasOwnProperty('_n')
		) {
			toRemove = root[toPath]._n;
		}
		root[toPath]._n = root[fromPath]._n;
		delete root[fromPath];
		this._setRoot(dataset,datakey,root,function() {
			this._emit('change-path',fromPath,toPath);
			next(ERROR.OK);
			if (toRemove) {
				this._removePathItems(dataset,datakey,toRemove,function() {});
			}
		}.bind(this));
	}.bind(this));
};

/**
 * ## SyncIt_Path_AsyncLocalStorage.promotePathToOrRemove()
 * 
 * When the server feeds a "remove" instruction it is still possible to pass in
 * extra updates etc from the conflict resolution function. If we go and just
 * delete the Root we will loose this extra information. This function will see
 * if there are any conflict resolution updates (`pathToPromote` or "c") and if
 * there are it will move them onto the normal data path (`promoteToWhere` or
 * "a") but if there are none then it will just remove the root.
 *
 * * **@param {Datakey} `dataset`** The dataset you want to purge
 * * **@param {Datakey} `datakey`** The datakey you want to purge
 * * **@param {Datakey} `pathToPromote`** If this exists it will be moved to `promoteToWhere`
 * * **@param {Datakey} `promoteToWhere`** Where `pathToPromote` will be moved to
 * * **@param {Function} `next`** Callback when complete, Signature: Function(err, err)
 *   * **@param {Errorcode} `errRootDeletion`** If the Root was successfully deleted
 */
Als.prototype.promotePathToOrRemove = function(dataset,datakey,pathToPromote,promoteToWhere,next) {
	
	this._getRoot(dataset,datakey,function(err,root) {
		var oldTargetRef = (function() {
				if (root.hasOwnProperty(promoteToWhere) && root[promoteToWhere].hasOwnProperty('_n')) {
					return root[promoteToWhere]._n;
				}
				return null;
			}());
		
		if (!root.hasOwnProperty(pathToPromote)) {
			return this.removeDatasetDatakey(dataset,datakey,next);
		}
		root[promoteToWhere] = root[pathToPromote];
		delete root[pathToPromote];
		this._setRoot(dataset,datakey,root,function() {
			if (oldTargetRef === null) {
				return next(ERROR.OK,ERROR.OK);
			}
			this._removePathItems(dataset,datakey,oldTargetRef,function(err) {
				return next(ERROR.OK,err);
			});
		}.bind(this));
	}.bind(this));
};

/**
 * ## SyncIt_Path_AsyncLocalStorage.removeDatasetDatakey()
 *
 * Remove all data to do with a Dataset and Datakey
 *
 * * **@param {Datakey} `dataset`** The dataset you want to purge
 * * **@param {Datakey} `datakey`** The datakey you want to purge
 * * **@param {Function} `next`** Callback when complete, Signature: Function(err, err)
 *   * **@param {Errorcode} `errRootDeletion`** If the Root was successfully deleted
 */
Als.prototype.removeDatasetDatakey = function(dataset,datakey,next) {
	
	var _getPathRefs = function(root) {
		var r = [];
		for (var k in root) {
			if (root.hasOwnProperty(k) && k.length == 1) {
				if (root[k].hasOwnProperty('_n')) {
					r.push(root[k]._n);
				}
			}
		}
		return r;
	};
	
	this._getRoot(dataset,datakey,function(err,root) {
		var pathRefs = _getPathRefs(root),
			pathRefCount = pathRefs.length;
		
		var trackPathItemDeletions = function(err) {
			if (err !== ERROR.OK) {
				pathRefCount = -1;
				return next(err);
			}
			if (--pathRefCount === 0) {
				return next(ERROR.OK);
			}
		};
		
		this.__removeItem(dataset + '.' + datakey, function(err) {
			if ((pathRefs.length === 0) || (err !== ERROR.OK)) {
				return next(err);
			}
			for (var i=0, l=pathRefs.length; i<l; i++) {
				this._removePathItems(
					dataset,
					datakey,
					pathRefs[i],
					trackPathItemDeletions
				);
			}
		}.bind(this));
	}.bind(this));
};

/**
 * ## SyncIt_Path_AsyncLocalStorage.removePath()
 *
 * Removes all Pathitem and the Pathroot within a specific Dataset / Datakey /
 * Path.
 *
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Path} `path`**
 * * **@param {Boolean} `removeOld`** If this is True the old Pathitem will be
 *	removed, however this will be __after__ `next()` is called.
 * * **@param {Function} `next`** Signature: Function(err)
 *   * **@param {Errorcode} `err`**
 */
Als.prototype.removePath = function(dataset,datakey,path,removeOld,next) {
	this._getRoot(dataset,datakey,function(err,root) {
		var toRemove = false;
		if (err !== ERROR.OK) {
			return next(err);
		}
		if (!root.hasOwnProperty(path)) {
			return next(ERROR.PATH_DOES_NOT_EXISTS );
		}
		if (!root[path].hasOwnProperty('_n')) {
			return next(ERROR.PATH_DOES_NOT_EXISTS );
		}
		toRemove = root[path]._n;
		delete root[path];
		this._setRoot(dataset,datakey,root,function() {
			this._emit('set-root',dataset,datakey,root);
			next(ERROR.OK);
			if (removeOld) {
				this._removePathItems(dataset,datakey,toRemove,function() {});
			}
		}.bind(this));
	}.bind(this));
};

/**
 * ## SyncIt_Path_AsyncLocalStorage._removePathItems()
 *
 * Attempts to remove a Pathitem at a specific Dataset / Datakey / Reference
 * and then recursively remove all it's child Pathitem.
 *
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Reference} `ref`**
 * * **@param {Function} `next`** Signature: Function(err)
 *   * **@param {Errorcode} `err`**
 */
Als.prototype._removePathItems = function(dataset,datakey,ref,next) {
	
	var removeAndTry = function(ref) {
		this._getPathItem(dataset,datakey,ref,function(err,item) {
			var nextRef;
			if (err !== ERROR.OK) {
				return next(err);
			}
			if (item.hasOwnProperty('_n')) {
				nextRef = item._n;
			}
			this._removePathItem(dataset,datakey,ref,function(err) {
				if ((err !== ERROR.OK) || (nextRef === undefined)) {
					return next(err);
				}
				return removeAndTry(nextRef);
			});
		}.bind(this));
	}.bind(this);

	removeAndTry(ref);
};

/**
 * ## SyncIt_Path_AsyncLocalStorage._removePathItem()
 *
 * Removes a Pathitem at a specific Dataset / Datakey / Reference.
 *
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Reference} `reference`**
 * * **@param {Function} `next`** Signature: Function(err)
 *   * **@param {Errorcode} `err`**
 */
Als.prototype._removePathItem = function(dataset,datakey,reference,next) {
	var k = [dataset,datakey,reference].join('.');
	this.__removeItem(k,next);
};

var validateDatesetOrDatakey = function(str) {
	if (typeof str !== 'string') { return false; }
	if (str.length < 2) { return false; }
	if (str.indexOf('.') > -1) { return false; }
	return true;
};
/**
 * ## SyncIt_Path_AsyncLocalStorage._setRoot()
 *
 * Sets a Root at a Dataset / Datakey.
 *
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Object} `value`**
 * * **@param {Function} `next`** Signature: Function(err)
 *   * **@param {Errorcode} `err`**
 */
Als.prototype._setRoot = function(dataset,datakey,value,next) {
	if (!validateDatesetOrDatakey(dataset)) {
		return next(ERROR.INVALID_DATASET);
	}
	if (!validateDatesetOrDatakey(datakey)) {
		return next(ERROR.INVALID_DATAKEY);
	}
	this.__setItem([dataset,datakey].join('.'),value,next);
};

/**
 * ## SyncIt_Path_AsyncLocalStorage._setPathItem()
 *
 * Sets a Pathitem at a specific Dataset / Datakey / Reference.
 *
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Reference} `reference`**
 * * **@param {Object} `value`**
 * * **@param {Function} `next`** Signature: Function(err)
 *   * **@param {Errorcode} `err`**
 */
Als.prototype._setPathItem = function(dataset,datakey,reference,value,next) {
	if (!validateDatesetOrDatakey(dataset)) {
		return next(ERROR.INVALID_DATASET);
	}
	if (!validateDatesetOrDatakey(datakey)) {
		return next(ERROR.INVALID_DATAKEY);
	}
	this.__setItem([dataset,datakey,reference].join('.'),value,next);
};

/**
 * ## SyncIt_Path_AsyncLocalStorage.__setItem()
 *
 * Low level function for setting data at a key within the underlying storage.
 *
 * * **@param {String} `storageKey`**
 * * **@param {Object} `value`**
 * * **@param {Function} `next`** Signature: Function(err)
 *   * **@param {Errorcode} `err`**
 */
Als.prototype.__setItem = function(storageKey,value,next) {
	this._ls.setItem(storageKey,value,function() {
		this._emit('set-item',storageKey,value);
		next(ERROR.OK);
	}.bind(this));
};

/**
 * ## SyncIt_Path_AsyncLocalStorage.__removeItem()
 *
 * Low level function for removing data at a key within the underlying storage.
 *
 * * **@param {String} `storageKey`**
 * * **@param {Function} `next`** Signature: Function(err)
 *   * **@param {Errorcode} `err`**
 */
Als.prototype.__removeItem = function(storageKey,next) {
	this._ls.removeItem(storageKey, function() {
		this._emit('remove-item',storageKey);
		next(ERROR.OK);
	}.bind(this));
};

/**
 * ## SyncIt_Path_AsyncLocalStorage._getPathItem()
 *
 * Gets a Pathitem.
 *
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Reference} `reference`**
 * * **@param {Function} `next`** Signature: Function(err)
 *   * **@param {Errorcode} `err`**
 */
Als.prototype._getPathItem = function(dataset,datakey,reference,next) {
	this.__getItem([dataset,datakey,reference].join('.'),next);
};

/**
 * ## SyncIt_Path_AsyncLocalStorage._getRoot()
 *
 * Gets a Root at a Dataset / Datakey.
 *
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Function} `next`** Signature: Function(err)
 *   * **@param {Errorcode} `err`**
 */
Als.prototype._getRoot = function(dataset,datakey,next) {
	this.__getItem([dataset,datakey].join('.'),next);
};

/**
 * ## SyncIt_Path_AsyncLocalStorage.__getItem()
 *
 * Low level function for getting data at a key within the underlying storage.
 *
 * * **@param {String} `storageKey`**
 * * **@param {Function} `next`** Signature: Function(err)
 *   * **@param {Errorcode} `err`**
 */
Als.prototype.__getItem = function(storageKey,next) {
	this._ls.getItem(storageKey,function(item) {
		if (!item) {
			return next(ERROR.NO_DATA_FOUND);
		}
		return next(ERROR.OK,item);
	}.bind(this));
};

/**
 * ## SyncIt_Path_AsyncLocalStorage._removePrivatePathStorageData()
 *
 * SyncIt_Path_AsyncLocalStorage will store data for it's own purposes within
 * the Root or Pathitem which will start with an "_", this function will filter
 * that information out and is used to help make sure that data is presented
 * correctly to the outside world.
 *
 * * **@param {Object} `ob`**
 */
Als.prototype._removePrivatePathStorageData = function(ob) {
	var r = {};
	for (var k in ob) {
		if (!k.match(/^_/) && ob.hasOwnProperty(k)) {
			r[k] = ob[k];
		}
	}
	return r;
};

/**
 * ## SyncIt_Path_AsyncLocalStorage._fireFollowInformationTypeForRoot()
 *
 * Both `SyncIt_Path_AsyncLocalStorage.push()` and 
 * `SyncIt_Path_AsyncLocalStorage.followPath()` fire a callback multiple times
 * as they progress through from the Pathroot through all Pathitem within that
 * Dataset / Datakey. The callbacks between these functions should be 
 * consistent so this function is used called as a step towards unifying the
 * code to fire that callback.
 *
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Root} `root`**
 * * **@param {Path} `path`**
 * * **@param {Function} `func`**
 * * **@return {Number}** The first non-zero Errorcode return by func (note, 
 *		it still continues running).
 */
Als.prototype._fireFollowInformationTypeForRoot = function(dataset,datakey,root,path,func) {
	var err = ERROR.OK;

	var perhapsSetErr = function(inErr) {
		if (err === ERROR.OK) {
			err = inErr;
		}
	};

	var key = [dataset,datakey].join('.') + ':' + path;
	if (root.hasOwnProperty('_i')) {
		perhapsSetErr(
			func(
				key,
				this._removePrivatePathStorageData(root._i),
				FOLLOW_INFORMATION_TYPE.INFO
			)
		);
	}

	if (root[path].hasOwnProperty('_s')) {
		perhapsSetErr(
			func(
				key,
				this._removePrivatePathStorageData(root[path]),
				FOLLOW_INFORMATION_TYPE.ROOTITEM
			)
		);
	}

	var paths = [];
	for (var k in root) {
		if ((k !== path) && root.hasOwnProperty(k) && k.match(/^[a-z]$/)) {
			paths.push(k);
		}
	}

	perhapsSetErr(
		func(
			key,
			paths,
			FOLLOW_INFORMATION_TYPE.OTHER_PATHS
		)
	);

	return err;
};

/**
 * ## SyncIt_Path_AsyncLocalStorage._calculateLink()
 *
 * Gets a presentable version the link between Pathitem given a Dataset, 
 * Datakey and Reference.
 *
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Reference} `reference`**
 */
Als.prototype._calculateLink = function(dataset,datakey,reference) {
	return [dataset,datakey,reference].join('.');
};

/**
 * ## SyncIt_Path_AsyncLocalStorage.followPath()
 *
 * Will follow all the way from Pathroot through to the final Pathitem of a
 * Dataset / Datakey / Path calling `forEvery` for every piece of information
 * found.
 * 
 * Currently supported information types can be found by looking in 
 * SyncIt_Constant.FollowInformationType.
 *
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Path} `path`**
 * * **@param {Function} `forEvery`** Signature(key, data, informationType)
 *   * **@param {String} `key`** The current key of the underlying storage, will
 *		be [dataset].[datakey]:[path] for Pathroot.
 *   * **@param {Object} `data`** The `informationType` stored at `key`.
 *   * **@param {Number} `informationType`** The type of data that the callback
 *		has been called for.
 * * **@param {Function} `next`** Signature: Function(err) This will be called
 *		when reading has finished.
 *   * **@param {Errorcode} `err`**
 */
Als.prototype.followPath = function(dataset,datakey,path,forEvery,next) {

	this._getRoot(dataset,datakey,function(err,root) {
		
		if (err !== ERROR.OK) {
			return next(err);
		}
		
		if (!root.hasOwnProperty(path)) {
			return next(ERROR.NO_DATA_FOUND);
		}
		
		this._fireFollowInformationTypeForRoot(dataset,datakey,root,path,forEvery);
		
		if (!root[path].hasOwnProperty('_n')) {
			return next(ERROR.OK);
		}

		var follow = function(ref) {
			this._getPathItem(dataset,datakey,ref,function(err,item) {
				if (err !== ERROR.OK) {
					return next(err);
				}
				var nextRef;
				if (item.hasOwnProperty('_n')) {
					nextRef = item._n;
				}
				forEvery(
					this._calculateLink(dataset,datakey,ref),
					this._removePrivatePathStorageData(item),
					FOLLOW_INFORMATION_TYPE.PATHITEM
				);
				if (nextRef === undefined) {
					return next(err);
				}
				return follow(nextRef);
			}.bind(this));
		}.bind(this);

		follow(root[path]._n);

	}.bind(this));

};

/**
 * ## SyncIt_Path_AsyncLocalStorage._createAnonymousPath()
 *
 * Adds Pathitem which are connected to each other, but nothing else.
 *
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Array} `pathitems`** An array of Pathitem.
 * * **@param {Function} `next`** Signature: Function(err)
 *   * **@param {Errorcode} `err`**
 */
Als.prototype._createAnonymousPath = function(dataset,datakey,pathitems,next) {

	var refs = new Array(pathitems.length),
		len = 0,
		pos = 0;
	
	for (pos = 0, len = pathitems.length; pos < len; pos++) {
		refs[pos] = this._ed.encode();
	}

	pos = pathitems.length-1;
	var pushOne = function() {

		if (pos < 0) {
			return next(ERROR.OK,refs[0]);
		}

		if (pos !== pathitems.length - 1) {
			pathitems[pos]._n = refs[pos+1];
		}
		this._setPathItem(dataset,datakey,refs[pos],pathitems[pos],function(err) {
			if (err !== ERROR.OK) {
				return next(err);
			}
			pos--;
			pushOne();
		});

	}.bind(this);

	pushOne();
};

/**
 * ## SyncIt_Path_AsyncLocalStorage.pushPathitemsToNewPath()
 *
 * Will add a series of Pathitem to a Path, that path must not already exist.
 *
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Path} `path`**
 * * **@param {Array} `pathitems`** Array of Pathitem
 * * **@param {Function} `next`** Signature: Function(err)
 *   * **@param {Errorcode} `err`**
 */
Als.prototype.pushPathitemsToNewPath = function(dataset,datakey,path,pathitems,next) {
	
	this._getRoot(dataset,datakey,function(err,root) {
		if (err === ERROR.NO_DATA_FOUND) {
			err = ERROR.OK;
			root = {};
		}
		if (root.hasOwnProperty(path)) {
			return next(ERROR.PATH_ALREADY_EXISTS);
		}
		this._createAnonymousPath(dataset,datakey,pathitems,function(err,firstRef) {
			root[path] = {_n: firstRef};
			this._setRoot(dataset,datakey,root,next);
		}.bind(this));
	}.bind(this));
};

/**
 * ## SyncIt_Path_AsyncLocalStorage.push()
 *
 * Adds a Pathitem to a Path, unless there is no Pathroot, in which case a
 * Pathroot will be created.
 *
 * * **@param {Dataset} `dataset`**
 * * **@param {Datakey} `datakey`**
 * * **@param {Path} `path`**
 * * **@param {Pathitem} `pathitem`**
 * * **@param {Boolean} `mustBeSinglePath`** If this is true then adding will
 *		fail if there is more than one Path.
 * * **@param {Function} `forEvery`** Called for the Pathroot and Pathitem upto
 *		the point that the Pathitem is added, it will also then be called for
 *		the new `Pathitem`. If this function does not return 
 *		SyncIt_Constant.Error.OK then `push()` will terminate with that Errorcode.
 *		See SyncIt_Path_AsyncLocalStorage.followPath() for further information.
 * * **@param {Function} `next`** Signature: Function(err)
 *   * **@param {Errorcode} `err`**
 */
Als.prototype.push = function(dataset,datakey,path,pathitem,mustBeSinglePath,forEvery,next) {
	
	var doNext = function(err,reference) {
		if (err === ERROR.OK) {
			this._emit('push',reference,pathitem);
			forEvery(
				this._calculateLink(dataset,datakey,reference),
				pathitem,
				FOLLOW_INFORMATION_TYPE.PATHITEM
			);
		}
		next(err,(err === ERROR.OK) ? pathitem : undefined);
	}.bind(this);
	
	var updateChildPointer = function(dataset,datakey,reference, toReference) {
		this._getPathItem(dataset,datakey,reference,function(err,item) {
			if (err !== ERROR.OK) {
				return doNext(ERROR.NO_DATA_FOUND,reference);
			}
			item._n = toReference;
			this._setPathItem(dataset,datakey,reference,item,function(err) {
				doNext(err,toReference);
			});
		}.bind(this));
	}.bind(this);

	var follow = function(dataset,datakey,tlid,lastitem) {
		if (!lastitem.hasOwnProperty('_n')) {
			var reference = this._ed.encode();
			return this._setPathItem(dataset,datakey,reference,pathitem,function(err) {
				if (err !== ERROR.OK) {
					doNext(err,reference);
				}
				updateChildPointer(dataset,datakey,tlid,reference);
			}.bind(this));
		}
		this._getPathItem(dataset,datakey,lastitem._n,function(err,item) {
			if (err !== ERROR.OK) {
				doNext(err,lastitem._n);
			}
			err = forEvery(
				this._calculateLink(dataset,datakey,lastitem._n),
				this._removePrivatePathStorageData(item),
				FOLLOW_INFORMATION_TYPE.PATHITEM
			);
			if (err !== ERROR.OK) {
				return doNext(err);
			}
			return follow(dataset,datakey,lastitem._n, item);
		}.bind(this));
	}.bind(this);
	
	this._getRoot(dataset,datakey,function(err,root) {
		var kCount = 0;
		if (err === ERROR.NO_DATA_FOUND) {
			root = {};
		}
		if ((err === ERROR.NO_DATA_FOUND) || (!root.hasOwnProperty(path))) {
			root[path] = {};
		}
		if (mustBeSinglePath) {
			for (var k in root) {
				if (k.match(/^[a-z]$/) || root.hasOwnProperty('k')) {
					if (++kCount == 2) {
						return next(ERROR.MULTIPLE_PATHS_FOUND);
					}
				}
			}
		}
		err = this._fireFollowInformationTypeForRoot(dataset,datakey,root,path,forEvery);
		if (err !== ERROR.OK) {
			return doNext(err);
		}
		if (!root[path].hasOwnProperty('_n')) {
			var reference = this._ed.encode();
			return this._setPathItem(dataset,datakey,reference,pathitem,function(err) {
				if (err !== ERROR.OK) { return doNext(err,reference); }
				root[path]._n = reference;
				return this._setRoot(dataset,datakey,root,function(err) {
					doNext(err,reference);
				});
			}.bind(this));
		}
		return this._getPathItem(dataset,datakey,root[path]._n,function(err,item) {
			if (err !== ERROR.OK) {
				doNext(err,root[path]._n);
			}
			err = forEvery(
				this._calculateLink(dataset,datakey,root[path]._n),
				this._removePrivatePathStorageData(item),
				FOLLOW_INFORMATION_TYPE.PATHITEM
			);
			if (err !== ERROR.OK) {
				return doNext(err);
			}
			return follow(dataset,datakey,root[path]._n,item);
		}.bind(this));
	}.bind(this));

};

/**
 * ## SyncIt_Path_AsyncLocalStorage.getDatasetNames()
 *
 * Lists Dataset names.
 *
 * * **@param {Function} `next`** Signature: Function(err,datasets)
 *   * **@param {Errorcode} `err`**
 *   * **@param {Array} `datasets`** An array of Dataset names.
 */
Als.prototype.getDatasetNames = function(next) {

	this._ls.findKeys('*.*',function(datasetDatakey) {
		var i = 0,
			l = 0,
			k = '',
			r = [];
		for (i=0, l=datasetDatakey.length; i<l; i++) {
			k =datasetDatakey[i].split('.');
			if (r.indexOf(k[0]) === -1) {
				r.push(k[0]);
			}
		}
		return next(ERROR.OK,r);
	}.bind(this));

};

/**
 * ## SyncIt_Path_AsyncLocalStorage.getDatakeysInDataset()
 *
 * Lists the Datakeys within a Dataset.
 *
 * * **@param {Dataset} `dataset`**
 * * **@param {Function} `next`** Signature: Function(err,datakeys)
 *   * **@param {Errorcode} `err`**
 *   * **@param {Array} `datakeys`** An array of Datakeys found within the Dataset
 */
Als.prototype.getDatakeysInDataset = function(dataset,next) {

	this._ls.findKeys('*.*',function(datasetDatakey) {
		var i = 0,
			l = 0,
			k = '',
			r = [];

		for (i=0, l=datasetDatakey.length; i<l; i++) {
			k = datasetDatakey[i].split('.');
			if (k.length == 2) {
				if (k[0] == dataset) {
					r.push(k[1]);
				}
			}
		}
		return next(ERROR.OK,r);
	}.bind(this));

};

/**
 * ## SyncIt_Path_AsyncLocalStorage.findFirstDatasetDatakey()
 *
 * Will find the Reference which is lowest and return the Dataset / Datakey
 * that it is attached to.
 *
 * * **@param {Path} `path`**
 * * **@param {Function} `next`** Signature: Function(err, dataset, datakey)
 *   * **@param {Errorcode} `err`**
 *   * **@param {String} `dataset`**
 *   * **@param {String} `datakey`**
 */
Als.prototype.findFirstDatasetDatakey = function(datasets,path,next) {
	this._findFirstDatasetDatakeyReference(datasets,path,function(err,dataset,datakey) {
		if (err !== ERROR.OK) {
			return next(err);
		}
		return next(err,dataset,datakey);
	});
};

/**
 * ## SyncIt_Path_AsyncLocalStorage.getFirstPathitemInDatasets()
 *
 * Will find the first Pathitem via the lowest Reference and return it along
 * with the Dataset, Datakey and Pathitem.
 *
 * * **@param {Array|null} `datasets`** An array of datasets which are acceptable, or null for any.
 * * **@param {Path} `path`**
 * * **@param {Function} `next`** Signature: Function(err, dataset, datakey, reference, pathitem)
 *   * **@param {Errorcode} `err`**
 *   * **@param {String} `dataset`**
 *   * **@param {String} `datakey`**
 *   * **@param {String} `reference`**
 *   * **@param {Pathitem} `pathitem`**
 */
Als.prototype.getFirstPathitem = function(datasets,path,next) {
	this._findFirstDatasetDatakeyReference(
		datasets,
		path,
		function(err,dataset,datakey,reference) {
			if (err !== ERROR.OK) {
				return next(err);
			}
			return this._getPathItem(dataset,datakey,reference,function(err,pathitem) {
				next(err,dataset,datakey,reference,pathitem);
			});
		}.bind(this)
	);
};

/**
 * ## SyncIt_Path_AsyncLocalStorage._findFirstDatasetDatakeyReference()
 *
 * Will find the lowest Reference and return it along with the Dataset, Datakey
 * it was found at.
 *
 * * **@param {Array|null} `datasets`** An array of datasets which are acceptable, or null for any
 * * **@param {Path} `path`**
 * * **@param {Function} `next`** Signature: Function(err)
 *   * **@param {Errorcode} `err`**
 */
Als.prototype._findFirstDatasetDatakeyReference = function(datasets,path,next) {
	this._ls.findKeys('*.*.*',function(keys) {
		keys = keys.sort(this._ed.sort);
		var processOne = function() {
			var k = '';
			if (!keys.length) {
				return next(ERROR.PATH_EMPTY);
			}
			k = keys.shift();
			k = k.split('.');
			if (k.length != 3) {
				return processOne();
			}
			this._getRoot(k[0],k[1],function(err,root) {
				if (err == ERROR.NO_DATA_FOUND) {
					keys.shift();
					return processOne();
				}
				if (err !== ERROR.OK) {
					return next(err);
				}
				if (
					(datasets !== null) &&
					(datasets.indexOf(k[0]) == -1)
				) {
					return processOne();
				}
				if (
					root.hasOwnProperty(path) && 
					root[path].hasOwnProperty('_n') &&
					root[path]._n == k[2]
				) {
					return next(ERROR.OK,k[0],k[1],k[2]);
				}
				processOne();
			});
		}.bind(this);
		processOne();
	}.bind(this));
};

Als.prototype.purge = function(dataset, next) {
	
	this._ls.findKeys(dataset + '.*',function(rootKeys) {
		
		this._ls.findKeys(dataset + '.*.*',function(pathKeys) {
			
			var toProccess = rootKeys.concat(pathKeys);
			
			var removeOne = function() {
				if (toProccess.length === 0) {
					return next(ERROR.OK);
				}
				this.__removeItem(toProccess.shift(), removeOne);
			}.bind(this);
			
			removeOne();
			
		}.bind(this));
			
	}.bind(this));

};

/**
 * ## SyncIt_Path_AsyncLocalStorage.clean()
 * 
 * This function will find disconnected Pathitem and delete them.
 *
 * When adding Pathitem SyncIt_Path_AsyncLocalStorage will first create the 
 * Pathitem and then link it. This means that the main datastructure will
 * stay consistent but it also means that if things go wrong it can leave
 * a disconnected Pathitem.
 *
 * Note, this probably should not be done while other data is being be added.
 *
 * * **@param {Function} `next`** Signature: Function(err)
 *   * **@param {Errorcode} `err`**
 */
Als.prototype.clean = function(next) {
	
	// TODO This should be possible to do per Dataset / Datakey as aposed to
	// for the whole database at once, this might give nicer code and lower
	// memory consumption.
	
	// Get all non root data points
	var getAllKeysAsObj = function(next) {
		this._ls.findKeys('*.*.*',function(allKeysWithoutNamespace) {
			var i = 0,
				l = 0,
				k = '',
				r = {};

			for (i=0, l=allKeysWithoutNamespace.length; i<l; i++) {
				k = allKeysWithoutNamespace[i].split('.');
				if (!r.hasOwnProperty(k[0])) {
					r[k[0]] = {};
				}
				if (!r[k[0]].hasOwnProperty(k[1])) {
					r[k[0]][k[1]] = {};
				}
				r[k[0]][k[1]][k[2]] = true;
			}
			return next(ERROR.OK,r);
		}.bind(this));
	}.bind(this);
	
	var flattenNotVisited = function(notVisited) {
		var r = [],
			datasetK = '',
			datakeyK = '',
			refK = '';
			
		for (datasetK in notVisited) {
			if (notVisited.hasOwnProperty(datasetK)) {
				for (datakeyK in notVisited[datasetK]) {
					if (notVisited[datasetK].hasOwnProperty(datakeyK)) {
						for (refK in notVisited[datasetK][datakeyK]) {
							if (notVisited[datasetK][datakeyK].hasOwnProperty(refK)) {
								r.push(
									{dataset: datasetK, datakey: datakeyK, ref: refK}
								);
							}
						}
					}
				}
			}
		}
		return r;
	};

	var removeItems = function(notVisited, next) {

		var flattenedNotVisited = flattenNotVisited(notVisited);
		
		var doRemove = function() {
			
			var keyInfo = {};

			if (!flattenedNotVisited.length) {
				return next(ERROR.OK);
			}

			keyInfo = flattenedNotVisited.shift();
			this._removePathItem(
				keyInfo.dataset,
				keyInfo.datakey,
				keyInfo.ref,
				function(err) {
					if (err !== ERROR.OK) {
						return next(err);
					}
					doRemove();
				}
			);
		}.bind(this);

		doRemove();

	}.bind(this);
	
	getAllKeysAsObj(function(err,refsStillToBeVisited) {
		
		if (err !== ERROR.OK) {
			return next(err);
		}
	
		var follow = function(dataset,datakey,data,innerNext) {
			if (!data.hasOwnProperty('_n')) {
				return innerNext(ERROR.OK);
			}
			delete refsStillToBeVisited[dataset][datakey][data._n];
			this._getPathItem(dataset,datakey,data._n,function(err,data) {
				if (err !== ERROR.OK) {
					return innerNext(err);
				}
				follow(dataset,datakey,data,innerNext);
			}.bind(this));
		}.bind(this);

		var followRoot = function(dataset,datakey,innerNext) {
			this._getRoot(dataset,datakey,function(err,data) {
				
				var k = '',
					mainErr = err,
					toComplete = 0;

				if (err !== ERROR.OK) {
					return innerNext(err);
				}
				
				var finishedMonitor = function(err) {
					toComplete = toComplete - 1;
					if (err !== ERROR.OK) {
						mainErr = err;
					}
					if (toComplete === 0) {
						innerNext(mainErr);
					}
				}.bind(this);

				for (k in data) {
					if (data.hasOwnProperty(k)) {
						toComplete = toComplete + 1;
						follow(dataset,datakey,data[k],finishedMonitor);
					}
				}
			}.bind(this));
		}.bind(this);

		var processDataset = function(dataset,innerNext) {
			this.getDatakeysInDataset(dataset,function(err,datakeys) {

				var toComplete = 0,
					i = 0,
					l = 0,
					mainErr = ERROR.OK;

				if (err !== ERROR.OK) { 
					return innerNext(err);
				}

				var finishedMonitor = function(err) {
					toComplete--;
					if (err !== ERROR.OK) {
						mainErr = err;
					}
					if (toComplete === 0) {
						innerNext(mainErr);
					}
				}.bind(this);

				for (i=0, toComplete=l=datakeys.length; i<l; i++) {
					followRoot(dataset,datakeys[i],finishedMonitor);
				}
			}.bind(this));
		}.bind(this);
		
		var cleanOrphaned = function(data, next) {
			var removeOne = function() {
				if (data.length === 0) {
					return next(ERROR.OK);
				}
				
				var item = data.shift();
				this.__removeItem(
					[item.dataset, item.datakey, item.ref].join("."),
					removeOne
				);
			}.bind(this);
			removeOne();
		}.bind(this);
		
		this.getDatasetNames(function(err,datasets) {
			if (err !== ERROR.OK) { 
				return next(err);
			}
			
			if (datasets.length === 0) {
				cleanOrphaned(
					flattenNotVisited(refsStillToBeVisited),
					next
				);
			}

			var i = 0,
				l = 0,
				mainErr = err,
				toComplete = 0;

			var finishedMonitor = function(err) {
				toComplete--;
				if (err !== ERROR.OK) {
					mainErr = err;
				}
				if (toComplete === 0) {
					if (mainErr !== ERROR.OK) {
						return next(mainErr);
					}
					removeItems(
						refsStillToBeVisited,
						function(err) {
							if (err) { next(err); }
							cleanOrphaned(
								flattenNotVisited(refsStillToBeVisited),
								next
							);
						}
					);
				}
			}.bind(this);

			for (i=0, toComplete=l=datasets.length; i<l ; i++) {
				processDataset(datasets[i],finishedMonitor);
			}
		}.bind(this));

	}.bind(this));

};

addEvents(Als,['set-root','set-item','remove-item','advance','push','change-path','change-root']);

return Als;

}(_dereq_('../Constant'), _dereq_('add-events')));

},{"../Constant":2,"add-events":12}],5:[function(_dereq_,module,exports){
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
			_dereq_('./Constant.js'),
			_dereq_('add-events'),
			_dereq_('./addLocking.js'),
			_dereq_('./updateResult.js')
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
					throw new Error("Merge queue cannot include any " + disallowedKeys.join(', '));
				}
			}
			for (i=0; i<copyKeys.length; i++) {
				if (queueitem.hasOwnProperty(copyKeys[i])) {
					r[copyKeys[i]] = queueitem[copyKeys[i]];
				}
			}
			if (queueitem.hasOwnProperty('s') && (queueitem.s != storedrecord.s)) {
				throw new Error("Merge queue cannot use different dataset to stored record");
			}
			if (queueitem.hasOwnProperty('k') && (queueitem.k != storedrecord.k)) {
				throw new Error("Merge queue cannot use different datakey to stored record");
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
			return this._ps.promotePathToOrRemove(feedQueue[0].s,feedQueue[0].k,'c','a',function(err) {
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
	
	this._ps.findFirstDatasetDatakey(null,'a',function(err,dataset,datakey) {
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
			throw new Error("No time and no time found in key");
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
 * ### SyncIt.getFirstInDatasets()
 *
 * Gets the Pathitem which should be next uploaded to the server or will be advanced
 * should `SyncIt.advance()` be called.
 *
 * #### Parameters
 * 
 * * **@param {Array|null} `datasets`** An array of datasets which are acceptable, or null for any
 * * **@param {Function} `done`** Callback. Signature: Function(err, pathitem)
 *   * **@param {ErrorCode} `done.err`** See SyncIt_Constant.Error.
 *   * **@param {Pathitem} `done.pathitem`** The Pathitem.
 */
SyncIt.prototype.getFirstInDatasets = function(datasets, done) {
	
	this._ps.getFirstPathitem(
		datasets,
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

SyncIt.prototype.getFirst = function(done) {
	this.getFirstInDatasets(null, done);
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
				throw new Error("How did we end up with more than two paths?");
			}
			if (info.p.length) {
				if (info.p[0] !== 'c') {
					throw new Error("How did we end up with paths other than 'c' and 'a'?");
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

},{"./Constant.js":2,"./addLocking.js":8,"./updateResult.js":15,"add-events":12}],6:[function(_dereq_,module,exports){
module.exports = (function (SyncItConstant, SyncIt) {
	
"use strict";

/**
 * ## SyncItBuffer
 *
 * A wrapper that can be used around SyncIt so you can blindly call functions 
 * that lock SyncIt and they will queue up. 
 *
 * NOTE: This is not unit tested and is perhaps subject to change (may have bugs).
 */

var SyncItBuffer = function(syncIt) {
	/* global setInterval */
	this._syncIt = syncIt;
	this._instructions = [];
	this._current = null;
	setInterval(function() {
		var args, c;
		if ((this._current === null) && this._instructions.length) {
			this._current = this._instructions.shift();
			args = Array.prototype.slice.call(this._current.a);
			args.push(function(e) {
				if (e !== SyncItConstant.Error.UNABLE_TO_PROCESS_BECAUSE_LOCKED) {
					c = this._current.c;
					this._current = null;
					c.apply(
						this._syncIt,
						arguments
					);
				}
			}.bind(this));
			this._current.f.apply(this._syncIt, args);
		}
	}.bind(this), 50);
};

var mapNonBuffered = function(k) {
	SyncItBuffer.prototype[k] = function() {
		this._syncIt[k].apply(
			this._syncIt,
			Array.prototype.slice.call(arguments)
		);
	};
};

var mapBuffered = function(k) {
	SyncItBuffer.prototype[k] = function() {
		this._instructions.push({
			f: this._syncIt[k],
			a: Array.prototype.slice.call(arguments,0,arguments.length - 1),
			c: Array.prototype.slice.call(arguments,arguments.length - 1)[0]
		});
	};
};

var k,
	bufferedFuncs = ['update', 'remove', 'set', 'purge', 'clean', 'feed', 'advance', 'getFirst'];
for (k in SyncIt.prototype) {
	if (SyncIt.prototype.hasOwnProperty(k)) {
		if (k.match(/^_/)) { continue; }
		if (bufferedFuncs.indexOf(k) > -1) {
			mapBuffered(k);
		} else {
			mapNonBuffered(k);
		}
	}
}

return SyncItBuffer;

}(_dereq_('./Constant.js'), _dereq_('./SyncIt.js')));

},{"./Constant.js":2,"./SyncIt.js":5}],7:[function(_dereq_,module,exports){
module.exports = (function () {

"use strict";
	
// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

/**
 * # SyncLocalStorage
 *
 * A pretty basic wrapper around HTML5's LocalStorage.
 *
 * Allows the existance of namespaces for easy seperation of data and
 * automatically serializes and unserializes all data stored within
 * it.
 *
 * It is anticipated that a "." is used to seperate information within
 * a key, although that will only be a factor if you wish to use the 
 * `SyncLocalStorage.findKeys()` method.
 */

/**
 * ## new SyncLocalStorage()
 *
 * Constructor.
 *
 * ### Parameters
 *
 * * **@param {LocalStorage} `localStorage`** This should be window.localStorage,
 *		or something that implements that API.
 * * **@param {String} `namespace`** This will be included before every value
 *		stored and other functions will only retrieve items with this namespace.
 * * **@param {Function} `serialize`** The method to use for serialization (Try JSON.stringify).
 * * **@param {Function} `unserialize`** The method to use for unserialization (Try JSON.parse).
 */
var SyncLocalStorage = function(localStorage,namespace,serialize,unserialize) {
	this._ls = localStorage;
	this._serialize = serialize;
	this._unserialize = unserialize;
	this._ns = namespace;
};

/**
 * Returns the amount of items stored in the LocalStorage. Note this is not the 
 * amount of items which are stored within the namespace
 */
SyncLocalStorage.prototype.getLength = function() {
	return this._ls.length;
};

/**
 * ## SyncLocalStorage.prototype.setItem()
 *
 * Sets key k to value v
 *
 * ### Parameters
 *
 * * **@param {String} `k`**
 * * **@param {Object} `unserialize`**
 */
SyncLocalStorage.prototype.setItem = function(k,v) {
	return this._ls.setItem(this._ns+'.'+k,this._serialize(v));
};

/**
 * ## SyncLocalStorage.prototype.clear()
 *
 * Removes all items in the namespace.
 */
SyncLocalStorage.prototype.clear = function() {
	var i = 0,
		k = '',
		l = 0,
		keys = [];
	for ( i = 0, l = this.getLength(); i<l; i++) {
		k = this.key(i);
		if (k !== null) {
			keys.push(k);
		}
	}
	while (keys.length) {
		this.removeItem(keys.shift());
	}
};

/**
 * ## SyncLocalStorage.prototype.key()
 *
 * Fetches the LocalStorage key at index `i` if it is within the 
 * namespace. If it is not within the namespace `null` will be
 * returned.
 *
 * ### Parameters
 *
 * * **@param {Number} `i`**
 */
SyncLocalStorage.prototype.key = function(i) {
	var k = this._ls.key(i);
	if (k === null) { return null; }
	if (
		(k.length > this._ns.length) &&
		(k.substr(0,this._ns.length + 1) == this._ns+'.')
	) {
		return k.substr(k.indexOf('.')+1);
	}
	return null;
};

/**
 * ## SyncLocalStorage.prototype.getItem()
 *
 * Gets the item stored at key `k` within the namespace.
 *
 * ### Parameters
 *
 * * **@param {String} `k`**
 */
SyncLocalStorage.prototype.getItem = function(k) {
	return this._unserialize(this._ls.getItem(this._ns+'.'+k));
};

/**
 * ## SyncLocalStorage.prototype.removeItem()
 *
 * Removes the item stored at key `k`.
 *
 * ### Parameters
 *
 * * **@param {String} `k`**
 */
SyncLocalStorage.prototype.removeItem = function(k) {
	return this._ls.removeItem(this._ns+'.'+k);
};

/**
 * ## SyncLocalStorage.prototype.findKeys()
 *
 * This function will return all keys that a specified pattern.
 *
 * ### Parameters
 *
 * * **@param {String} `pattern`** Patterns allow wildcards of "*" and use "."
 *		as a seperator. For example 'cars.*.large' could return 
 *		'cars.bmw.large' and 'cars.ford.large' but not 'cars.opel.medium'.
 * * **@return {Array}** An Array of String.
 */
SyncLocalStorage.prototype.findKeys = function(pattern) {
	var l = 0,
		i = 0,
		k = '',
		starIndex = -1,
		buildRe = null,
		r = [],
		re = null;
	
	buildRe = function(pattern) {
		var mustBeDot = [],
			j = 0;
		if (!pattern.match(/^[A-Za-z0-9_\.\*]/)) {
			return false;
		}
		pattern = pattern.replace(/\./g,'\\.');
        starIndex = pattern.indexOf('*');
		while (starIndex > -1) {
			mustBeDot = [starIndex-1,starIndex+1];
			if (starIndex == pattern.length-1) {
				mustBeDot.pop();
			}
			if (starIndex === 0) {
				mustBeDot.shift();
			}
			for (j = 0; j < mustBeDot.length; j++) {
				if (
					(pattern.substr(mustBeDot[j],1) !== '.') && 
					(pattern.substr(mustBeDot[j],1) !== '\\')
				) {
					return false;
				}
			}
			pattern = pattern.replace('*','[a-z0-9A-Z_\\-]+');
			starIndex = pattern.indexOf('*');
		}
		return new RegExp('^'+pattern+'$');
	};
	
	re = buildRe(pattern);

	if (re === false) {
		throw new Error(
			"You cannot find keys from the pattern '" + pattern + "'"
		);
	}

	for (i = 0, l = this._ls.length; i < l; i++) {
		k = this._ls.key(i);
		if (
			(k.length > this._ns.length) &&
			(k.substr(0,this._ns.length + 1) == this._ns+'.')
		) {
			k = k.substr(k.indexOf('.')+1);
			if (re.test(k)) {
				r.push(k);
			}
		}
	}

	return r;
};

return SyncLocalStorage;

}());

},{}],8:[function(_dereq_,module,exports){
module.exports = (function () {
	
"use strict";

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

/**
 * # addLocking()
 *
 * Adds internal locking to an existing pseudo-classical Javascript class
 * 
 * ## Example
 *
 * ```javascript
 * var MyClass = function() {
 * };
 *
 * MyClass.prototype.doSomething = function() {
 *	this._lockFor(1); // Lock with bitpattern '10'
 *	this._startSensitiveJob();
 *	this._lockFor(2); // Lock with bitpattern '01', Locks '11' now present.
 *	this._startSomethingElse();
 *	this._unlockFor(3); // Lock is now back at '00'
 * };
 *
 * MyClass.prototype.doSomethingElse() {
 *	if (this.amILocked(2)) {
 *		// It safe to do something as lock '10' is not present.
 *	}
 * };
 *
 * addLocking(MyClass,3); Supports locks 1 and 2
 * ```
 *
 * ## Parameters
 * * **@param {Function} `classFunc`** The class to add internal locking to.
 * * **@param {Array} `maxLockingValue`** maximum bit pattern suported for locking.
 */
return function(classFunc,maxLockingValue) { 
	
	classFunc.prototype._ensureLockingData = function() {
		if (!this.hasOwnProperty('_locked')) {
			this._locked = 0;
		}
	};
	
	/**
	 * ### CLASS._amILocked()
	 *
	 * Checks if SyncIt is locked.
	 *
	 * #### Parameters
	 *
	 * **@param {Number} `disregardTheseLocks`** Allowed locks to skip over.
	 * **@return {Boolean}** True if locks other than `disregardTheseLocks` are present.
	 */
	classFunc.prototype._amILocked = function(disregardTheseLocks) {
		this._ensureLockingData();
		return this._locked & (maxLockingValue ^ disregardTheseLocks) ? true : false;
	};
	

	/**
	 * ### CLASS._lockFor()
	 *
	 * Adds the lock `lockType`
	 *
	 * **@param {Number} `lockType`** The lock to add.
	 * **@return {Boolean}** False if the lock was already present, True otherwise.
	 */ 
	classFunc.prototype._lockFor = function(lockType) {
		this._ensureLockingData();
		var r = this._locked & lockType;
		if (r) { return false; }
		this._locked = this._locked | lockType;
		return true;
	};

	/**
	 * ### CLASS._unlockFor()
	 *
	 * Removes the lock `lockType`
	 *
	 * **@param {Number} `lockType`** The lock to remove.
	 * **@return {Boolean}** False if the lock was not present, True otherwise.
	 */ 
	classFunc.prototype._unlockFor = function(lockType) {
		this._ensureLockingData();
		if (!(this._locked & lockType)) { 
			return false;
		}
		this._locked = this._locked ^ (maxLockingValue & lockType);
	};


	/**
	 * ### classFunc.isLocked()
	 * 
	 * #### Returns
	 * 
	 * * **@return {Boolean}** True if there are any locks
	 */
	classFunc.prototype.isLocked = function() {
		this._ensureLockingData();
		return (this._locked > 0);
	};
};

}());

},{}],9:[function(_dereq_,module,exports){
module.exports = {
	AsyncLocalStorage: _dereq_('./AsyncLocalStorage'),
	Constant: _dereq_('./Constant'),
	SyncIt: _dereq_('./SyncIt'),
	SyncItBuffer: _dereq_('./SyncItBuffer'),
	FakeLocalStorage: _dereq_('./FakeLocalStorage'),
	getTlIdEncoderDecoder: _dereq_('get_tlid_encoder_decoder'),
	Path_AsyncLocalStorage: _dereq_('./Path/AsyncLocalStorage'),
	dontListLocallyDeletedDatakeys: _dereq_('./dontListLocallyDeletedDatakeys')
};

},{"./AsyncLocalStorage":1,"./Constant":2,"./FakeLocalStorage":3,"./Path/AsyncLocalStorage":4,"./SyncIt":5,"./SyncItBuffer":6,"./dontListLocallyDeletedDatakeys":10,"get_tlid_encoder_decoder":13}],10:[function(_dereq_,module,exports){
module.exports = (function (SyncIt_Constant) {
	
"use strict";

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

/**
 * # dontListLocallyDeletedDatakeys()
 *
 * Adds a wrapper around `SyncIt.getDatakeysInDataset()` to make it not list locally
 * deleted Datakey.
 *
 * * **@param {SyncIt} `syncIt`** A full SyncIt instance.
 * * **@return {SyncIt}** a SyncIt which will no longer list locally deleted datakeys.
 * * **@todo** This could be more tightly coupled into SyncIt to dramatically increase performace.
 */
return function(syncIt) { 
	
	var origGetDatakeysInDataset = syncIt.getDatakeysInDataset.bind(syncIt);
	
	syncIt.getDatakeysInDataset = function(dataset, whenDatakeysKnown) {
		
		origGetDatakeysInDataset(dataset, function(err, datakeys) {
			
			var r = {},
				inError = false,
				i, l;
			
			var _keys = function(ob) {
					var r = [],
						k;
					for (k in ob) {
						if (ob.hasOwnProperty(k)) {
							r.push(k);
						}
					}
					return r;
				};
			
			var keysFromNonRemoved = function(ob) {
					var r = [],
						k;
					for (k in ob) {
						if (ob.hasOwnProperty(k) && ob[k].r === false) {
							r.push(k);
						}
					}
					return r;
				};
			
			var handleGetFull = function(err, data) {
				if ([SyncIt_Constant.Error.OK,SyncIt_Constant.Error.DATA_ALREADY_REMOVED].indexOf(err) === -1) {
					if (inError) { return; }
					inError = true;
					return whenDatakeysKnown(err);
				}
				r[data.k] = data;
				if (_keys(r).length == datakeys.length) {
					whenDatakeysKnown(SyncIt_Constant.Error.OK,keysFromNonRemoved(r));
				}
			};
			
			if (datakeys.length === 0) {
				return whenDatakeysKnown(SyncIt_Constant.Error.OK,[]);
			}
			
			for (i=0, l=datakeys.length; i<l; i++) {
				syncIt.getFull(dataset,datakeys[i],handleGetFull);
			}
		});
	};
	
	return syncIt;
	
};

}(_dereq_('./Constant')));

},{"./Constant":2}],11:[function(_dereq_,module,exports){
module.exports = (function () {

"use strict";

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

/**
 * # makeAsync(classFunc, asynchronousDelay)
 *
 * Takes a pseudo-classical Javascript class and converts that class into an 
 * asynchronous version.
 * 
 * ## Example
 * ```javascript
 * var MyClass = function(property) {
 *	this.property = property;
 * };
 *
 * MyClass.prototype.getProperty = function() {
 *	return this.property + 3;
 * };
 *
 * var AsyncMyClass = makeAsync(MyClass);
 * var asyncMyClass = new AsyncMyClass(4);
 * asyncMyClass.getProperty(function(property) {
 *	// Outputs "Property is 7"
 *	console.log('Property is '+property);
 * });
 * ```
 *
 * ## Parameters
 * * **@param {Function} `classFunc`**
 * * **@param {Number} `asynchronousDelay`**
 */
return function(classFunc,asynchronousDelay) {
	
	// This will create the constructor
	var constructorFunc  = function() {
		var args = Array.prototype.slice.call(arguments);
		args.unshift(null);
		var Factory = classFunc.bind.apply(
			classFunc,
			args
		);
		this._inst = new Factory();
	};

	var k = '';
	
	// Takes a function and a factor and returns an asynchronous 
	// (if factor != false) function which wraps the func and passes 
	// it's parameters through with the addition of a callback
	var makeLaggy = function(func,factor) {
		return function() {
			
			/* globals setTimeout: false */

			var args = Array.prototype.slice.call(arguments);
			var cb = args.pop();
			if (factor === false) {
				return cb(func.apply(this._inst,args));
			}
			setTimeout(function() {
				cb(func.apply(this._inst,args));
			}.bind(this),Math.floor(Math.random() * factor) + 1);
		};
	};

	// This should be an IIFE in the for loop below, except that JSHint complains
	// about functions in loops
	var proc = function(k) {
		constructorFunc.prototype[k] = makeLaggy(classFunc.prototype[k],asynchronousDelay);
	};

	// Look at classFunc and use makeLaggy to attach a asynchronous version of
	// the function.
	for (k in classFunc.prototype) {
		if (classFunc.prototype.hasOwnProperty(k)) {
			proc(k);
		}
	}
	
	return constructorFunc;
	
};

}());

},{}],12:[function(_dereq_,module,exports){
module.exports = (function () {
	
// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

"use strict";

/**
 * # addEvents()
 *
 * Adds events to an existing pseudo-classical Javascript class.
 *
 * NOTE: Overwrites the following variables within the prototype:
 *
 * * _eventTypes
 * * _emit
 * * on
 * * once
 * * removeAllListeners
 * * removeAllOnceListeners
 * * removeOnceListener
 * * removeOnceListener
 *
 * NOTE: Overwrites the following variables within the instance of a class
 *
 * * _onceListeners
 * * _listeners
 * 
 * ## Example
 *
 * ```javascript
 * var MyClass = function() {
 * };
 *
 * MyClass.prototype.doSomething = function() {
 *	return this._emit('doneit','a','b');
 * };
 *
 * addEvents(MyClass,['doneit']);
 *
 * var myClass = new MyClass();
 * myClass.on('doneit',function (a, b) {
 *	console.log('a = ' + a + ', b = ' + b);
 * });
 * myClass.doSomething();
 * ```
 *
 * ## Parameters
 * * **@param {Function} `classFunc`** The class to add events to.
 * * **@param {Array} `events`** The events you want the class to support.
 */
var addEvents = function(classFunc, events) {

	classFunc.prototype._eventTypes = events;
	
	classFunc.prototype._emit = function(event /*, other arguments */) {

		var i = 0,
			args = Array.prototype.slice.call(arguments, 1);
		
		if (this._eventTypes.indexOf(event) === -1) {
			throw "SyncIt._emit(): Attempting to fire unknown event '" + event + "'";
		}
		
		var toFire = [];
		
		if (
			this.hasOwnProperty('_onceListeners') &&
			this._onceListeners.hasOwnProperty(event)
		) {
			while (this._onceListeners[event].length) {
				toFire.push(this._onceListeners[event].shift());
			}
		}
		
		if (
			this.hasOwnProperty('_listeners') &&
			this._listeners.hasOwnProperty(event)
		) {

			for (i=0; i<this._listeners[event].length; i++) {
				toFire.push(this._listeners[event][i]);
			}
		}
		
		while (toFire.length) {
			toFire.shift().apply(this, args);
		}
		
	};

	var pushTo = function(objKey, event, func, ctx) {
		
		if (ctx._eventTypes.indexOf(event) === -1) {
			throw "addEvents: Attempting to listen for unknown event '"+event+"'";
		}
		
		if (!ctx.hasOwnProperty(objKey)) {
			ctx[objKey] = {};
		}
		
		if (!ctx[objKey].hasOwnProperty(event)) {
			ctx[objKey][event] = [];
		}
		
		ctx[objKey][event].push(func);
	};

	/**
	 * ### CLASS.on()
	 * 
	 * Adds an event listeners to an event
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
	classFunc.prototype.on = function(event, func) {
		pushTo('_listeners', event, func, this);
	};
	classFunc.prototype.listen = classFunc.prototype.on;
	
	/**
	 * ### CLASS.once()
	 * 
	 * Adds an event listeners which will be called only once then removed
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
	classFunc.prototype.once = function(event,func) {
		pushTo('_onceListeners', event, func, this);
	};
	
	var removeAllListeners = function(objKey, event, ctx) {	
		var propertyNames = (function(ob) {
			var r = [];
			for (var k in ob) { if (ob.hasOwnProperty(k)) {
				r.push(k);
			} }
			return r;
		})(ctx[objKey]);
		
		if (propertyNames.indexOf(event) == -1) {
			return [];
		}
		
		var r = ctx[objKey][event];
		ctx[objKey][event] = [];
		return r;
	};

	/**
	 * ### CLASS.removeAllListeners()
	 *
	 * Removes all non `once` listeners for a specific event.
	 *
	 * #### Parameters
	 * 
	 * * **@param {String} `event`** The name of the event you want to remove all listeners for.
	 * 
	 * #### Returns
	 * 
	 * * **@return {Array}** The listeners that have just been removed.
	 */
	classFunc.prototype.removeAllListeners = function(event) {
		return removeAllListeners('_listeners', event, this);
	};
	
	/**
	 * ### CLASS.removeAllOnceListeners()
	 *
	 * Removes all `once` listeners for a specific event.
	 *
	 * #### Parameters
	 * 
	 * * **@param {String} `event`** The name of the event you want to remove all listeners for.
	 * 
	 * #### Returns
	 * 
	 * * **@return {Array}** The listeners that have just been removed.
	 */
	classFunc.prototype.removeAllOnceListeners = function(event) {
		return removeAllListeners('_onceListeners', event, this);
	};
	
	var removeListener = function(objKey, event, listener, ctx) {
		
		var i = 0,
			replacement = [],
			successful = false;
		
		var propertyNames = (function(ob) {
			var r = [];
			for (var k in ob) { if (ob.hasOwnProperty(k)) {
				r.push(k);
			} }
			return r;
		})(ctx[objKey]);
		
		if (propertyNames.indexOf(event) == -1) {
			return false;
		}
		
		for (i=0; i<ctx[objKey][event].length; i++) {
			if (ctx[objKey][event][i] !== listener) {
				replacement.push(ctx[objKey][event][i]);
			} else {
				successful = true;
			}
		}
		ctx[objKey][event] = replacement;
		
		return successful;
	};
	
	/**
	 * ### CLASS.removeListener()
	 *
	 * Removes a specific listener from an event (note, not from the `once()` call).
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
	classFunc.prototype.removeListener = function(event, listener) {
		return removeListener('_listeners', event, listener, this);
	};

	/**
	 * ### CLASS.removeOnceListener()
	 *
	 * Removes a specific listener from an event (note, not from the `once()` call).
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
	classFunc.prototype.removeOnceListener = function(event, listener) {
		return removeListener('_onceListeners', event, listener, this);
	};

};

return addEvents;

}());

},{}],13:[function(_dereq_,module,exports){
/*jshint smarttabs:true */
module.exports = (function () {

"use strict";
// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

/**
 * # getTLIdEncoderDecoder()
 *
 * Generate time based local Id's which are guarenteed to be unique for that
 * particular constructor call.
 *
 * ## Parameters
 *
 * * **@param {Number} `epoch`** A timestamp, all unique Id's will use this as
 *	thier base time.
 * * **@param {Number} `uniqueLength`** Id's will be based on a timestamp and a
 *	extra sequence number if we happen to generate two Id's in the same 
 *	millisecond. If you leave this at the default of 1, 32 unique Id's can be
 *	generated per millisecond (because it's a 32bit number represented in a
 *	string), I have found this to be sufficient, but you can increase this
 *	number if it is not.
 * * **@return {Object} `return`** The return value includes three seperate Functions, 
 *	these are:
 * *   **@return {Function} `return.encode`** Encode now by default (or the
 *		first parameter) into an Id.
 * *   **@return {Function} `return.decode`** Decode an Id back into a 
 *		timestamp (Id is the first parameter).
 * *   **@return {Function} `return.sort`** Compatible with Array.sort() and
 *		will soft based on the encode time / first parameter.
 *
 * ## Example
 *
 * ```javascript
 * // Use one character (32 bit number) to ensure uniqueness within a millisecond
 * var uniquenessPerMillisecond = 1;
 * // As close as possible (but lower) than the lowest date to give shorter Id's
 * var epoch = new Date(1970,0,1).getTime();
 * 
 * 
 * // Get the TLId Encoder / Decoder
 * var encoderDecoder = getTLIdEncoderDecoder(epoch,uniquenessPerMillisecond);
 * 
 * // Encode a date into a unique string
 * var dates = [
 *   encoderDecoder.encode(),
 *   encoderDecoder.encode(new Date(1980,1,6).getTime()),
 *   encoderDecoder.encode(new Date(1981,3,15).getTime()),
 *   encoderDecoder.encode(new Date(1986,8,9).getTime()),
 *   encoderDecoder.encode(new Date(1983,10,3).getTime()),
 *   encoderDecoder.encode(new Date(1982,0,6).getTime()),
 *   encoderDecoder.encode()
 * ];
 * 
 * // Get the dates it was encoded
 * var originalTimestamps = dates.map(encoderDecoder.decode);
 * 
 * // Sort them in date order
 * var sortedDates = dates.sort(encoderDecoder.sort);*
 * console.log("The first Date is " + new Date(encoderDecoder.decode(sortedDates[0])));
 * ```
 */
return function(epoch,uniqueLength) {
  
  var lastDate = null;
  var index = -1;
  if (uniqueLength === undefined) {
	uniqueLength = 1;
  }

  if (typeof epoch != 'number') {
    throw "Only takes timestamps";
  }
  
  var genUid = function(now) {
    
    if (now === undefined) {
      now = new Date().getTime();
    }
	if (typeof now == 'object') {
      throw "Only takes timestamps";
	}
    
    if ((lastDate === null) || (now !== lastDate)) {
      index = -1;
    }

	var superUnique = (++index).toString(32);
	if (superUnique.length < uniqueLength) {
		superUnique = '0' + superUnique;
	}
	var timeEncoded = (now - epoch).toString(32);

	if (superUnique.length > uniqueLength) {
      throw "getUidGenerator.genUid cannot generate TLId until next millisecond!";
	}

    lastDate = now;
	if (timeEncoded.substr(0,1) <= '9') {
		return "X"+timeEncoded+superUnique;
	}
	return timeEncoded+superUnique;
  };
  
  var uidToTimestamp = function(tlid) {
	if (tlid.substr(0,1) == 'X') {
		tlid = tlid.substr(1);
	}
	tlid = tlid.substr(0, tlid.length - uniqueLength);
    return parseInt(tlid,32) + epoch;
  };

  var sort = function(tlidA, tlidB) {
	if (tlidA.substr(0,1) == 'X') {
		tlidA = tlidA.substr(1);
	}
	if (tlidB.substr(0,1) == 'X') {
		tlidB = tlidB.substr(1);
	}
	tlidA = tlidA.replace(/.*\./,'');
	tlidB = tlidB.replace(/.*\./,'');
	if (tlidA.length != tlidB.length) {
		return (tlidA.length < tlidB.length) ? -1 : 1;
	}
	return (tlidA < tlidB) ? -1 : 1;
  };
  
  return {encode: genUid, decode: uidToTimestamp, sort: sort};
};

}());

},{}],14:[function(_dereq_,module,exports){
module.exports = (function () {
	
// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

"use strict";

/**
 * ### manip()
 * 
 * The function to return.
 * 
 * #### Parameters
 * 
 * * **@param {Object} `ob`** The function to apply the Manipulation to.
 * * **@param {Object} `jsonDoc`** The manipulation.
 * * **@param {Function|undefined} `cloneObjFunc`** Function to use for cloning objects, if left null, it will do a JSON based clone.
 * * **@return {Object}** The result of applying the `jsonDoc` to `ob`.
 */
var manip = function(ob,jsonDoc,cloneFunc) {
	var k = '',
		r = null,
		_cloneFunc = function(ob) { return JSON.parse(JSON.stringify(ob)); };
	
	if (cloneFunc === undefined) {
		r = _cloneFunc(ob);
	} else {
		r = cloneFunc(ob);
	}

	for (k in jsonDoc) { if (jsonDoc.hasOwnProperty(k)) {
		if (k.substring(0,1) == '$') {
			if (!manip.fn.hasOwnProperty(k.substring(1))) {
				throw new Error('manip: Does not have manipulation function '+k.substring(1));
			}
			r = manip.fn[k.substring(1)].call(manip,r,jsonDoc[k]);
		}
	} }
	return r;
};

// Holds the functions
manip.fn = {};

/**
 * ### manip._setKey()
 * 
 * Sets an internal field of `r` at `path` to `value`.
 * 
 * #### Parameters
 * 
 * * **@param {Object} `r`** The object to set an internal path to.
 * * **@param {String} `path`** The path to change, seperated by "."'s.
 * * **@param {Var} `value`** The value to set `path` to.
 * * **@return {Object}** The result.
 */
manip._setKey = function(r,path,value) {
	var k,
		t = r,
		parsePath = path.split('.');
	
	while (parsePath.length) {
		k = parsePath.shift();
		if (parsePath.length === 0) {
			t[k] = value;
			return r;
		}
		if (!t.hasOwnProperty(k)) {
			t[k] = {};
		}
		t = t[k];
	}
	return r;
};

/**
 * ### manip._getKey()
 * 
 * Gets the value from `r` at path `path`.
 * 
 * #### Parameters
 * 
 * * **@param {Object} `r`** The object to set an internal path to.
 * * **@param {String} `path`** The path to get, seperated by "."'s.
 * * **@return {Object}** The result.
 */
manip._getKey = function(r,path) {
	var k,
		t = r,
		parsePath = path.split('.');
	
	while (parsePath.length) {
		k = parsePath.shift();
		if (parsePath.length === 0) {
			return t[k];
		}
		if (!t.hasOwnProperty(k)) {
			t[k] = {};
		}
		t = t[k];
	}
	return undefined;
};

/**
 * ### manip._remKey()
 * 
 * Removes `path` from `r`.
 * 
 * #### Parameters
 * 
 * * **@param {Object} `r`** The object to remove an internal path from.
 * * **@param {String} `path`** The path to remove, seperated by "."'s.
 * * **@return {Object}** The result
 */
manip._remKey = function(r,path) {
	var k,
		t = r,
		parsePath = path.split('.');
	
	while (parsePath.length) {
		k = parsePath.shift();
		if (parsePath.length === 0) {
			delete t[k];
			return r;
		}
		if (!t.hasOwnProperty(k)) {
			return r;
		}
		t = t[k];
	}
	return r;
};

/**
 * ### manip.addManipulation()
 * 
 * Adds a manipulation function.
 * 
 * #### Parameters
 * 
 * * **@param {String} `name`** The name of the Manipulation
 * * **@param {Function} `func`** The function that will perform the manipultion
 */
manip.addManipulation = function(name,func) {
	manip.fn[name] = func;
};

/**
 * Adds the 'set' which is similar to the MongoDB operation of the same name.
 */
manip.addManipulation('set',function(ob,jsonSnippet) {
	var k = '';
	for (k in jsonSnippet) { if (jsonSnippet.hasOwnProperty(k)) {
		ob = manip._setKey(ob,k,jsonSnippet[k]);
	} }
	return ob;
});

/**
 * Adds the 'unset' which is similar to the MongoDB operation of the same name.
 */
manip.addManipulation('unset',function(ob,jsonSnippet) {
	var k = '';
	for (k in jsonSnippet) { if (jsonSnippet.hasOwnProperty(k)) {
		ob = manip._remKey(ob,k);
	} }
	return ob;
});

/**
 * Adds the 'push' which is will add an item or items to the array.
 *
 * Note the subdocument of jsonSnippet can be a single scalar, which will just
 * be added to the array or it could be a document including any/all of "$each",
 * "$sort" and "$slice" which will act in way (somewhat) similar to how they
 * work in MongoDB 2.4.
 */
manip.addManipulation('push',function(ob,jsonSnippet) {
	
	var k, v;
	
	var subOps = {
		"scalar": function(src, val) {
			var i, l;
			if (val.length && (typeof val != 'string')) {
				for (i=0, l=val.length; i<l; i++) {
					src.push(v[i]);
				}
				return src;
			}
			src.push(val);
			return src;
		},
		"$each": function(src, val) {
			var i, l;
			for (i=0, l=val.length; i<l; i++) {
				src.push(val[i]);
			}
			return src;
		},
		"$sort": function(src, val) {
			var tmp;
			
			if (val == '.') {
				return src.sort();
			}
			
			src.sort(function(a, b) {
				for (var k in val) {
					if (val.hasOwnProperty(k)) {
						if (!a.hasOwnProperty(k)) {
							return (val[k] > 0) ? -1 : 1;
						}
						if (!b.hasOwnProperty(k)) {
							return (val[k] > 0) ? 1 : -1;
						}
						if (a[k] == b[k]) { continue; }
						tmp = [a[k], b[k]].sort();
						if (tmp[0] === a[k]) {
							return (val[k] > 0) ? -1 : 1;
						}
						return (val[k] > 0) ? 1 : -1;
					}
				}
				return 0;
			});
			return src;
		},
		"$slice": function(src, num) {
			if (num === 0) { return []; }
			return src.slice(num);
		}
	};
	
	var processPushMods = function(v, pushMods) {
		
		var toPush = {},
			willPush = false,
			didComplex = false;
		
		if (['string', 'number'].indexOf(typeof pushMods) > -1) {
			subOps.scalar(v, pushMods);
			return v;
		}

		for (var k in pushMods) {
			if (
				pushMods.hasOwnProperty(k) &&
				(subOps.hasOwnProperty(k))
			) {
				v = subOps[k](v, pushMods[k]);
				didComplex = true;
			} else {
				willPush = true;
				toPush[k] = pushMods[k];
			}
		}
		
		if (willPush) {
			subOps.scalar(v, toPush);
			return v;
		}

		if (didComplex) {
			return v;
		}

		subOps.scalar(v, pushMods);
		return v;
	};
	
	for (k in jsonSnippet) { if (jsonSnippet.hasOwnProperty(k)) {
	
		v = manip._getKey(ob,k);
		if (v === undefined) {
			v = [];
		}
		
		if (!ob[k] instanceof Array) {
			v = [ob[k]];
		}
		
		v = processPushMods(v, jsonSnippet[k]);
		
		ob = manip._setKey(ob,k,v);
	} }
	return ob;
});

/**
 * Adds the 'inc' which is similar to the MongoDB operation of the same name.
 */
manip.addManipulation('inc',function(ob,jsonSnippet) {
	var k = '';
	for (k in jsonSnippet) { if (jsonSnippet.hasOwnProperty(k)) {
		var x = parseInt(manip._getKey(ob,k),10);
		if (!x) { x = 0; }
		x = x + jsonSnippet[k];
		ob = manip._setKey(ob,k,x);
	} }
	return ob;
});

return manip;

}());

},{}],15:[function(_dereq_,module,exports){
module.exports = (function (manip) {

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

"use strict";

/**
 * ### updateResult()
 *
 * Runs a `Pathitem` on a `PathRoot` or a `PathRoot` with one or more `Pathitem` already ran on it.
 *
 ***Parameters**
 *
 * * **@param {PathRoot|updateResult(PathRoot,Pathitem)} `obToApplyTo`**
 * * **@param {Pathitem} `pathitem`**
 */
var updateResult = function(obToApplyTo,pathitem,cloningFunction) {
	if (!updateResult.hasOwnProperty('_op_'+pathitem.o)) {
		throw new Error(
			'SyncLib.updateResult No Operation: updateResult has no ' +
			'operation '+
			pathitem.o
		);
	}
	var f = updateResult['_op_'+pathitem.o];
	return f.call(this,obToApplyTo,pathitem,cloningFunction);
};

/**
 * ### updateResult.op_update()
 * 
 * Performs a MongoDB like update operation.
 * 
 * #### Parameters
 * 
 * * **@param {Object} `ob`** The Object to update
 * * **@param {Object} `pathitem`** The *Pathitem* to apply
 * * **@param {Function} `cloningFunction`** The function to use to create a clone of `ob`
 * * **@return {Object}** The result.
 */
updateResult._op_update = function(ob,pathitem,cloningFunction) {
	var r = cloningFunction(ob);
	r.i = manip(r.i,pathitem.u,cloningFunction);
	r.v = r.v + 1;
	if (pathitem.hasOwnProperty('m')) {
		r.m = pathitem.m;
	}
	r.t = pathitem.t;
	r.r = false;
	return r;
};

/**
 * ### updateResult.op_removeData()
 * 
 * Remove operations set the removed flag, increment the version and set the 
 * *modifier*.
 * 
 * #### Parameters
 * 
 * * **@param {Object} `ob`** The Object to update
 * * **@param {Object} `pathitem`** The Pathitem to be applied
 * * **@param {Function} `cloningFunction`** The function to use to create a clone of `ob`
 * * **@return {Object}** The result
 */
updateResult._op_remove = function(ob,pathitem,cloningFunction) {
	var r = cloningFunction(ob);
	r.v = r.v + 1;
	if (pathitem.hasOwnProperty('m')) {
		r.m = pathitem.m;
	}
	r.t = pathitem.t;
	r.r = true;
	return r;
};


/**
 * ### updateResult.op_set()
 * 
 * A set operation is a local *Operation* which will overwrite all data. The 
 * version will be incremented, *Modifier* set and the removed flag will be unset.
 * 
 * #### Parameters
 * 
 * * **@param {Object} `ob`** The Object to update
 * * **@param {Object} `pathitem`** The Pathitem to be applied
 * * **@param {Function} `cloningFunction`** The function to use to create a clone of `ob`
 * * **@return {Object}** The result
 */
updateResult._op_set = function(ob,pathitem,cloningFunction) {
	var r = cloningFunction(ob);
	r.i = pathitem.u;
	r.v = r.v + 1;
	if (pathitem.hasOwnProperty('m')) {
		r.m = pathitem.m;
	}
	r.t = pathitem.t;
	r.r = false;
	return r;
};

return updateResult;

}(_dereq_('manip')));

},{"manip":14}]},{},[9])
(9)
});