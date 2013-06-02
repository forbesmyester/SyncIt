var manip = require('../js/manip.js'),
	expect = require('expect.js');


// describe('_cloneObj',function() {
//     var source = {color: 'blue', size: 'large'},
//         syncIt = new SyncIt();
//     it('should be able to clone',function() {
//         expect(syncIt._cloneObj(source).color).to.equal(source.color);
//     });

describe('manip',function() {
	it('can manipulate',function() {
		
		var xmanip = manip.create();
		var i = 0;
		var ob = {hi:'there'};
		var steps = [
			{cmd:{'$set':{'car.color':'red'}},expected:{hi:'there',car:{color:'red'}}},
			{cmd:{'$unset':{'car':1}},expected:{hi:'there'}},
			{cmd:{'$set':{'car.wheels':3}},expected:{hi:'there',car:{wheels:3}}},
			{cmd:{'$inc':{'car.wheels':1},'$set':{z:1}},expected:{hi:'there',car:{wheels:4},z:1}}
		];
		for (i=0;i<steps.length;i++) {
			ob = xmanip(ob,steps[i].cmd);
			expect(ob).to.eql(steps[i].expected);
		}

	});
});
