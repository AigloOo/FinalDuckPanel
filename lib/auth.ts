import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

// Lazy initialization - validate JWT_SECRET only at runtime, not at build time
let SECRET: Uint8Array | null = null;

function getSecret(): Uint8Array {
  if (SECRET) return SECRET;

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    // Dev fallback
    SECRET = new TextEncoder().encode('dev-only-secret-do-not-use-in-production');
  } else {
    SECRET = new TextEncoder().encode(jwtSecret);
  }
  
  return SECRET;
}

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  [key: string]: unknown;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('duck-session')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getSessionFromRequest(req: NextRequest): Promise<JWTPayload | null> {
  const token = req.cookies.get('duck-session')?.value;
  if (!token) return null;
  return verifyToken(token);
}
