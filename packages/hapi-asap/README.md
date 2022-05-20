## Hapi configuration

```typescript
import Hapi from "@hapi/hapi";
import registerPlugin from "@ordermentum/hapi-asap";

const server = Hapi.server({
  port: 3000,
  host: "localhost",
});

await server.register(registerPlugin);

server.auth.strategy("asap", "hapi-asap", {
  keyLoader: (_key: string) => Promise.resolve(publicKey),
  resourceServerAudience: "test",
  maxLifeTimeSeconds: 60,
});

server.route({
  method: "GET",
  path: "/test",
  options: {
    auth: {
      mode: "optional",
      strategy: "asap",
    },
  },
  handler(request, h) {
    const { asapClaims } = request.auth.artifacts ?? {};

    if (!asapClaims) {
      return `Ok`;
    }

    return `${asapClaims?.aud}`;
  },
});

server.route({
  method: "GET",
  options: {
    auth: {
      mode: "required",
      strategy: "asap",
    },
  },
  path: "/required",
  handler(request, h) {
    const { asapClaims } = request.auth.artifacts ?? {};
    return `test ${asapClaims?.aud}`;
  },
});

await server.initialize();
```
