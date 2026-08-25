---
"@ordermentum/asap-core": patch
"@ordermentum/axios-asap": patch
---

Bump axios to ^1.16.0 to resolve 13 high-severity CVEs (SSRF, credential leak,
proxy bypass, prototype pollution, ReDoS). Consumers pick up the fixed version
transitively; no API changes.
