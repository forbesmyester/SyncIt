/*jshint smarttabs:true */
(function (
	expect,
	updateResult
) {
// =============================================================================

"use strict";

var _cloneObj = function(ob) {
	return JSON.parse(JSON.stringify(ob));
};

describe('updateResult op="set"',function() {
	it(
		'should overwrite all data and increment the version, update the modifier and perform an undelete',
		function() {
			var queueitem = {
				u:{color:'blue',size:'bigger'},
				m:'bob',
				b:3,
				o:'set'
			};
			var original = {
				i:{
					color:'blue',
					size:'large'
				},
				v:3,
				r:true,
				m:'aa'
			};
			var r = updateResult(original, queueitem, _cloneObj);
			delete r.t;
			expect(r).to.eql({i:{color:'blue',size:'bigger'},v:4,r:false,m:'bob'}); 
		}
	);
});

describe('updateResult op="update"',function() {
	it('should be able to $set a subfield',function() {
		var queueitem = {
			u:{$set:{color:'red'}},
			m:'bob',
			b:3,
			o:'update'
		};
		var original = {
			i:{
				color:'blue',
				size:'large'
			},
			v:3,
			r:true,
			m:'aa'
		};
		var r = updateResult(original, queueitem, _cloneObj);
		delete r.t;
		expect(r).to.eql({i:{color:'red',size:'large'},v:4,r:false,m:'bob'}); 
	});
});

describe('updateResult op="remove"',function() {
	it('be able to remove an existing field',function() {
		var update = {m:'james',b:3,o:'remove',u:{x:'x'}},
			original = {i:{color:'blue',size:'large'},v:3,r:false},
			r = updateResult(original, update, _cloneObj);
			delete r.t;
		expect(
			r
		).to.eql({i:{color:'blue',size:'large'},r:true,v:4,m:'james'});
	});
});

}(
	require('expect.js'),
	require('../updateResult.js')
));
