/*jshint smarttabs:true */
(function (root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js

	"use strict";

	if (typeof exports === 'object') {
		module.exports = factory(require('manip'));
	} else {
		define(['manip'], factory);
	}
})(this, function (manip) {

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

"use strict";

/**
 * ### updateResult()
 *
 * Runs a `Pathitem` on a `PathRoot` or a `PathRoot` with one or more `Pathitem` already ran on it.
 *
 ***Parameters**
 *
 * * **@param {PathRoot|updateResult(PathRoot,Pathitem)} `obToApplyTo`**
 * * **@param {Pathitem} `pathitem`**
 */
var updateResult = function(obToApplyTo,pathitem,cloningFunction) {
	if (!updateResult.hasOwnProperty('_op_'+pathitem.o)) {
		throw 'SyncLib.updateResult No Operation: updateResult has no ' + 
			'operation '+ pathitem.o;
	}
	var f = updateResult['_op_'+pathitem.o];
	return f.call(this,obToApplyTo,pathitem,cloningFunction);
};

/**
 * ### updateResult.op_update()
 * 
 * Performs a MongoDB like update operation.
 * 
 * #### Parameters
 * 
 * * **@param {Object} `ob`** The Object to update
 * * **@param {Object} `pathitem`** The *Pathitem* to apply
 * * **@param {Function} `cloningFunction`** The function to use to create a clone of `ob`
 * * **@return {Object}** The result.
 */
updateResult._op_update = function(ob,pathitem,cloningFunction) {
	var r = cloningFunction(ob);
	r.i = manip(r.i,pathitem.u,cloningFunction);
	r.v = r.v + 1;
	if (pathitem.hasOwnProperty('m')) {
		r.m = pathitem.m;
	}
	r.t = pathitem.t;
	r.r = false;
	return r;
};

/**
 * ### updateResult.op_removeData()
 * 
 * Remove operations set the removed flag, increment the version and set the 
 * *modifier*.
 * 
 * #### Parameters
 * 
 * * **@param {Object} `ob`** The Object to update
 * * **@param {Object} `pathitem`** The Pathitem to be applied
 * * **@param {Function} `cloningFunction`** The function to use to create a clone of `ob`
 * * **@return {Object}** The result
 */
updateResult._op_remove = function(ob,pathitem,cloningFunction) {
	var r = cloningFunction(ob);
	r.v = r.v + 1;
	if (pathitem.hasOwnProperty('m')) {
		r.m = pathitem.m;
	}
	r.t = pathitem.t;
	r.r = true;
	return r;
};


/**
 * ### updateResult.op_set()
 * 
 * A set operation is a local *Operation* which will overwrite all data. The 
 * version will be incremented, *Modifier* set and the removed flag will be unset.
 * 
 * #### Parameters
 * 
 * * **@param {Object} `ob`** The Object to update
 * * **@param {Object} `pathitem`** The Pathitem to be applied
 * * **@param {Function} `cloningFunction`** The function to use to create a clone of `ob`
 * * **@return {Object}** The result
 */
updateResult._op_set = function(ob,pathitem,cloningFunction) {
	var r = cloningFunction(ob);
	r.i = pathitem.u;
	r.v = r.v + 1;
	if (pathitem.hasOwnProperty('m')) {
		r.m = pathitem.m;
	}
	r.t = pathitem.t;
	r.r = false;
	return r;
};

return updateResult;

});
