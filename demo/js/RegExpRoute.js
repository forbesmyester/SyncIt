(function(exporterFunction) {

var RegExpRoute = function() {
	this.routes = {};
};

RegExpRoute.prototype.add = function(method,route) {
	if (!this.routes.hasOwnProperty(method)) {
		this.routes[method] = [];
	}
	this.routes[method].push(route);
};

RegExpRoute.prototype.route = function(method,path) {
	var i = 0,
		l = 0,
		routeRegExp = null,
		routeRegExpResult = null,
		paramRegExp = null,
		paramRegExpResult = null;
	
	var calculateResult = function(route,routeReRes,paramReRes) {
		var i = 0,
			p = {};
		for (i=1; i<routeReRes.length; i++) {
			p[paramReRes[i]] = routeReRes[i];
		}
		return {route: route, params: p};
	};
	
	if (!this.routes.hasOwnProperty(method)) { return null; }
	
	for (i=0,l=this.routes[method].length;i<l;i++) {
		routeRegExp = new RegExp(this.routes[method][i].replace(/:[^\s\/]+/g, '([\\w-]+)'));
		if ((routeRegExpResult = routeRegExp.exec(path)) !== null ) {
			paramRegExp = new RegExp(this.routes[method][i].replace(/:[^\s\/]+/g, ':([\\w-]+)'));
			paramRegExpResult = paramRegExp.exec(this.routes[method][i]);
			return calculateResult(this.routes[method][i],routeRegExpResult,paramRegExpResult);
		}
	}
	return null;
};

exporterFunction(RegExpRoute);

})(
	(function() {
		/*global module:false, window:false, setTimeout:false */
		if ((typeof module != 'undefined') && (module.exports)) {
			return function(obj) {
				module.exports = obj;
				return;
			};
		}
		if (typeof define != 'undefined' && define.hasOwnProperty('amd') && define.amd) {
			return function(obj) {
				define([],function() {
					return obj
				});
			};
		}
		if (typeof window != 'undefined') {
			return function(obj) {
				var k = '';
				for (k in obj) {
					if (obj.hasOwnProperty(k)) {
						window[k] = obj[k];
					}
				}
			};
		}
	})()
);