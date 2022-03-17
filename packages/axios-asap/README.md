## Axios ASAP Interceptor

```typescript
import axios from "axios";
import { createAsapInterceptor } from "@ordermentum/axios-asap";
const client = axios.create();
client.interceptors.request.use(createAsapInterceptor(jwtConfig));
```
