# @ordermentum/axios-asap

## 1.0.2

### Patch Changes

- 7b1daf6: Add `repository` metadata to the published packages. Releases now authenticate
  to npm with GitHub Actions OIDC (trusted publishing) rather than a long-lived
  token.
- Updated dependencies [7b1daf6]
  - @ordermentum/asap-core@1.0.2

## 1.0.1

### Patch Changes

- a7c9c15: Bump axios to ^1.19.0 in `asap-core` and `axios-asap` to resolve 13
  high-severity CVEs (SSRF, credential leak, proxy bypass, prototype pollution,
  ReDoS). Consumers pick up the fixed version transitively; no API changes.

  Also bumps `@types/node` to ^20.0.0 and `typescript` to ^4.9.5 across all
  packages; axios 1.19 typings reference DOM/fetch globals declared by
  `@types/node` 18+, and that types version needs TypeScript 4.8+ to parse.

- Updated dependencies [a7c9c15]
  - @ordermentum/asap-core@1.0.1

## 1.0.0

### Major Changes

- f98cfb8: Upgrade axios version to 1.0

### Patch Changes

- Updated dependencies [f98cfb8]
  - @ordermentum/asap-core@1.0.0
