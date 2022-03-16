 express-asap

This is an implementation of [ASAP S2S Authentication](https://s2sauth.bitbucket.io/) as both an [Express](https://expressjs.com/) middleware and a generic authenticator function which works without express.


This is forked from a no longer public bitbucket repo.


# Usage guide

Install the library:

```
npm install --save @ordermentum/express-asap
```


## Express configuration

```
const express = require('express');

const {createAsapAuthenticationMiddleware, createAsapIssuerWhitelistMiddleware} = require('@atlassian/express-asap');

const app = express();

app.use(createAsapAuthenticationMiddleware({
  publicKeyBaseUrls: [
    config.get('jwt.publicKeyBaseUrl'),
    config.get('jwt.publicKeyBaseUrlFallback')
  ],
  resourceServerAudience: config.get('jwt.audience')
}));

app.use('/some-resource',
  createAsapIssuerWhitelistMiddleware(['some-authorized-issuer']),
  (request, response) => {
      response.send('This will only be reached by a request authenticated as some-authorized-issuer');
  }
);

app.listen(8080);
```

For more examples have a look at the `test/integration` directory.


## Use without Express

```
const {createAsapAuthenticator} = require('@atlassian/express-asap');

const authenticateAsapHeader = createAsapAuthenticationMiddleware({
  publicKeyBaseUrls: [
    config.get('jwt.publicKeyBaseUrl'),
    config.get('jwt.publicKeyBaseUrlFallback')
  ],
  resourceServerAudience: config.get('jwt.audience')
});

authenticateAsapHeader('Bearer foo')
  .then((asapClaims) => {
    if (asapClaims) {
      console.log('Authenticated!', asapClaims);
    } else {
      console.log('Anonymous!');
    }
  })
  .catch((error) => console.log('Authentication failed!', error));
```



# Development guide

## Install dependencies

```
npm install
```


## Useful commands

```
# Run all checks
npm test

# Run just the jasmine tests
npm run test:jasmine

# Run just the linter
npm run test:lint
```


## Perform a release

```
npm version 99.98.97
npm publish
git push
git push --tags
```
