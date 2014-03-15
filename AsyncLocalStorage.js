(function (root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	"use strict";
	if (typeof exports === 'object') {
		module.exports = factory(
			require('./SyncLocalStorage.js'),
			require('./makeAsync.js')
		);
	} else {
		define(['./SyncLocalStorage','./makeAsync'],factory);
	}
}(this, function (SyncLocalStorage,makeAsync) {

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

}));
