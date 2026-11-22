import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Optional,
} from '@nestjs/common';
import type { Request, Response } from 'express';

export const RATE_LIMITER_OPTIONS = Symbol('RATE_LIMITER_OPTIONS');

export interface IRateLimiterOptions {
  ttlMs: number;
  max: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private readonly store = new Map<string, RateLimitEntry>();
  private readonly ttlMs: number;
  private readonly max: number;

  constructor(
    @Optional()
    @Inject(RATE_LIMITER_OPTIONS)
    options?: IRateLimiterOptions,
  ) {
    const envTtl = Number(process.env.RATE_LIMIT_TTL_MS ?? 60_000);
    const envMax = Number(process.env.RATE_LIMIT_MAX ?? 100);

    this.ttlMs = options?.ttlMs ?? (Number.isFinite(envTtl) ? envTtl : 60_000);
    this.max = options?.max ?? (Number.isFinite(envMax) ? envMax : 100);
  }

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();

    const now = Date.now();
    this.pruneExpiredEntries(now);

    const clientKey = this.resolveClientKey(req);
    const existing = this.store.get(clientKey);

    let entry: RateLimitEntry;
    if (!existing || existing.resetAt <= now) {
      entry = { count: 1, resetAt: now + this.ttlMs };
      this.store.set(clientKey, entry);
    } else {
      existing.count += 1;
      entry = existing;
    }

    const remaining = Math.max(0, this.max - entry.count);
    const resetSeconds = Math.ceil(entry.resetAt / 1000);

    res.setHeader('X-RateLimit-Limit', String(this.max));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(resetSeconds));

    if (entry.count > this.max) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((entry.resetAt - now) / 1000),
      );
      res.setHeader('Retry-After', String(retryAfterSeconds));
      throw new HttpException(
        {
          success: false,
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests, please try again later.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private resolveClientKey(req: Request): string {
    return req.ip ?? req.socket?.remoteAddress ?? 'unknown';
  }

  private pruneExpiredEntries(now: number): void {
    if (this.store.size <= 1000) {
      return;
    }

    for (const [key, entry] of this.store.entries()) {
      if (entry.resetAt <= now) {
        this.store.delete(key);
      }
    }
  }
}