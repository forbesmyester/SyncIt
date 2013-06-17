/*jshint smarttabs:true */
(function (root, factory) {
	if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([],factory);
	} else {
		// Browser globals (root is window)
		root.SyncIt_getTLIdEncoderDecoder = factory();
	}
})(this, function () {

// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

return function(epoch,uniqueLength) {
  
  var lastDate = null;
  var index = -1;
  if (uniqueLength == undefined) {
	uniqueLength = 1;
  }

  if (typeof epoch != 'number') {
    throw "Only takes timestamps";
  }
  
  var genUid = function(now) {
    
    if (now === undefined) {
      now = new Date().getTime();
    }
	if (typeof now == 'object') {
      throw "Only takes timestamps";
	}
    
    if ((lastDate === null) || (now !== lastDate)) {
      index = -1;
    }

	var superUnique = (++index).toString(32);
	if (superUnique.length < uniqueLength) {
		superUnique = '0' + superUnique;
	}
	var timeEncoded = (now - epoch).toString(32);

	if (superUnique.length > uniqueLength) {
      throw "getUidGenerator.genUid cannot generate TLId until next millisecond!";
	}

    lastDate = now;
	if (timeEncoded.substr(0,1) <= '9') {
		return "X"+timeEncoded+superUnique;
	}
	return timeEncoded+superUnique;
  };
  
  var uidToTimestamp = function(tlid) {
	if (tlid.substr(0,1) == 'X') {
		tlid = tlid.substr(1);
	}
	tlid = tlid.substr(0, tlid.length - uniqueLength);
    return parseInt(tlid,32) + epoch;
  };

  var sort = function(tlidA, tlidB) {
	if (tlidA.substr(0,1) == 'X') {
		tlidA = tlidA.substr(1);
	}
	if (tlidB.substr(0,1) == 'X') {
		tlidB = tlidB.substr(1);
	}
	if (tlidA.length != tlidB.length) {
		return (tlidA.length < tlidB.length) ? -1 : 1;
	}
	return (tlidA < tlidB) ? -1 : 1;
  }
  
  return {encode: genUid, decode: uidToTimestamp, sort: sort};
};

});
