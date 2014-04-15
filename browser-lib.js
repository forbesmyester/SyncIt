!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.SyncItLib=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
!function(e,t){"use strict";"object"==typeof exports?module.exports=t(_dereq_("./SyncLocalStorage.js"),_dereq_("./makeAsync.js")):define(["./SyncLocalStorage","./makeAsync"],t)}(this,function(e,t){"use strict";return t(e,0)});
},{"./SyncLocalStorage.js":7,"./makeAsync.js":11}],2:[function(_dereq_,module,exports){
!function(_,E){"use strict";"object"==typeof exports?module.exports=E():define(E)}(this,function(){"use strict";var _={};_.OK=0,_.NO_DATA_FOUND=-1,_.COULD_NOT_ADVANCE_QUEUE=1,_.NOTHING_TO_ADVANCE_TO=21,_.TRYING_TO_ADD_NON_DEFAULT_ROOT=22,_.PATH_DOES_NOT_EXISTS=22,_.MULTIPLE_PATHS_FOUND=23,_.UNABLE_TO_PROCESS_BECAUSE_LOCKED=2,_.UNABLE_TO_PROCESS_BECAUSE_FEED_LOCKED=10,_.FEED_VERSION_ERROR=24,_.TRYING_TO_ADVANCE_TO_FUTURE_VERSION=3,_.TRYING_TO_APPLY_UPDATE_BASED_ON_OLD_VERSION=4,_.TRYING_TO_APPLY_UPDATE_ALREADY_APPLIED=-2,_.DATA_ALREADY_REMOVED=8,_.FEEDING_OUT_OF_DATE_BASEDONVERSION=9,_.FAILURE_WRITING_UPDATE=5,_.FEED_REQUIRES_BASED_ON_VERSION=6,_.TRYING_TO_ADD_QUEUEITEM_BASED_ON_OLD_VERSION=11,_.TRYING_TO_ADD_ALREADY_ADDED_QUEUEITEM=12,_.TRYING_TO_ADD_FUTURE_QUEUEITEM=20,_.YOU_CANNOT_FEED_YOUR_OWN_CHANGES=13,_.BASED_ON_IN_QUEUE_LESS_THAN_BASED_IN_BEING_FED=18,_.STALE_FOUND_IN_QUEUE=19,_.INVALID_DATASET=14,_.INVALID_DATAKEY=15,_.INVALID_MODIFIER=16,_.INVALID_OPERATION=17,_.PATH_EMPTY=-3,_.NOT_RESOLVED=-4,_.MUST_APPLY_SERVER_PATCH_BEFORE_LOCAL=7;var E={};E.IN_QUEUE=1,E.IN_STORE=2;var A={};A.ADDING_TO_QUEUE=1,A.ADVANCING=2,A.FEEDING=4,A.CLEANING=8,A.MAXIMUM_BIT_PATTERN=15;var T={};T.DATASET_REGEXP=/^[A-Za-z][A-Za-z0-9\-]+$/,T.DATAKEY_REGEXP=/^[A-Za-z][A-Za-z0-9\-]+$/,T.MODIFIER_REGEXP=/^[A-Za-z][A-Za-z0-9\-]+$/,T.OPERATION_REGEXP=/^(set)|(update)|(remove)$/;var O={};return O.INFO=1,O.ROOTITEM=2,O.PATHITEM=3,O.OTHER_PATHS=4,{Error:_,Location:E,Locking:A,Validation:T,FollowInformationType:O}});
},{}],3:[function(_dereq_,module,exports){
!function(t,e){"use strict";"object"==typeof exports?module.exports=e():define(e)}(this,function(){"use strict";var t=function(){this.data={},this.keys=[]};return t.prototype.setItem=function(t,e){this.data[t]=e,this._regen()},t.prototype._regen=function(){this.keys=[],this.length=0;for(var t in this.data)this.data.hasOwnProperty(t)&&this.keys.push(t);this.keys=this.keys.sort(),this.length=this.keys.length},t.prototype.clear=function(){this.data={},this._regen()},t.prototype.key=function(t){return t<this.length?this.keys[t]:null},t.prototype.getItem=function(t){return this.data.hasOwnProperty(t)?this.data[t]:null},t.prototype.removeItem=function(t){this.data.hasOwnProperty(t)&&(delete this.data[t],this._regen())},t});
},{}],4:[function(_dereq_,module,exports){
!function(t,n){"use strict";"object"==typeof exports?module.exports=n(_dereq_("../Constant.js"),_dereq_("add-events")):define(["../Constant","add-events"],n)}(this,function(t,n){"use strict";var e=t.Error,i=t.FollowInformationType,o=function(t,n){this._ls=t,this._ed=n};o.prototype.getKeyTimeDecoder=function(){return function(t){return-1===[1,3].indexOf(t.split(".").length)?!1:this._ed.decode(t.replace(/.*\./,""))}.bind(this)},o.prototype.getRootItem=function(t,n,i,o){this._getRoot(t,n,function(t,n){return n.hasOwnProperty(i)&&n[i].hasOwnProperty("_s")?o(e.OK,this._removePrivatePathStorageData(n[i])):o(e.NO_DATA_FOUND)}.bind(this))},o.prototype.getInfo=function(t,n,i){this._getRoot(t,n,function(t,n){return t===e.NO_DATA_FOUND&&(t=e.OK,n={}),t!==e.OK?i(t):n.hasOwnProperty("_i")?i(t,n._i):i(t,{})}.bind(this))},o.prototype.setInfo=function(t,n,i,o){this._getRoot(t,n,function(r,s){var h=!0,a="";if(r===e.NO_DATA_FOUND&&(r=e.OK,s={}),r!==e.OK)return o(r);s._i=i;for(a in i)i.hasOwnProperty(a)&&(h=!1);h&&delete s._i,this._setRoot(t,n,s,o)}.bind(this))},o.prototype.setPathroot=function(t,n,i,o,r){this._getRoot(t,n,function(s,h){return s===e.NO_DATA_FOUND&&(s=e.OK,h={}),s!==e.OK?r(s):(h[i]=o,h[i]._s=!0,void this._setRoot(t,n,h,r))}.bind(this))},o.prototype.advance=function(t,n,i,o,r){this._getRoot(t,n,function(s,h){var a=null,u="";if(s!==e.OK)return r(s);for(u in h)if(h.hasOwnProperty(u)&&u.match(/^[a-z]$/)){if(null!==a)return r(e.MULTIPLE_PATHS_FOUND);a=u}return null===a?r(e.NOTHING_TO_ADVANCE_TO):void this._getPathItem(t,n,h[a]._n,function(s,u){return s!==e.OK?r(s):void o(h[a].hasOwnProperty("_s")?this._removePrivatePathStorageData(h[a]):null,h[a]._n,u,function(o){if(null===o)return this.removeDatasetDatakey(t,n,function(t){return t?r(t):void r(t,this._removePrivatePathStorageData(u),null)}.bind(this));o._s=!0,u.hasOwnProperty("_n")&&(o._n=u._n);var s=h[a]._n;h[a]=o,this._setRoot(t,n,h,function(o){this._emit("advance",t,n,h),r(o,this._removePrivatePathStorageData(u),this._removePrivatePathStorageData(h[a])),o===e.OK&&i&&this._removePathItem(t,n,s,function(){})}.bind(this))}.bind(this))}.bind(this))}.bind(this))},o.prototype.removePathitemFromPath=function(t,n,i,o,r){this._getRoot(t,n,function(s,h){if(s!==e.OK)return r(s);if(!h.hasOwnProperty(i))return r(e.PATH_DOES_NOT_EXISTS);if(!h[i].hasOwnProperty("_n"))return r(e.OK);var a=h[i]._n;delete h[i]._n,this._setRoot(t,n,h,function(){this._emit("change-root",t,n,h),r(e.OK),o&&this._removePathItems(t,n,a,function(){})}.bind(this))}.bind(this))},o.prototype.changePath=function(t,n,i,o,r,s){this._getRoot(t,n,function(h,a){var u=!1;return h!==e.OK?s(h):a.hasOwnProperty(i)&&a[i].hasOwnProperty("_n")?(r&&a.hasOwnProperty(o)&&a[o].hasOwnProperty("_n")&&(u=a[o]._n),a[o]._n=a[i]._n,delete a[i],void this._setRoot(t,n,a,function(){this._emit("change-path",i,o),s(e.OK),u&&this._removePathItems(t,n,u,function(){})}.bind(this))):s(e.PATH_DOES_NOT_EXISTS)}.bind(this))},o.prototype.promotePathToOrRemove=function(t,n,i,o,r){this._getRoot(t,n,function(s,h){var a=function(){return h.hasOwnProperty(o)&&h[o].hasOwnProperty("_n")?h[o]._n:null}();return h.hasOwnProperty(i)?(h[o]=h[i],delete h[i],void this._setRoot(t,n,h,function(){return null===a?r(e.OK,e.OK):void this._removePathItems(t,n,a,function(t){return r(e.OK,t)})}.bind(this))):this.removeDatasetDatakey(t,n,r)}.bind(this))},o.prototype.removeDatasetDatakey=function(t,n,i){var o=function(t){var n=[];for(var e in t)t.hasOwnProperty(e)&&1==e.length&&t[e].hasOwnProperty("_n")&&n.push(t[e]._n);return n};this._getRoot(t,n,function(r,s){var h=o(s),a=h.length,u=function(t){return t!==e.OK?(a=-1,i(t)):0===--a?i(e.OK):void 0};this.__removeItem(t+"."+n,function(o){if(0===h.length||o!==e.OK)return i(o);for(var r=0,s=h.length;s>r;r++)this._removePathItems(t,n,h[r],u)}.bind(this))}.bind(this))},o.prototype.removePath=function(t,n,i,o,r){this._getRoot(t,n,function(s,h){var a=!1;return s!==e.OK?r(s):h.hasOwnProperty(i)&&h[i].hasOwnProperty("_n")?(a=h[i]._n,delete h[i],void this._setRoot(t,n,h,function(){this._emit("set-root",t,n,h),r(e.OK),o&&this._removePathItems(t,n,a,function(){})}.bind(this))):r(e.PATH_DOES_NOT_EXISTS)}.bind(this))},o.prototype._removePathItems=function(t,n,i,o){var r=function(i){this._getPathItem(t,n,i,function(s,h){var a;return s!==e.OK?o(s):(h.hasOwnProperty("_n")&&(a=h._n),void this._removePathItem(t,n,i,function(t){return t!==e.OK||void 0===a?o(t):r(a)}))}.bind(this))}.bind(this);r(i)},o.prototype._removePathItem=function(t,n,e,i){var o=[t,n,e].join(".");this.__removeItem(o,i)};var r=function(t){return"string"!=typeof t?!1:t.length<2?!1:t.indexOf(".")>-1?!1:!0};return o.prototype._setRoot=function(t,n,i,o){return r(t)?r(n)?void this.__setItem([t,n].join("."),i,o):o(e.INVALID_DATAKEY):o(e.INVALID_DATASET)},o.prototype._setPathItem=function(t,n,i,o,s){return r(t)?r(n)?void this.__setItem([t,n,i].join("."),o,s):s(e.INVALID_DATAKEY):s(e.INVALID_DATASET)},o.prototype.__setItem=function(t,n,i){this._ls.setItem(t,n,function(){this._emit("set-item",t,n),i(e.OK)}.bind(this))},o.prototype.__removeItem=function(t,n){this._ls.removeItem(t,function(){this._emit("remove-item",t),n(e.OK)}.bind(this))},o.prototype._getPathItem=function(t,n,e,i){this.__getItem([t,n,e].join("."),i)},o.prototype._getRoot=function(t,n,e){this.__getItem([t,n].join("."),e)},o.prototype.__getItem=function(t,n){this._ls.getItem(t,function(t){return t?n(e.OK,t):n(e.NO_DATA_FOUND)}.bind(this))},o.prototype._removePrivatePathStorageData=function(t){var n={};for(var e in t)!e.match(/^_/)&&t.hasOwnProperty(e)&&(n[e]=t[e]);return n},o.prototype._fireFollowInformationTypeForRoot=function(t,n,o,r,s){var h=e.OK,a=function(t){h===e.OK&&(h=t)},u=[t,n].join(".")+":"+r;o.hasOwnProperty("_i")&&a(s(u,this._removePrivatePathStorageData(o._i),i.INFO)),o[r].hasOwnProperty("_s")&&a(s(u,this._removePrivatePathStorageData(o[r]),i.ROOTITEM));var _=[];for(var f in o)f!==r&&o.hasOwnProperty(f)&&f.match(/^[a-z]$/)&&_.push(f);return a(s(u,_,i.OTHER_PATHS)),h},o.prototype._calculateLink=function(t,n,e){return[t,n,e].join(".")},o.prototype.followPath=function(t,n,o,r,s){this._getRoot(t,n,function(h,a){if(h!==e.OK)return s(h);if(!a.hasOwnProperty(o))return s(e.NO_DATA_FOUND);if(this._fireFollowInformationTypeForRoot(t,n,a,o,r),!a[o].hasOwnProperty("_n"))return s(e.OK);var u=function(o){this._getPathItem(t,n,o,function(h,a){if(h!==e.OK)return s(h);var _;return a.hasOwnProperty("_n")&&(_=a._n),r(this._calculateLink(t,n,o),this._removePrivatePathStorageData(a),i.PATHITEM),void 0===_?s(h):u(_)}.bind(this))}.bind(this);u(a[o]._n)}.bind(this))},o.prototype._createAnonymousPath=function(t,n,i,o){var r=new Array(i.length),s=0,h=0;for(h=0,s=i.length;s>h;h++)r[h]=this._ed.encode();h=i.length-1;var a=function(){return 0>h?o(e.OK,r[0]):(h!==i.length-1&&(i[h]._n=r[h+1]),void this._setPathItem(t,n,r[h],i[h],function(t){return t!==e.OK?o(t):(h--,void a())}))}.bind(this);a()},o.prototype.pushPathitemsToNewPath=function(t,n,i,o,r){this._getRoot(t,n,function(s,h){return s===e.NO_DATA_FOUND&&(s=e.OK,h={}),h.hasOwnProperty(i)?r(e.PATH_ALREADY_EXISTS):void this._createAnonymousPath(t,n,o,function(e,o){h[i]={_n:o},this._setRoot(t,n,h,r)}.bind(this))}.bind(this))},o.prototype.push=function(t,n,o,r,s,h,a){var u=function(o,s){o===e.OK&&(this._emit("push",s,r),h(this._calculateLink(t,n,s),r,i.PATHITEM)),a(o,o===e.OK?r:void 0)}.bind(this),_=function(t,n,i,o){this._getPathItem(t,n,i,function(r,s){return r!==e.OK?u(e.NO_DATA_FOUND,i):(s._n=o,void this._setPathItem(t,n,i,s,function(t){u(t,o)}))}.bind(this))}.bind(this),f=function(t,n,o,s){if(!s.hasOwnProperty("_n")){var a=this._ed.encode();return this._setPathItem(t,n,a,r,function(i){i!==e.OK&&u(i,a),_(t,n,o,a)}.bind(this))}this._getPathItem(t,n,s._n,function(o,r){return o!==e.OK&&u(o,s._n),o=h(this._calculateLink(t,n,s._n),this._removePrivatePathStorageData(r),i.PATHITEM),o!==e.OK?u(o):f(t,n,s._n,r)}.bind(this))}.bind(this);this._getRoot(t,n,function(_,c){var O=0;if(_===e.NO_DATA_FOUND&&(c={}),_!==e.NO_DATA_FOUND&&c.hasOwnProperty(o)||(c[o]={}),s)for(var d in c)if((d.match(/^[a-z]$/)||c.hasOwnProperty("k"))&&2==++O)return a(e.MULTIPLE_PATHS_FOUND);if(_=this._fireFollowInformationTypeForRoot(t,n,c,o,h),_!==e.OK)return u(_);if(!c[o].hasOwnProperty("_n")){var p=this._ed.encode();return this._setPathItem(t,n,p,r,function(i){return i!==e.OK?u(i,p):(c[o]._n=p,this._setRoot(t,n,c,function(t){u(t,p)}))}.bind(this))}return this._getPathItem(t,n,c[o]._n,function(r,s){return r!==e.OK&&u(r,c[o]._n),r=h(this._calculateLink(t,n,c[o]._n),this._removePrivatePathStorageData(s),i.PATHITEM),r!==e.OK?u(r):f(t,n,c[o]._n,s)}.bind(this))}.bind(this))},o.prototype.getDatasetNames=function(t){this._ls.findKeys("*.*",function(n){var i=0,o=0,r="",s=[];for(i=0,o=n.length;o>i;i++)r=n[i].split("."),-1===s.indexOf(r[0])&&s.push(r[0]);return t(e.OK,s)}.bind(this))},o.prototype.getDatakeysInDataset=function(t,n){this._ls.findKeys("*.*",function(i){var o=0,r=0,s="",h=[];for(o=0,r=i.length;r>o;o++)s=i[o].split("."),2==s.length&&s[0]==t&&h.push(s[1]);return n(e.OK,h)}.bind(this))},o.prototype.findFirstDatasetDatakey=function(t,n){this._findFirstDatasetDatakeyReference(t,function(t,i,o){return t!==e.OK?n(t):n(t,i,o)})},o.prototype.getFirstPathitem=function(t,n){this._findFirstDatasetDatakeyReference(t,function(t,i,o,r){return t!==e.OK?n(t):this._getPathItem(i,o,r,function(t,e){n(t,i,o,r,e)})}.bind(this))},o.prototype._findFirstDatasetDatakeyReference=function(t,n){this._ls.findKeys("*.*.*",function(i){i=i.sort(this._ed.sort);var o=function(){var r="";return i.length?(r=i.shift(),r=r.split("."),3!=r.length?o():void this._getRoot(r[0],r[1],function(s,h){return s==e.NO_DATA_FOUND?(i.shift(),o()):s!==e.OK?n(s):h.hasOwnProperty(t)&&h[t].hasOwnProperty("_n")&&h[t]._n==r[2]?n(e.OK,r[0],r[1],r[2]):void o()})):n(e.PATH_EMPTY)}.bind(this);o()}.bind(this))},o.prototype.purge=function(t,n){this._ls.findKeys(t+".*",function(i){this._ls.findKeys(t+".*.*",function(t){var o=i.concat(t),r=function(){return 0===o.length?n(e.OK):void this.__removeItem(o.shift(),r)}.bind(this);r()}.bind(this))}.bind(this))},o.prototype.clean=function(t){var n=function(t){this._ls.findKeys("*.*.*",function(n){var i=0,o=0,r="",s={};for(i=0,o=n.length;o>i;i++)r=n[i].split("."),s.hasOwnProperty(r[0])||(s[r[0]]={}),s[r[0]].hasOwnProperty(r[1])||(s[r[0]][r[1]]={}),s[r[0]][r[1]][r[2]]=!0;return t(e.OK,s)}.bind(this))}.bind(this),i=function(t){var n=[],e="",i="",o="";for(e in t)if(t.hasOwnProperty(e))for(i in t[e])if(t[e].hasOwnProperty(i))for(o in t[e][i])t[e][i].hasOwnProperty(o)&&n.push({dataset:e,datakey:i,ref:o});return n},o=function(t,n){var o=i(t),r=function(){var t={};return o.length?(t=o.shift(),void this._removePathItem(t.dataset,t.datakey,t.ref,function(t){return t!==e.OK?n(t):void r()})):n(e.OK)}.bind(this);r()}.bind(this);n(function(n,r){if(n!==e.OK)return t(n);var s=function(t,n,i,o){return i.hasOwnProperty("_n")?(delete r[t][n][i._n],void this._getPathItem(t,n,i._n,function(i,r){return i!==e.OK?o(i):void s(t,n,r,o)}.bind(this))):o(e.OK)}.bind(this),h=function(t,n,i){this._getRoot(t,n,function(o,r){var h="",a=o,u=0;if(o!==e.OK)return i(o);var _=function(t){u-=1,t!==e.OK&&(a=t),0===u&&i(a)}.bind(this);for(h in r)r.hasOwnProperty(h)&&(u+=1,s(t,n,r[h],_))}.bind(this))}.bind(this),a=function(t,n){this.getDatakeysInDataset(t,function(i,o){var r=0,s=0,a=0,u=e.OK;if(i!==e.OK)return n(i);var _=function(t){r--,t!==e.OK&&(u=t),0===r&&n(u)}.bind(this);for(s=0,r=a=o.length;a>s;s++)h(t,o[s],_)}.bind(this))}.bind(this),u=function(t,n){var i=function(){if(0===t.length)return n(e.OK);var o=t.shift();this.__removeItem([o.dataset,o.datakey,o.ref].join("."),i)}.bind(this);i()}.bind(this);this.getDatasetNames(function(n,s){if(n!==e.OK)return t(n);0===s.length&&u(i(r),t);var h=0,_=0,f=n,c=0,O=function(n){if(c--,n!==e.OK&&(f=n),0===c){if(f!==e.OK)return t(f);o(r,function(n){n&&t(n),u(i(r),t)})}}.bind(this);for(h=0,c=_=s.length;_>h;h++)a(s[h],O)}.bind(this))}.bind(this))},n(o,["set-root","set-item","remove-item","advance","push","change-path","change-root"]),o});
},{"../Constant.js":2,"add-events":12}],5:[function(_dereq_,module,exports){
!function(t,n){"use strict";"function"==typeof define&&define.amd?define(["./Constant","add-events","./addLocking","./updateResult"],n):module.exports=n(_dereq_("./Constant.js"),_dereq_("add-events"),_dereq_("./addLocking.js"),_dereq_("./updateResult.js"))}(this,function(t,n,r,i){"use strict";var e=t.Locking,o=t.Error,s=t.FollowInformationType,u=function(t,n){if(t.map)return t.map(n);var r,i,e=[];for(r=0,i=t.length;i>r;r++)e.push(n(t[r]));return e},a=function(t,n){if(t.filter)return t.filter(n);var r=0,i=0,e=[];for(r=0,i=t.length;i>r;r++)n(t[r])&&e.push(t[r]);return e},h=function(t,n,r){var i="",e={};for(i in t)t.hasOwnProperty(i)&&(void 0===n||n.indexOf(i)>-1)&&(r||null!==t[i]&&void 0!==t[i])&&(e[i]=t[i]);return e},d=function(t,n){this._ps=t,this._modifier=n,this._cloneObj=function(t){return JSON.parse(JSON.stringify(t))},this._autoClean=!0};return d.prototype._getPathWatcher=function(){var t=this._getEmptyStorerecord();return{getWatcher:function(){return function(n,r,e){var u="",a=n.split(".");if(e==s.INFO)return t.j=r,o.OK;if(e==s.ROOTITEM){for(u in r)r.hasOwnProperty(u)&&(t[u]=r[u]);return t.s=a[0],t.k=a[1],r.hasOwnProperty("r")&&r.r?o.DATA_ALREADY_REMOVED:o.OK}return e==s.OTHER_PATHS&&(t.p=r),e==s.PATHITEM&&(r.hasOwnProperty("t")||(r.t=this._ps.getKeyTimeDecoder().call(this._ps,n)),r.hasOwnProperty("m")||(r.m=this.getModifier()),t.q.push(r),t=i(t,r,this._cloneObj),t.s=a[0],t.k=a[1],"remove"==r.o)?o.DATA_ALREADY_REMOVED:o.OK}.bind(this)}.bind(this),getReaditem:function(){return t}}},d.prototype.setCloneFunction=function(t){this._cloneObj=t},d.prototype.getModifier=function(){return this._modifier},d.prototype.listenForAddedToPath=function(t){return this.listen("added_to_queue",t)},d.prototype.listenForAdvanced=function(t){return this.listen("advanced",t)},d.prototype.listenForFed=function(t){return this.listen("fed",t)},d.prototype.set=function(t,n,r,i){return this._addToQueue("set",t,n,r,i)},d.prototype.remove=function(t,n,r){return this._addToQueue("remove",t,n,{},r)},d.prototype.update=function(t,n,r,i){return this._addToQueue("update",t,n,r,i)},d.prototype.feed=function(n,r,d){var f=function(t){for(var n=[],r=0,i=t.length;i>r;r++)n.push(h(t[r],["s","k","u","t","m","o","b"],!1));return n}(n),_=function(t,n){var r=[],i=0,e=0,o=n[0],s=function(n){return null===t?!0:n.b>=t.v};for(i=0,e=n.length;e>i;i++){if(n[i].s!=o.s||n[i].k!=o.k)return a(r,s);r.push(n[i])}return a(r,s)},c=function(t){return this._unlockFor(e.FEEDING),d(t,f)}.bind(this),p=function(t,n,r,i,e){var s=function(n){var r,i={},e=["o","u","t"],o=["i","j","q","r","v"];for(r=0;r<o.length;r++)if(n.hasOwnProperty(o[r]))throw"Merge queue cannot include any "+o.join(", ");for(r=0;r<e.length;r++)n.hasOwnProperty(e[r])&&(i[e[r]]=n[e[r]]);if(n.hasOwnProperty("s")&&n.s!=t.s)throw"Merge queue cannot use different dataset to stored record";if(n.hasOwnProperty("k")&&n.k!=t.k)throw"Merge queue cannot use different datakey to stored record";return i};return r||c(o.NOT_RESOLVED),i.length?void this._ps.pushPathitemsToNewPath(f[0].s,f[0].k,"c",u(i,s),function(r){if(r)return c(r,f);var i={cv:t.v+n.length};this._ps.setInfo(f[0].s,f[0].k,i,function(t){return t!==o.OK&&c(t),this._ps.removePathitemFromPath(f[0].s,f[0].k,"a",this._autoClean,e)}.bind(this))}.bind(this)):this._ps.removePathitemFromPath(f[0].s,f[0].k,"a",this._autoClean,e)}.bind(this),O=function(){if(0===f.length)return this._unlockFor(e.FEEDING),d(o.OK,[]);var t=this._getEmptyStorerecord(),n=[],r=[],i={};this._ps.followPath(f[0].s,f[0].k,"a",function(e,o,u){return u==s.INFO?void(i=o):u==s.ROOTITEM?void(t=o):(u==s.OTHER_PATHS&&(n=o),void(u==s.PATHITEM&&r.push(o)))},function(e){return e!==o.NO_DATA_FOUND&&e!==o.OK&&c(e),f[0].b<t.v?(f.shift(),O()):r.length&&r[0].b<f[0].b?c(Error.BASED_ON_IN_QUEUE_LESS_THAN_BASED_IN_BEING_FED,f):E(t,r,i,n)}.bind(this))}.bind(this),E=function(t,n,e){if(n.length){var u=_(t,f);return r.call(this,f[0].s,f[0].k,function(){return 0===t.v?null:(t.s=f[0].s,t.k=f[0].k,t.hasOwnProperty("m")||(t.m=this.getModifier()),t)}.bind(this)(),n,u,function(n,r){p(t,u,n,r,O)})}if(t.v!=f[0].b)return c(o.FEED_VERSION_ERROR,f);var a=h(i(t,f[0],this._cloneObj),["i","v","m","t","r"]);if("remove"==f[0].o)return this._ps.promotePathToOrRemove(f[0].s,f[0].k,"c","a",function(t){if(t!==o.OK)return c(t);var n=f[0].s,r=f[0].k;this._emit("fed",n,r,f[0],null),f.shift(),O()}.bind(this));var d=function(t,n,r,i){return this._ps.changePath(t,n,"c","a",this._autoClean,function(e){return e?c(e,f):this._ps.followPath(t,n,"a",function(i,e,u){return u!==s.PATHITEM?o.OK:(this._emit("added_to_queue",t,n,this._addObviousInforation(t,n,i.replace(/.*\./,""),e,{b:r++})),o.OK)}.bind(this),function(t){return t?c(t,f):void i()})}.bind(this))}.bind(this);this._ps.setPathroot(f[0].s,f[0].k,"a",a,function(t){if(t!==o.OK)return c(t);var n=f[0].s,r=f[0].k;return this._emit("fed",n,r,f[0],this._addObviousInforation(f[0].s,f[0].k,null,a)),f.shift(),a.v==e.cv?d(n,r,a.v,O):void O()}.bind(this))}.bind(this),l=0,v=0,A=0;if(this.isLocked())return d(t.Error.UNABLE_TO_PROCESS_BECAUSE_LOCKED,n);for(l=0,v=n.length;v>l;l++)if(A=this._basicValidationForQueueitem(n[l]),A!=t.Error.OK)return d(A,n);this._lockFor(e.FEEDING),O()},d.prototype._basicValidationForQueueitem=function(n,r){var i,e={s:t.Error.INVALID_DATASET,k:t.Error.INVALID_DATAKEY,o:t.Error.INVALID_OPERATION};for(i in e)if(e.hasOwnProperty(i)&&!n.hasOwnProperty(i))return e[i];return null===n.s.match(t.Validation.DATASET_REGEXP)?t.Error.INVALID_DATASET:null===n.k.match(t.Validation.DATAKEY_REGEXP)?t.Error.INVALID_DATAKEY:null===n.o.match(t.Validation.OPERATION_REGEXP)?t.Error.INVALID_OPERATION:void 0!==r&&-1!=r.indexOf("m")?t.Error.OK:null===n.m.match(t.Validation.MODIFIER_REGEXP)?t.Error.INVALID_MODIFIER:t.Error.OK},d.prototype._addToQueue=function(t,n,r,i,s){if(this.isLocked())return s(o.UNABLE_TO_PROCESS_BECAUSE_LOCKED),!1;var u={o:t,u:i},a=function(t){var n="",r={m:this.getModifier(),r:!1};for(n in r)t.hasOwnProperty(n)||(t[n]=r[n]);return t}.bind(this),h=this._getPathWatcher();this._lockFor(e.ADDING_TO_QUEUE),this._ps.push(n,r,"a",u,!0,h.getWatcher(),function(t,i){var d=h.getReaditem();return this._unlockFor(e.ADDING_TO_QUEUE),t!==o.OK?s(t):(this._emit("added_to_queue",n,r,this._addObviousInforation(n,r,i,u,d)),void s(t,n,r,u,a(d)))}.bind(this))},d.prototype._getEmptyStorerecord=function(){return{i:{},v:0,j:{},p:[],q:[],r:!1,t:(new Date).getTime()}},d.prototype.advance=function(t){if(this.isLocked())return t(o.UNABLE_TO_PROCESS_BECAUSE_LOCKED),!1;this._lockFor(e.ADVANCING);var n="";this._ps.findFirstDatasetDatakey("a",function(r,s,u){if(r!==o.OK)return this._unlockFor(e.ADVANCING),t(r);var a={};this._ps.advance(s,u,this._autoClean,function(t,r,e,o){return null===t&&(t=this._getEmptyStorerecord()),n=r,"remove"===e.o?o(null):(a=i(t,e,this._cloneObj),a=h(this._addObviousInforation(s,u,n,a),["i","t","v","r"],!1),void o(a))}.bind(this),function(r,i){return this._unlockFor(e.ADVANCING),r!==o.OK?t(r,s,u):(this._emit("advanced",s,u,this._addObviousInforation(s,u,n,i,a),this._addObviousInforation(s,u,n,a)),t(r,s,u,this._addObviousInforation(s,u,n,i,a),this._addObviousInforation(s,u,n,a)))}.bind(this))}.bind(this))},d.prototype._addObviousInforation=function(t,n,r,i,e){var o=h(i),s="";if(o.s=t,o.k=n,o.hasOwnProperty("m")||(o.m=this.getModifier()),!o.hasOwnProperty("t")){if(void 0===r||null===r)throw"No time and no time found in key";o.t=this._ps.getKeyTimeDecoder()(r)}void 0!==e&&(!o.hasOwnProperty("b")&&e.hasOwnProperty("b")&&(o.b=parseInt(e.b,10)),!o.hasOwnProperty("b")&&e.hasOwnProperty("v")&&(o.b=parseInt(e.v,10)-1));for(s in o)s.match(/^_/)&&delete o[s];return o},d.prototype.get=function(t,n,r){this.getFull(t,n,function(t,n){return t===o.DATA_ALREADY_REMOVED?r(t,null):t===o.OK?r(t,n.i):void r(t)})},d.prototype.getVersion=function(t,n,r){this.getFull(t,n,function(t,n){return t===o.NO_DATA_FOUND?r(o.OK,0):[o.OK,o.DATA_ALREADY_REMOVED].indexOf(t)>-1?r(t,n.b+1):void r(t)})},d.prototype.getFirst=function(t){this._ps.getFirstPathitem("a",function(n,r,i,e,s){if(n!==o.OK)return t(n===o.PATH_EMPTY?o.NO_DATA_FOUND:n);var u=this._addObviousInforation(r,i,e,s);this._ps.getRootItem(r,i,"a",function(n,r){return n===o.NO_DATA_FOUND&&(n=o.OK,r=this._getEmptyStorerecord()),n!==o.OK?t(n):(u.b=r.v,t(n,u))}.bind(this))}.bind(this))},d.prototype.getFull=function(t,n,r){var i=this._getPathWatcher();this._ps.followPath(t,n,"a",i.getWatcher(),function(e){var s;return e!==o.OK?r(e):(s=this._addObviousInforation(t,n,null,i.getReaditem()),s.r===!0&&(e=o.DATA_ALREADY_REMOVED),r(e,s))}.bind(this))},d.prototype.getDatasetNames=function(t){this._ps.getDatasetNames(t)},d.prototype.getDatakeysInDataset=function(t,n){this._ps.getDatakeysInDataset(t,n)},d.prototype.purge=function(t,n){return this.isLocked()?(n(o.UNABLE_TO_PROCESS_BECAUSE_LOCKED),!1):(this._lockFor(e.CLEANING),this._ps.purge(t,function(t){this._unlockFor(e.CLEANING),n(t)}.bind(this)))},d.prototype.clean=function(t){if(this.isLocked())return t(o.UNABLE_TO_PROCESS_BECAUSE_LOCKED),!1;this._lockFor(e.CLEANING);var n=function(t,n,r){var i=this._getPathWatcher();this._ps.followPath(t,n,"a",i.getWatcher(),function(e){var s=i.getReaditem(),u=function(){return s.j.hasOwnProperty("cv")?(delete s.j.cv,void this._ps.setInfo(t,n,s.j,function(t){r(t)})):r(e)}.bind(this),a=function(){this._ps.removePath(t,n,"c",!1,u)}.bind(this);if(e!==o.OK)return r(e);if(s.p.length>1)throw"How did we end up with more than two paths?";if(s.p.length){if("c"!==s.p[0])throw"How did we end up with paths other than 'c' and 'a'?";return a()}return u()}.bind(this))}.bind(this),r=function(t,r){this.getDatakeysInDataset(t,function(i,e){if(i!==o.OK)return r(i);var s=0,u=e.length,a=!1,h=function(t){if(t!==o.OK){if(a)return;return a=!0,r(t)}0!==--u||a||r(o.OK)};for(s=u-1;s>=0;s--)n(t,e[s],h)})}.bind(this);this._ps.getDatasetNames(function(n,i){var s=0,u=!1,a=i.length,h=function(n){if(n!==o.OK){if(u)return;return u=!0,this._unlockFor(e.CLEANING),t(n)}0!==--a||u||this._ps.clean(function(n){this._unlockFor(e.CLEANING),t(n)}.bind(this))}.bind(this);if(n!==o.OK)return this._unlockFor(e.CLEANING),t(n);for(s=a-1;s>=0;s--)r(i[s],h)}.bind(this))},n(d,["fed","advanced","added_to_queue"]),r(d,e.MAXIMUM_BIT_PATTERN),d});
},{"./Constant.js":2,"./addLocking.js":8,"./updateResult.js":15,"add-events":12}],6:[function(_dereq_,module,exports){
!function(t,n){"use strict";"object"==typeof exports?module.exports=n(_dereq_("./Constant.js"),_dereq_("./SyncIt.js")):define(["./Constant","./SyncIt"],n)}(this,function(t,n){"use strict";var r,s=function(n){this._syncIt=n,this._instructions=[],this._current=null,setInterval(function(){var n,r;null===this._current&&this._instructions.length&&(this._current=this._instructions.shift(),n=Array.prototype.slice.call(this._current.a),n.push(function(n){n!==t.Error.UNABLE_TO_PROCESS_BECAUSE_LOCKED&&(r=this._current.c,this._current=null,r.apply(this._syncIt,arguments))}.bind(this)),this._current.f.apply(this._syncIt,n))}.bind(this),50)},e=function(t){s.prototype[t]=function(){this._syncIt[t].apply(this._syncIt,Array.prototype.slice.call(arguments))}},i=function(t){s.prototype[t]=function(){this._instructions.push({f:this._syncIt[t],a:Array.prototype.slice.call(arguments,0,arguments.length-1),c:Array.prototype.slice.call(arguments,arguments.length-1)[0]})}},c=["update","remove","set","purge","clean","feed","advance","getFirst"];for(r in n.prototype)if(n.prototype.hasOwnProperty(r)){if(r.match(/^_/))continue;c.indexOf(r)>-1?i(r):e(r)}return s});
},{"./Constant.js":2,"./SyncIt.js":5}],7:[function(_dereq_,module,exports){
!function(t,e){"use strict";"object"==typeof exports?module.exports=e():define(e)}(this,function(){"use strict";var t=function(t,e,s,n){this._ls=t,this._serialize=s,this._unserialize=n,this._ns=e};return t.prototype.getLength=function(){return this._ls.length},t.prototype.setItem=function(t,e){return this._ls.setItem(this._ns+"."+t,this._serialize(e))},t.prototype.clear=function(){var t=0,e="",s=0,n=[];for(t=0,s=this.getLength();s>t;t++)e=this.key(t),null!==e&&n.push(e);for(;n.length;)this.removeItem(n.shift())},t.prototype.key=function(t){var e=this._ls.key(t);return null===e?null:e.length>this._ns.length&&e.substr(0,this._ns.length+1)==this._ns+"."?e.substr(e.indexOf(".")+1):null},t.prototype.getItem=function(t){return this._unserialize(this._ls.getItem(this._ns+"."+t))},t.prototype.removeItem=function(t){return this._ls.removeItem(this._ns+"."+t)},t.prototype.findKeys=function(t){var e=0,s=0,n="",i=-1,r=null,h=[],u=null;for(r=function(t){var e=[],s=0;if(!t.match(/^[a-z0-9_\.\*]/))return!1;for(t=t.replace(/\./g,"\\."),i=t.indexOf("*");i>-1;){for(e=[i-1,i+1],i==t.length-1&&e.pop(),0===i&&e.shift(),s=0;s<e.length;s++)if("."!==t.substr(e[s],1)&&"\\"!==t.substr(e[s],1))return!1;t=t.replace("*","[a-z0-9A-Z_\\-]+"),i=t.indexOf("*")}return new RegExp("^"+t+"$")},u=r(t),s=0,e=this._ls.length;e>s;s++)n=this._ls.key(s),n.length>this._ns.length&&n.substr(0,this._ns.length+1)==this._ns+"."&&(n=n.substr(n.indexOf(".")+1),u.test(n)&&h.push(n));return h},t});
},{}],8:[function(_dereq_,module,exports){
!function(t,o){"use strict";"object"==typeof exports?module.exports=o():define(o)}(this,function(){"use strict";return function(t,o){t.prototype._ensureLockingData=function(){this.hasOwnProperty("_locked")||(this._locked=0)},t.prototype._amILocked=function(t){return this._ensureLockingData(),this._locked&(o^t)?!0:!1},t.prototype._lockFor=function(t){this._ensureLockingData();var o=this._locked&t;return o?!1:(this._locked=this._locked|t,!0)},t.prototype._unlockFor=function(t){return this._ensureLockingData(),this._locked&t?void(this._locked=this._locked^o&t):!1},t.prototype.isLocked=function(){return this._ensureLockingData(),this._locked>0}}});
},{}],9:[function(_dereq_,module,exports){
module.exports={AsyncLocalStorage:_dereq_("./AsyncLocalStorage"),Constant:_dereq_("./Constant"),SyncIt:_dereq_("./SyncIt"),SyncItBuffer:_dereq_("./SyncItBuffer"),FakeLocalStorage:_dereq_("./FakeLocalStorage"),getTlIdEncoderDecoder:_dereq_("get_tlid_encoder_decoder"),Path_AsyncLocalStorage:_dereq_("./Path/AsyncLocalStorage"),dontListLocallyDeletedDatakeys:_dereq_("./dontListLocallyDeletedDatakeys")};
},{"./AsyncLocalStorage":1,"./Constant":2,"./FakeLocalStorage":3,"./Path/AsyncLocalStorage":4,"./SyncIt":5,"./SyncItBuffer":6,"./dontListLocallyDeletedDatakeys":10,"get_tlid_encoder_decoder":13}],10:[function(_dereq_,module,exports){
!function(r,t){"use strict";"object"==typeof exports?module.exports=t(_dereq_("./Constant.js")):define(["./Constant"],t)}(this,function(r){"use strict";return function(t){var n=t.getDatakeysInDataset.bind(t);return t.getDatakeysInDataset=function(e,o){n(e,function(n,u){var i,s,f={},a=!1,c=function(r){var t,n=[];for(t in r)r.hasOwnProperty(t)&&n.push(t);return n},h=function(r){var t,n=[];for(t in r)r.hasOwnProperty(t)&&r[t].r===!1&&n.push(t);return n},g=function(t,n){if(-1===[r.Error.OK,r.Error.DATA_ALREADY_REMOVED].indexOf(t)){if(a)return;return a=!0,o(t)}f[n.k]=n,c(f).length==u.length&&o(r.Error.OK,h(f))};if(0===u.length)return o(r.Error.OK,[]);for(i=0,s=u.length;s>i;i++)t.getFull(e,u[i],g)})},t}});
},{"./Constant.js":2}],11:[function(_dereq_,module,exports){
!function(t,n){"use strict";"object"==typeof exports?module.exports=n():define([],n)}(this,function(){"use strict";return function(t,n){var o=function(){var n=Array.prototype.slice.call(arguments);n.unshift(null);var o=t.bind.apply(t,n);this._inst=new o},r="",e=function(t,n){return function(){var o=Array.prototype.slice.call(arguments),r=o.pop();return n===!1?r(t.apply(this._inst,o)):void setTimeout(function(){r(t.apply(this._inst,o))}.bind(this),Math.floor(Math.random()*n)+1)}},i=function(r){o.prototype[r]=e(t.prototype[r],n)};for(r in t.prototype)t.prototype.hasOwnProperty(r)&&i(r);return o}});
},{}],12:[function(_dereq_,module,exports){
(function (root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	"use strict";
	if (typeof exports === 'object') {
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		define(factory);
	} else {
		root.addEvents = factory();
	}
})(this, function () {
	
// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

"use strict";

/**
 * # addEvents()
 *
 * Adds events to an existing pseudo-classical Javascript class.
 *
 * NOTE: Overwrites the following variables within the prototype:
 *
 * * _eventTypes
 * * _emit
 * * on
 * * once
 * * removeAllListeners
 * * removeAllOnceListeners
 * * removeOnceListener
 * * removeOnceListener
 *
 * NOTE: Overwrites the following variables within the instance of a class
 *
 * * _onceListeners
 * * _listeners
 * 
 * ## Example
 *
 * ```javascript
 * var MyClass = function() {
 * };
 *
 * MyClass.prototype.doSomething = function() {
 *	return this._emit('doneit','a','b');
 * };
 *
 * addEvents(MyClass,['doneit']);
 *
 * var myClass = new MyClass();
 * myClass.on('doneit',function (a, b) {
 *	console.log('a = ' + a + ', b = ' + b);
 * });
 * myClass.doSomething();
 * ```
 *
 * ## Parameters
 * * **@param {Function} `classFunc`** The class to add events to.
 * * **@param {Array} `events`** The events you want the class to support.
 */
var addEvents = function(classFunc, events) {

	classFunc.prototype._eventTypes = events;
	
	classFunc.prototype._emit = function(event /*, other arguments */) {

		var i = 0,
			args = Array.prototype.slice.call(arguments, 1);
		
		if (this._eventTypes.indexOf(event) === -1) {
			throw "SyncIt._emit(): Attempting to fire unknown event '" + event + "'";
		}
		
		var toFire = [];
		
		if (
			this.hasOwnProperty('_onceListeners') &&
			this._onceListeners.hasOwnProperty(event)
		) {
			while (this._onceListeners[event].length) {
				toFire.push(this._onceListeners[event].shift());
			}
		}
		
		if (
			this.hasOwnProperty('_listeners') &&
			this._listeners.hasOwnProperty(event)
		) {

			for (i=0; i<this._listeners[event].length; i++) {
				toFire.push(this._listeners[event][i]);
			}
		}
		
		while (toFire.length) {
			toFire.shift().apply(this, args);
		}
		
	};

	var pushTo = function(objKey, event, func, ctx) {
		
		if (ctx._eventTypes.indexOf(event) === -1) {
			throw "addEvents: Attempting to listen for unknown event '"+event+"'";
		}
		
		if (!ctx.hasOwnProperty(objKey)) {
			ctx[objKey] = {};
		}
		
		if (!ctx[objKey].hasOwnProperty(event)) {
			ctx[objKey][event] = [];
		}
		
		ctx[objKey][event].push(func);
	};

	/**
	 * ### CLASS.on()
	 * 
	 * Adds an event listeners to an event
	 * 
	 * #### Parameters
	 * 
	 * * **@param {String} `event`** The name of the event to listen for
	 * * **@param {Function} `listener`** The listener to fire when event occurs.
	 * 
	 * #### Returns
	 * 
	 * * **@return {Boolean}** True if that event is available to listen to.
	 */
	classFunc.prototype.on = function(event, func) {
		pushTo('_listeners', event, func, this);
	};
	classFunc.prototype.listen = classFunc.prototype.on;
	
	/**
	 * ### CLASS.once()
	 * 
	 * Adds an event listeners which will be called only once then removed
	 * 
	 * #### Parameters
	 * 
	 * * **@param {String} `event`** The name of the event to listen for
	 * * **@param {Function} `listener`** The listener to fire when event occurs.
	 * 
	 * #### Returns
	 * 
	 * * **@return {Boolean}** True if that event is available to listen to.
	 */
	classFunc.prototype.once = function(event,func) {
		pushTo('_onceListeners', event, func, this);
	};
	
	var removeAllListeners = function(objKey, event, ctx) {	
		var propertyNames = (function(ob) {
			var r = [];
			for (var k in ob) { if (ob.hasOwnProperty(k)) {
				r.push(k);
			} }
			return r;
		})(ctx[objKey]);
		
		if (propertyNames.indexOf(event) == -1) {
			return [];
		}
		
		var r = ctx[objKey][event];
		ctx[objKey][event] = [];
		return r;
	};

	/**
	 * ### CLASS.removeAllListeners()
	 *
	 * Removes all non `once` listeners for a specific event.
	 *
	 * #### Parameters
	 * 
	 * * **@param {String} `event`** The name of the event you want to remove all listeners for.
	 * 
	 * #### Returns
	 * 
	 * * **@return {Array}** The listeners that have just been removed.
	 */
	classFunc.prototype.removeAllListeners = function(event) {
		return removeAllListeners('_listeners', event, this);
	};
	
	/**
	 * ### CLASS.removeAllOnceListeners()
	 *
	 * Removes all `once` listeners for a specific event.
	 *
	 * #### Parameters
	 * 
	 * * **@param {String} `event`** The name of the event you want to remove all listeners for.
	 * 
	 * #### Returns
	 * 
	 * * **@return {Array}** The listeners that have just been removed.
	 */
	classFunc.prototype.removeAllOnceListeners = function(event) {
		return removeAllListeners('_onceListeners', event, this);
	};
	
	var removeListener = function(objKey, event, listener, ctx) {
		
		var i = 0,
			replacement = [],
			successful = false;
		
		var propertyNames = (function(ob) {
			var r = [];
			for (var k in ob) { if (ob.hasOwnProperty(k)) {
				r.push(k);
			} }
			return r;
		})(ctx[objKey]);
		
		if (propertyNames.indexOf(event) == -1) {
			return false;
		}
		
		for (i=0; i<ctx[objKey][event].length; i++) {
			if (ctx[objKey][event][i] !== listener) {
				replacement.push(ctx[objKey][event][i]);
			} else {
				successful = true;
			}
		}
		ctx[objKey][event] = replacement;
		
		return successful;
	};
	
	/**
	 * ### CLASS.removeListener()
	 *
	 * Removes a specific listener from an event (note, not from the `once()` call).
	 *
	 * #### Parameters
	 * 
	 * * **@param {String} `event`** The name of the event you want to remove a listener from.
	 * * **@param {Function} `listener`** The listener you want to remove.
	 * 
	 * #### Returns
	 * 
	 * * **@return {Boolean}** True if the listener was removed, false otherwise.
	 */
	classFunc.prototype.removeListener = function(event, listener) {
		return removeListener('_listeners', event, listener, this);
	};

	/**
	 * ### CLASS.removeOnceListener()
	 *
	 * Removes a specific listener from an event (note, not from the `once()` call).
	 *
	 * #### Parameters
	 * 
	 * * **@param {String} `event`** The name of the event you want to remove a listener from.
	 * * **@param {Function} `listener`** The listener you want to remove.
	 * 
	 * #### Returns
	 * 
	 * * **@return {Boolean}** True if the listener was removed, false otherwise.
	 */
	classFunc.prototype.removeOnceListener = function(event, listener) {
		return removeListener('_onceListeners', event, listener, this);
	};

};

return addEvents;

});
},{}],13:[function(_dereq_,module,exports){
/*jshint smarttabs:true */
(function (root, factory) {
	"use strict";
	if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([],factory);
	} else {
		// Browser globals (root is window)
		root.getTLIdEncoderDecoder = factory();
	}
})(this, function () {

"use strict";
// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

/**
 * # getTLIdEncoderDecoder()
 *
 * Generate time based local Id's which are guarenteed to be unique for that
 * particular constructor call.
 *
 * ## Parameters
 *
 * * **@param {Number} `epoch`** A timestamp, all unique Id's will use this as
 *	thier base time.
 * * **@param {Number} `uniqueLength`** Id's will be based on a timestamp and a
 *	extra sequence number if we happen to generate two Id's in the same 
 *	millisecond. If you leave this at the default of 1, 32 unique Id's can be
 *	generated per millisecond (because it's a 32bit number represented in a
 *	string), I have found this to be sufficient, but you can increase this
 *	number if it is not.
 * * **@return {Object} `return`** The return value includes three seperate Functions, 
 *	these are:
 * *   **@return {Function} `return.encode`** Encode now by default (or the
 *		first parameter) into an Id.
 * *   **@return {Function} `return.decode`** Decode an Id back into a 
 *		timestamp (Id is the first parameter).
 * *   **@return {Function} `return.sort`** Compatible with Array.sort() and
 *		will soft based on the encode time / first parameter.
 *
 * ## Example
 *
 * ```javascript
 * // Use one character (32 bit number) to ensure uniqueness within a millisecond
 * var uniquenessPerMillisecond = 1;
 * // As close as possible (but lower) than the lowest date to give shorter Id's
 * var epoch = new Date(1970,0,1).getTime();
 * 
 * 
 * // Get the TLId Encoder / Decoder
 * var encoderDecoder = getTLIdEncoderDecoder(epoch,uniquenessPerMillisecond);
 * 
 * // Encode a date into a unique string
 * var dates = [
 *   encoderDecoder.encode(),
 *   encoderDecoder.encode(new Date(1980,1,6).getTime()),
 *   encoderDecoder.encode(new Date(1981,3,15).getTime()),
 *   encoderDecoder.encode(new Date(1986,8,9).getTime()),
 *   encoderDecoder.encode(new Date(1983,10,3).getTime()),
 *   encoderDecoder.encode(new Date(1982,0,6).getTime()),
 *   encoderDecoder.encode()
 * ];
 * 
 * // Get the dates it was encoded
 * var originalTimestamps = dates.map(encoderDecoder.decode);
 * 
 * // Sort them in date order
 * var sortedDates = dates.sort(encoderDecoder.sort);*
 * console.log("The first Date is " + new Date(encoderDecoder.decode(sortedDates[0])));
 * ```
 */
return function(epoch,uniqueLength) {
  
  var lastDate = null;
  var index = -1;
  if (uniqueLength === undefined) {
	uniqueLength = 1;
  }

  if (typeof epoch != 'number') {
    throw "Only takes timestamps";
  }
  
  var genUid = function(now) {
    
    if (now === undefined) {
      now = new Date().getTime();
    }
	if (typeof now == 'object') {
      throw "Only takes timestamps";
	}
    
    if ((lastDate === null) || (now !== lastDate)) {
      index = -1;
    }

	var superUnique = (++index).toString(32);
	if (superUnique.length < uniqueLength) {
		superUnique = '0' + superUnique;
	}
	var timeEncoded = (now - epoch).toString(32);

	if (superUnique.length > uniqueLength) {
      throw "getUidGenerator.genUid cannot generate TLId until next millisecond!";
	}

    lastDate = now;
	if (timeEncoded.substr(0,1) <= '9') {
		return "X"+timeEncoded+superUnique;
	}
	return timeEncoded+superUnique;
  };
  
  var uidToTimestamp = function(tlid) {
	if (tlid.substr(0,1) == 'X') {
		tlid = tlid.substr(1);
	}
	tlid = tlid.substr(0, tlid.length - uniqueLength);
    return parseInt(tlid,32) + epoch;
  };

  var sort = function(tlidA, tlidB) {
	if (tlidA.substr(0,1) == 'X') {
		tlidA = tlidA.substr(1);
	}
	if (tlidB.substr(0,1) == 'X') {
		tlidB = tlidB.substr(1);
	}
	tlidA = tlidA.replace(/.*\./,'');
	tlidB = tlidB.replace(/.*\./,'');
	if (tlidA.length != tlidB.length) {
		return (tlidA.length < tlidB.length) ? -1 : 1;
	}
	return (tlidA < tlidB) ? -1 : 1;
  };
  
  return {encode: genUid, decode: uidToTimestamp, sort: sort};
};

});

},{}],14:[function(_dereq_,module,exports){
(function (root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js

	"use strict";

	if (typeof exports === 'object') {
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		define(factory);
	} else {
		root.manip = factory();
	}

}(this, function () {
	
// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

"use strict";

/**
 * ### manip()
 * 
 * The function to return.
 * 
 * #### Parameters
 * 
 * * **@param {Object} `ob`** The function to apply the Manipulation to.
 * * **@param {Object} `jsonDoc`** The manipulation.
 * * **@param {Function|undefined} `cloneObjFunc`** Function to use for cloning objects, if left null, it will do a JSON based clone.
 * * **@return {Object}** The result of applying the `jsonDoc` to `ob`.
 */
var manip = function(ob,jsonDoc,cloneFunc) {
	var k = '',
		r = null,
		_cloneFunc = function(ob) { return JSON.parse(JSON.stringify(ob)); };
	
	if (cloneFunc === undefined) {
		r = _cloneFunc(ob);
	} else {
		r = cloneFunc(ob);
	}

	for (k in jsonDoc) { if (jsonDoc.hasOwnProperty(k)) {
		if (k.substring(0,1) == '$') {
			if (!manip.fn.hasOwnProperty(k.substring(1))) {
				throw new Error('manip: Does not have manipulation function '+k.substring(1));
			}
			r = manip.fn[k.substring(1)].call(manip,r,jsonDoc[k]);
		}
	} }
	return r;
};

// Holds the functions
manip.fn = {};

/**
 * ### manip._setKey()
 * 
 * Sets an internal field of `r` at `path` to `value`.
 * 
 * #### Parameters
 * 
 * * **@param {Object} `r`** The object to set an internal path to.
 * * **@param {String} `path`** The path to change, seperated by "."'s.
 * * **@param {Var} `value`** The value to set `path` to.
 * * **@return {Object}** The result.
 */
manip._setKey = function(r,path,value) {
	var k,
		t = r,
		parsePath = path.split('.');
	
	while (parsePath.length) {
		k = parsePath.shift();
		if (parsePath.length === 0) {
			t[k] = value;
			return r;
		}
		if (!t.hasOwnProperty(k)) {
			t[k] = {};
		}
		t = t[k];
	}
	return r;
};

/**
 * ### manip._getKey()
 * 
 * Gets the value from `r` at path `path`.
 * 
 * #### Parameters
 * 
 * * **@param {Object} `r`** The object to set an internal path to.
 * * **@param {String} `path`** The path to get, seperated by "."'s.
 * * **@return {Object}** The result.
 */
manip._getKey = function(r,path) {
	var k,
		t = r,
		parsePath = path.split('.');
	
	while (parsePath.length) {
		k = parsePath.shift();
		if (parsePath.length === 0) {
			return t[k];
		}
		if (!t.hasOwnProperty(k)) {
			t[k] = {};
		}
		t = t[k];
	}
	return undefined;
};

/**
 * ### manip._remKey()
 * 
 * Removes `path` from `r`.
 * 
 * #### Parameters
 * 
 * * **@param {Object} `r`** The object to remove an internal path from.
 * * **@param {String} `path`** The path to remove, seperated by "."'s.
 * * **@return {Object}** The result
 */
manip._remKey = function(r,path) {
	var k,
		t = r,
		parsePath = path.split('.');
	
	while (parsePath.length) {
		k = parsePath.shift();
		if (parsePath.length === 0) {
			delete t[k];
			return r;
		}
		if (!t.hasOwnProperty(k)) {
			return r;
		}
		t = t[k];
	}
	return r;
};

/**
 * ### manip.addManipulation()
 * 
 * Adds a manipulation function.
 * 
 * #### Parameters
 * 
 * * **@param {String} `name`** The name of the Manipulation
 * * **@param {Function} `func`** The function that will perform the manipultion
 */
manip.addManipulation = function(name,func) {
	manip.fn[name] = func;
};

/**
 * Adds the 'set' which is similar to the MongoDB operation of the same name.
 */
manip.addManipulation('set',function(ob,jsonSnippet) {
	var k = '';
	for (k in jsonSnippet) { if (jsonSnippet.hasOwnProperty(k)) {
		ob = manip._setKey(ob,k,jsonSnippet[k]);
	} }
	return ob;
});

/**
 * Adds the 'unset' which is similar to the MongoDB operation of the same name.
 */
manip.addManipulation('unset',function(ob,jsonSnippet) {
	var k = '';
	for (k in jsonSnippet) { if (jsonSnippet.hasOwnProperty(k)) {
		ob = manip._remKey(ob,k);
	} }
	return ob;
});

/**
 * Adds the 'push' which is will add an item or items to the array.
 *
 * Note the subdocument of jsonSnippet can be a single scalar, which will just
 * be added to the array or it could be a document including any/all of "$each",
 * "$sort" and "$slice" which will act in way (somewhat) similar to how they
 * work in MongoDB 2.4.
 */
manip.addManipulation('push',function(ob,jsonSnippet) {
	
	var k, v;
	
	var subOps = {
		"scalar": function(src, val) {
			src.push(val);
			return src;
		},
		"$each": function(src, val) {
			var i, l;
			for (i=0, l=val.length; i<l; i++) {
				src.push(val[i]);
			}
			return src;
		},
		"$sort": function(src, val) {
			var tmp;
			
			if (val == '.') {
				return src.sort();
			}
			
			src.sort(function(a, b) {
				for (var k in val) {
					if (val.hasOwnProperty(k)) {
						if (!a.hasOwnProperty(k)) {
							return (val[k] > 0) ? -1 : 1;
						}
						if (!b.hasOwnProperty(k)) {
							return (val[k] > 0) ? 1 : -1;
						}
						if (a[k] == b[k]) { continue; }
						tmp = [a[k], b[k]].sort();
						if (tmp[0] === a[k]) {
							return (val[k] > 0) ? -1 : 1;
						}
						return (val[k] > 0) ? 1 : -1;
					}
				}
				return 0;
			});
			return src;
		},
		"$slice": function(src, num) {
			if (num === 0) { return []; }
			return src.slice(num);
		}
	};
	
	var processPushMods = function(v, pushMods) {
		
		var toPush = {},
			willPush = false;
		
		for (var k in pushMods) {
			if (
				pushMods.hasOwnProperty(k) &&
				(subOps.hasOwnProperty(k))
			) {
				v = subOps[k](v, pushMods[k]);
			} else {
				willPush = true;
				toPush[k] = pushMods[k];
			}
		}
		
		subOps.scalar(v, toPush);
		
		return v;
	};
	
	for (k in jsonSnippet) { if (jsonSnippet.hasOwnProperty(k)) {
	
		v = manip._getKey(ob,k);
		if (v === undefined) {
			v = [];
		}
		
		if (!ob[k] instanceof Array) {
			v = [ob[k]];
		}
		
		v = processPushMods(v, jsonSnippet[k]);
		
		ob = manip._setKey(ob,k,v);
	} }
	return ob;
});

/**
 * Adds the 'inc' which is similar to the MongoDB operation of the same name.
 */
manip.addManipulation('inc',function(ob,jsonSnippet) {
	var k = '';
	for (k in jsonSnippet) { if (jsonSnippet.hasOwnProperty(k)) {
		var x = parseInt(manip._getKey(ob,k),10);
		if (!x) { x = 0; }
		x = x + jsonSnippet[k];
		ob = manip._setKey(ob,k,x);
	} }
	return ob;
});

return manip;

}));

},{}],15:[function(_dereq_,module,exports){
!function(t,r){"use strict";"object"==typeof exports?module.exports=r(_dereq_("manip")):define(["manip"],r)}(this,function(t){"use strict";var r=function(t,e,o){if(!r.hasOwnProperty("_op_"+e.o))throw"SyncLib.updateResult No Operation: updateResult has no operation "+e.o;var n=r["_op_"+e.o];return n.call(this,t,e,o)};return r._op_update=function(r,e,o){var n=o(r);return n.i=t(n.i,e.u,o),n.v=n.v+1,e.hasOwnProperty("m")&&(n.m=e.m),n.t=e.t,n.r=!1,n},r._op_remove=function(t,r,e){var o=e(t);return o.v=o.v+1,r.hasOwnProperty("m")&&(o.m=r.m),o.t=r.t,o.r=!0,o},r._op_set=function(t,r,e){var o=e(t);return o.i=r.u,o.v=o.v+1,r.hasOwnProperty("m")&&(o.m=r.m),o.t=r.t,o.r=!1,o},r});
},{"manip":14}]},{},[9])
(9)
});