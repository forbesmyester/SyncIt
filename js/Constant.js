// if the module has no dependencies, the above pattern can be simplified to
(function (root, factory) {
	if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(factory);
	} else {
		// Browser globals (root is window)
		root.SyncIt_Constant = factory();
  }
}(this, function () {

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
/**
 The data is currently locked, please try again.
*/
Error.UNABLE_TO_PROCESS_BECAUSE_LOCKED = 2;

/**
 The data is currently locked for feeding, please try again.
*/
Error.UNABLE_TO_PROCESS_BECAUSE_FEED_LOCKED = 10;

/**
 Trying to apply an update based on a version number higher than the current.
*/
Error.TRYING_TO_APPLY_TO_FUTURE_VERSION = 3;

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
Error.TRYING_TO_ADD_FUTURE_QUEUEITEM = 14;

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
Error.QUEUE_EMPTY = -3;

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

Locking.PROCESSING = 1;

Locking.FEEDING = 2;

Locking.MAXIMUM_BIT_PATTERN = 3;

var Validation = {};

Validation.DATASET_REGEXP = /^[A-Za-z][A-Za-z0-9\-]+$/;

Validation.DATAKEY_REGEXP = /^[A-Za-z][A-Za-z0-9\-]+$/;

Validation.MODIFIER_REGEXP = /^[A-Za-z][A-Za-z0-9\-]+$/;

Validation.OPERATION_REGEXP = /^(set)|(update)|(remove)$/;

return {
	Error: Error,
	Location: Location,
	Locking: Locking,
	Validation: Validation
};

}));
