---
"@ordermentum/asap-core": patch
"@ordermentum/axios-asap": patch
"@ordermentum/express-asap": patch
"@ordermentum/hapi-asap": patch
---

Bump axios to ^1.19.0 in `asap-core` and `axios-asap` to resolve 13
high-severity CVEs (SSRF, credential leak, proxy bypass, prototype pollution,
ReDoS). Consumers pick up the fixed version transitively; no API changes.

Also bumps `@types/node` to ^20.0.0 and `typescript` to ^4.9.5 across all
packages; axios 1.19 typings reference DOM/fetch globals declared by
`@types/node` 18+, and that types version needs TypeScript 4.8+ to parse.
