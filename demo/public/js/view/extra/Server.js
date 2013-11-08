define(
["syncitserv/view/extra/Common","dojo/_base/declare","dgrid/extensions/ColumnResizer",'dojo/store/Memory', "dojo/store/Observable"],
function(viewExtraCommon,declare,ColumnResizer, Memory,Observable) {

	return function(storeElementId,syncItServer) {
		
		var dojoStore = new Observable(new Memory({data:[]}));
		
		var grid = viewExtraCommon.drawDisplay(
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
		
		syncItServer.listenForFed(function(req, to, dataset, datakey, queueitem, jrec) {
			dojoStore.put(
				{
					id:queueitem.s+'.'+queueitem.k, 
					s:queueitem.s,
					k:queueitem.k,
					jrec:jrec
				});
		});

		return grid;
		
	};

});
