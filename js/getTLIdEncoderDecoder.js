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

return function(epoch) {
  
  var lastDate = null;
  var index = -1;

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
      index = 9;
    }
    lastDate = now;
    if (index>30) {
      throw "getUidGenerator.genUid cannot generate Uid... "+now+" "+index;
    }
    return "X"+(now - epoch).toString(32)+'-'+(++index).toString(32);
  };
  
  var uidToTimestamp = function(uid) {
    return parseInt(uid.substr(1,uid.length-2),32) + epoch;
  };
  
  return {encoder: genUid, decoder: uidToTimestamp};
};

});
