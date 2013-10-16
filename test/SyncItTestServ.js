/*jshint smarttabs:true */
(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(
            require('../node_modules/expect.js/expect.js'),
            require('../js/SyncItTestServ.js'),
            require('../js/ServerPersist/MemoryAsync.js'),
            require('../js/Constant.js')
        );
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(
            ['expect.js','syncIt/SyncItTestServer','syncit/ServerPersist/MemoryAsync','syncit/Constant'],
            factory
        );
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(
            root.expect,
            root.SyncItTestServ,
            root.SyncIt_ServerPersist_MemoryAsync,
            root.SyncIt_Constant
        );
    }
})(this, function (expect, SyncItTestServer, SyncIt_ServerPersist_MemoryAsync,SyncIt_Constant) {

var getModifierFromRequestHackFunc = function(req) {
	return req.body.m;
};

describe('When SyncItTestServ responds to a getDatasetNames request',function() {
    
    var syncItTestServer = new SyncItTestServer(
    	new SyncIt_ServerPersist_MemoryAsync(),
    	getModifierFromRequestHackFunc
    );
    
    it('should respond with an empty object, when it is',function(done) {
        syncItTestServer.getDatasetNames({},function(status,data) {
            expect(status).to.eql('ok');
            expect(data).to.eql({});
            done();
        });
    });
});

describe('When SyncItTestServ responds to a PATCH request',function() {
    
    var syncItTestServer = new SyncItTestServer(
    	new SyncIt_ServerPersist_MemoryAsync(),
    	getModifierFromRequestHackFunc
    );
    var emitCount = 0;
    var lastEmitQueueitem = null;
    var lastEmitJrec = null;
    syncItTestServer.listenForFed(function(dataset,datakey,queueitem,jrec) {
		expect(dataset).to.equal('xx');
		expect(datakey).to.equal('yy');
        emitCount = emitCount + 1;
        lastEmitJrec = jrec;
        lastEmitQueueitem = queueitem;
    });
    
    it('will respond with created when creating data',function(done) {
        var testCount = 0;
        var req = {
            body:{ s:'xx', k:'yy', b:0, m:'aa', r:false, t:new Date().getTime(), u:{b:'c'}, o:'set' }
        };
        var test = function(status,data) {
            expect(status).to.equal('created');
            syncItTestServer.getValue(
                {params:{s:'xx',k:'yy'}},
                
                function(err,jrec) {
                    expect(err).to.equal('ok');
                    expect(jrec.i).to.eql({b:'c'});
                    expect(jrec.m).to.equal('aa');
                    if (++testCount == 2) {
                        expect(emitCount).to.equal(1);
                        expect(lastEmitJrec.v).to.equal(1);
                        expect(lastEmitJrec.m).to.equal('aa');
                        expect(lastEmitQueueitem.u.b).to.equal('c');
                        expect(lastEmitQueueitem.b).to.equal(0);
                        expect(lastEmitQueueitem.m).to.equal('aa');
                        done();
                    }
                }
            );
        };
        syncItTestServer.PUT(req,  test );
        syncItTestServer.PUT(req,  test );
    });
    it('will respond with ok when updating data',function(done) {
        var testCount = 0;
        var req = {
            params:{s:'xx',k:'yy'},
            body:{ s:'xx', k:'yy', b:1, m:'aa', r:false, t:new Date().getTime(), u:{c:'d'}, o:'set' }
        };
        var test = function(status,data) {
            syncItTestServer.getValue(req,function(err,jrec) {
                expect(status).to.equal('ok');
                expect(jrec.m).to.equal('aa');
                expect(jrec.i).to.eql({c:'d'});
                if (++testCount == 2) {
                    done();
                }
            });
        };
        syncItTestServer.PUT(req,  test );
        syncItTestServer.PUT(req,  test );
    });
    it('will respond with out_of_date when trying to update with out of date patch',function(done) {
        var testCount = 0;
        var req = {
            body:{ s:'xx', k:'yy', b:1, m:'bb', r:false, t:new Date().getTime(), u:{c:'d'},o:'set' } // the time will be wrong
        };
        var test = function(status,data) {
            syncItTestServer.getValue({params:{s:'xx',k:'yy'}},function(err,jrec) {
                expect(status).to.equal('out_of_date');
                expect(jrec.m).to.equal('aa');
                expect(jrec.i).to.eql({c:'d'});
                if (++testCount == 2) {
                    done();
                }
            });
        };
        syncItTestServer.PUT(req,  test );
        syncItTestServer.PUT(req,  test );
    });
    it('will respond when deleting',function(done) {
        var testCount = 0;
        var req = {
            params:{s:'xx',k:'yy'},
            body:{ s:'xx', k:'yy', b:2, m:'aa', r:false, t:new Date().getTime(), u:{t:'t'}, o:'remove' } // the time will be wrong
        };
        var test = function(status,data) {
            expect(status).to.equal('ok');
            syncItTestServer.getValue(req,function(err,jrec) {
                expect(status).to.equal('ok');
                expect(jrec.m).to.equal('aa');
                expect(jrec.r).to.equal(true);
                expect(jrec.i).to.eql({c:'d'});
                if (++testCount == 2) {
                    done();
                }
            });
        };
        syncItTestServer.DELETE(req, test );
        syncItTestServer.DELETE(req, test );
    });
    it('will respond with gone, if already deleted',function(done) {
        var testCount = 0;
        var req = {
            params:{s:'xx',k:'yy'},
            body:{ s:'xx', k:'yy', b:3, m:'aa', r:false, t:new Date().getTime(), u:{t:'t'}, o:'set' } // the time will be wrong
        };
        var test = function(status,data) {
            expect(status).to.equal('gone');
            syncItTestServer.getValue(req,function(err) {
                expect(err).to.equal('gone');
                if (++testCount == 2) {
                    done();
                }
            });
        };
        syncItTestServer.PUT(req,  test );
        syncItTestServer.PUT(req,  test );
    });
    it('will respond with validation error if using the wrong method',function(done) {
        var testCount = 0;
        var req1 = {
            params:{s:'xx',k:'yy'},
            body:{ b:3, m:'aa', r:false, t:new Date().getTime(), u:{t:'t'}, o:'set' } // the time will be wrong
        };
        var req2 = {
            params:{s:'xx',k:'yy'},
            body:{ b:3, m:'aa', r:false, t:new Date().getTime(), u:{t:'t'}, o:'remove' } // the time will be wrong
        };
        var test = function(status,data) {
            expect(status).to.equal('validation_error');
            if (++testCount == 2) {
                done();
            }
        };
        syncItTestServer.DELETE(req1,  test );
        syncItTestServer.PUT(req2,  test );
    });
});

describe('SyncItTestServ can respond to data requests',function() {
    
    var syncItServ = new SyncItTestServer(
    	new SyncIt_ServerPersist_MemoryAsync(),
    	getModifierFromRequestHackFunc
    );
    
	var injectR = function(ob) {
		var r = JSON.parse(JSON.stringify(ob));
		r.r = false;
		return r;
	};
    
    it('when there is a point to go from',function(done) {
    	
    	var data1 = { body: {
				s: 'usersA',
				k: 'me',
				b: 0,
				m: 'me',
				t: new Date().getTime(),
				o: 'set',
				u: {name: "Jack Smith" }
		} };
		
		var data2 = { body: {
			s: 'usersA',
			k: 'me',
			b: 1,
			m: 'me',
			t: new Date().getTime(),
			o: 'update',
			u: {eyes: "Blue" }
		} };
    	
		syncItServ.PUT(data1, function(status, result) {
			expect(status).to.equal('created');
			syncItServ.PATCH(data2, function(status, result) {  
				expect(status).to.equal('ok');                
				syncItServ.getQueueitem(
					{ params: {s: 'usersA'}, query: { from: 'usersA.me@1' } },
					function(status, data) {
						expect(status).to.equal('ok');
						expect(data).to.eql({          
							queueitems: [ injectR(data2.body) ],
							to: "usersA.me@2"
						});
						done();
					}
				);
			});
		});
    });
    
    it('when there is no point to go from',function(done) {
    	
    	var data1 = { body: {
				s: 'usersB',
				k: 'me',
				b: 0,
				m: 'me',
				t: new Date().getTime(),
				o: 'set',
				u: {name: "Jack Smith" }
		} };
		
		var data2 = { body: {
			s: 'usersB',
			k: 'me',
			b: 1,
			m: 'me',
			t: new Date().getTime(),
			o: 'update',
			u: {eyes: "Blue" }
		} };
    	
		syncItServ.PUT(data1, function(status, result) {
			expect(status).to.equal('created');
			syncItServ.PATCH(data2, function(status, result) {  
				expect(status).to.equal('ok');                
				syncItServ.getQueueitem(
					{ params: {s: 'usersB'} },
					function(status, data) {
						expect(status).to.equal('ok');
						expect(data).to.eql({          
							queueitems: [
								injectR(data1.body),
								injectR(data2.body)
							],
							to: "usersB.me@2"
						});
						done();
					}
				);
			});
		});
		
    });
    
    
});



});
