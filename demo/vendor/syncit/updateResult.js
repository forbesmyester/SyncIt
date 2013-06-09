/*jshint smarttabs:true */
(function (root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	if (typeof exports === 'object') {
		module.exports = factory(
			require('./manip.js')
		);
	} else if (typeof define === 'function' && define.amd) {
		define(
			['syncit/manip'],
			factory
		);
	} else {
		root.SyncIt_updateResult = factory(
			root.SyncIt_manip
		);
	}
})(this, function (manip) {

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

"use strict";

/**
 * ### updateResult()
 *
 * Runs a queueitem on an object, which would normally be either a *Jrec* or a *Jrec* with one or more *Queueitem* already ran on it.
 *
 ***Parameters**
 *
 * * **@param {Jrec|updateResult(Jrec,Queueitem)} `obToApplyTo`**
 * * **@param {Queueitem} `queueitem`**
 */
var updateResult = function(obToApplyTo,queueitem,cloningFunction) {
	if (!updateResult.hasOwnProperty('_op_'+queueitem.o)) {
		throw 'SyncLib.updateResult No Operation: updateResult has no ' + 
			'operation '+ queueitem.o;
	}
	var f = updateResult['_op_'+queueitem.o];
	return f.call(this,obToApplyTo,queueitem,cloningFunction);
};

/**
 * ### updateResult.op_update()
 * 
 * Performs a MongoDB like update operation.
 * 
 * #### Parameters
 * 
 * * **@param {Object} `ob`** *Jrec* like object to apply the *Queueitem* to.
 * * **@param {Object} `queueitem`** The *Queueitem* to apply
 * * **@param {Function} `cloningFunction`** The function to use to create a clone of `ob`
 * * **@return {Object}** The result.
 */
updateResult._op_update = function(ob,queueitem,cloningFunction) {
	var r = cloningFunction(ob);
	r.i = manip(r.i,queueitem.u,cloningFunction);
	r.v = queueitem.b + 1;
	r.m = queueitem.m;
	r.t = queueitem.t;
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
 * * **@param {Object} `queueitem`** The queueitem to be applied
 * * **@param {Function} `cloningFunction`** The function to use to create a clone of `ob`
 * * **@return {Object}** The result
 */
updateResult._op_remove = function(ob,queueitem,cloningFunction) {
	var r = cloningFunction(ob);
	r.v = queueitem.b + 1;
	r.m = queueitem.m;
	r.t = queueitem.t;
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
 * * **@param {Object} `queueitem`** The queueitem to be applied
 * * **@param {Function} `cloningFunction`** The function to use to create a clone of `ob`
 * * **@return {Object}** The result
 */
updateResult._op_set = function(ob,queueitem,cloningFunction) {
	var r = cloningFunction(ob);
	r.i = queueitem.u;
	r.v = queueitem.b + 1;
	r.m = queueitem.m;
	r.t = queueitem.t;
	r.r = false;
	return r;
};

return updateResult;

});
