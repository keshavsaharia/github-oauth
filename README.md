# Github OAuth server

A secure implementation of GitHub OAuth that uses a one-time password to hand off the authentication token, and can handle redirects.

## How it works

1. You [setup](#setup) and run this Express script on a public-facing webserver (e.g. "github.example.com")
2. You configure your GitHub application to have `https://github.example.com/callback` as the authentication callback.
3. Somewhere in your app you have a "login with GitHub" button that points to the webserver root
```html
<a href="https://github.example.com">login with GitHub</a>
<a href="https://github.example.com?redirect=/go/here/after">login with GitHub and return to page</a>
```
4. You also need to include a script that checks the document hash for `token=`, to check for one-time passwords.
```javascript
var oneTimePassword;
if (window.location.hash.indexOf('token=') == 0)
	oneTimePassword = window.location.hash.substring(6);
```
5. Once you have the OTP, send it to the server with a `GET` request for the user's token.
```javascript
if (oneTimePassword) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4) {
			window.location.hash = '';
	                var res = JSON.parse(xhttp.responseText);
			if (res.success) {
				console.log('Token: ' + res.token);
				// Use the token
			}
			else console.error(res);
                }
	};
	
	// Make a GET request to the authentication server
	xhttp.open("GET", 'https://github.example.com/token?token=' + oneTimePassword, true);
	xhttp.send();
}
```

## Notes

- Save the token to a cookie if you plan on allowing sessions to persist. Once the one-time password is used, the token is deleted from the server and cannot be retrieved with the OTP. 
- It's the 21st century, don't run an OAuth server without HTTPS, even though it still works.

## Setup

Everything you need is in the [`oauth.js`](oauth.js) file. Configuration data lives in a `github.json` file which is loaded by the `oauth.js` file. 

```
{
	"redirect": "http://url-of-your-application.com",
	"url": "http://url-of-your-oauth-server.com",
	"scope": ["user", "user:follow", "repo"],
	"client": "Client ID",
	"secret": "Client secret"
}
```

You will need to edit:
- **Client ID** and **Client Secret**: get this from your GitHub application
- **scope** - list of the permissions you would like GitHub to give your application

|scope|description|
|-----|-----------|
|repo|Access private repositories,|
|repo:status| Access commit status,|
|repo_deployment| Access deployment status,|
|public_repo| Access public repositories,|
|delete_repo| Delete repositories,|
|user| Access all profile data,|
|user:email| Access user email addresses (read only),|
|user:follow| Follow and unfollow users,|
|admin:org| Full control of orgs and teams,|
|write:org| Read and write org and team membership,|
|read:org| Read org and team membership,|
|admin:public_key| Full control of user public keys,|
|write:public_key| Write user public keys,|
|read:public_key| Read user public keys,|
|admin:repo_hook| Full control of repository hooks,|
|write:repo_hook| Write repository hooks,|
|read:repo_hook| Read repository hooks,|
|admin:org_hook| Full control of organization hooks,|
|gist| Create gists,|
|notifications| Access notifications|

## Experimental- multiple GitHub applications

You can provide OAuth for multiple GitHub applications with the [multi-oauth.js](multi-oauth.js) Express script.
