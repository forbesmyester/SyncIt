var manip = require('../js/manip.js'),
	expect = require('expect.js');


(function() {

"use strict";

describe('manip',function() {
	it('can manipulate',function() {
		
		var i = 0;
		var ob = {hi:'there'};
		var steps = [
			{cmd:{'$set':{'car.color':'red'}},expected:{hi:'there',car:{color:'red'}}},
			{cmd:{'$unset':{'car':1}},expected:{hi:'there'}},
			{cmd:{'$set':{'car.wheels':3}},expected:{hi:'there',car:{wheels:3}}},
			{cmd:{'$inc':{'car.wheels':1},'$set':{z:1}},expected:{hi:'there',car:{wheels:4},z:1}},
			{cmd:{'$push':{'car.drivers':['fred','faye']}},expected:{hi:'there',car:{wheels:4,drivers:['fred','faye']},z:1}},
			{cmd:{'$push':{'car.drivers':['james']}},expected:{hi:'there',car:{wheels:4,drivers:['fred','faye','james']},z:1}}
		];
		for (i=0;i<steps.length;i++) {
			ob = manip(ob,steps[i].cmd);
			expect(ob).to.eql(steps[i].expected);
		}

	});
});

}());
