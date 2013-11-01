/*jshint smarttabs:true */
(function (root, factory) {

	"use strict";

	if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		module.exports = factory(
			require('../node_modules/expect.js/expect.js'),
			require('../js/TransitionState.js')
		);
	} else if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(
			[
				'expect.js',
				'syncit/TransitionState'
			],
			factory
		);
	} else {
		// Browser globals (root is window)
		root.returnExports = factory(
			root.expect,
			root.SyncIt_TransitionState
		);
	}
}(this, function (
	expect,
	TransitionState
) {
// =============================================================================

"use strict";

describe('TransitionState constructor',function() {
	it('should check everything is valid before starting', function() {
		var ts = new TransitionState('ANALYZE');
		ts.addState('ANALYZE', ['DATA_PARTIAL_OFFLINE', 'DATA_FULL_OFFLINE']);
		expect(function() { ts.start(); }).to.throwError(function(e) {
			expect(e.message).to.match(/TransitionState/);
		})
	});
	it('transitions to the initial state', function() {
		var ts = new TransitionState('ANALYZE');
		var evented = false;
		ts.addState('ANALYZE', ['DATA_PARTIAL_OFFLINE', 'DATA_FULL_OFFLINE']);
		ts.addState('DATA_PARTIAL_OFFLINE', ['ANALYZE']);
		ts.addState('DATA_FULL_OFFLINE', ['ANALYZE']);
		ts.on('initial-state',function(newState) {
			evented = true;
			expect(newState).to.equal('ANALYZE');
		});
		ts.start();
		expect(evented).to.equal(true);
		expect(ts.current()).to.equal('ANALYZE');
	});
});
describe('TransitionState',function() {
	it('can transition states from instance func', function() {
		var ts = new TransitionState('ANALYZE');
		var evented = 0;
		ts.addState('ANALYZE', ['DATA_PARTIAL_OFFLINE', 'DATA_FULL_OFFLINE']);
		ts.addState('DATA_PARTIAL_OFFLINE', ['ANALYZE']);
		ts.addState('DATA_FULL_OFFLINE', ['ANALYZE']);
		ts.on('initial-state',function(newState) {
			evented++;
			expect(newState).to.equal('ANALYZE');
		});
		ts.start();
		expect(evented).to.equal(1);
		expect(ts.current()).to.equal('ANALYZE');
		ts.on('changed-state',function(oldState, newState) {
			evented++;
			expect(oldState).to.equal('ANALYZE');
			expect(newState).to.equal('DATA_FULL_OFFLINE');
		});
		ts.change('DATA_FULL_OFFLINE');
		expect(evented).to.equal(2);
	});
	it('can transition states', function() {
		var ts = new TransitionState('ANALYZE');
		var evented = false;
		ts.addState('ANALYZE', ['DATA_PARTIAL_OFFLINE', 'DATA_FULL_OFFLINE']);
		ts.addState('DATA_PARTIAL_OFFLINE', ['ANALYZE']);
		ts.addState('DATA_FULL_OFFLINE', ['ANALYZE']);
		ts.on('initial-state',function(newState, changeState) {
			evented = true;
			expect(newState).to.equal('ANALYZE');
			ts.change('DATA_PARTIAL_OFFLINE');
		});
		ts.start();
		expect(evented).to.equal(true);
		expect(ts.current()).to.equal('DATA_PARTIAL_OFFLINE');
	});
	it('bad transitions to errors', function() {
		var ts = new TransitionState('ANALYZE');
		var evented = false;
		ts.addState('ANALYZE', ['DATA_PARTIAL_OFFLINE', 'DATA_FULL_OFFLINE']);
		ts.addState('DATA_PARTIAL_OFFLINE', ['ANALYZE']);
		ts.addState('DATA_FULL_OFFLINE', ['ANALYZE']);
		ts.on('initial-state',function(newState) {
			evented = true;
			expect(newState).to.equal('ANALYZE');
			expect(
				function() { ts.change('BAD_STATE') }
			).to.throwError(function(e) {
				expect(e.message).to.match(/TransitionState/);
			});
		});
		ts.start();
		expect(evented).to.equal(true);
		expect(ts.current()).to.equal('ANALYZE');
	});
});

}));
