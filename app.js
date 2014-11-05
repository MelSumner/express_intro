
var express = require('express'),
    short = require('short'),
    app = express(),
    port = process.env.PORT || 3000,
	hbs = require('hbs');
 
app.set('view engine', 'html');
app.engine('html', hbs.__express);
app.use(express.static('public'));

short.connect("mongodb://localhost/short");

app.get('/about', function (req, res) {
	res.render('about');
});

app.get('/shorten/*', function (req, res) {
	
	var longURL = req.params[0],
		shortURLPromise = short.generate({URL: longURL});
	
	shortURLPromise.then(function(shortURLData) {
		short.retrieve(shortURLData.hash).then(function(shortURLObject) {
			var shortURL = [req.host, ":", port, "/", shortURLObject.hash].join("");
			res.send(shortURL);
	  	}, function(error) {
			if (error) {
		  		throw new Error(error);
			}
	  	});
	}, function(error) {
		if (error) {
			throw new Error(error);
	  	}
	});
});

app.get('/expand/:hash', checkHashExists, function (req, res) {
	var short_hash = req.params.hash;
	short.retrieve(short_hash).then(function(shortURLObject) {
		res.send(shortURLObject);
	});
});

app.get('/:hash', checkHashExists, function (req, res) {
	var short_hash = req.params.hash;
	short.retrieve(short_hash).then(function(shortURLObject) {
		res.redirect(302, shortURLObject.URL);
	});
});

function checkHashExists(req, res, next) {
	var short_hash = req.params.hash;
	short.retrieve(short_hash).then(function(shortURLObject) {
		next();
	}, function (error) {
		if (error) {
			res.send('URL not found!', 404);
		}
	});
}

app.get('/', function (req, res) {
	var listURLsPromise = short.list();
	listURLsPromise.then(function(urlData) {	
		res.render('list',{urls:urlData, count: urlData.length});
	}, function(error) {
  		if (error) {
    		throw new Error(error);
  		}
	});
});


app.listen(port, function () {
  console.log('Server running on port ' + port);
});