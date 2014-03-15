/*jshint smarttabs:true */
define(
['../SyncIt','../Constant','dojo/_base/declare','dojo/Deferred',"dojo/promise/all",
	"dojo/_base/array",'dojo/store/util/QueryResults'],
function(SyncIt,SyncIt_Constant,declare,Deferred,promiseAll,dojoBaseArray,QueryResults) {

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: 2013 Matthew Forrester
// License: MIT/BSD-style

"use strict";

return declare('syncit.Unsupported.SyncItStore',[], {
	
	/**
	 * Constructor.
	 * 
	 * You must call SyncItStore.startup() afterwards.
	 * 
	 * @param {SyncIt} syncIt
	 * @param {String} dataset The dataset this grid represents, null implies all dataset(!)
	 * @param {Array} indexes Extra indexes to maintain, id will always be Indexed
	 */
	constructor: function(syncIt,dataset,indexes,options) {
		this._syncIt = syncIt;
		this._dataset = dataset;
		this._jreadCache = [];
		this._lastOptions = undefined;
		this._hideDeleted = true;
		this._index = {
			id:{},
			s:{},
			k:{},
			v:{},
			m:{},
			r:{},
			t:{}
		};
		for (var i=0;i<indexes.length;i++) {
			this._index[indexes[i]] = {};
		}
		if ((typeof options == 'object') && (options.hasOwnProperty('hideDeleted'))) {
			this._hideDeleted = options.hideDeleted ? true : false;
		}
	},
	startup: function(startupCompleteCallback) {
		var inst = this;
		
		var indexItem = function(dataset,datakey,done) {

			if ((inst._dataset !== null) && (inst._dataset != dataset)) {
				return done();
			}
			
			var perform = function(jrec) {
				
				inst._jreadCache[inst.getIdentity(jrec)] = jrec;
				for (var index in inst._index) { if (inst._index.hasOwnProperty(index)) {
					var indKey = inst._navigateToPath(jrec,index);
					indKey = typeof(indKey)+':'+indKey;
					if (!inst._index[index].hasOwnProperty(indKey)) {
						inst._index[index][indKey] = [];
					}
					inst._index[index][indKey].push(dataset+'.'+datakey);
					
				}}
				
			};
			
			inst._syncIt.getFull(dataset,datakey,function(err,jread) {
				if (
					(err != SyncIt_Constant.Error.OK) &&
					(err != SyncIt_Constant.Error.DATA_ALREADY_REMOVED)
				) { throw err; }
				var wasAlreadyThere = inst._removeFromIndexes(dataset+'.'+datakey);
				perform(inst._makeFullStoreRecord(jread,dataset+'.'+datakey));
				if (inst.hasOwnProperty('notify')) {
					inst.notify(
						inst._hideDeleted && jread.removed ? undefined : jread,
						wasAlreadyThere ? inst.getIdentity(jread) : undefined
					);
				}
				done();
			});
			
		};
		
		inst._syncIt.listenForAddedToPath(function(dataset, datakey) {
			indexItem(dataset, datakey, function() {} );
		});
		
		inst._syncIt.listenForAdvanced(function(dataset, datakey) {
			indexItem(dataset, datakey, function() {} );
		});
		
		inst._syncIt.listenForFed(function(dataset, datakey) {
			indexItem(dataset, datakey, function() {} );
		});
		
		var indexDataset = function(dataset) {

			inst._syncIt.getDatakeysInDataset(dataset,function(err,keys) {
				
				var indexesToCreate = keys.length;
				
				if (indexesToCreate === 0) {
					startupCompleteCallback();
				}
				
				var i = 0,
					l = 0;
				
				// Fired when all indexes have been created for one jrec.
				var indexed = function() {
					if (--indexesToCreate === 0) {
						if (startupCompleteCallback !== undefined) {
							startupCompleteCallback();
						}
					}
				};
				
				for (i=0,l=keys.length; i<l; i++) {
					indexItem(dataset,keys[i],indexed);
				}
				
			});
		};

		if (this._dataset !== null) {
			indexDataset(this._dataset);
		} else {
			inst._syncIt.getDatasetNames(function(err,datasets) {
				var i=0,
					l=0;
				for (i=0,l=datasets.length; i<l; i++) {
					indexDataset(datasets[i]);
				}
			});
		}
		
	},
	_removeFromIndexes: function(jrecId) {
		var index = '',
			indKey = '',
			oldLength = 0,
			removed = false;
		
		var filterFunc = function(indJrecId) {
			if (indJrecId == jrecId) {
				return false;
			}
			return true;
		};
		
		for (index in this._index) { if (this._index.hasOwnProperty(index)) {
			for (indKey in this._index[index]) { if (this._index[index].hasOwnProperty(indKey)) {
				oldLength = this._index[index][indKey].length;
				this._index[index][indKey] = this._index[index][indKey].filter(filterFunc);
				if (oldLength != this._index[index][indKey].length) {
					removed = true;
				}
			}}
		}}
		
		return removed;
	},
	_navigateToPath: function(ob,path) {
		var k = '';
		var parsePath = path.split('.');
		while (parsePath.length) {
			k = parsePath.shift();
			if (!ob.hasOwnProperty(k)) {
				return null;
			}
			if (parsePath.length === 0) {
				return ob[k];
			}
			ob = ob[k];
		}
		return null;
	},
	_makeFullStoreRecord: function(jread,newId) {
		jread.s = newId.split('.')[0];
		jread.k = newId.split('.')[1];
		jread.id = newId;
		return jread;
	},
	_getDatasetFromId: function(id) {
		return id.replace(/\..*/,'');
	},
	_getDatakeyFromId: function(id) {
		return id.replace(/.*\./,'');
	},
	get: function(id) {
		var deferred = new Deferred(),
			inst = this;
		this._syncIt.getFull(
			this._getDatasetFromId(id),
			this._getDatakeyFromId(id),
				function(err,jread) {
				if (err !== SyncIt_Constant.Error.OK) {
					deferred.reject(err);
				}
				inst._makeFullStoreRecord(jread,id);
				deferred.resolve(jread);
			}
		);
		return deferred.promise;
	},
	getIdentity: function(jread) {
		return jread.id;
	},
	queryEngine: function() {
		
		var inst = this;
		
		return function(query,options) {
			
			
			// First of all, if the query comes from an adding notify, make sure to add
			// the supplied new objects to the jread cache.
			// if ((query instanceof Array) && (options === undefined)) {
			// 	(function(objs) {
			// 		var jreadCacheIds = dojoBaseArray.map(
			// 			inst._jreadCache,
			// 			function(jread) {
			// 				return jread.id;
			// 			}
			// 		);
			// 		for (var i=0;i<objs.length;i++) {
			// 			if ((objs[i].hasOwnProperty('id')) && jreadCacheIds.indexOf(objs[i].id) == -1) {
			// 				inst._jreadCache.push(objs[i]);
			// 			}
			// 		}
			// 	})(query);
			// }
			
			var getFromLastResultSet = function(jrecId) {
				if (inst._jreadCache.hasOwnProperty(jrecId)) {
					return inst._jreadCache[jrecId];
				}
				// var obIds = Object.getOwnPropertyNames(inst._jreadCache);
				// for (var i=0;i<inst._jreadCache.length;i++) {
				// 	if (inst._jreadCache[i].id == jrecId) {
				// 		return inst._jreadCache[i];
				// 	}
				// }
				return null;
			};
			
			var sort = {attribute:'id',descending:false},
				i,j,l = 0;
			
			if (options !== undefined) {
				inst._lastOptions = options;
			}
			
			
			if ( ( inst._lastOptions !== undefined ) && inst._lastOptions.hasOwnProperty('sort') )
			{
				if (inst._lastOptions.sort instanceof Array) {
					if (inst._lastOptions.sort.length > 0) {
						sort = inst._lastOptions.sort[0];
					}
				}
			}
			
			
			if (!inst._index.hasOwnProperty(sort.attribute)) {
				throw ('No Index');
			}
			
			var keys = Object.getOwnPropertyNames(inst._index[sort.attribute]).slice(0);
			keys.sort();
			if (sort.descending) { keys = keys.reverse(); }
			
			
			var resultIds = [];
			
			var doingPromise = false;
			for (
				i=inst._lastOptions.hasOwnProperty('start') ? inst._lastOptions.start : 0,l=keys.length;
				(i<l && (
					!inst._lastOptions.hasOwnProperty('count') ||
					resultIds.length<inst._lastOptions.count)
				);
				i++
			) {
				var jRecIds = inst._index[sort.attribute][keys[i]];
				for (j=0; j<jRecIds.length; j++) {
					resultIds.push(jRecIds[j]);
					if (getFromLastResultSet(jRecIds[j]) === null) {
						doingPromise = true;
					}
				}
			}
			 
			var filterOutDeleted = function(jread) {
				return inst._hideDeleted && jread.removed ? false : true;
			};
			
			var getDataFromLastResultSet = function(resultIds) {
				return dojoBaseArray.filter(
					dojoBaseArray.map(resultIds,function(jrecId) {
						return getFromLastResultSet(jrecId);
					}),
					filterOutDeleted
				);
			};
			
			var getPromiseResultSet = function(resultIds) {
				
				var deferred = new Deferred();
				
				var promises = dojoBaseArray.map(resultIds,function(jrecId) {
					return inst.get(jrecId);
				});
				
				promiseAll(promises).then(function(jrecs) {
					inst._jreadCache = jrecs;
					deferred.resolve(
						dojoBaseArray.filter(jrecs,filterOutDeleted)
					);
				},function(e) { deferred.reject(e); });
				
				return deferred;
			};
			
			var getResult = function(doingPromise) {
				/* jshint newcap: false */
				if (!doingPromise) {
					return QueryResults(getDataFromLastResultSet(resultIds));
				}
				return QueryResults(getPromiseResultSet(resultIds));
			};
			
			return getResult(doingPromise);
		};
	},
	query: function(query,options) {
		return (this.queryEngine())(query,options);
	}
});

});
