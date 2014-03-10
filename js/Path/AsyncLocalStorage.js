(function(root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	"use strict";
	if (typeof exports === 'object') {
		module.exports = factory(
			require('../Constant.js'),
			require('add-events')
		);
	} else {
		define(
			['../Constant','add-events'],
			factory
		);
	}
})(this, function(SyncIt_Constant,addEvents) {

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
						return this.removeDatasetDatakey(dataset, datakey, false, function() {
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
 * * **@param {Boolean} `delayTillComplete`** If you want to wait for all data to be cleaned
 * * **@param {Function} `next`** Callback when complete, Signature: Function(err, err)
 *   * **@param {Errorcode} `errRootDeletion`** If the Root was successfully deleted
 *   * **@param {Errorcode} `errPathDeletion`** Only supplied if `delayTillComplete` but will give you an indication on whether all the Pathitem were deleted.
 */
Als.prototype.promotePathToOrRemove = function(dataset,datakey,pathToPromote,promoteToWhere,delayTillComplete,next) {
	
	this._getRoot(dataset,datakey,function(err,root) {
		var oldTargetRef = (function() {
				if (root.hasOwnProperty(promoteToWhere) && root[promoteToWhere].hasOwnProperty('_n')) {
					return root[promoteToWhere]._n;
				}
				return null;
			}());
		
		if (!root.hasOwnProperty(pathToPromote)) {
			return this.removeDatasetDatakey(dataset,datakey,delayTillComplete,next);
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
 * * **@param {Boolean} `delayTillComplete`** If you want to wait for all data to be cleaned
 * * **@param {Function} `next`** Callback when complete, Signature: Function(err, err)
 *   * **@param {Errorcode} `errRootDeletion`** If the Root was successfully deleted
 *   * **@param {Errorcode} `errPathDeletion`** Only supplied if `delayTillComplete` but will give you an indication on whether all the Pathitem were deleted.
 */
Als.prototype.removeDatasetDatakey = function(dataset,datakey,delayTillComplete,next) {
	
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
				if (delayTillComplete) { next(ERROR.OK, err); }
				pathRefCount = -1;
			}
			if (--pathRefCount === 0) {
				if (delayTillComplete) { next(ERROR.OK, ERROR.OK); }
			}
		};
		
		this.__removeItem(dataset + '.' + datakey, function(err) {
			if (!delayTillComplete || (err !== ERROR.OK)) {
				next(err);
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
Als.prototype.findFirstDatasetDatakey = function(path,next) {
	this._findFirstDatasetDatakeyReference(path,function(err,dataset,datakey) {
		if (err !== ERROR.OK) {
			return next(err);
		}
		return next(err,dataset,datakey);
	});
};

/**
 * ## SyncIt_Path_AsyncLocalStorage.getFirstPathitem()
 *
 * Will find the first Pathitem via the lowest Reference and return it along
 * with the Dataset, Datakey and Pathitem.
 *
 * * **@param {Path} `path`**
 * * **@param {Function} `next`** Signature: Function(err, dataset, datakey, reference, pathitem)
 *   * **@param {Errorcode} `err`**
 *   * **@param {String} `dataset`**
 *   * **@param {String} `datakey`**
 *   * **@param {String} `reference`**
 *   * **@param {Pathitem} `pathitem`**
 */
Als.prototype.getFirstPathitem = function(path,next) {
	this._findFirstDatasetDatakeyReference(path,function(err,dataset,datakey,reference) {
		if (err !== ERROR.OK) {
			return next(err);
		}
		return this._getPathItem(dataset,datakey,reference,function(err,pathitem) {
			next(err,dataset,datakey,reference,pathitem);
		});
	}.bind(this));
};

/**
 * ## SyncIt_Path_AsyncLocalStorage._findFirstDatasetDatakeyReference()
 *
 * Will find the lowest Reference and return it along with the Dataset, Datakey
 * it was found at.
 *
 * * **@param {Path} `path`**
 * * **@param {Function} `next`** Signature: Function(err)
 *   * **@param {Errorcode} `err`**
 */
Als.prototype._findFirstDatasetDatakeyReference = function(path,next) {
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

});
