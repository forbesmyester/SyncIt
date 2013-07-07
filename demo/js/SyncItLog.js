define(
["syncit/SyncIt","dgrid/OnDemandList", "dojo/store/Observable", "dojo/store/Memory","dojo/dom-construct"],
function(SyncIt,Grid,Observable,Memory,domConstruct) {
	
	return function(elementId,syncIt) {
		
		var store = new Observable(new Memory({data:[]}));
		
		var genId = function(dataset,datakey) {
			return dataset+'.'+datakey+":"+(new Date().getTime());
		}
		
		var appliedOrFed = function(queueitem,evtname) {
			var operation = queueitem.o,
				dataset = queueitem.s,
				datakey = queueitem.k,
				modifier = queueitem.m,
				update = queueitem.u;

			store.put({
				id: genId(dataset,datakey),
				operation: operation,
				update: update,
				dataset: dataset,
				modifier: modifier,
				datakey: datakey,
				event: evtname,
				t: new Date().getTime()
			});
		};
		syncIt.listenForAdvanced(function(dataset, datakey, queueitem, storerecord) {
			appliedOrFed(queueitem,'applied');
		});
		syncIt.listenForFed(function(dataset, datakey, queueitem, storerecord) {
			appliedOrFed(queueitem,'fed');
		});
		
		syncIt.listenForAddedToPath(function(dataset, datakey, queueitem, storerecord) {
			store.put({
				id: genId(dataset,datakey),
				operation: queueitem.o,
				update: queueitem.u,
				dataset: queueitem.s,
				datakey: queueitem.k,
				event: 'queued',
				t: new Date().getTime()
			});
		});
		
		grid = new Grid({
			store:  store,
			renderRow: function(ob) {
				var inside = domConstruct.create('div',{
					class:'logitem'
				});
				var nodeData = [
					{
						c: 'event ',
						i: ob.event
					},
					{
						c: 'non-data',
						i: 'operation '
					},
					{
						c: 'operation',
						i: ob.operation+' '
					},
					{
						c: 'non-data',
						i: 'on '
					},
					{
						c: 'dataset',
						i: ob.dataset+'.'
					},
					{
						c: 'datakey',
						i: ob.datakey+' '
					},
					{
						c: 'non-data',
						i: 'from user '
					},
					{
						c: 'modifier',
						i: (
							ob.hasOwnProperty('m') ? 
								ob.m : 
								syncIt.getModifier()
							) + ' '
					},
					{
						c: 'non-data',
						i: 'with data '
					},
					{
						c: 'update',
						i: JSON.stringify(ob.update)
					}
				];
				for (var i=0;i<nodeData.length;i++) {
					var n = domConstruct.create('span',{
						class: nodeData[i].c,
						innerHTML: nodeData[i].i
					});
					domConstruct.place(n, inside, 'last');
				}
				return inside;
			}
		},elementId);
		
		grid.set("sort", 't', true);
		
		grid.startup();
		
	};

	
});
