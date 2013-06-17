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
			expect(ed.decode(ed.encode(d))).to.equal(d);
		}
		var nd = new Date(1980,2,15).getTime();
		expect(ed.decode(ed.encode(nd))).to.equal(nd);
	});
	var clip1If1L = function(str,l) {
		if (l == 1) {
			return str.substr(0,str.length-1);
		}
		return str;
	}
	it('can decode dates which are not X padded',function() {
		for (var ulen=1; ulen<=2; ulen++) {
			var ed = getTLIdEncoderDecoder(new Date(1970,5,5).getTime(),ulen);
			var c = 'X9vvvvvav';
			var d = 'a000003d';
			expect(
				ed.decode(clip1If1L(d,ulen))
			).to.equal(ed.decode(clip1If1L(c,ulen))+1);
			var x = [d,c];
			x.sort(ed.sort);
			expect(x[0].substr(0,1)).to.equal('X');
		}
	});
	it('can decode dates of different lengths',function() {
		for (var ulen=1; ulen<=2; ulen++) {
			var ed = getTLIdEncoderDecoder(new Date(1970,5,5).getTime(),ulen);
			var c = 'vvvvav';
			var d = 'X100003d';
			expect(
				ed.decode(clip1If1L(d,ulen))
			).to.equal(ed.decode(clip1If1L(c,ulen))+1);
		}
	});
	it('can sort',function() {
		var encoderDecoder = getTLIdEncoderDecoder(new Date(1970,5,5).getTime(),2);
		var dates = [
			encoderDecoder.encode(),
			encoderDecoder.encode(new Date(1980,1,6).getTime()),
			encoderDecoder.encode(new Date(1981,3,15).getTime()),
			encoderDecoder.encode(new Date(1986,8,9).getTime()),
			encoderDecoder.encode(new Date(1983,10,3).getTime()),
			encoderDecoder.encode(new Date(1982,0,6).getTime())
		];
		var newDates = (dates.sort(encoderDecoder.sort));
		for (var i=1;i<newDates.length;i++) {
			expect(
				encoderDecoder.decode(newDates[i-1]) < encoderDecoder.decode(newDates[i])
			).to.equal(true);
		}
	});
});

});
