## ASAP

http based fetcher

```typescript
import { createAsapAuthenticator } from "@ordermentum/asap-core";

const authenticateAsapHeader = createAsapAuthenticator({
  publicKeyBaseUrls: [
    config.get("jwt.publicKeyBaseUrl"),
    config.get("jwt.publicKeyBaseUrlFallback"),
  ],
  resourceServerAudience: config.get("jwt.audience"),
});

authenticateAsapHeader("Bearer foo")
  .then((asapClaims) => {
    if (asapClaims) {
      console.log("Authenticated!", asapClaims);
    } else {
      console.log("Anonymous!");
    }
  })
  .catch((error) => console.log("Authentication failed!", error));
```

environment based fetcher

```typescript
import { createAsapAuthenticator } from "@ordermentum/asap-core";
import createPublicKeyFetcher from "@ordermentum/asap-core/fetchers/env";

const authenticateAsapHeader = createAsapAuthenticator({
  keyLoader: createPublicKeyFetcher("PUBLIC_KEY_PREFIX_"),
  resourceServerAudience: config.get("jwt.audience"),
});

authenticateAsapHeader("Bearer foo")
  .then((asapClaims) => {
    if (asapClaims) {
      console.log("Authenticated!", asapClaims);
    } else {
      console.log("Anonymous!");
    }
  })
  .catch((error) => console.log("Authentication failed!", error));
```

```typescript
import { createAuthHeaderGenerator } from "@ordermentum/asap-core";

const jwtConfig = {
  privateKey: privateKeyPem,
  issuer: "an-issuer",
  keyId: "the-keyid",
  audience: "an-audience",
};
createAuthHeaderGenerator(jwtConfig);
// Bearer ....
```
