module.exports = (function (buildRe) {

"use strict";
	
// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

var thrower = function(next) {
	return function(e) {
		if (e) {
			throw e;
		}
		var args = Array.prototype.slice.call(arguments,1);
		next.apply(this, args);
	};
};

/**
 * # LocalForage
 *
 * A pretty basic wrapper around Mozilla's LocalForage
 *
 * Allows the existance of namespaces for easy seperation of data and
 * automatically serializes and unserializes all data stored within
 * it.
 *
 * It is anticipated that a "." is used to seperate information within
 * a key, although that will only be a factor if you wish to use the 
 * `LocalForage.findKeys()` method.
 */
var LocalForage = function(localForage,namespace,serialize,unserialize) {
	this._lf = localForage;
	this._serialize = serialize;
	this._unserialize = unserialize;
	this._ns = namespace;
};

/**
 * Returns the amount of items stored in the LocalForage. Note this is not the 
 * amount of items which are stored within the namespace
 */
LocalForage.prototype.getLength = function(next) {
	return this._lf.length(thrower(next));
};

/**
 * ## LocalForage.prototype.setItem()
 *
 * Sets key k to value v
 *
 * ### Parameters
 *
 * * **@param {String} `k`**
 * * **@param {Object} `unserialize`**
 */
LocalForage.prototype.setItem = function(k,v,next) {
	return this._lf.setItem(this._ns+'.'+k,this._serialize(v), thrower(next));
};

/**
 * ## LocalForage.prototype.clear()
 *
 * Removes all items in the namespace.
 */
LocalForage.prototype.clear = function(next) {
	return this._lf.clear(thrower(next));
};

/**
 * ## LocalForage.prototype.key()
 *
 * Fetches the LocalForage key at index `i` if it is within the 
 * namespace. If it is not within the namespace `null` will be
 * returned.
 *
 * ### Parameters
 *
 * * **@param {Number} `i`**
 */
LocalForage.prototype.key = function(i,next) {
	var ns = this._ns;
	return this._lf.key(i,thrower(function(k) {
		if (k === null) { return null; }
		if (
			(k.length > ns.length) &&
			(k.substr(0,ns.length + 1) == ns+'.')
		) {
			return next(k.substr(k.indexOf('.')+1));
		}
		return next(null);
	}));
};

/**
 * ## LocalForage.prototype.getItem()
 *
 * Gets the item stored at key `k` within the namespace.
 *
 * ### Parameters
 *
 * * **@param {String} `k`**
 */
LocalForage.prototype.getItem = function(k,next) {
	var unserialize = this._unserialize;
	return this._lf.getItem(this._ns+'.'+k,thrower(function(val) {
		next(unserialize(val));
	}));
};

/**
 * ## LocalForage.prototype.removeItem()
 *
 * Removes the item stored at key `k`.
 *
 * ### Parameters
 *
 * * **@param {String} `k`**
 */
LocalForage.prototype.removeItem = function(k,next) {
	return this._lf.removeItem(this._ns+'.'+k,thrower(next));
};

/**
 * ## LocalForage.prototype.findKeys()
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
LocalForage.prototype.findKeys = function(pattern,next) {
	var l = 0,
		i = 0,
		k = '',
		r = [],
		ns = this._ns,
		re = null;
	
	
	re = buildRe(pattern);

	if (re === false) {
		throw new Error(
			"You cannot find keys from the pattern '" + pattern + "'"
		);
	}

	this._lf.keys(thrower(function(keys) {
		for (i = 0, l = keys.length; i < l; i++) {
			k = keys[i];
			if (
				(k.length > ns.length) &&
				(k.substr(0,ns.length + 1) == ns + '.')
			) {
				k = k.substr(k.indexOf('.')+1);
				if (re.test(k)) {
					r.push(k);
				}
			}
		}
		next(r);
	}));

	return;

};

return LocalForage;

}(require('./FindKeysReBuilder.js')));

