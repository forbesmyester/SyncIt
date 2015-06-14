"use strict";

module.exports = function(ctx, func, successErrorCodes /*, params */) {
	var params = Array.prototype.slice.call(arguments).slice(3);

	return new Promise(function(resolve, reject) {

		params.push(function(err) {
			if (successErrorCodes.indexOf(err) > -1) {
				return resolve.apply(
					ctx,
					Array.prototype.slice.call(arguments).slice(1)
				);
			}
			return reject(err);
		});

		func.apply(ctx, params);

	});

};
