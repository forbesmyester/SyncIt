module.exports = (function() {

"use strict";

/**
 * SyncIt relies on being able to have a incremental dataversion within a Dataset
 * so clients can request updates from that version. This function will generate
 * version numbers. NOTE it is perfectly fine for this sequence to have holes in.
 *
 * Throws on Mongo Error.
 *
 * * **@param {MongoskinConnection} `mongoskinConnection`** Must be connected.
 * * **@param {String} `sequenceCollection`** The name of the collection to store sequences in.
 * * **@param {String} `sequenceName`** The sequence you wish to generate the Id for.
 * * **@param {Function} `callback`** Will be called once the number has been generated.
 *   * **@param {Reserverd} `callback.err`** Space reserved for errors.
 *   * **@param {Number} `callback.n`** The new number.
 */
return function(mongoskinConnection, sequenceCollection, sequenceName, callback) {
	mongoskinConnection.collection(sequenceCollection).findAndModify(
		{_id: sequenceName},
		{},
		{$inc: {n: 1}},
		{'new': true, upsert: true, multi: false},
		function(err, result) {
			if (err) {
				throw new Error("getIncrementalNumber: ", err, sequenceCollection);
			}
			callback(err, result.n);
		}
	);
};

})();
