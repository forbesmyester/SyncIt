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
return  makeAsync(SyncLocalStorage, 1, true);

}(require('./SyncLocalStorage'), require('./makeAsync.js')));
