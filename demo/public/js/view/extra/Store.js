define(
["syncitserv/view/extra/Common","dojo/_base/declare","dgrid/extensions/ColumnResizer",'dojo/store/Memory', "dojo/store/Observable"],
function(viewExtraCommon,declare,ColumnResizer, Memory,Observable) {

	return function(storeElementId,syncIt,syncItStore) {
		
		var regenerateStore = function(dojoStore,syncItStore) {
			
			var i = 0,
				l = 0,
				id = '',
				ids = [];
			
			viewExtraCommon.emptyDojoStore(dojoStore);
			
			// Display Store
			syncItStore.getDatasetNames(function(err,datasets) {
				datasets.sort();
				
				var showJrec = function(dataset,datakey) {
					syncItStore.get(dataset,datakey,function(e,jrec) {
						dojoStore.put({s:dataset,k:datakey,jrec:jrec});
					});
				}
				
				var showDataset = function(dataset) {
					var i=0,
						l=0;
					syncItStore.getDatakeyNames(dataset,function(err,keys) {
						for (i=0,l=keys.length; i<keys.length; i++) {
							showJrec(dataset,keys[i]);
						}
					});
				}
				
				for (i=0,l=datasets.length; i<l; i++) {
					showDataset(datasets[i]);
				};
			});
			
		};

		var dojoStore = new Observable(new Memory({data:[]}));

		regenerateStore(dojoStore,syncItStore);
		
		viewExtraCommon.drawDisplay(
			storeElementId,
			[
				{label: 'Dataset', field: 's', sortable: false},
				{label: 'Datakey', field: 'k', sortable: false},
				{
					label: 'JRec',
					get: function(object) {
						return JSON.stringify(object.jrec.i);
					},
					sortable: false
				},
				{
					label: 'Version',
					get: function(object) {
						return JSON.stringify(object.jrec.v);
					},
					sortable: false
				}
			],
			dojoStore
		);

		syncIt.listenForApplied(function(queueitem) {
			regenerateStore(dojoStore,syncItStore);
		});
		
		syncIt.listenForFed(function(queueitem) {
			regenerateStore(dojoStore,syncItStore);
		});
		
		syncIt.listenForAddedToQueue(function(dataset,datakey,patch) {
			regenerateStore(dojoStore,syncItStore);
		});
		
	};

});