/*jshint smarttabs:true */
(function (root, factory) {
	if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		module.exports = factory(
			require('../node_modules/expect.js/expect.js'),
			require('../js/getTLIdEncoderDecoder.js')
		);
	} else if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(
			[
				'expect.js',
				'syncit/getTLIdEncoderDecoder'
			],
			factory
		);
	} else {
		// Browser globals (root is window)
		root.returnExports = factory(
			root.expect,
			root.SyncIt_getTLIdEncoderDecoder
		);
	}
})(this, function (
	expect,
	getTLIdEncoderDecoder
) {

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

describe('getTLIdEncoderDecoder',function() {
	it('can encode timestamp and then decode',function() {
		var ed = getTLIdEncoderDecoder(new Date(1970,5,5).getTime());
		for (var i=0;i<100;i++) {
			var d = new Date().getTime();
			expect(ed.decoder(ed.encoder(d))).to.equal(d);
		}
		var nd = new Date(1980,2,15).getTime();
		expect(ed.decoder(ed.encoder(nd))).to.equal(nd);
	});
});

});
