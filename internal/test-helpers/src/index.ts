import jsonWebToken from 'jsonwebtoken';

export const privateKeyPem = `
-----BEGIN RSA PRIVATE KEY-----
MIICXgIBAAKBgQDPpV0EjiFQ0ZEJ3m7Nyz+pmY+t2t2aqUe/uqW6PLvePe7b9/I0
7Znz65koGidfmsZxy88waj1GO0y9nGwvZ5yicE8dfDId2GruMzgcSWJCmgJ/2/OH
53KaYd9AXLI1ynl5rjwWy8KPrX8XhpTrlEo+Pu57Kc/LHlXL9ubs1sW6ZQIDAQAB
AoGBAJJdyfeQCEPjtQzz0b8WacWvDOxLvrFqabzoYDGq5fJ+TYSYfg54/XBGvira
ZK6rdv5335ANEywSWMG/JTM1Id7JVDI6/Mdbp2Wzu8slNcXUMqS9jb6WY/KlVrdq
ZRhlinTjachnNtK9K2O3EdSxQb9aLwHNboOnu7qPvsBP+p3xAkEA8T7CP0KPpjKo
adrfRo6RI1znivny3+oPPF/0ZnQ1h5vUCKVlRD899w0T71CyS2tIbPbgJ2UTFZ/2
TjljVi3D0wJBANxYiF+WXe/+UnLLydnWDFW6I1fPgm5ZbySluqejIYS02O34KQXj
VVNqif6TW/U+5KQ/Oayb4MNxkkxNmbw0fecCQQDaB1xLC/8Dt7jZooQ0Ilkt2qMw
yWEl2UXXzOj3R4OxgbYJ8mEpYva/tsQTf50D6HvWbvB66jBrVNyoKdmLY2UdAkAs
vl2S63nPzhj37qHidjCzB8U9g4m81rRXAMBSYjHgPMkAKbBK3crp0WyMIWg++LJ9
F8miX1TY2ysWC3v4V8BpAkEAzwUaRygWfprUbYZLiTcqO3MaUEKvBnf+WswUqxkP
jPu20i22yqAHpkqagruNMz9RHS4WCrYLVXHC0+lb1HlGQg==
-----END RSA PRIVATE KEY-----
`.trim();

export const publicKey = `
-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDPpV0EjiFQ0ZEJ3m7Nyz+pmY+t
2t2aqUe/uqW6PLvePe7b9/I07Znz65koGidfmsZxy88waj1GO0y9nGwvZ5yicE8d
fDId2GruMzgcSWJCmgJ/2/OH53KaYd9AXLI1ynl5rjwWy8KPrX8XhpTrlEo+Pu57
Kc/LHlXL9ubs1sW6ZQIDAQAB
-----END PUBLIC KEY-----
`.trim();

export function parseAuthHeader(authHeader: string) {
  const parts = authHeader.split(' ');
  const token = parts[1];
  return jsonWebToken.verify(token, publicKey);
}
