# Github OAuth server

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
- **scope** - change this array to the 

scope| description
repo| Access private repositories,
repo:status| Access commit status,
repo_deployment| Access deployment status,
public_repo| Access public repositories,
delete_repo| Delete repositories,
user| Access all profile data,
user:email| Access user email addresses (read only),
user:follow| Follow and unfollow users,
admin:org| Full control of orgs and teams,
write:org| Read and write org and team membership,
read:org| Read org and team membership,
admin:public_key| Full control of user public keys,
write:public_key| Write user public keys,
read:public_key| Read user public keys,
admin:repo_hook| Full control of repository hooks,
write:repo_hook| Write repository hooks,
read:repo_hook| Read repository hooks,
admin:org_hook| Full control of organization hooks,
gist| Create gists,
notifications| Access notifications
