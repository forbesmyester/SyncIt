define(
["dojo/io-query",'./RegExpRoute'],
function(ioQuery,RegExpRoute) {
	
	var ServerSimulator = function(logger) {
		this.server = null;
		this.intervalId = null;
		this.routes = {};
		this.regExpRoute = new RegExpRoute();
		this.logger = logger;
	};
	
	ServerSimulator.prototype.addRoute = function(method,route,func) {
		if (!this.routes.hasOwnProperty(method)) {
			this.routes[method] = [];
		}
		this.routes[method][route] = func;
		this.regExpRoute.add(method,route);
	}
	
	ServerSimulator.prototype._handleRequestFromReadyXhr = function()
	{
		var inst = this;
		var extractInformationFromReadyXhr = function(fakeXMLHttpRequest) {
			var path = fakeXMLHttpRequest.url;
			var query = {};
			var body = {};
			if (fakeXMLHttpRequest.url.match(/\?/))
			{
				path = fakeXMLHttpRequest.url.replace(/\?.*/,'');
				query = ioQuery.queryToObject(fakeXMLHttpRequest.url.replace(/.*\?/,''));
			}
			if (fakeXMLHttpRequest.requestBody)
			{
				body = JSON.parse(fakeXMLHttpRequest.requestBody); // Assuming JSON!
			}
			var method = fakeXMLHttpRequest.method;
			if (query.hasOwnProperty('_method'))
			{
				method = query._method;
			}
			var _pathComponents = path.split('/');
			var pathComponents = {
				'path':path,
				'query':query,
				'body':body,
				'method':method
			};
			return pathComponents;
		};

		var debug = [];
		if (this.server.hasOwnProperty('requests'))
		{
			debug.push(this.server.requests.length);
		} else {
			debug.push(0);
		}
		if (this.server.hasOwnProperty('queue'))
		{
			debug.push(this.server.queue.length);
		} else {
			debug.push(0);
		}

		if (
			this.server.hasOwnProperty('requests') &&
			this.server.hasOwnProperty('queue')
		)
		{
			var respondToIt = function(readyXhr) {
				var info = extractInformationFromReadyXhr(readyXhr);
				inst.logger.log({"ServerSimulator: Request:": info});
				
				var routeInfo = inst.regExpRoute.route(info.method,info.path);
				
				if (routeInfo === null) {
					throw "ServerSimulator: Could not match route for path "+info.path;
				}
				
				(inst.routes[info.method][routeInfo.route])(
					info.method,
					info.path,
					routeInfo.params,
					info.query,
					info.body,
					function(httpStatus,headers,data) {
						inst.logger.log(
							{
								"ServerSimulator: Response:": 
								{
									httpStatus:httpStatus,
									headers:headers,
									data:data
								}
							}
						);
						readyXhr.respond(
							httpStatus,
							headers,
							JSON.stringify(data)
						);
					}
				);
			};
			for (var i=0;i<this.server.requests.length;i++)
			{
				if ((this.server.requests[i].readyState == 1) &&
					(!this.server.requests[i].hasOwnProperty('server_simulator_processed')))
				{
					this.server.requests[i].server_simulator_processed = true;
					return respondToIt(this.server.requests[i]);
				}
			}
		}
		return false;
	};
	
	ServerSimulator.prototype.stop = function() {
		if (this.intervalId === null) {
			return;
		}
		clearInterval(this.intervalId);
		this.intervalId = null;
		this.server.restore();
	};
	
	ServerSimulator.prototype.start = function() {
		if (this.intervalId !== null) {
			return;
		}
		this.server = sinon.fakeServer.create();
		this.intervalId = setInterval(
			this._handleRequestFromReadyXhr.bind(this),
			200
		);
	};
	
	return ServerSimulator;
	
});