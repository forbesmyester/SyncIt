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
		root.SyncIt_Store_Persist = factory(
			root.SyncIt_Constant
		);
	}
})(this, function (SyncIt_Constant) {

"use strict";

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
 * * **@param {Function} `whenRetrieved`** Signature: `function(err, storerecord)
 *   * **@param {Errorcode} `whenRetrieved.err`**
 *   * **@param {Storerecord} `whenRetrieved.storerecord`** The value stored at the *Dataset* / *Datakey*.
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

return Store;

});
