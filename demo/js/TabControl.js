define(
    ['dojo/_base/declare','dojo/ready','dojo/hash',"dojo/io-query",
    "dojo/_base/connect","dojo/dom-class",'dojo/on','dojo/query',
    'dojo/Evented','dojo/dom-attr',"dojo/NodeList-dom",
    "dojo/NodeList-traverse"],
function(declare,_,hash,ioQuery,connect,domClass,on,query,Evented,domAttr) {
    
    return declare('syncitserv.TabControl',[Evented], {
        constructor: function(tabWrapper,hashName,options) {
            if (options === undefined) {
                options = {};
            }
            this._hashName = hashName;
            this._tabWrapper = tabWrapper;
            this._changeListeners = [];
            if (options.hasOwnProperty('defaultTab')) {
                this._defaultTab = options['defaultTab'];
            } else {
                this._defaultTab = domAttr.get(
                    query('nav dd:first-child a',this._tabWrapper)[0],
                    'href'
                ).replace(/.*=/,'');
            }
            connect.subscribe("/dojo/hashchange", this, this.syncToHash);
        },
        getActiveTab: function() {
            var activeTab = this._defaultTab,
                querystringHash = ioQuery.queryToObject(dojo.hash());
            if (querystringHash.hasOwnProperty(this._hashName)) {
                activeTab = querystringHash[this._hashName];
            }
            return activeTab;
        },
        startup: function() {
            var activeTab = this.getActiveTab();
            if (activeTab !== null) {
                this.show(activeTab);
            }
        },
        syncToHash: function() {
            var querystringHash = ioQuery.queryToObject(dojo.hash());
            if (querystringHash.hasOwnProperty(this._hashName)) {
                this.show(querystringHash[this._hashName]);
            }
        },
        show: function(activeTab) {
            var tabBodyHolder = query(
                query(this._tabWrapper).children('ul.tab-bodies')
            );
            
            var tabHolder = query(
                query(this._tabWrapper).children('nav').children('dl')
            );
            tabBodyHolder.children().removeClass('active');
            tabBodyHolder.children('li.'+activeTab+'.tab-body').addClass('active');
            tabHolder.children().removeClass('active');
            tabHolder.children('dd.'+activeTab+'.tab').addClass('active');
            this.emit('tab-change',activeTab);
        }
    });
});
