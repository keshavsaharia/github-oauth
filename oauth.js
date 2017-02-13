var app = require('express')(),
	request = require('request'),
	crypto = require('crypto');

var github = require('./github.json');
/**
github.json contains a simple object with configuration data. You can also initialize it here.

var github = {
	"redirect": "http://url-of-your-application.com",
	"url": "http://url-of-your-oauth-server.com",
	"scope": ["user", "user:follow", "repo"],
	"client": "Client ID",
	"secret": "Client secret"
};
**/

// Store access tokens with OTP keys (one-time passwords)
var token = {};
var redirect = {};

/**
 * GET /
 *
 * Redirect to the github OAuth flow
 */
app.get('/', function(req, res) {
	res.statusCode = 302;

	// Generate a random state string and initialize the value for the key
	var state = crypto.randomBytes(16).toString('hex');
	token[state] = false;

	// Set the redirect if there is one
	redirect[state] =
		((req.query.localhost) ? 'http://localhost:8000' : github.redirect) +
		((req.query.redirect) ? (((req.query.redirect.indexOf('/') == 0) ? '' : '/') + req.query.redirect) : '');

	// Redirect to GitHub
	res.setHeader('location',
		'https://github.com/login/oauth/authorize?state=' + state
	  	+ '&client_id=' + github.client
	  	+ '&scope=' + github.scope
	  	+ '&redirect_uri=' + github.url + '/callback'
	  );
	res.end();
});

// The callback path
app.get('/callback', function(req, res, callback) {
	// If there is no callback code
	if (! req.query.code)
		res.status(400).send('{ "error": "no_code" }');

	// If there is a mismatch in the random generated state (prevent cross-site attacks)
	else if (! req.query.state || token[req.query.state] !== false)
		res.status(400).send('{ "error": "invalid_state" }');

	// Retrieve the access token for the user
	else
	    request.get({
			url: 'https://github.com/login/oauth/access_token'
			  	 + '?client_id=' + github.client
			  	 + '&client_secret=' + github.secret
			  	 + '&code=' + req.query.code
			  	 + '&state=' + req.query.state,
			json: true
		},
		function (error, token, body) {
			if (error) {
				error.body = body;
				error.token = token;
				callback(error);
			}
			else {
				token[req.query.state] = body.access_token;
				delete redirect[req.query.state];
				res.redirect(redirect[req.query.state] + '#' + req.query.state);
			}
	    });
});

/**
 * 	GET /token?token=[one time password]
 *
 *  Passes the one-time query parameter
 */
app.get('/token', function(req, res) {
	if (! res.query.token)
		res.status(400).send('{ "error": "no_token" }');

	else if (! token[res.query.token])
		res.status(400).send('{ "error": "expired_token" }');

	// One-time token handoff
	else {
		var t = token[res.query.token];
		delete token[res.query.token];
		res.status(200).send('{ "error": "", "token": "' + t + '" }');
	}
});

// Start the server on the default port
app.listen(github.port || 80, function() {
	console.log('Server started.');
});
