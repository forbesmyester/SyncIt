define(
["syncit/SyncIt","dgrid/OnDemandList", "dojo/store/Observable", "dojo/store/Memory","dojo/dom-construct"],
function(SyncIt,Grid,Observable,Memory,domConstruct) {
	
	var consLog = function(elementId) {
		
		this._store = new Observable(new Memory({data:[]}));
		
		var genId = function(dataset,datakey) {
			return dataset+'.'+datakey+":"+(new Date().getTime());
		}
		
		grid = new Grid({
			store:  this._store,
			renderRow: function(ob) {
				var inside = domConstruct.create('div',{
					class:'logitem',
					innerHTML: JSON.stringify(ob.msg)
				});
				return inside;
			}
		},elementId);
		
		grid.startup();
		
	};
	
	consLog.prototype.log = function(stringOrObject) {
		this._store.put({msg: stringOrObject});
	};
	
	return consLog;

	
});