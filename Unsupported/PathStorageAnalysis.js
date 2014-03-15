/* globals document: false, Viz: false */
(function(root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js

	"use strict";

	if (typeof exports === 'object') {
		module.exports = factory(require('../SyncLocalStorage.js'));
	} else if (typeof define === 'function' && define.amd) {
		define(
			['../SyncLocalStorage'],
			factory
		);
	} else {
		root.SyncIt_Unsupported_PathStorageAnalysis = factory(
			root.SyncIt_SyncLocalStorage
		);
	}

}(this, function(SyncLocalStorage) {

"use strict";

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style


var getDigraph = function(localStorage,paths,namespace) {

	var pathGraph = '',
		nodeGraph = '',
		rootNodeGraph = '',
		i = 0,
		l = 0;
	
	var toIdentifier = function(src) {
		if (src.match(/\:/)) {
			var x = src.split(':');
			return x[0].replace(/[^0-9a-zA-Z]/g,'_')+':'+x[1];
		}
		return src.replace(/[^0-9a-zA-Z]/g,'_');
	};

	var toNode = function(src) {
		var kr = '',
			r = [];
			var getInnerRec = function(item) {
				var r = [],
					k = '';
				for (k in item) {
					if (item.hasOwnProperty(k)) {
						r.push(''+k+':'+JSON.stringify(item[k])
							.replace(/"/g,'\\"')
							.replace(/\{/g,'\\{')
							.replace(/\}/g,'\\}')
							.replace(/\|/g,'|')
							.replace(/\(/g,'(')
							.replace(/\)/g,')')
						);
					}
				}
				return r.join('|');
			};
		var item = JSON.parse(localStorage.getItem(namespace + '.'+src.replace(/\:.*/,'')));
		if (src.match(/\:/)) {
			for (kr in item) {
				if (item.hasOwnProperty(kr)) {
					r.push(
						(r.length ? '' : src.replace(/\:.*/,'') + '|') +
						'{ <'+kr+"> "+kr+" |{"+getInnerRec(item[kr])+'}}'
					);
				}
			}
			return toIdentifier(src) + ' [label="'+r.join('|')+'"];';
		}
		return toIdentifier(src) + ' [label="'+src+'|'+getInnerRec(item)+'"]' + ";\n";
	};
	
	for (i=0, l=paths.length; i<l; i++) {
		if (paths[i].from.match(/\:/)) {
			rootNodeGraph = rootNodeGraph + toNode(paths[i].from);
		} else {
			nodeGraph = nodeGraph + toNode(paths[i].from);
		}
		if (paths[i].to) {
			var tmp = paths[i].from.split(/[\.\:]/);
			nodeGraph = nodeGraph + toNode(tmp[0]+'.'+tmp[1]+'.'+paths[i].to);
			pathGraph = pathGraph + 
				toIdentifier(paths[i].from) + 
				' -> ' +
				toIdentifier(tmp[0]+'.'+tmp[1]+'.'+paths[i].to) +
				(paths[i].hasOwnProperty('via') ? '[label="'+paths[i].via+'"]' : '') +
				";\n";
		}
	}

	var str = 'digraph { graph [ dpi = 50 ]; rankdir="LR"; node[shape=record]; % }';
	str = str.replace('%','subgraph clusterStore { label=Roots; '+rootNodeGraph+' } %');
	str = str.replace('%',nodeGraph+' %');
	str = str.replace('%',pathGraph+' ');

	return str;
};

var getPaths = function(localStorage,namespace) {
	var r = [],
		path = null,
		ik = '',
		item = {},
		k = '',
		i = 0,
		pathItemKs = [],
		rootKs = [];
	
	var syncLocalStorage = new SyncLocalStorage(localStorage,namespace,JSON.stringify,JSON.parse);
	
	var extract = function(key,item) {
		var ob = {
			from: key,
			to: item.hasOwnProperty('_n') ? item._n : null
		};
		return ob;
	};

	var record = function(dataset,datakey,reference,isRoot,pathOrRootPath) {
		var key = isRoot ? (dataset+'.'+datakey+':'+reference) : (dataset+'.'+datakey+'.'+reference);
		r.push(extract(
			key,
			pathOrRootPath
		));
	};
	
	rootKs = syncLocalStorage.findKeys('*.*');
	for (i=0;i<rootKs.length;i++) {
		k = rootKs[i];
		ik = '';
		item = syncLocalStorage.getItem(k);
		path = null;

		for (ik in item) {
			if (item.hasOwnProperty(ik) && ik.match(/^[a-z]$/)) {
				record(k.split('.')[0],k.split('.')[1],ik,true,item[ik]);
			}
		}
	}

	pathItemKs = syncLocalStorage.findKeys('*.*.*');
	for (i=0;i<pathItemKs.length;i++) {
		k = pathItemKs[i].split('.');
		record(k[0],k[1],k[2],false,syncLocalStorage.getItem(k.join('.')));
	}

	return r.sort(function(a,b) {
		if (a.from.split('.').length != b.from.split('.').length) {
			return b.from.split('.').length - a.from.split('.').length;
		}
		if (a.from.replace(/\..*/,'').length != b.from.replace(/\..*/,'').length) {
			return a.from.replace(/\..*/,'').length < b.from.replace(/\..*/,'').length ? -1 : 1;
		}
		return (a.from < b.from) ? -1 : 1;
	});
};

var draw = function(nodeId,digraphStr) {
	
	/* jshint newcap: false */

	if (typeof Viz == 'undefined') {
		return;
	}

	var svg = Viz(digraphStr, "svg");
	document.getElementById(nodeId).innerHTML = svg;
};

var visualizeData = function(nodeId,pathStore,localStorage,namespace) {
	var redraw = function() {
		draw(nodeId,getDigraph(localStorage,getPaths(localStorage,namespace),namespace));
	};
	var events = ['set-root','set-item','remove-item','advance','push','change-path','change-root'];
	var listen = function(evt) {
		pathStore.on(evt,function() {
			redraw();
		});
	};
	for (var i=0;i<events.length;i++) {
		listen(events[i]);
	}
};

return { visualizeData: visualizeData, getPaths: getPaths };

}));
