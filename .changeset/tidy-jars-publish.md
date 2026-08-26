---
"@ordermentum/asap-test-helpers": patch
"@ordermentum/express-asap": patch
"@ordermentum/asap-core": patch
"@ordermentum/axios-asap": patch
"@ordermentum/hapi-asap": patch
---

Add `repository` metadata to the published packages. Releases now authenticate
to npm with GitHub Actions OIDC (trusted publishing) rather than a long-lived
token.
