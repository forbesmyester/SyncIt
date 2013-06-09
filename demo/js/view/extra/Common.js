define(
["dojo/_base/declare","dgrid/extensions/ColumnResizer","dgrid/Grid","dgrid/OnDemandGrid","dgrid/extensions/DijitRegistry"],
function(declare,ColumnResizer,Grid,OnDemandGrid,DijitRegistry) {

	var emptyDojoStore = function(dojoStore) {
		var i = 0,
			l = 0,
			ids = [];
			
		for (i=0,l=dojoStore.data.length; i<l; i++) {
			ids.push(dojoStore.getIdentity(dojoStore.data[i]));
		}
		while (ids.length) {
			dojoStore.remove(ids.shift());
		}
	};
	
	var drawDisplay = function(elementId,columns,dojoStore) {
		
		var grid = new (declare([OnDemandGrid, ColumnResizer,DijitRegistry]))({
			columns: columns,
			store: dojoStore,
			loadingMessage: 'loading...',
			sort: [{attribute: 't', descending: true}]
		}, elementId); // attach to a DOM id
		
		grid.startup();

		return grid;
		
	};
	
	return {emptyDojoStore: emptyDojoStore, drawDisplay: drawDisplay};
});
