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
Error.NOTHING_TO_ADVANCE_TO = 21;
Error.PATH_DOES_NOT_EXISTS = 22;
Error.MULTIPLE_PATHS_FOUND = 23;
/**
 The data is currently locked, please try again.
*/
Error.UNABLE_TO_PROCESS_BECAUSE_LOCKED = 2;

Error.FEED_VERSION_ERROR = 24;

/**
 Trying to change data post delete
 */
Error.DATA_ALREADY_REMOVED = 8;

/**
 * If you have local Queueitem that have been put into the Repository and not
 * applied locally, but are feeding Queueitem with a higher version.
 */
Error.BASED_ON_IN_QUEUE_LESS_THAN_BASED_IN_BEING_FED = 18;

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
 * A request was made to add a Queueitem, but it is based on an outdated version. - server only
 */
Error.TRYING_TO_ADD_QUEUEITEM_BASED_ON_OLD_VERSION = 11;

/**
 * For some reason, we are trying to add an item based on something that does not yet exist! - server only
 */
Error.TRYING_TO_ADD_FUTURE_QUEUEITEM = 20;


/**
 * A request was made to add a Queueitem, but we already have it (note this may only happen for the latest!) - server only
 */
Error.TRYING_TO_ADD_ALREADY_ADDED_QUEUEITEM = 12;

/**
 * Trying to apply an update, but the queue is empty.
 */
Error.PATH_EMPTY = -3;

/**
 * When resolving conflict, we were told not to continue
 */
Error.NOT_RESOLVED = -4;

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
