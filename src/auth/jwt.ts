export interface TokenInfo {
  userId: string;
  roles: string[]; // không gồm tiền tố ROLE_
  authorities: string[];
  exp: number;
}

function decodeBase64Url(part: string): string {
  const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  return decodeURIComponent(
    Array.from(bin, (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''),
  );
}

/** identity-service ghi `sub` = userId và `scope` = "ROLE_ADMIN, PERM_A, ...". */
export function parseToken(token: string | null): TokenInfo | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(decodeBase64Url(token.split('.')[1])) as {
      sub: string;
      scope?: string;
      exp: number;
    };
    const authorities = (payload.scope ?? '').split(/[\s,]+/).filter(Boolean);
    return {
      userId: payload.sub,
      authorities,
      roles: authorities.filter((a) => a.startsWith('ROLE_')).map((a) => a.slice(5)),
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}
