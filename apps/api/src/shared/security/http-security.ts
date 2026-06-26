import type { NextFunction, Request, Response } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const requests = new Map<string, RateLimitEntry>();

export function securityHeaders(_request: Request, response: Response, next: NextFunction): void {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  response.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  next();
}

export function createRateLimit(options: { windowMs: number; max: number }) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = `${request.ip}:${request.method}:${request.path}`;
    const current = requests.get(key);
    if (!current || current.resetAt <= now) {
      requests.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }
    current.count += 1;
    response.setHeader('X-RateLimit-Limit', String(options.max));
    response.setHeader('X-RateLimit-Remaining', String(Math.max(options.max - current.count, 0)));
    response.setHeader('X-RateLimit-Reset', String(Math.ceil(current.resetAt / 1000)));
    if (current.count > options.max) {
      response.status(429).json({ statusCode: 429, message: 'Too many requests' });
      return;
    }
    next();
  };
}
