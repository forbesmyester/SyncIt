// if the module has no dependencies, the above pattern can be simplified to
(function (root, factory) {
	"use strict";
	if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like enviroments that support module.exports,
		// like Node.
		module.exports = factory(require('when'));
	} else {
		// AMD. Register as an anonymous module.
		define(['when'],factory);
	}
}(this, function (when) {

	"use strict";
	
	return function(ctx, func, successErrorCodes /*, params */) {
		var params = Array.prototype.slice.call(arguments).slice(3),
			deferred = when.defer();
		
		params.push(function(err) {
			if (successErrorCodes.indexOf(err) > -1) {
				return deferred.resolve.apply(
					ctx,
					Array.prototype.slice.call(arguments).slice(1)
				);
			}
			return deferred.reject(err);
		});
		func.apply(ctx, params);
		
		return deferred.promise;
	};
	
}));
