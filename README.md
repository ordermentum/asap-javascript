# Javascript Atlassian ASAP S2S Authentication

<p>
  <a href="#" target="_blank">
    <img alt="License: Apache--2.0" src="https://img.shields.io/badge/License-Apache--2.0-yellow.svg" />
  </a>
</p>

This is an implementation of [Atlassian ASAP S2S Authentication](https://s2sauth.bitbucket.io/).

This is a mono repo with

- @ordermentum/asap-core a generic authenticator function and header generation library for usage in http clients
- @ordermentum/express-asap An [Express](https://expressjs.com/) middleware
- @ordermentum/axios-asap interceptor for axios

This started as a forked from a no longer public bitbucket repo - all credit to Atlassian.

# Usage guide

Install the library:

```
# server
npm install --save @ordermentum/express-asap
# client
npm install --save @ordermentum/asap-core
```

For more examples have a look at the `test/` directories.

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

## Generating keys for use

```
openssl genrsa -out private.pem 2048
openssl rsa -in private.pem -pubout -out public.pem

# get public key as base64
cat public.pem | base64
```
