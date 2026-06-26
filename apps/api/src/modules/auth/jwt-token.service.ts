import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

function base64UrlEncode(value: string): string {
  return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

@Injectable()
export class JwtTokenService {
  constructor(private readonly config: ConfigService) {}

  sign(payload: Omit<AccessTokenPayload, 'iat' | 'exp'>): string {
    const now = Math.floor(Date.now() / 1000);
    const ttlSeconds = this.config.get<number>('security.jwtExpiresInSeconds') ?? 3600;
    const fullPayload: AccessTokenPayload = {
      ...payload,
      iat: now,
      exp: now + ttlSeconds,
    };
    const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = base64UrlEncode(JSON.stringify(fullPayload));
    const signature = this.signPart(`${header}.${body}`);
    return `${header}.${body}.${signature}`;
  }

  verify(token: string): AccessTokenPayload {
    const parts = token.split('.');
    if (parts.length !== 3) throw new UnauthorizedException('Invalid token');
    const [header, body, signature] = parts;
    const expected = this.signPart(`${header}.${body}`);
    if (!this.safeEquals(signature, expected)) throw new UnauthorizedException('Invalid token');
    const payload = JSON.parse(base64UrlDecode(body)) as AccessTokenPayload;
    if (!payload.sub || !payload.email || !payload.exp) throw new UnauthorizedException('Invalid token');
    if (payload.exp < Math.floor(Date.now() / 1000)) throw new UnauthorizedException('Token expired');
    return payload;
  }

  private signPart(value: string): string {
    const secret = this.config.get<string>('security.jwtSecret');
    if (!secret || secret.length < 32) throw new Error('JWT_SECRET must be at least 32 characters');
    return createHmac('sha256', secret).update(value).digest('base64url');
  }

  private safeEquals(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    if (leftBuffer.length !== rightBuffer.length) return false;
    return timingSafeEqual(leftBuffer, rightBuffer);
  }
}
