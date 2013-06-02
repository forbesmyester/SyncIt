/**
 * ## Persist
 * 
 * Persist the the actual method that will be used to store the data and follows
 * the HTML5 LocalStorage API to some degree.
 * 
 * It is used by Store and Queue to store data.
 */

/**
 * ### Persist.set()
 * 
 * Sets a value.
 * 
 * #### Parameters
 * 
 * * **@param {String} `key`** The key to set.
 * * **@param {Var} `value`** The value to set it to.
 * * **@param {Function} `done`** Called when complete. Signature: `function(err)`
 */

/**
 * ### Persist.get()
 * 
 * #### Parameters
 * 
 * * **@param {String} `key`** The key to get
 * * **@param {Function} `done`** Called when complete. Signature: `function(err,val)`
 *   * **@param {ErrorCode} `done.err`** Will be NO_DATA_FOUND if no data is at that key, OK for normal operation but could be something else to indicate a failure retrieving the data.
 *   * **@param {Array} `done.val`** The value stored at `key`.
 */

/**
 * ### Persist.remove()
 * 
 * #### Parameters
 * 
 * * **@param {String} `key`** The key to remove
 * * **@param {Function} `done`** Called when complete. Signature: `function(err)`
 *   * **@param {ErrorCode} `done.err`** Will be NO_DATA_FOUND if no data was at that key, OK otherwise.
 */

/**
 * ### Persist.getKeys()
 * 
 * #### Parameters
 * 
 * * **@param {Function} `done`** Called when complete. Signature: `function(err,keys)`
 *   * **@param {ErrorCode} `done.err`** OK under normal operation, even if there are no keys.
 *   * **@param {Array} `done.keys`** An array of keys in the *Persist*
 */