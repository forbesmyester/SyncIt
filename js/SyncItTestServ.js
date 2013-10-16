/*jshint smarttabs:true */
(function (root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	if (typeof exports === 'object') {
		module.exports = factory(require('./Constant.js'));
	} else if (typeof define === 'function' && define.amd) {
		define(['syncit/Constant'], factory);
	} else {
		root.SyncItTestServ = factory(root.SyncIt_Constant);
	}
})(this, function (SyncIt_Constant) {

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: 2013 Matthew Forrester
// License: MIT/BSD-style

"use strict";

var queueitemProperties = ['s','k','b','m','t','u','o'];

/**
 * ### new TestServer()
 * 
 * Constructor
 * 
 * #### Parameters
 * 
 * * **@param {ServerPersist} `serverPersist`** A [ServerPersist](ServerPersist/MemoryAsync.js.html) instance.
 * * **@param {Function} `extractModifierFromRequestFunc`** This function will be used to get the modifier for a Dataset / Datakey, it is anticipated this is from the Express Request.
 */
var TestServer = function(serverPersist, extractModifierFromRequestFunc) {
	this._serverPersist = serverPersist;
	this._listeners = {fed: []};
	this._getModifier = extractModifierFromRequestFunc;
};

/**
 * ### TestServer.getDatasetNames()
 * 
 * Retrieves a list of *Dataset* names.
 *
 * #### Parameters
 *
 * * **@param {Request} `req`** A Express like Request Object
 * * **@param {Function} `responder`** Callback. Signature: `function (statusString, data)`
 *   * **@param {String} `responder.statusString`** Always 'ok'
 *   * **@param {Array} `responder.data`** An Array of *Dataset* names
 */
TestServer.prototype.getDatasetNames = function(req,responder) {
	this._serverPersist.getDatasetNames(function(err,names) {
		responder('ok',names);
	});
};

/**
 * ### TestServer.getQueueitem()
 * 
 * Retrieves a list of Queueitem from a previously known one.
 *
 * #### Parameters
 *
 * * **@param {Request} `req`** A Express like Request Object
 *   * **@param {String} `req.(param|query|body).s`** REQUIRED: The *Dataset* you want to download updates from
 *   * **@param {String} `req.(param|query|body).from`** OPTIONAL: The last known Id for a Queueitem, if supplied all items from, but not including that Queueitem will be downloaded.
 * * **@param {Function} `responder`** Callback. Signature: `function (statusString, data)`
 *   * **@param {String} `responder.statusString`** 'validation_error' if no dataset supplied, 'ok' otherwise.
 *   * **@param {Object} `responder.data`** An object in the form `{queueitems: [<Queueitem>,<Queu...>], to: <QueueitemId>}`
 */
TestServer.prototype.getQueueitem = function(req,responder) {
	
	var reqInfo = this._extractInfoFromRequest(req, ['from']);
	
	if (!this._validateInputFieldAgainstRegexp(
		's',
		SyncIt_Constant.Validation.DATASET_REGEXP,
		reqInfo
	)) {
		return responder('validation_error',null);
	}
	
	this._serverPersist.getQueueitem(
		reqInfo.s,
		reqInfo.hasOwnProperty('from') ? reqInfo.from : null,
		function(err,queueitems,to) {
			if (err) { throw err; }
			return responder('ok',{ queueitems:queueitems, to: to});
		}
	);
};

/**
 * ### TestServer.getValue()
 *
 * #### Parameters
 *
 * * **@param {Request} `req`** A Express like Request Object
 *   * **@param {String} `req.(param|query|body).k`** REQUIRED: The *Datakey* you want to get the value from.
 *   * **@param {String} `req.(param|query|body).s`** REQUIRED: The *Dataset* you want to get the value from.
 * * **@param {Function} `responder`** Callback. Signature: `function (statusString, data)`
 *   * **@param {String} `responder.statusString`** `validation_error` if not given a valid looking Dataset and Datakey. `not_found` If the Dataset and Datakey has no records. `gone` If there was data, but it has been deleted. `ok` should data be found.
 *   * **@param {Object} `responder.data`** The Jrec stored at that location.
 */
TestServer.prototype.getValue = function(req,responder) {
	
	var reqInfo = this._extractInfoFromRequest(req);
	
	if (!this._validateInputFieldAgainstRegexp(
		's',
		SyncIt_Constant.Validation.DATASET_REGEXP,
		reqInfo
	)) { return responder('validation_error',null); }
	if (!this._validateInputFieldAgainstRegexp(
		'k',
		SyncIt_Constant.Validation.DATASET_REGEXP,
		reqInfo
	)) { return responder('validation_error',null); }
	
	this._serverPersist.getValue(
		reqInfo.s,
		reqInfo.k,
		function(err,jrec) {
			if (err === SyncIt_Constant.Error.NO_DATA_FOUND) {
				return responder('not_found',null);
			}
			if (jrec.r) {
				return responder('gone',jrec);
			}
			return responder('ok',jrec);
		}
	);
};
/**
 * ### TestServer.listenForFed()
 * 
 * Listen for data changes.
 *
 * #### Parameters
 *
 * * **@param {Function} `listener`** Callback. Signature: `function (processedQueueitem, processedJrec)`
 *   * **@param {String} `listener.dataset`** The dataset of the just fed Queueitem.
 *   * **@param {String} `listener.datakey`** The datakey of the just fed Queueitem.
 *   * **@param {Queueitem} `listener.processedQueueitem`** The Queueitem which has just been added
 *   * **@param {Storerecord} `listener.processedJrec`** The resulting data after the Queueitem has been applied
 */
TestServer.prototype.listenForFed = function(listener) {
	this.listen('fed',listener);
};
/**
 * ### TestServer.listen()
 *
 * See [TestServer.listenForFed()](#testserver.listenforfed--), as that is the only supported event.
 *
 * #### Parameters
 *
 * * **@param {String} `event`** The event to listen to
 * * **@param {Function} `listener`** The function which will be fired when the event occurs
 */
TestServer.prototype.listen = function(event,listener) {
	
	var propertyNames = (function(ob) {
		var r = [];
		for (var k in ob) { if (ob.hasOwnProperty(k)) {
			r.push(k);
		} }
		return r;
	})(this._listeners);
	
	if (propertyNames.indexOf(event) == -1) {
		return false;
	}
	this._listeners[event].push(listener);
	return true;
};

/**
 * ### TestServer._setRemoveOrUpdate()
 * 
 * TestServer.PATCH(), TestServer.PUT() and TestServer.DELETE() really all do 
 * the same thing, that being to put a Queueitem on the Queue and then calculate
 * the result of that operation. Therefore all the functions wrap this general
 * purpose function.
 *
 * * **@param {Request} `req`** A Express like Request Object
 *   * **@param {Object} `req.(param|query|body)`** Should look like a Queueitem.
 * * **@param {Function} `responder`** Callback. Signature: `function (statusString, data)`
 *   * **@param {String} `responder.statusString`** Quite a set... `validation_error` || `service_unavailable` || `conflict` || `out_of_date` || `gone` || `created` || `ok`
 *   * **@param {Object} `responder.data`** Object {loc: <location>, to: <lastId>}
 *      * **@param {String} `responder.data.loc`** The Dataset and Datakey seperated by a '/'
 *      * **@param {String} `responder.data.to`** The Id which which was just created, this is for use in [TestServer.getQueueitem()](#testserver.getqueueitem--)
 */
TestServer.prototype._setRemoveOrUpdate = function(req,operation,responder) {
	
	if (!this._validate_queueitem(req)) {
		return responder('validation_error',null);
	}
	
	var queueitem = this._extractInfoFromRequest(req);
	
	// Translations from SyncIt_Constant.Error to StatusString.
	var feedErrors = {
		lockedError:function(err) {
			if (err === SyncIt_Constant.Error.UNABLE_TO_PROCESS_BECAUSE_LOCKED) {
				return 'service_unavailable';
			}
			return false;
		},
		versionError: function(err) {
			if (err === SyncIt_Constant.Error.TRYING_TO_ADD_FUTURE_QUEUEITEM) {
				return 'conflict';
			}
			return false;
		},
		unexpectedError: function(err) {
			if (err !== SyncIt_Constant.Error.OK) {
				throw "TestServer.unexpectedError: Unexpected error code "+err;
			}
			return false;
		},
		tryingToApplyOld: function(err) {
			if (err == SyncIt_Constant.Error.TRYING_TO_ADD_QUEUEITEM_BASED_ON_OLD_VERSION) {
				return 'out_of_date';
			}
			return false;
		},
		modifyRemoved: function(err) {
			if (err == SyncIt_Constant.Error.DATA_ALREADY_REMOVED) {
				return 'gone';
			}
			return false;
		}
	};
	
	if (queueitem.hasOwnProperty('o') && (queueitem.o !== operation)) {
		return responder('validation_error');
	}
	
	if (!queueitem.hasOwnProperty('b')) {
		return responder('validation_error',null);
	}
	
	if ((operation != 'remove') && !queueitem.hasOwnProperty('u')) {
		return responder('validation_error',null);
	}
	
	var inst = this;
	inst._serverPersist.push(
		queueitem,
		function(err,processedQueueitem,processedJrec,createdId) {
			
			var emit = false;
			
			if (err === SyncIt_Constant.Error.OK) {
				emit = true;
			}
			
			if (err === SyncIt_Constant.Error.TRYING_TO_ADD_ALREADY_ADDED_QUEUEITEM) {
				err = SyncIt_Constant.Error.OK;
			}
			
			var checks = [
				feedErrors.lockedError,
				feedErrors.versionError,
				feedErrors.tryingToApplyOld,
				feedErrors.modifyRemoved,
				feedErrors.unexpectedError
			];
			
			var r = false;
			
			for (var i=0;i<checks.length;i++) {
				r = checks[i].call(this,err);
				if (r !== false) {
					return responder(r,null);
				}
			}
			
			if (emit) {
				inst._emit(
					'fed',
					processedQueueitem.s,
					processedQueueitem.k,
					processedQueueitem,
					processedJrec
				);
			}
			return responder(
				queueitem.b === 0 ? 'created' : 'ok',
				{
					loc: '/'+processedQueueitem.s+'/'+processedQueueitem.k,
					to: createdId
				}
			);
		},
		function() { console.log("SERVER_APPLIED"); }
	);

};
/**
 * ### TestServer.PUT()
 *
 * The operation (o) in the Request (`req.body`) object should be 'set'. For all other documentation see [TestServer.(_setRemoveOrUpdate)](#testserver._setremoveorupdate--).
 */
TestServer.prototype.PUT = function(req,responder) {
	this._setRemoveOrUpdate(req,'set',responder);
};
/**
 * ### TestServer.PATCH()
 *
 * The operation (o) in the Request (`req.body`) object should be 'update'. For all other documentation see [TestServer.(_setRemoveOrUpdate)](#testserver._setremoveorupdate--).
 */
TestServer.prototype.PATCH = function(req,responder) {
	this._setRemoveOrUpdate(req,'update',responder);
};
/**
 * ### TestServer.DELETE()
 *
 * The operation (o) in the Request (`req.body`) object should be 'remove'. For all other documentation see [TestServer.(_setRemoveOrUpdate)](#testserver._setremoveorupdate--).
 */
TestServer.prototype.DELETE = function(req,responder) {
	this._setRemoveOrUpdate(req,'remove',responder);
};

/**
 * **TestServer._emit()**
 * 
 * Emits an Event.
 * 
 * **Parameters**
 * 
 * * **@param {String} `event`** The name of the Event you wish to emit.
 * * **@param {} `param2, param3, ...`** Extra parameters will be passed to the event listener.
 */
TestServer.prototype._emit = function(event) {
	
	var i = 0,
		args = Array.prototype.slice.call(arguments,1);
	
	if (!this._listeners.hasOwnProperty(event)) {
		throw "SyncIt._emit(): Firing not know event '"+event+"'";
	}
	for (i=0; i<this._listeners[event].length; i++) {
		this._listeners[event][i].apply(this,args);
	}
	
};

/**
 * ### TestServer._extractInfoFromRequest()
 * 
 * Extracts Queueitem information and any extra from an express `req`.
 * 
 * Expects to see something like the following:
 * 
 * ```
 * {
 *     s: <Dataset>,
 *     k: <Datakey>,
 *     b: <Basedonversion>,
 *     m: <Modifier>, // (Note: This should not be here, or at least should be overridden by the Session or something that the User cannot control)
 *     t: <Modificationtime>,
 *     o: <Operation>,
 *     u: <Update>,
 * }
 * ```
 *
 * See [SyncIt documentation](SyncIt.js.html) for details about what a Queueitem is etc.
 *
 * #### Parameters
 *
 * * **@param {Request} `req`** A Express like Request Object.
 * * **@param {Array} `extras`** See description.
 */
TestServer.prototype._extractInfoFromRequest = function(req, extras) {
	
	var r = {},
		i = 0,
		j = 0,
		inputZones = ['body', 'query', 'params'];
	
	for (i=0; i<inputZones.length; i++) {
		if (!req.hasOwnProperty(inputZones[i])) {
			continue;
		}
		for (j=0; j<queueitemProperties.length; j++) {
			if (req[inputZones[i]].hasOwnProperty(queueitemProperties[j])) {
				r[queueitemProperties[j]] = req[inputZones[i]][queueitemProperties[j]];
			}
		}
		if (extras !== undefined) {
			for (j=0; j<extras.length; j++) {
				if (req[inputZones[i]].hasOwnProperty(extras[j])) {
					r[extras[j]] = req[inputZones[i]][extras[j]];
				}
			}
		}
	}
	
	var fixTypesBeforeStore = function(ob) {
		
		var forceStr = function(v) { return "" + v; };
		var forceInt = function(v) { return parseInt(v,10); };
		var forceBool = function(v) { return v ? true : false; };
		var forceField = function(ob,field,forcingFunc) {
			if (ob.hasOwnProperty(field)) {
				ob[field] = forcingFunc(ob[field]);
			}
			return ob;
		};
		
		ob = forceField(ob, 's', forceStr);
		ob = forceField(ob, 'k', forceStr);
		ob = forceField(ob, 'b', forceInt);
		ob = forceField(ob, 'm', forceStr);
		ob = forceField(ob, 'r', forceBool);
		ob = forceField(ob, 'o', forceStr);
		ob = forceField(ob, 't', forceInt);
		
		return ob;
	};
	
	return fixTypesBeforeStore(r);

};

/**
 * ### validateInputFieldAgainstRegex
 * 
 * Validates a Request (`req`) `field` within either the `req.body` or `req.params` against a `regexp`.
 *
 * #### Parameters
 *
 * * **@param {String} `field`** The field you are checking.
 * * **@param {Regexp} `regexp`** The RegExp you are checking the field against.
 * * **@param {Request} `reqInfo`** Information extract from an express `req` via TestServer._extractInfoFromRequest()
 * * **@return {Boolean}** `true` if the input is OK.
 */
TestServer.prototype._validateInputFieldAgainstRegexp = function(field,regexp,reqInfo) {
	if (!regexp) {
		return false;
	}
	if (!reqInfo.hasOwnProperty(field)) {
		return false;
	}
	if (reqInfo[field].match(regexp) !== null) {
		return true;
	}
	return false;
};

TestServer.prototype._validate_queueitem = function(req) {
	
	var reqInfo = this._extractInfoFromRequest(req);
	
	// dataset
	if (!this._validateInputFieldAgainstRegexp(
		's',
		SyncIt_Constant.Validation.DATASET_REGEXP,
		reqInfo
	)) { return false; }
	
	// datakey
	if (!this._validateInputFieldAgainstRegexp(
		'k',
		SyncIt_Constant.Validation.DATAKEY_REGEXP,
		reqInfo
	)) { return false; }
	
	// modifier
	if (!this._getModifier(req).match(
		SyncIt_Constant.Validation.MODIFIER_REGEXP
	)) { return false; }
	
	// operation
	if (!this._validateInputFieldAgainstRegexp(
		'o',
		SyncIt_Constant.Validation.OPERATION_REGEXP,
		reqInfo
	)) { return false; }
	
	for (var i=0; i < queueitemProperties.length; i++) {
		if (!reqInfo.hasOwnProperty(queueitemProperties[i])) {
			return false;
		}
	}
	
	return true;
};

return TestServer;
});
