(function() {

"use strict";

var AsyncLocalStorage = require('../AsyncLocalStorage.js');
var FakeLocalStorage = require('../FakeLocalStorage.js');
var expect = require('expect.js');

describe('AsyncLocalStorage',function() {
	
	it('can set an item, get an item then remove it',function(done) {
		var localStorage = new FakeLocalStorage();
		var asyncLocalStorage = new AsyncLocalStorage(
			localStorage,
			'aa',
			JSON.stringify,
			JSON.parse
		);

		var checkSet = function(then) {
			then();
		};

		var performGet = function(then) { asyncLocalStorage.getItem('car.bmw', then); };

		var checkGet = function(then, value) {
			expect(value).to.eql({drive: 'rear'});
			then();
		};

		var performRemove = function(then) { asyncLocalStorage.removeItem('car.bmw', then); };

		var performRemovalCheck = function(then) {
			asyncLocalStorage.getItem('car.bmw', then);
		};

		var checkRemoved = function(then, value) {
			expect(value).to.equal(null);
			then();
		};

		checkRemoved = checkRemoved.bind(this, done);
		performRemovalCheck = performRemovalCheck.bind(this, checkRemoved);
		performRemove = performRemove.bind(this, performRemovalCheck);
		checkGet = checkGet.bind(this, performRemove);
		performGet = performGet.bind(this, checkGet);
		checkSet = checkSet.bind(this, performGet);

		asyncLocalStorage.setItem('car.bmw', {drive: 'rear'}, checkSet);
	});

	it('can find keys', function(done) {
		var localStorage = new FakeLocalStorage();
		var asyncLocalStorage = new AsyncLocalStorage(
			localStorage,
			'aa',
			JSON.stringify,
			JSON.parse
		);

		var setItem = function(key, value, then) {
			asyncLocalStorage.setItem(key, value, then);
		};

		var performListPeople = function(then) {
			asyncLocalStorage.findKeys('person.*', then);
		};

		var checkListPeople = function(then, value) {
			expect(value.sort()).to.eql(['person.bobby', 'person.jack']);
			then();
		};

		var performListBobby = function(then) {
			asyncLocalStorage.findKeys('*.bobby', then);
		};

		var checkListBobby = function(then, value) {
			expect(value.sort()).to.eql(['car.bobby', 'person.bobby']);
			then();
		};

		checkListBobby = checkListBobby.bind(this, done);
		performListBobby = performListBobby.bind(this, checkListBobby);
		checkListPeople = checkListPeople.bind(this, performListBobby);
		performListPeople = performListPeople.bind(this, checkListPeople);

		var setItemD = setItem.bind(this, 'car.bobby', {drive: 'front', seats: 5}, performListPeople);
		var setItemC = setItem.bind(this, 'person.jack', {hair: 'brown'}, setItemD);
		var setItemB = setItem.bind(this, 'car.bmw', {drive: 'rear'}, setItemC);
		var setItemA = setItem.bind(this, 'person.bobby', {hair: 'blonde'}, setItemB);

		setItemA();
	});

});

}());
