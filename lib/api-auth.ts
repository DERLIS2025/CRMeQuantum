import { authCookieName, decodeSession } from '@/lib/auth';

export function getSessionFromRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie');

  if (!cookieHeader) {
    return null;
  }

  const cookieMap = new Map(
    cookieHeader
      .split(';')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [name, ...rest] = entry.split('=');
        return [name, rest.join('=')];
      }),
  );

  const token = cookieMap.get(authCookieName);

  if (!token) {
    return null;
  }

  return decodeSession(token);
}
