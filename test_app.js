var express = require('express');
var path = require('path');
var logger = require('morgan');
browserify = require('browserify-middleware');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));


var browserifyFiles = [
	'/addLocking.js',
	'/AsyncLocalStorage.js',
	'/Constant.js',
	'/dontListLocallyDeletedDatakeys.js',
	'/FakeLocalStorage.js',
	'/makeAsync.js',
	'/SyncItBuffer.js',
	'/syncItCallbackToPromise.js',
	'/SyncIt.js',
	'/SyncLocalStorage.js',
	'/updateResult.js',
	'/Path/AsyncLocalStorage.js'
];

var saf;
for (var i=0; i<browserifyFiles.length; i++) {
	app.get(
		browserifyFiles[i],
		browserify(
			'.' + browserifyFiles[i],
			{
				standalone: browserifyFiles[i].substr(1).replace(/\..*/,'').replace(/\//,'_')
			}
		)
	);
}

app.use(express.static(path.join(__dirname, '.')));

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
app.use(function(err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message,
		error: err
	});
});

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


app.listen(3000);
