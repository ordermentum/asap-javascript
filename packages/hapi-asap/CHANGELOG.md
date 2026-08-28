# @ordermentum/hapi-asap

## 1.0.3

### Patch Changes

- 3c22a85: Bump `jsonwebtoken` dependency from ^8.5.1 to ^9.0.0 to remediate CVE-2022-23539 (unrestricted key type could lead to legacy keys usage) and cascade fixes for `jws` and `semver` transitives.

  Test-only changes required by jsonwebtoken@9:

  - `internal/test-helpers`: swap the inline 1024-bit RSA test key pair for a 2048-bit pair (v9 enforces a minimum key size of 2048 bits for RS256).
  - `packages/asap-core/test/generate_test.ts`: update the invalid-private-key assertion regex to match v9's new error message `secretOrPrivateKey must be an asymmetric key`.

  No production API changes; sign/verify call sites already pass explicit `algorithm`/`algorithms` so v9 remains behaviour-compatible.

- Updated dependencies [3c22a85]
  - @ordermentum/asap-core@1.0.3

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
