---
"@ordermentum/asap-core": patch
"@ordermentum/express-asap": patch
"@ordermentum/hapi-asap": patch
---

Bump `jsonwebtoken` dependency from ^8.5.1 to ^9.0.0 to remediate CVE-2022-23539 (unrestricted key type could lead to legacy keys usage) and cascade fixes for `jws` and `semver` transitives.

Test-only changes required by jsonwebtoken@9:
- `internal/test-helpers`: swap the inline 1024-bit RSA test key pair for a 2048-bit pair (v9 enforces a minimum key size of 2048 bits for RS256).
- `packages/asap-core/test/generate_test.ts`: update the invalid-private-key assertion regex to match v9's new error message `secretOrPrivateKey must be an asymmetric key`.

No production API changes; sign/verify call sites already pass explicit `algorithm`/`algorithms` so v9 remains behaviour-compatible.
