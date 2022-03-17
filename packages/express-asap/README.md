## Express configuration

```typescript
import express from "express";

import {
  createAsapAuthenticationMiddleware,
  createAsapIssuerWhitelistMiddleware,
} from "@ordermentum/express-asap";

const app = express();

app.use(
  createAsapAuthenticationMiddleware({
    publicKeyBaseUrls: [
      config.get("jwt.publicKeyBaseUrl"),
      config.get("jwt.publicKeyBaseUrlFallback"),
    ],
    resourceServerAudience: config.get("jwt.audience"),
  })
);

app.use(
  "/some-resource",
  createAsapIssuerWhitelistMiddleware(["some-authorized-issuer"]),
  (request, response) => {
    response.send(
      "This will only be reached by a request authenticated as some-authorized-issuer"
    );
  }
);

app.listen(8080);
```
