import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-dev-secret-must-change-in-production"
);

export async function signJWT(payload, expiresIn = "24h") {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifyJWT(token) {
  const { payload } = await jwtVerify(token, secret);
  return payload;
}
