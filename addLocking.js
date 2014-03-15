(function (root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	"use strict";
	if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		define(factory);
	}
}(this, function () {
	
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

}));
