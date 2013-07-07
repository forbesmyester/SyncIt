/*jshint smarttabs:true */
(function (root, factory) {
	"use strict";
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

"use strict";
// Author: Matthew Forrester <matt_at_keyboardwritescode.com>
// Copyright: Matthew Forrester
// License: MIT/BSD-style

/**
 * # getTLIdEncoderDecoder()
 *
 * Generate time based local Id's which are guarenteed to be unique for that
 * particular constructor call.
 *
 * ## Parameters
 *
 * * **@param {Number} `epoch`** A timestamp, all unique Id's will use this as
 *	thier base time.
 * * **@param {Number} `uniqueLength`** Id's will be based on a timestamp and a
 *	extra sequence number if we happen to generate two Id's in the same 
 *	millisecond. If you leave this at the default of 1, 32 unique Id's can be
 *	generated per millisecond (because it's a 32bit number represented in a
 *	string), I have found this to be sufficient, but you can increase this
 *	number if it is not.
 * * **@return {Object} `return`** The return value includes three seperate Functions, 
 *	these are:
 * *   **@return {Function} `return.encode`** Encode now by default (or the
 *		first parameter) into an Id.
 * *   **@return {Function} `return.decode`** Decode an Id back into a 
 *		timestamp (Id is the first parameter).
 * *   **@return {Function} `return.sort`** Compatible with Array.sort() and
 *		will soft based on the encode time / first parameter.
 *
 * ## Example
 *
 * ```javascript
 * // Use one character (32 bit number) to ensure uniqueness within a millisecond
 * var uniquenessPerMillisecond = 1;
 * // As close as possible (but lower) than the lowest date to give shorter Id's
 * var epoch = new Date(1970,0,1).getTime();
 * 
 * 
 * // Get the TLId Encoder / Decoder
 * var encoderDecoder = getTLIdEncoderDecoder(epoch,uniquenessPerMillisecond);
 * 
 * // Encode a date into a unique string
 * var dates = [
 *   encoderDecoder.encode(),
 *   encoderDecoder.encode(new Date(1980,1,6).getTime()),
 *   encoderDecoder.encode(new Date(1981,3,15).getTime()),
 *   encoderDecoder.encode(new Date(1986,8,9).getTime()),
 *   encoderDecoder.encode(new Date(1983,10,3).getTime()),
 *   encoderDecoder.encode(new Date(1982,0,6).getTime()),
 *   encoderDecoder.encode()
 * ];
 * 
 * // Get the dates it was encoded
 * var originalTimestamps = dates.map(encoderDecoder.decode);
 * 
 * // Sort them in date order
 * var sortedDates = dates.sort(encoderDecoder.sort);*
 * console.log("The first Date is " + new Date(encoderDecoder.decode(sortedDates[0])));
 * ```
 */
return function(epoch,uniqueLength) {
  
  var lastDate = null;
  var index = -1;
  if (uniqueLength === undefined) {
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
	tlidA = tlidA.replace(/.*\./,'');
	tlidB = tlidB.replace(/.*\./,'');
	if (tlidA.length != tlidB.length) {
		return (tlidA.length < tlidB.length) ? -1 : 1;
	}
	return (tlidA < tlidB) ? -1 : 1;
  };
  
  return {encode: genUid, decode: uidToTimestamp, sort: sort};
};

});
