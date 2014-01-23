(function (root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	"use strict";
	if (typeof exports === 'object') {
		module.exports = factory(require('./Constant.js'));
	} else if (typeof define === 'function' && define.amd) {
		define(['syncit/Constant'],factory);
	} else {
		root.SyncIt_dontListLocallyDeletedDatakeys = factory(root.SyncIt_Constant);
	}
}(this, function (SyncIt_Constant) {
	
"use strict";

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

/**
 * # dontListLocallyDeletedDatakeys()
 *
 * Adds a wrapper around some methods of SyncIt to make `getDatakeysInDataset()`
 * not list locally deleted Datakey
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
			
			for (i=0, l=datakeys.length; i<l; i++) {
				syncIt.getFull(dataset,datakeys[i],handleGetFull);
			}
		});
	};
	
	return syncIt;
	
};

}));
