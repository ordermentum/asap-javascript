# Javascript Atlassian ASAP S2S Authentication

<p>
  <a href="#" target="_blank">
    <img alt="License: Apache--2.0" src="https://img.shields.io/badge/License-Apache--2.0-yellow.svg" />
  </a>
</p>

This is an implementation of [Atlassian ASAP S2S Authentication](https://s2sauth.bitbucket.io/).

This is a mono repo with

- An [Express](https://expressjs.com/) middleware and a generic authenticator function which works without express. @ordermentum/express-asap
- An header generation library for usage in http clients @ordermentum/asap-core

This started as a forked from a no longer public bitbucket repo - all credit to Atlassian.

# Usage guide

Install the library:

```
# server
npm install --save @ordermentum/express-asap
# client
npm install --save @ordermentum/asap-core
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
const {createAsapAuthenticator} = require('@ordermentum/asap-core');

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
# Run the typecheck
yarn run turbo run typecheck

# Run the mocha tests
yarn run turbo run test

# Run the linter
yarn run turbo run lint
```

## Perform a release

```
npm version 99.98.97
npm publish
git push
git push --tags
```
