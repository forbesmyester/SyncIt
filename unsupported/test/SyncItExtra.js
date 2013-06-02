/*jshint smarttabs:true */
(function (root, factory) {
    if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory(
            require('../node_modules/expect.js/expect.js'),
            require('../js/SyncIt.js'),
            require('../js/SyncItExtra.js')
        );
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['expect.js','syncit/SyncIt','syncIt/SyncItExtra'], factory);
    } else {
        // Browser globals (root is window)
        root.returnExports = factory(expect,SyncItLib,SyncItExtra);
    }
})(this, function (expect,SyncItLib,SyncItExtra) {

// =============================================================================

var SyncIt = SyncItLib.SyncIt;
var Queue = SyncItLib.Queue;
var Store = SyncItLib.Store;
var getUpdateResult = SyncItLib.getUpdateResult;
var SyncItError = SyncItLib.SyncItError;
var Persist = SyncItLib.Persist;

describe('SyncItAutoApply',function() {
    it('will apply things automatically',function(done) {
        var queue = new Queue(new Persist());
        var store = new Store(new Persist());
        var syncIt = new SyncIt(store,queue,'aa');
        var syncItAutoApply = new SyncItExtra.SyncItAutoApply(syncIt);
        
        var callbackNumber = 0;
        var eventsDone = [];
        
        var writeCheck = function(err,dataset,datakey,queueitem) {
            expect(err).to.equal(SyncItLib.SyncItError.OK);
            expect(queueitem.basedonversion).to.equal(callbackNumber++);
        };
        
        syncItAutoApply.listenForApplied(function(queueitem,jrec) {
            if (queueitem.operation == 'remove') {
                expect(jrec.info.speed).to.equal('fast4');
                eventsDone.sort();
                expect(eventsDone).to.eql([1,2,3,4]);
                return done();
            }
            expect(jrec.info.speed).to.equal('fast'+(queueitem.basedonversion+1));
            expect(jrec.info.speed.slice(4)).to.equal(''+jrec.version);
            eventsDone.push(jrec.version);
        });

        
        syncItAutoApply.set('car','ferrari',{typ:'sports',speed:'fast1'},writeCheck);
        syncItAutoApply.set('car','ferrari',{typ:'sports',speed:'fast2'},writeCheck);
        syncItAutoApply.set('car','ferrari',{typ:'sports',speed:'fast3'},writeCheck);
        syncItAutoApply.set('car','ferrari',{typ:'sports',speed:'fast4'},writeCheck);
        syncItAutoApply.remove('car','ferrari',function(err,dataset,datakey,queueitem) {
            expect(err).to.equal(SyncItLib.SyncItError.OK);
            expect(queueitem.basedonversion).to.equal(callbackNumber++);
            expect(queueitem.operation).to.equal('remove');
        });
    });
});

// =============================================================================

});