require(
["dojo/request/xhr", 'syncit/SyncIt', 'syncit/Constant', 'syncit/Persist/Memory', "syncitserv/view/extra/ConsLog", "syncitserv/TabControl", 'syncit/Unsupported/SyncItStore', 'syncit/SyncItTestServ', 'syncit/ServerPersist/MemoryAsync', 'syncitserv/ServerSimulator', 'syncitserv/view/extra/Queue', 'syncitserv/view/extra/Store', 'syncitserv/view/extra/Server', 'syncitserv/SyncItLog', "dojox/html/entities", 'dojo/dom-construct', "dojo/dom-class", 'dojo/query', 'dojo/dom-attr', "dgrid/Grid", 'dojo/store/Memory', "dojo/store/Observable", "dgrid/OnDemandGrid", 'dojo/Deferred', "dojo/promise/all", 'dojo/dom', 'dojo/on', "dojo/dom-form", "dijit/Dialog", "dojo/NodeList-traverse", "dojo/NodeList-manipulate","dojo/domReady!"
],
function(xhr, SyncItLib, SyncIt_Constant, SyncIt_Persist_Memory, ConsLog, TabControl, SyncItStore, SyncItTestServer, SyncIt_ServerPersist_MemoryAsync, ServerSimulator, viewExtraQueue, viewExtraStore, viewExtraServer, syncItLog, htmlEntities, domConstruct, domClass, domQuery, domAttr, Grid, Memory, Observable, OnDemandGrid, Deferred, promiseAll, dom, on, domForm, dijitDialog) {

dojo.byId('rhs-tab-holder').innerHTML = dojo.byId('lhs-tab-holder').innerHTML.replace(/lhs/g,'rhs');

var lhsTabControl = new TabControl(dom.byId('lhs-tab-holder'),'lhs-tab',{});
lhsTabControl.startup();

var rhsTabControl = new TabControl(dom.byId('rhs-tab-holder'),'rhs-tab',{});
rhsTabControl.startup();

var dialogShowText = function(title,text,width) {
	var myDialog = new dijitDialog({
		title: title,
		content: text,
		style: "width: "+width
	});
	
	myDialog.show();
	
	myDialog.on('Cancel',function() {
		myDialog.hide();
	});
	
	myDialog.on('Hide',function() {
		myDialog.destroyRecursive();
	});
}

var consLog = new ConsLog('consLog');

var showHttpError = function(response) {
	
	dialogShowText(
		'HTTP Error ' + response.status + ' Occurred',
		'Error Content: ' + JSON.stringify(response) + 'NOTE: This is probably not an error in SyncIt, though if you feel it is, contact the author.',
		'400px'
	);
		
};

var getErrorDisplayer = function(method) {
	return function(err) {
		var k = '',
			eStr = '';
		if (err !== SyncIt_Constant.Error.OK) {
			for (var k in SyncIt_Constant.Error) { if (SyncIt_Constant.Error.hasOwnProperty(k)) {
				if (SyncIt_Constant.Error[k] == err) {
					eStr = k;
				}
			} }
			Array.prototype.slice.call(arguments,1);
			dialogShowText(
				'Error occured in function: '+method,
				'Error code: '+eStr+"<br/>Arguments: "+JSON.stringify(arguments),
				'600px'
			);
		}
	}
}

dialogShowText(
	"Isn't this screen rather complicated?",
	(function() {
	var node = dojo.byId("help-download");
	return (node === null) ?
		'Cannot find content' : 
		node.innerHTML;
	})(),
	'900px'
);

var conflictResolutionFunc = function(dataset ,datakey ,jrec ,localQueueItems, serverQueueItems ,resolved) {
		
	var myDialog = new dijitDialog({
		title: "Conflict at "+dataset+"."+datakey,
		content: dojo.byId('conflict-resolution-dialog').innerHTML,
		style: "width: 760px"
	});
	
	var getDlForJread = function(jread) {
		if (jread === null) {
			var d = domConstruct.create(
				'div',
				{ innerHTML: JSON.stringify(jread) }
			);
			domClass.add(d,'null');
			return d;
		}
		var processOrder = ['m','o','b','u','t','r'],
			i = 0,
			dl = domConstruct.create('dl');
		for (i=0; i<processOrder.length;i++) {
			if (jread.hasOwnProperty(processOrder[i])) {
				domConstruct.create(
					'dt',
					{ innerHTML: processOrder[i] },
					dl
				);
				domConstruct.create(
					'dd',
					{
						innerHTML: (processOrder[i] === 'u') ?
							JSON.stringify(jread[processOrder[i]]) :
							jread[processOrder[i]] 
					},
					dl
				);
			}
		}
		return dl;
	};
	
	var dialogShown = function() {
		
		var i = 0,
			l = 0;
		
		domConstruct.place(
			getDlForJread(jrec),
			domQuery('div.dijitDialog form.syncit-update-conflicts div.syncit-base-version div')[0]
		);
		
		domQuery('.syncit-apply-updates-after input[name="dataset"]').val(dataset);
		
		domQuery('.syncit-apply-updates-after input[name="datakey"]').val(datakey);
		
		var placeQueueIn = function(queue,domNode) {
			for(i=0,l=queue.length; i<l; i++) {
				domConstruct.place(
					getDlForJread(queue[i]),
					domNode
				);
			}
		}
		
		placeQueueIn(
			serverQueueItems,
			domQuery('div.dijitDialog div.syncit-update-from-server ul')[0]
		);
		
		placeQueueIn(
			localQueueItems,
			domQuery('div.dijitDialog div.syncit-update-from-local ul')[0]
		);
		
		on(domQuery('div.dijitDialog form.syncit-update-conflicts')[0],'submit',function(evt) {
			
			var dataOk = true,
				inputData = {};
			
			var formData = domForm.toObject(
					domQuery('div.dijitDialog form.syncit-update-conflicts')[0]
				);
			
			evt.preventDefault();
			
			try {
				inputData.u = JSON.parse(formData.update);
				inputData.s = formData.dataset;
				inputData.k = formData.datakey;
				inputData.o = formData.operation;
			} catch (e) {
				dataOk = false;
			}
			if (formData.update.length === 0) {
				myDialog.hide();
				return resolved(true,[]);
			}
			if (!dataOk) {
				return alert('Invalid JSON');
			}
			myDialog.hide();
			return resolved(true,[inputData]);
		});
		
	};
	
	myDialog.show().then(dialogShown);
	
	myDialog.on('Cancel',function() {
		myDialog.hide();
		resolved(false);
	});
	
	myDialog.on('Hide',function() {
		myDialog.destroyRecursive();
	})
};

var syncIts = (function() {
	var sides = ['lhs','rhs'],
		i = 0,
		l = 0,
		r = {};
	for (var i=0; i<sides.length; i++) {
		r[sides[i]] = {};
		r[sides[i]]['queue'] = new SyncItLib.Queue(new SyncIt_Persist_Memory());
		r[sides[i]]['store'] = new SyncItLib.Store(new SyncIt_Persist_Memory());
		r[sides[i]]['syncIt'] = new SyncItLib.SyncIt(
			r[sides[i]]['store'],
			r[sides[i]]['queue'],
			sides[i]
		);
	}
	return r;
})();

(function() { // Setup Interface Bindings
	
	var getNodeOnEvtSide = function(selector,evt) {
		var nodes = domQuery(
			selector,
			domQuery.NodeList(evt.target).parents('div.tab-holder')[0]
		);
		if (!nodes.length) {
			throw "sync.js getXHandSideNodeMatchingEvt: Invalid selector "+
				selector+' for id '+ id;
		}
		return nodes[0];
	};
	
	var getHandSide = function(evt) {
		return domQuery.NodeList(evt.target).parents('div.tab-holder')[0].id.replace(/\-.*/,'');
	};
	
	on(domQuery('.form-set'),'submit',function(evt) {
		evt.preventDefault();
		var formdata = domForm.toObject(
			domQuery.NodeList(evt.target).parents('form')[0]
		);
		syncIts[getHandSide(evt)]['syncIt'].set(
			formdata.dataset,
			formdata.datakey,
			JSON.parse(formdata.json),
			getErrorDisplayer('syncIt.set()')
		);
		return false;
	});

	on(domQuery('.form-update'),'submit',function(evt) {
		evt.preventDefault();
		var formdata = domForm.toObject(
			domQuery.NodeList(evt.target).parents('form')[0]
		);
		syncIts[getHandSide(evt)]['syncIt'].update(
			formdata.dataset,
			formdata.datakey,
			JSON.parse(formdata.json),
			getErrorDisplayer('syncIt.update()')
		);
		return false;
	});

	on(domQuery('.form-remove'),'submit',function(evt) {
		evt.preventDefault();
		var formdata = domForm.toObject(
			domQuery.NodeList(evt.target).parents('form')[0]
		);
		syncIts[getHandSide(evt)]['syncIt'].remove(
			formdata.dataset,
			formdata.datakey,
			getErrorDisplayer('syncIt.remove()')
		);
		return false;
	});

	on(domQuery('.form-apply'),'submit',function(evt) {
		evt.preventDefault();
		syncIts[getHandSide(evt)]['syncIt'].apply(getErrorDisplayer('syncIt.apply()'));
		return false;
	});
	
	on(domQuery('.form-get-datset-names'),'submit',function(evt) {
		evt.preventDefault();
		xhr("/dataset", {
			handleAs: "json",
			timeout: 2000
		}).then(function(data) {
			var select = getNodeOnEvtSide('select.updates-in-dataset',evt);
			var toShow = false;
			domConstruct.empty(select);
			for (var i=0,l=data.length;i<l;i++) {
				toShow = true;
				var op = domConstruct.create(
					'option',
					{ value:data[i], innerHTML:data[i] }
				);
				domConstruct.place(op,select);
			}
			if (toShow) {
				domClass.remove(getNodeOnEvtSide('form.form-updates-in-dataset',evt),'hidden');
			} else {
				alert('No Dataset to show');
			}
		},function(err) {
			showHttpError(err.response);
		});
	});
	
	on(domQuery('.form-updates-in-dataset'),'submit',function(evt) {
		evt.preventDefault();
		var formdata = domForm.toObject(
			domQuery.NodeList(evt.target).parents('form')[0]
		);
		var url = "/dataset/"+formdata.dataset+'?from='+formdata.from;
		if (formdata.from == "") {
			url = url = "/dataset/"+formdata.dataset;
		}
		xhr(url, {
			handleAs: "json",
			timeout: 2000
		}).then(function(doc) {
			syncIts[getHandSide(evt)]['syncIt'].feed(
				doc.queueitems,
				conflictResolutionFunc,
				function(err) {
					var errorDisplayer = getErrorDisplayer('syncIt.feed()');
					if (err === 0) {
						domAttr.set(
							domQuery(
								'input[name="from"]',
								domQuery.NodeList(evt.target).parents('form')[0]
							)[0],
							'value',
							doc.to
						);
						return;
					}
					errorDisplayer.apply(this,Array.prototype.slice.call(arguments));
				}
				
			);
		},function(err) {
			showHttpError(err.response);
		});
	});
	
	on(domQuery('.upload-dataset-datakey'),'submit',function(evt) {
		evt.preventDefault();
		var formdata = domForm.toObject(
			domQuery.NodeList(evt.target).parents('form')[0]
		);
		
		syncIts[getHandSide(evt)]['queue'].getFirst(function(err,first) {
			if (err !== SyncIt_Constant.Error.OK) {
				return (getErrorDisplayer('syncIt.getFirst()'))(err);
			}
			xhr("/dataset/"+first.s+'/'+first.k, {
				data: JSON.stringify(first),
				method: (
					function(queueitem) {
						if (queueitem.o == 'update') {
							return 'PATCH';
						}
						return (queueitem.o == 'set') ? 'PUT' : 'DELETE';
					}
				)(first),
				handleAs: "json",
				timeout: 2000,
				headers: { 'Content-Type': 'application/json' }
			}).then(function(responseDoc) {
			},function(err) {
				showHttpError(err.response);
			});
		});
		
	});
	
})();

var showDisplayGridForSyncIt = function(syncIt,divId) {
	
	var syncItStore = new Observable(
		new SyncItStore(
			syncIt,
			'household',
			['modifier','modificationtime'],
			{hideDeleted: false}
		)
	);
	syncItStore.startup(function() {});
	
	var getFormatter = function(field) {
		return function(fieldData,jread) {
			var v = jread[field];
			if (typeof v == 'object') {
				v = JSON.stringify(v);
			}
			return "<div" + (jread.r ? ' class="removed"' : "") +
				">" + v + "</div>";
		};
	};
	
	var columns = [
		{
			label: 'Dataset',
			field: 's',
			formatter: getFormatter('s')
		},
		{
			label: 'Datakey',
			field: 'k',
			formatter: getFormatter('k')
		},
		{
			label: 'Modifier',
			field: 'm',
			formatter: getFormatter('m')
		},
		{
			label: 'Version',
			field: 'v',
			formatter: getFormatter('v')
		},
		{
			label: "Data",
			field: 'i',
			get: function(object) {
				return JSON.stringify(object.i);
			},
			formatter: getFormatter('i')
		}
	];
	
	// =========================================================================
	
	var grid = new OnDemandGrid({
		columns: columns,
		store: syncItStore,
		loadingMessage: 'loading...',
		sort: [{attribute: 'modificationtime', descending: true}]
	}, divId); // attach to a DOM id
	
	grid.startup();
};

(function() { // Setup Grids etc
	
	var sides = ['lhs','rhs'];
	
	
	for (var i=0; i<sides.length; i++) {
		
		showDisplayGridForSyncIt(syncIts[sides[i]]['syncIt'],sides[i]+'-jrec');
		
		viewExtraQueue(
			sides[i]+'-queue',
			syncIts[sides[i]]['syncIt'],
			syncIts[sides[i]]['queue']
		);
		viewExtraStore(
			sides[i]+'-store',
			syncIts[sides[i]]['syncIt'],
			syncIts[sides[i]]['store']
		);
		syncItLog(sides[i]+'-log',syncIts[sides[i]]['syncIt']);
	}
	
	var setHelpTo = function(side,activeTab) {
		domAttr.set(
			domQuery('#'+side+'-tab-holder a.apihelp')[0],
			'href',
			'help-'+activeTab+'.html'
		);
	};
	
	var doHelp = function(side,tabControl) {
		setHelpTo(side,tabControl.getActiveTab());
		tabControl.on('tab-change',function(activeTab) {
			setHelpTo(side,activeTab)
		});
	};
		
	doHelp('lhs',lhsTabControl);
	doHelp('rhs',rhsTabControl);

	(function(helpNodes) {
		for (var i=0; i<helpNodes.length; i++) {
		
			on(helpNodes[i],'click',function(evt) {
				
				evt.preventDefault();
				
				dialogShowText(
					"How does this work?",
					(function() {
					var id = domAttr.get(evt.target,'href').replace(/\..*/,'');
					var node = dojo.byId(id);
					return (node === null) ?
						'Cannot find content' : 
						node.innerHTML;
					})(),
					'900px'
				);
				
			});
		
		}
	})(domQuery('a.apihelp'));
	
})();

(function() { // Setup Server
	
	var syncItServerDi = {
		SyncItError: SyncItLib.SyncItError,
		getUpdateResult: SyncItLib.getUpdateResult
	};
	
	var syncItTestServer = new SyncItTestServer(new SyncIt_ServerPersist_MemoryAsync());
	
	viewExtraServer('server-view',syncItTestServer);
	
	var serverSimulator = new ServerSimulator(consLog);
	
	(function() {
		var statusMsgToHttpStatus = {
			ok: 200,
			created: 201,
			validation_error: 422,
			not_found: 404,
			out_of_date: 409,
			conflict: 409,
			service_unavailable: 409,
			gone: 410
		};
		var responder = function(statusText,data,next) {
			if (!statusMsgToHttpStatus.hasOwnProperty(statusText)) {
				throw 'sync.js: statusMsgToHttpStatus: Missing '+statusText;
			};
			next(
				statusMsgToHttpStatus[statusText],
				{'Content-Type':'application/json'},
				data
			);
		};
		serverSimulator.addRoute(
			'PATCH','/dataset/:s/:k',
			function(method,path,params,query,body,next) {
				syncItTestServer.PATCH(
					{path: path ,params: params ,query: query ,body: body },
					function(statusText,data) {
						responder(statusText,data,next)
					}
				);
			}
		);
		serverSimulator.addRoute(
			'PUT','/dataset/:s/:k',
			function(method,path,params,query,body,next) {
				syncItTestServer.PUT(
					{path: path ,params: params ,query: query ,body: body },
					function(statusText,data) {
						responder(statusText,data,next)
					}
				);
			}
		);
		serverSimulator.addRoute(
			'DELETE','/dataset/:s/:k',
			function(method,path,params,query,body,next) {
				syncItTestServer.DELETE(
					{path: path ,params: params ,query: query ,body: body },
					function(statusText,data) {
						responder(statusText,data,next)
					}
				);
			}
		);
		serverSimulator.addRoute(
			'GET','/dataset/:s',
			function(method,path,params,query,body,next) {
				syncItTestServer.getQueueitem(
					{params:params, query:query},
					function(statusText,data) {
						responder(statusText,data,next)
					}
				);
			}
		);
		serverSimulator.addRoute('GET','/dataset',function(method,path,params,query,body,next) {
			syncItTestServer.getDatasetNames({},function(statusText,data) {
				responder(statusText,data,next);
			});
		});
	})();
	serverSimulator.start();
	
	setTimeout(function() {
		var di = {
			SyncItError: SyncItLib.SyncItError, 
			getUpdateResult: SyncItLib.getUpdateResult
		};
		var req = {
			body:{ s:'xxx', k:'yyy', b:0, m:'another', r:false, t:new Date().getTime(), u:{b:'c'}, o:'set' }
		};
		syncItTestServer.PUT(req, function(resp) {
			if (resp != 'created') {
				alert('syncItTestServer responded with '+resp+' but I was expecting "created"');
			}
		} );
	},2000);
	
})();



	// =========================================================================
	

});
