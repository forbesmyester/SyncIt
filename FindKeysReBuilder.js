module.exports = (function () {
	"use strict";
	return function(pattern) {
		var mustBeDot = [],
			j = 0,
			starIndex;
		if (!pattern.match(/^[A-Za-z0-9_\.\*]/)) {
			return false;
		}
		pattern = pattern.replace(/\./g,'\\.');
        starIndex = pattern.indexOf('*');
		while (starIndex > -1) {
			mustBeDot = [starIndex-1,starIndex+1];
			if (starIndex == pattern.length-1) {
				mustBeDot.pop();
			}
			if (starIndex === 0) {
				mustBeDot.shift();
			}
			for (j = 0; j < mustBeDot.length; j++) {
				if (
					(pattern.substr(mustBeDot[j],1) !== '.') && 
					(pattern.substr(mustBeDot[j],1) !== '\\')
				) {
					return false;
				}
			}
			pattern = pattern.replace('*','[a-z0-9A-Z_\\-]+');
			starIndex = pattern.indexOf('*');
		}
		return new RegExp('^'+pattern+'$');
	};
}());
