
/**
 * Module dependencies.
 */

var express = require('express'),
	// routes = require('./routes'),
	repl = require("repl"),
	http = require('http'),
	path = require('path'),
	stylus = require('stylus'),
	fluidity = require('fluidity'),
	cons = require('consolidate'),
	swig = require('swig'),
	util = require('util');
	// Responder = require('./libs/Responder');

var app = express();

app.configure(function(){
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	app.engine('.html', cons.swig);
	app.set('view engine', 'html');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('your secret here'));
	app.use(app.router);
	app.use(stylus.middleware({
		src: __dirname + '/assets',
		dest: __dirname + '/public',
		compile: function (str, path) {
			return stylus(str)
				.set('filename', path)
				.set('compress', false)
				.use(fluidity());
		}
	}));
	app.use(express['static'](path.join(__dirname, 'public')));
});

var swigInit = function(developmentMode) {
	swig.init({
		root: __dirname + '/views',
		cache: developmentMode ? false : true,
		allowErrors: true // allows errors to be thrown and caught by express instead of suppressed by Swig
	});
};

app.set('views', __dirname + '/views');

app.configure('development', function(){
	console.log("DEVELOPMENT MODE ON");
	app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));
	swigInit(true);
}); 

app.configure("production",function() {
	swiginit(false);
});

// db = require('mongoskin').db('192.168.122.249:27017/syncitserv',{w:true});

var setupRoutes = function(app,mode) {
	
	var i = 0;
	
	var getTemplateSlice = function(paths) {
		var worker = function(paths,excludeLast) {
			var np = [],
				i = 0;
			for (i=0;i<(paths.length-excludeLast);i++) {
				np.push(paths[i]);
			}
			return np;
		};
		
		if (paths.length > 3) {
			return worker(paths,3);
		}
		return worker(paths,0);
	};
	
	var getTemplateBaseAfterCreation = function(paths) {
		var r = getTemplateSlice(paths);
		if (r.length > 1) {
			r.pop();
			return r.join('/');
		}
		return r.join('/');
	};

	var getTemplateFromPaths = function(paths) {
		return getTemplateSlice(paths).join('/');
	};
	
	var responseSelector = (function(responses) {

		var responseSelector = new (require('./libs/ResponseSelector'))({
			format: { points:16, required: true },
			controller: { points:8, required: true },
			action: { points:4, required: true },
			method: { points:2, required: true },
			status: { points:1, required: true }
		});
		var path = '';
			
		var constructPathObj = function(str) {
			var map = ['format','controller','action','method','status'],
				i = 0;
				r = {};
			str = str.split('/');
			for (i=0;i<str.length;i++) {
				if (str[i].length) {
					r[map[i]] = str[i];
				}
			}
			return r;
		};
		
		for (path in responses) {
			if (responses.hasOwnProperty(path)) {
				responseSelector.set(constructPathObj(path),responses[path]);
			}
		}
		
		return responseSelector;
	})({
		'json///post/accepted': 
			function(res,paths,status,data) { res.send(201,data); },
		'json///post/created': 
			function(res,paths,status,data) { res.send(201,data); },
		'json///post/validation_error': 
			function(res,paths,status,data) { res.send(422,data); },
		'json///post/unauthorized': 
			function(res,paths,status,data) { res.send(401,"Unauthorized"); },
		'json///post/forbidden': 
			function(res,paths,status,data) { res.send(403,"Forbidden"); },
		'json///post/not_acceptable': 
			function(res,paths,status,data) { res.send(406,"Not Acceptable"); },
		'json///get/ok': 
			function(res,paths,status,data) { res.send(200,data); },
		'json///get/unauthorized': 
			function(res,paths,status,data) { res.send(401,"Unauthorized"); },
		'json///get/forbidden': 
			function(res,paths,status,data) { res.send(403,"Forbidden"); },
		'json///get/not_acceptable': 
			function(res,paths,status,data) { res.send(406,"Not Acceptable"); },
		'html/user/activate/patch/accepted': 
			function(res,paths,data) {
				data.redirect = '/user/'+data.userId;
				res.cookie('auth',data.auth);
				res.cookie('userId',data.userId);
				res.status(202)
					.render('user/created',data);
			},
		'html//session//ok': 
			function(res,paths,status,data) { res.render('user/register',data); },
		'html//session//validation_error': 
			function(res,paths,status,data) { res.render('user/register',data); },
		'html//session//created': 
			function(res,paths,data) {
				var collectionLocation = getTemplateBaseAfterCreation(paths);
				data.redirect = '/user/'+data.userId;
				res.cookie('auth',data.auth);
				res.cookie('userId',data.userId);
				res.status(201)
					.render(collectionLocation+'/created',data);
			},
		'html////created': 
			function(res,paths,status,data) { 
				res.status(201).render(getTemplateBaseAfterCreation(paths)+'/accepted',data);
			},
		'html////not_found': 
			function(res,paths,status,data) {
				res.status(404).render(getTemplateFromPaths(paths),data);
			},
		'html////unauthorized': 
			function(res,paths,status,data) {
				res.status(401).render(getTemplateFromPaths(paths),data);
			},
		'html////accepted': 
			function(res,paths,status,data) {
				res.status(202).render(getTemplateBaseAfterCreation(paths)+'/accepted',data);
			},
		'html////ok': 
			function(res,paths,status,data) {
				res.render(getTemplateFromPaths(paths),data);
			},
		'html////validation_error': 
			function(res,paths,status,data) {
				res.status(422).render(getTemplateFromPaths(paths),data);
			}
	});
	
	var Utils = require('./libs/dev.utils.js'),
		utils = new Utils({
			mongoskin_database: db
		});
		
	//utils.addIndexes(user.INDEXES);
	
	// Setup responses
	(function() {
		

		var getExpressRequestHandler = function(controllerName, actionName, controllerActionFunc, utils, responseSelector) {
			return function(req,res,next) {
				var responder = new Responder(req,res,next,controllerName,actionName,responseSelector);
				console.log(req);
				controllerActionFunc.call(
					this,
					req,
					res,
					utils,
					responder,
					next
				);
			};
		};
		
		var appRoutes = [ 
			{ method:'post', requestPath:'/register', controller:'user', action:'register', func:user.register.process },
			{ method:'get', requestPath:'/register', controller:'user', action:'register', func:user.register.get },
			{ method:'get', requestPath:'/', controller:'index', action:'index', func:routes.index, },
			{ method:'get', requestPath:'/user/:_id/activate/:activationPad', controller:'user', action:'activate', func:user.activate.get },
			{ method:'patch', requestPath:'/user/:_id/activate/:activationPad',controller:'user',action:'activate',func:user.activate.process },
			{ method:'get', requestPath:'/session', controller:'user', action:'login', func:user.login.get },
			{ method:'post', requestPath:'/session', controller:'user', action:'login', func:user.login.process },
			{ method:'get', requestPath:'/user/:_id', controller:'user', action:'get', func:user.get },
			{ method:'get', requestPath:'/sync', controller:'sync', action:'sync', func:sync.sync },
		];
		
		var i = 0,
		route = {};
		
		for (i=0;i<appRoutes.length;i++) {
			route = appRoutes[i];
			app[route.method].call(app,route.requestPath,getExpressRequestHandler(
				route.controller,
				route.action,
				route.func,
				utils,
				responseSelector
			));
		}
		
	})();

	app.get('/session', function(req,res,next) {
		user.login.get.call(this,req,res,utils,responder,next);
	});
	app.post('/session', function(req,res,next) {
		user.login.process.call(this,req,res,utils,responder,next);
	});
	
	app.get('/user/:_id', function(req,res,next) {
		user.show.call(this,req,res,utils,responder,next);
	});

	app.get('/user/:_id', function(req,res,next) {
		user.get.call(this,req,res,utils,responder,next);
	});
	
};

http.createServer(app).listen(app.get('port'), function(){
	console.log("LISTENING ON PORT " + app.get('port'));
});
