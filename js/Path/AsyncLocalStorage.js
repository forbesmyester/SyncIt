/* jshint strict: true, smarttabs: true, es3: true, forin: true, immed: true, latedef: true, newcap: true, noarg: true, undef: true, unused: true, es3: true, bitwise: false, curly: true, latedef: true, newcap: true, noarg: true, noempty: true */

(function(root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	/* jshint strict: false */
	/* globals module: false, require: false, define: true */
	if (typeof exports === 'object') {
		module.exports = factory(
			require('../Constant.js'),
			require('../addEvents.js')
		);
	} else if (typeof define === 'function' && define.amd) {
		define(
			['syncit/Constant','syncit/addEvents'],
			factory
		);
	} else {
		root.SyncIt_Path_AsyncLocalStorage = factory(
			root.SyncIt_Constant,
			root.SyncIt_addEvents
		);
	}
})(this, function(SyncIt_Constant,addEvents) {

"use strict";

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

var ERROR = SyncIt_Constant.Error;

var Als = function(asyncLocalStorage,tLEncoderDecoder,namespace) {
	this._ls = asyncLocalStorage;
	this._ed = tLEncoderDecoder;
	this._ns = namespace;
};

Als.prototype.getInfo = function(dataset,datakey,next) {
	this.getItem(dataset+'.'+datakey,function(err,root) {
		if (err === ERROR.NO_DATA_FOUND) {
			err = ERROR.OK;
			root = {};
		}
		if (err !== ERROR.OK) {
			return next(err);
		}
		if (!root.hasOwnProperty('_i')) {
			return next(err,{});
		}
		return next(err,root._i);
	}.bind(this));
};

Als.prototype.setInfo = function(dataset,datakey,info,next) {
	this.getItem(dataset+'.'+datakey,function(err,root) {
		if (err === ERROR.NO_DATA_FOUND) {
			err = ERROR.OK;
			root = {};
		}
		if (err !== ERROR.OK) {
			return next(err);
		}
		root._i = info;
		this._setItem(dataset+'.'+datakey,root,next);
	}.bind(this));
};

Als.prototype.advance = function(dataset,datakey,path,removeOld,next) {
	this.getItem(dataset+'.'+datakey,function(err,root) {
		if (err !== ERROR.OK) {
			return next(err);
		}
		if (!root.hasOwnProperty(path)) {
			return next(ERROR.NOTHING_TO_ADVANCE_TO);
		}
		this.getItem(root[path]._n,function(err,item) {
			if (err !== ERROR.OK) {
				return next(err);
			}
			var toDelete = root[path]._n;
			root[path] = item;
			this._setItem(dataset+'.'+datakey,root,function(err) {
				this._emit('advance',dataset,datakey);
				next(err);
				if ((err === ERROR.OK) && (removeOld)) {
					this._removeItem(toDelete,function() {});
				}
			}.bind(this));
		}.bind(this));
	}.bind(this));
};

Als.prototype.changePath = function(dataset,datakey,fromPath,toPath,removeOld,next) {
	this.getItem(dataset+'.'+datakey,function(err,root) {
		var toRemove = false;
		if (err !== ERROR.OK) {
			return next(err);
		}
		if (!root.hasOwnProperty(fromPath)) {
			return next(ERROR.PATH_DOES_NOT_EXISTS );
		}
		if (
			removeOld &&
			root.hasOwnProperty(toPath) && 
			root[toPath].hasOwnProperty('_n')
		) {
			toRemove = root[toPath]._n;
		}
		root[toPath] = root[fromPath];
		delete root[fromPath];
		this._setItem(dataset+'.'+datakey,root,function() {
			this._emit('change-path',fromPath,toPath);
			next(ERROR.OK);
			if (toRemove) {
				this._removePath(toRemove,function() {});
			}
		}.bind(this));
	}.bind(this));
};

Als.prototype._getPath = function(reference,next) {
	var r = [reference];
	var follow = function(ref) {
		this.getItem(ref,function(err,item) {
			if (!item.hasOwnProperty('_n')) {
				return next(ERROR.OK,r);
			}
			r.push(item._n);
			follow(item._n);
		}.bind(this));
	}.bind(this);
	follow(reference);
};

Als.prototype._removePath = function(fromReference,next) {
	return this._getPath(fromReference,function(err,refs) {
		
		var rem = function(ref) {
			this._removeItem(ref,function(err) {
				if (err !== ERROR.OK) {
					return next(err);
				}
				if (refs.length) {
					rem(refs.shift());
				}
			}.bind(this));
		}.bind(this);

		if (refs.length) {
			rem(refs.shift());
		}

	}.bind(this));
};

Als.prototype._removeItem = function(reference,next) {
	this._ls.removeItem(this._ns+'.'+reference,function() {
		this._emit('remove-item');
		next(ERROR.OK);
	}.bind(this));
};

Als.prototype._setItem = function(reference,item,next) {
	this._ls.setItem([this._ns,reference].join('.'),item,function() {
		this._emit('set-item',item);
		next(ERROR.OK);
	}.bind(this));
};

Als.prototype.getItem = function(reference,next) {
	this._ls.getItem([this._ns,reference].join('.'),function(item) {
		if (!item) {
			return next(ERROR.NO_DATA_FOUND);
		}
		return next(ERROR.OK,item);
	}.bind(this));
};

Als.prototype.getRoot = function(dataset,datakey,next) {
	this.getItem(dataset + '.' + datakey,next);
};

Als.prototype.push = function(dataset,datakey,path,queueitem,next) {
	
	var doNext = function(err) {
		if (err === ERROR.OK) {
			this._emit('push', queueitem);
		}
		next(err,(err === ERROR.OK) ? queueitem : undefined);
	}.bind(this);
	
	var updateChildPointer = function(reference, toReference) {
		this.getItem(reference,function(err,item) {
			if (err !== ERROR.OK) {
				return doNext(ERROR.NO_DATA_FOUND);
			}
			item._n = toReference;
			this._setItem(reference,item,next);
		}.bind(this));
	}.bind(this);

	var genReference = function() {
		return this._ed.encode(new Date().getTime());
		/*
		Comment above and uncomment this to get dataset and datakey in child path elements.
		return [
			this._ed.encode(new Date().getTime()),
			dataset,
			datakey
		].join('.');
		*/
	}.bind(this);

	var follow = function(tlid,lastitem) {
		if (!lastitem.hasOwnProperty('_n')) {
			var reference = genReference();
			return this._setItem(reference,queueitem,function(err) {
				if (err !== ERROR.OK) {
					doNext(err);
				}
				updateChildPointer(tlid,reference);
			}.bind(this));
		}
		this.getItem(lastitem[path],function(err,item) {
			return follow(lastitem[path], null, item);
		}.bind(this));
	}.bind(this);
	
	this.getItem(dataset+'.'+datakey,function(err,root) {
		if (err === ERROR.NO_DATA_FOUND) {
			root = {};
		}
		if ((err === ERROR.NO_DATA_FOUND) || (!root.hasOwnProperty(path))) {
			root[path] = queueitem;
			return this._setItem(dataset+'.'+datakey,root,doNext);
		}
		if (!root[path].hasOwnProperty('_n')) {
			var reference = genReference();
			return this._setItem(reference,queueitem,function(err) {
				if (err !== ERROR.OK) { return doNext(err); }
				root[path]._n = reference;
				return this._setItem(dataset+'.'+datakey,root,doNext);
			}.bind(this));
		}
		return this.getItem(root[path]._n,function(err,item) {
			return follow(root[path]._n,item,path);
		}.bind(this));
	}.bind(this));

};

Als.prototype._getKeysWithoutNamespace = function(next) {
	var i = 0,
		l = 0,
		k = '',
		r = [];
	for (i=0, l=this._ls.length; i<l; i++) {
		k = this._ls.key(i);
		if (
			(k.length > this._ns.length + 1) &&
			(k.substr(0,this._ns.length + 1) == this._ns+'.')
		) {
			r.push(k.substr(this._ns.length + 1));
		}
	}
	next(ERROR.OK,r);
};

Als.prototype._getDatasets = function(allKeysWithoutNamespace,next) {

	var i = 0,
		l = 0,
		k = '',
		r = [];
	for (i=0, l=allKeysWithoutNamespace.length; i<l; i++) {
		k = allKeysWithoutNamespace[i].split('.');
		if (k.length == 3) {
			r.push(k[1]);
		}
	}
	return next(ERROR.OK,r);

};

Als.prototype._getDatakeyInDataset = function(allKeysWithoutNamespace,dataset,next) {

	var i = 0,
		l = 0,
		k = '',
		r = [];

	for (i=0, l=allKeysWithoutNamespace.length; i<l; i++) {
		k = allKeysWithoutNamespace[i].split('.');
		if (k.length == 3) {
			if (k[1] == dataset) {
				r.push(k[2]);
			}
		}
	}
	return next(ERROR.OK,r);

};

Als.prototype.clean = function(next) {
	
	var getAllKeysAsObj = function(innerNext) {
		this._ls.getAllKeys(function(keys) {
			var o = {},
				k = '';
			while(keys.length) {
				k = keys.shift();
				if ((k.length > this._ns.length) && (k.substr(0,this._ns.length+1) == this._ns+'.')) {
					o[k] = false;
				}
			}
			innerNext(0,o);
		}.bind(this));
	}.bind(this);

	var removeItems = function(keys,next) {
		var k = '';
		if (!keys.length) {
			next(ERROR.OK);
		}
		if (keys.length) {
			k = keys.pop();
			if (
				(k.length > this._ns.length) && 
				(k.substr(0,this._ns.length+1) == this._ns+'.') && 
				(k.split('.').length == 2)
			) {
				this._removeItem(k.substr(this._ns.length+1),function(err) {
					if (err !== ERROR.OK) {
						next(err);
					}
					removeItems(keys,next);
				}.bind(this));
			} else {
				removeItems(keys,next);
			}
		}
	}.bind(this);
	
	getAllKeysAsObj(function(err,visitedKeysObj) {
		
		if (err !== ERROR.OK) {
			return next(err);
		}
	
		var follow = function(data,innerNext) {
			if (!data.hasOwnProperty('_n')) {
				return innerNext(ERROR.OK);
			}
			if (visitedKeysObj.hasOwnProperty(this._ns+'.'+data._n)) {
				delete visitedKeysObj[this._ns+'.'+data._n];
			}
			this.getItem(data._n,function(err,data) {
				if (err !== ERROR.OK) {
					return innerNext(err);
				}
				follow(data,innerNext);
			}.bind(this));
		}.bind(this);

		var followRoot = function(ref,innerNext) {
			this.getItem(ref,function(err,data) {
				
				var k = '',
					mainErr = err,
					toComplete = 0;

				if (err !== ERROR.OK) {
					return innerNext(err);
				}
				
				var finishedMonitor = function(err) {
					toComplete = toComplete - 1;
					if (err !== ERROR.OK) {
						mainErr = err;
					}
					if (toComplete === 0) {
						if (
							(mainErr === ERROR.OK) &&
							(visitedKeysObj.hasOwnProperty(this._ns+'.'+ref))
						) {
							delete visitedKeysObj[this._ns+'.'+ref];
						}
						innerNext(mainErr);
					}
				}.bind(this);

				for (k in data) {
					if (data.hasOwnProperty(k)) {
						toComplete = toComplete + 1;
						follow(data[k],finishedMonitor);
					}
				}
			}.bind(this));
		}.bind(this);

		var objectKeysToArray = function(ob) {
			if (typeof Object.getOwnPropertyNames !== 'undefined') {
				return Object.getOwnPropertyNames(ob);
			}
			var r = [],
				k = '';
			for (k in ob) {
				if (ob.hasOwnProperty(k)) {
					r.push(k);
				}
			}
			return r;
		};
		
		var processDataset = function(dataset,innerNext) {
			this._getDatakeyInDataset(objectKeysToArray(visitedKeysObj),dataset,function(err,datakeys) {

				var toComplete = 0,
					i = 0,
					l = 0,
					mainErr = ERROR.OK;

				if (err !== ERROR.OK) { 
					return innerNext(err);
				}

				var finishedMonitor = function(err) {
					toComplete--;
					if (err !== ERROR.OK) {
						mainErr = err;
					}
					if (toComplete === 0) {
						innerNext(mainErr);
					}
				}.bind(this);

				for (i=0, toComplete=l=datakeys.length; i<l; i++) {
					followRoot(dataset+'.'+datakeys[i],finishedMonitor);
				}
			}.bind(this));
		}.bind(this);
		
		this._getDatasets(objectKeysToArray(visitedKeysObj),function(err,datasets) {
			if (err !== ERROR.OK) { 
				return next(err);
			}

			var i = 0,
				l = 0,
				mainErr = err,
				toComplete = 0;

			var finishedMonitor = function(err) {
				toComplete--;
				if (err !== ERROR.OK) {
					mainErr = err;
				}
				if (toComplete === 0) {
					if (mainErr !== ERROR.OK) {
						return next(mainErr);
					}
					removeItems(objectKeysToArray(visitedKeysObj),next);
				}
			}.bind(this);

			for (i=0, toComplete=l=datasets.length; i<l ; i++) {
				processDataset(datasets[i],finishedMonitor);
			}
		}.bind(this));

	}.bind(this));

};

addEvents(Als,['set-item','remove-item','advance','push','change-path']);

return Als;

});
