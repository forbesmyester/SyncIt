/*jshint smarttabs:true */
(function (root, factory) {
	if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		module.exports = factory(
			require('../../node_modules/expect.js/expect.js'),
			require('../../js/Constant.js'),
			require('../../js/FakeLocalStorage.js'),
			require('../../js/AsyncLocalStorage.js'),
			require('../../js/getTLIdEncoderDecoder.js'),
			require('../../js/Path/AsyncLocalStorage.js')
		);
	} else if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(
			[
				'expect.js',
				'syncit/Constant',
				'syncit/FakeLocalStorage.js',
				'syncit/AsyncLocalStorage.js',
				'syncit/getTLIdEncoderDecoder',
				'syncit/AsyncLocalStorage.js',
			],
			factory
		);
	} else {
		// Browser globals (root is window)
		root.returnExports = factory(
			root.expect,
			root.SyncIt_Constant,
			root.SyncIt_FakeLocalStorage,
			root.SyncIt_AsyncLocalStorage,
			root.SyncIt_getTLIdEncoderDecoder,
			root.SyncIt_Path_AsyncLocalStorage
		);
	}
})(this, function (
	expect,
	SyncIt_Constant,
	SyncIt_FakeLocalStorage,
	AsyncLocalStorage,
	SyncIt_getTLIdEncoderDecoder,
	SyncIt_Path_AsyncLocalStorage
) {
// =============================================================================

var ASYNCHRONOUS_DELAY=20;
var USE_REAL_ENCODER_DECODER=false;

var draw = function(paths) {

	if (typeof Viz == 'undefined') {
		return;
	}

	var pathGraph = [],
		nodeGraph = [],
		i = 0,
		l = 0;
	
	var toIdentifier = function(src) {
		return src.replace(/[^0-9a-zA-Z]/g,'_');
	};

	var toNode = function(src) {
		return toIdentifier(src) + '[label="'+src+'"]' + ';';
	};
	
	for (i=0, l=paths.length; i<l; i++) {
		nodeGraph = nodeGraph + toNode(paths[i].from);
		if (paths[i].to) {
			nodeGraph = nodeGraph + toNode(paths[i].to);
			pathGraph = pathGraph + 
				toIdentifier(paths[i].from) + 
				' -> ' +
				toIdentifier(paths[i].to) +
				(paths[i].hasOwnProperty('via') ? '[label="'+paths[i].via+'"]' : '') +
				';';
		}
	}

	var str = 'digraph { rankdir="LR"; node [shape=record]; a [label="'+
		'{ a | { aa| bb | cc | dd} | {{a|b} | aaa2 } }| b }'+
		'"]; a -> b; }';
	
	str = 'digraph { rankdir="LR"; % }';
	str = str.replace('%',nodeGraph+' %');
	str = str.replace('%',pathGraph+' ');

	var svg = Viz(str, "svg");
	
	$('#graph').html($(svg));
};


var EncoderDecoder = function() {
	this.index = 0;
};

EncoderDecoder.prototype.encode = function() {
	return '_'+(this.index++);
};

if (USE_REAL_ENCODER_DECODER) {
	EncoderDecoder = SyncIt_getTLIdEncoderDecoder;
}

var getPaths = function(localStorage,namespace) {
	var r = [],
		path = null;
	
	var extract = function(key,item,via) {
		var ob = {
			from: key,
			to: item.hasOwnProperty('_n') ? item._n : null
		};
		if ((via !== null) && ob.to) {
			ob.via = via;
		}
		return ob;
	};

	for (var i=0;i<localStorage.length;i++) {
		if (
			(localStorage.key(i).length > namespace.length) &&
			(localStorage.key(i).substr(0,namespace.length+1) == namespace+'.')
		){
			var ik = '';
			var k = localStorage.key(i);
			var item = JSON.parse(localStorage.getItem(k));
			path = null;
			var ref = localStorage.key(i).substr(namespace.length+1);
			if (k.split('.').length == 3) {
				for (ik in item) {
					if (item.hasOwnProperty(ik) && ik.match(/^[a-z]$/)) {
						r.push(extract(ref+'.'+ik,item[ik],ik));
					}
				}
			} else {
				r.push(extract(ref,item,null));
			}
		}
	}
	return r.sort(function(a,b) {
		return a.to - b.to;
	});
};

var visualizeData = function(pathStore,localStorage) {
	var redraw = function() {
		draw(getPaths(localStorage,'aa','p'));
	};
	var events = ['set-item','remove-item','advance','push','change-path'];
	for (var i=0;i<events.length;i++) {
		pathStore.on(events[i],redraw);
	}
};

describe('SyncIt_Path_AsyncLocalStorage',function() {
	
	it('can add roots, push and advance',function(done) {
		var localStorage = new SyncIt_FakeLocalStorage();
		var asyncLocalStorage = new AsyncLocalStorage(
			localStorage,
			JSON.stringify,
			JSON.parse,
			ASYNCHRONOUS_DELAY
		);
		var pathStore = new SyncIt_Path_AsyncLocalStorage(
			asyncLocalStorage,
			new EncoderDecoder(new Date(1980,1,1).getTime()),
			'aa'
		);
		visualizeData(pathStore,localStorage);
		pathStore.push('cars','subaru','p',{a:'b'},function(err) {
			expect(getPaths(localStorage,'aa','p')).to.eql([{from:'cars.subaru.p',to:null}]);
			pathStore.push('cars','subaru','p',{c:'d'},function(err) {
				expect(
					getPaths(localStorage,'aa','p')
				).to.eql([
					{from:'cars.subaru.p',to:'_0',via:'p'},
					{from:'_0',to:null},
				]);
				pathStore.push('cars','subaru','p',{c:'d'},function(err) {
					expect(
						getPaths(localStorage,'aa','p')
					).to.eql([
						{from:'cars.subaru.p',to:'_0',via:'p'},
						{from:'_0',to:'_1'},
						{from:'_1',to:null},
					]);
					pathStore.advance('cars','subaru','p',true,function(err) {
						draw(getPaths(localStorage,'aa','p'));
						expect(err).to.eql(SyncIt_Constant.Error.OK);
						expect(
							getPaths(localStorage,'aa','p')
						).to.eql([
							{from:'cars.subaru.p',to:'_1',via:'p'},
							{from:'_0',to:'_1'},
							{from:'_1',to:null},
						]);
						pathStore.on('remove-item',function() {
							draw(getPaths(localStorage,'aa','p'));
							expect(err).to.eql(SyncIt_Constant.Error.OK);
							expect(
								getPaths(localStorage,'aa','p')
							).to.eql([
								{from:'cars.subaru.p',to:'_1',via:'p'},
								{from:'_1',to:null},
							]);
							done();
						});
					});
				});
			});
		});
	});
	
	it('can switch path',function(done) {
		var localStorage = new SyncIt_FakeLocalStorage();
		var asyncLocalStorage = new AsyncLocalStorage(
			localStorage,
			JSON.stringify,
			JSON.parse,
			ASYNCHRONOUS_DELAY
		);
		var pathStore = new SyncIt_Path_AsyncLocalStorage(
			asyncLocalStorage,
			new EncoderDecoder(new Date(1980,1,1).getTime()),
			'aa'
		);
		visualizeData(pathStore,localStorage);
		pathStore.push('cars','subaru','p',{a:'b'},function(err) {
			expect(getPaths(localStorage,'aa','p')).to.eql([{from:'cars.subaru.p',to:null}]);
			pathStore.push('cars','subaru','p',{c:'d'},function(err) {
				expect(
					getPaths(localStorage,'aa','p')
				).to.eql([
					{from:'cars.subaru.p',to:'_0',via:'p'},
					{from:'_0',to:null},
				]);
				pathStore.push('cars','subaru','c',{e:'f'},function(err) {
					expect(
						getPaths(localStorage,'aa','p')
					).to.eql([
						{from:'cars.subaru.p',to:'_0',via:'p'},
						{from:'cars.subaru.c',to:null},
						{from:'_0',to:null}
					]);
					pathStore.push('cars','subaru','c',{e:'f'},function(err) {
						expect(
							getPaths(localStorage,'aa','p')
						).to.eql([
							{from:'cars.subaru.p',to:'_0',via:'p'},
							{from:'cars.subaru.c',to:'_1',via:'c'},
							{from:'_0',to:null},
							{from:'_1',to:null}
						]);
						pathStore.changePath('cars','subaru','c','p',true,function(err) {
							expect(err).to.equal(SyncIt_Constant.Error.OK);
							expect(
								getPaths(localStorage,'aa','p')
							).to.eql([
								{from:'cars.subaru.p',to:'_1',via:'p'},
								{from:'_0',to:null},
								{from:'_1',to:null}
							]);
							pathStore.on('remove-item',function() {
								draw(getPaths(localStorage,'aa','p'));
								expect(err).to.eql(SyncIt_Constant.Error.OK);
								expect(
									getPaths(localStorage,'aa','p')
								).to.eql([
									{from:'cars.subaru.p',to:'_1',via:'p'},
									{from:'_1',to:null},
								]);
								done();
							});
						});
					});
				});
			});
		});
	});
	

	it('can clean',function(done) {
		var localStorage = new SyncIt_FakeLocalStorage();
		var asyncLocalStorage = new AsyncLocalStorage(
			localStorage,
			JSON.stringify,
			JSON.parse,
			ASYNCHRONOUS_DELAY
		);
		var pathStore = new SyncIt_Path_AsyncLocalStorage(
			asyncLocalStorage,
			new EncoderDecoder(new Date(1980,1,1).getTime()),
			'aa'
		);
		visualizeData(pathStore,localStorage);
		pathStore.push('cars','subaru','p',{a:'b'},function(err) {
			expect(getPaths(localStorage,'aa','p')).to.eql([{from:'cars.subaru.p',to:null}]);
			pathStore.push('cars','subaru','p',{c:'d'},function(err) {
				expect(
					getPaths(localStorage,'aa','p')
				).to.eql([
					{from:'cars.subaru.p',to:'_0',via:'p'},
					{from:'_0',to:null},
				]);
				pathStore.push('cars','subaru','c',{e:'f'},function(err) {
					expect(
						getPaths(localStorage,'aa','p')
					).to.eql([
						{from:'cars.subaru.p',to:'_0',via:'p'},
						{from:'cars.subaru.c',to:null},
						{from:'_0',to:null}
					]);
					pathStore.push('cars','subaru','c',{e:'f'},function(err) {
						expect(
							getPaths(localStorage,'aa','p')
						).to.eql([
							{from:'cars.subaru.p',to:'_0',via:'p'},
							{from:'cars.subaru.c',to:'_1',via:'c'},
							{from:'_0',to:null},
							{from:'_1',to:null}
						]);
						pathStore.changePath('cars','subaru','c','p',false,function(err) {
							expect(err).to.equal(SyncIt_Constant.Error.OK);
							expect(
								getPaths(localStorage,'aa','p')
							).to.eql([
								{from:'cars.subaru.p',to:'_1',via:'p'},
								{from:'_0',to:null},
								{from:'_1',to:null}
							]);
							pathStore.push('bikes','harley','p',{t:1},function(err) {
								expect(err).to.equal(SyncIt_Constant.Error.OK);
								pathStore.push('bikes','harley','p',{t:1},function(err) {
									expect(err).to.equal(SyncIt_Constant.Error.OK);
									expect(
										getPaths(localStorage,'aa','p')
									).to.eql([
										{from:'cars.subaru.p',to:'_1',via:'p'},
										{from:'_0',to:null},
										{from:'_1',to:null},
										{from:'bikes.harley.p',to:'_2',via:'p'},
										{from:'_2',to:null}
									]);
									pathStore.push('bikes','kawasaki','p',{s:1},function(err) {
										expect(
											getPaths(localStorage,'aa','p')
										).to.eql([
											{from:'cars.subaru.p',to:'_1',via:'p'},
											{from:'_0',to:null},
											{from:'_1',to:null},
											{from:'bikes.harley.p',to:'_2',via:'p'},
											{from:'_2',to:null},
											{from:'bikes.kawasaki.p',to:null}
										]);
										pathStore.clean(function(err) {
											expect(err).to.equal(SyncIt_Constant.Error.OK);
											expect(
												getPaths(localStorage,'aa','p')
											).to.eql([
												{from:'cars.subaru.p',to:'_1',via:'p'},
												{from:'_1',to:null},
												{from:'bikes.harley.p',to:'_2',via:'p'},
												{from:'_2',to:null},
												{from:'bikes.kawasaki.p',to:null}
											]);
											done();
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
	

});



});
