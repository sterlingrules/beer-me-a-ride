// var express = require('./node_modules/express');
var express = require('express');

// var jade = require('jade');
var url = require('url');
var fs = require('fs');
var http = require('http');
var request = require('request');
var static = require('node-static');


// --------------------------------------------------------------------------------------
// CSS/LESS
// --------------------------------------------------------------------------------------

var less = require('less');
var parser = new (less.Parser)({
    paths: ['.', './views/css'], // Specify search paths for @import directives
    filename: 'style.less' // Specify a filename, for better error messages
});

parser.parse('.class { width: 1 + 1 }', function (e, tree) {
    tree.toCSS({ compress: true }); // Minify CSS output
});


// --------------------------------------------------------------------------------------
// SERVER
// --------------------------------------------------------------------------------------

var app = express.createServer( 
				express.static(__dirname + '/views'),
				express.cookieParser(),
				express.bodyParser(),
				express.session({secret: 'FlurbleGurgleBurgle',
				                store: new express.session.MemoryStore({ reapInterval: -1 }) }));
app.listen(8989);

app.use(express.compiler({ src: __dirname + '/views', enable: ['less'] }));
app.use('/css', express.static(__dirname + '/views'));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.enable('jsonp callback');


// --------------------------------------------------------------------------------------
// PUSH NOTIFICATIONS
// --------------------------------------------------------------------------------------

var qs = require('querystring'),
	oauth = {
			config_key: configKey,
			api_secret: secretKey
    	},
	url = 'https://' + configKey + ':' + secretKey + '@launch.alertrocket.com/api/push';


// --------------------------------------------------------------------------------------
// DATABASE
// --------------------------------------------------------------------------------------

var mysql = require('mysql'),
	database = 'beer_me_a_ride',
	user_table = 'users',
	// client = mysql.createClient({ user: 'root', password: '' });
	client = mysql.createClient({ user: 'sterlingrules', password: '@y&7~s45', host: 'mysql.mynameissterling.com', port: 3306 });
	client.query('USE ' + database);
	client.database = 'beer_me_a_ride';
	
console.log('Connected...');

var configKey = '09a3ca0d2c614eaaac4152e1b4a0f19d';
var secretKey = '174b0585012d4b8aa88c62fa319c9575';


// --------------------------------------------------------------------------------------
// APPLICATION
// --------------------------------------------------------------------------------------

app.get('/', function(req, res) {
	res.render('login', { layout: 'home-layout', title: 'Beer Me A Ride' });
});

app.post('/login', function(req, res) {
	console.log(req.body.email);
	if (req.body.email != "karl@jogonaut.com") {
		client.query(
			'SELECT beers, name FROM users WHERE email = "' + req.body.email + '";',
			function(err, results, field) {
				if (err) throw err;
				console.log(results);
				console.log(results[0].beers);
				req.session.email = req.body.email;
				req.session.beers = results[0].beers;
				res.redirect('/dashboard');
			});
	} else if (req.body.email == "karl@jogonaut.com") {
		req.session.email = req.body.email;
		res.redirect('/karl');
	} else {
		// error message
	}
});

app.get('/dashboard', function(req, res) {
	console.log(req.session.email);
	if (req.session.email != undefined) {
		res.render('dashboard', { layout: 'layout', title: 'Beer Me A Ride', beer_count: req.session.beers });
	} else {
		res.redirect('/');
	}
});

app.get('/karl', function(req, res) {
	if (req.session.email != undefined) {
		client.query(
			'SELECT * FROM users WHERE beers > 0;',
			function(err, results, field) {
				if (err) throw err;
				console.log(results);
				res.render('karl', { layout: 'layout', title: 'Beer Me A Ride', data: results });
		});
	} else {
		res.redirect('/');
	}
});

app.get('/redeem-ride', function(req, res) {
	request.post({
		url: url,
		method: 'POST',
		body: '{"alert":"I Need A Ride!", "url":"http://launch.alertrocket.com/demo"}'
		}, function (e, r, body) {
			var response = qs.parse(body);
			// console.log(r);
			console.log(response);
	});
});

app.get('/redeem-beer', function(req, res) {
	request.post({
		url: url,
		method: 'POST',
		body: '{"alert":"A Notification Title", "url":"http://launch.alertrocket.com/demo"}'
		}, function (e, r, body) {
			var response = qs.parse(body);
			// console.log(r);
			console.log(response);
	});
});

