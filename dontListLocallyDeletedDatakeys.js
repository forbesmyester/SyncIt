(function (root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	"use strict";
	if (typeof exports === 'object') {
		module.exports = factory(require('./Constant.js'));
	} else {
		define(['./Constant'],factory);
	}
}(this, function (SyncIt_Constant) {
	
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

}));
