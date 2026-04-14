import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'eqcrm_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 12; // 12h

type SessionPayload = {
  userId: string;
  organizationId: string;
  email: string;
  role: string;
  exp: number;
};

function getSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error('SESSION_SECRET no está configurado');
  }

  return secret;
}

function sign(payloadBase64: string) {
  return createHmac('sha256', getSecret()).update(payloadBase64).digest('hex');
}

function encodeSession(payload: SessionPayload) {
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = sign(payloadBase64);
  return `${payloadBase64}.${signature}`;
}

export function decodeSession(token: string): SessionPayload | null {
  const [payloadBase64, signature] = token.split('.');

  if (!payloadBase64 || !signature) {
    return null;
  }

  const expected = sign(payloadBase64);

  if (signature.length !== expected.length) {
    return null;
  }

  const valid = timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

  if (!valid) {
    return null;
  }

  const payload = JSON.parse(
    Buffer.from(payloadBase64, 'base64url').toString()
  ) as SessionPayload;

  if (!payload.exp || Date.now() > payload.exp * 1000) {
    return null;
  }

  return payload;
}

export async function createSessionCookie(user: {
  id: string;
  organizationId: string;
  email: string;
  role: string;
}) {
  const payload: SessionPayload = {
    userId: user.id,
    organizationId: user.organizationId,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  };

  const token = encodeSession(payload);

  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function destroySessionCookie() {
  (await cookies()).delete(COOKIE_NAME);
}

export async function getServerSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return decodeSession(token);
}

export const authCookieName = COOKIE_NAME;