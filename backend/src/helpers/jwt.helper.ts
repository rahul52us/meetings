import pkg, { Algorithm, SignOptions, Secret } from 'jsonwebtoken';
import {
  JWT_SECRET,
  JWT_ISSUER,
  JWT_SUBJECT,
  JWT_AUDIENCE,
  JWT_EXPIRESIN,
  JWT_ALGORITHM
} from "~/utils/env";

type Payload = {
  email?: string;
  name?: string;
  createdAt?: string;
};

const { sign: jwtSign, verify: jwtVerify } = pkg;

const signOptions: any = {
  issuer: JWT_ISSUER,
  subject: JWT_SUBJECT,
  audience: JWT_AUDIENCE,
  expiresIn: typeof JWT_EXPIRESIN === "string" && !isNaN(Number(JWT_EXPIRESIN))
    ? Number(JWT_EXPIRESIN)
    : JWT_EXPIRESIN, // Convert to number if possible
  algorithm: JWT_ALGORITHM as Algorithm,
};

function sign(payload: Payload): string {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined.");
  }
  return jwtSign({ user: payload }, JWT_SECRET as Secret, signOptions);
}

function verify(token: string): string | pkg.JwtPayload {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined.");
  }
  return jwtVerify(token, JWT_SECRET as Secret, signOptions);
}

export { sign, verify };
