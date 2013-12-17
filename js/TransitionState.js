(function (root, factory) { // UMD from https://github.com/umdjs/umd/blob/master/returnExports.js
	"use strict";
	if (typeof exports === 'object') {
		module.exports = factory(require('./addEvents.js'));
	} else if (typeof define === 'function' && define.amd) {
		define(['syncit/addEvents'],factory);
	} else {
		root.SyncIt_TransitionState = factory(root.SyncIt_addEvents);
	}
}(this, function (addEvents) {

"use strict";

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style


var TransitionState = function(initialState) {
	this._states = {};
	this._state = null;
	this._initialState = initialState;
};

TransitionState.prototype.addState = function(stateName, validNextStates) {
	this._states[stateName] = validNextStates;
};

TransitionState.prototype.current = function() {
	return this._state;
};

TransitionState.prototype.change = function(newState) {
	var oldState = this._state;
	if (!this._states.hasOwnProperty(newState)) {
		throw new Error("TransitionState: Attempting to transition from " +
			"state '" + this._state + "' to state '" + newState +
			"' but state '" + newState + "' does not exist.");
	}
	if (this._states[oldState].indexOf(newState) == -1) {
		throw new Error("TransitionState: Attempting to transition to " +
			"state '" + newState + "' from state '" + this._state +
			"' but that is not a valid transition");
	}
	this._state = newState;
	this._emit('changed-state', oldState, newState);
};

TransitionState.prototype.start = function() {
	var i, l, k, nextStates;
	
	for (k in this._states) {
		if (this._states.hasOwnProperty(k)) {
			nextStates = this._states[k];
			for (i=0, l=nextStates.length; i<l; i++) {
				if (!this._states.hasOwnProperty(nextStates[i])) {
					throw new Error("TransitionState: There is a transition " +
						"from state '" + k + "' to state '" + nextStates[i] +
						"' but state '" + nextStates[i] + "' does not exist.");
				}
			}
		}
	}
	
	this._state = this._initialState;
	this._emit('initial-state', this._initialState);
};

addEvents(TransitionState, ['changed-state', 'initial-state']);

return TransitionState;

}));
