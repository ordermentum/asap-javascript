---
"@ordermentum/hapi-asap": major
"@ordermentum/express-asap": major
"@ordermentum/asap-core": major
---

**BREAKING**: framework packages are no longer bundled — consumers must supply them.

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
