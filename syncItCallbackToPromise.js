module.exports = (function (when) {

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
	
}(require('when')));
