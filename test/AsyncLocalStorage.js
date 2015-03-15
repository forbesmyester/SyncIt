(function() {

"use strict";

var AsyncLocalStorage = require('../AsyncLocalStorage.js');
var FakeLocalStorage = require('../FakeLocalStorage.js');
var LocalForage = require('../LocalForage.js');
var expect = require('expect.js');

var getMainInstance = function() {
	if (false) { // Flip this to true to test LocalForage backed store (which must be ran in the browser).
		var localForage = require('localforage');
		localForage.clear();
		return new LocalForage(
			localForage,
			'aa',
			JSON.stringify,
			JSON.parse
		);
	}
	var localStorage = new FakeLocalStorage();
	localStorage.clear();
	return new AsyncLocalStorage(
		localStorage,
		'aa',
		JSON.stringify,
		JSON.parse
	);
};

describe('AsyncLocalStorage',function() {
	
	it('can set an item, get an item then remove it',function(done) {

		var asyncLocalStorage = getMainInstance();

		var performGet = function(then) {
			asyncLocalStorage.getItem('car.bmw', then);
		};

		var checkGet = function(then, value) {
			expect(value).to.eql({drive: 'rear'});
			then();
		};

		var performRemove = function(then) {
			asyncLocalStorage.removeItem('car.bmw', then);
		};

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

		asyncLocalStorage.setItem('car.bmw', {drive: 'rear'}, performGet);
	});

	it('can find keys', function(done) {

		var asyncLocalStorage = getMainInstance();

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

		var checkGetLength = function(then, value) {
			expect(value).to.equal(4);
			then();
		};

		var performGetLength = function(then) {
			asyncLocalStorage.getLength(then);
		};

		var checkKey = function(then, value) {
			var valid = ['car.bobby', 'person.jack', 'car.bmw', 'person.bobby'];
			expect(valid.indexOf(value)).to.be.greaterThan(-1);
			then();
		};

		var performKey = function(then) {
			asyncLocalStorage.key(0, then);
		};



		checkGetLength = checkGetLength.bind(this, done);
		performGetLength = performGetLength.bind(this, checkGetLength);
		checkKey = checkKey.bind(this, performGetLength);
		performKey = performKey.bind(this, checkKey);
		checkListBobby = checkListBobby.bind(this, performKey);
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
