var RegExpRoute = require('../public/js/RegExpRoute.js'),
	expect = require('expect.js'),
	sinon = require('sinon');


describe('RegExpRoute says...',function() {
	// For most of the functionality here, see ResponseSelector
	var regExpRoute = new RegExpRoute();
	it('will return Ok with no routes',function() {
		expect(regExpRoute.route('a','/a/b/c')).to.equal(null);
	});
	it('will return a matched route',function() {
		regExpRoute.add('get','/user/:user_id/picture/:picture_id');
		expect(
			regExpRoute.route('get','/user/a4v/picture/3')
		).to.eql({
			route: '/user/:user_id/picture/:picture_id',
			params: {
				user_id:'a4v',
				picture_id:'3'
			}
		});
	});
	it('will exclude route if method is wrong',function() {
		expect(
			regExpRoute.route('post','/user/a4v/picture/3')
		).to.eql(null);
	});
	it('will return null if no route matched',function() {
		expect(
			regExpRoute.route('/user/a4v/friend/3')
		).to.eql(null);
	});
});
