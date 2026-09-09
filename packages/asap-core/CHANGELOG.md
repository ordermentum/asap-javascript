# @ordermentum/asap-core

## 2.0.0

### Major Changes

- 5329cec: **BREAKING**: framework packages are no longer bundled — consumers must supply them.

  `@hapi/hapi` (hapi-asap) and `express` (express-asap) are only referenced in
  type positions — both are erased from the compiled output and were never
  required at runtime. Declaring them as regular dependencies forced a second
  copy of the framework into any consumer whose own version resolved to a
  different range. They are now peer dependencies, supplied by the consuming
  app: `@hapi/hapi` at `>=20.0.0 <22`, `express` at `^4.17.3`.

  Both peers are required rather than optional: neither package is usable
  without its framework, so an unmet peer is a genuine misconfiguration.

  `asap-core` and `hapi-asap` both declared `express` without importing it
  anywhere — zero references in `src/`, `test/` or `build/`. That dead
  dependency is removed; it was pulling express and its whole tree into
  Hapi-only services that never touch it.

  `@types/hapi__hapi` is dropped from hapi-asap: hapi 21 ships its own type
  definitions, so the DefinitelyTyped package for hapi 20 is redundant.

  Every current consumer already declares its framework directly, so in
  practice no consumer code or dependency changes are required.

## 1.0.3

### Patch Changes

- 3c22a85: Bump `jsonwebtoken` dependency from ^8.5.1 to ^9.0.0 to remediate CVE-2022-23539 (unrestricted key type could lead to legacy keys usage) and cascade fixes for `jws` and `semver` transitives.

  Test-only changes required by jsonwebtoken@9:

  - `internal/test-helpers`: swap the inline 1024-bit RSA test key pair for a 2048-bit pair (v9 enforces a minimum key size of 2048 bits for RS256).
  - `packages/asap-core/test/generate_test.ts`: update the invalid-private-key assertion regex to match v9's new error message `secretOrPrivateKey must be an asymmetric key`.

  No production API changes; sign/verify call sites already pass explicit `algorithm`/`algorithms` so v9 remains behaviour-compatible.

## 1.0.2

### Patch Changes

- 7b1daf6: Add `repository` metadata to the published packages. Releases now authenticate
  to npm with GitHub Actions OIDC (trusted publishing) rather than a long-lived
  token.

## 1.0.1

### Patch Changes

- a7c9c15: Bump axios to ^1.19.0 in `asap-core` and `axios-asap` to resolve 13
  high-severity CVEs (SSRF, credential leak, proxy bypass, prototype pollution,
  ReDoS). Consumers pick up the fixed version transitively; no API changes.

  Also bumps `@types/node` to ^20.0.0 and `typescript` to ^4.9.5 across all
  packages; axios 1.19 typings reference DOM/fetch globals declared by
  `@types/node` 18+, and that types version needs TypeScript 4.8+ to parse.

## 1.0.0

### Major Changes

- f98cfb8: Upgrade axios version to 1.0
