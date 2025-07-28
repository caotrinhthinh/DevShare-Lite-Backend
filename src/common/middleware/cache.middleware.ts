/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable, NestMiddleware, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CacheMiddleware implements NestMiddleware {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Không cache các method khác GET
    if (req.method !== 'GET') return next();

    const cacheKey = req.originalUrl;
    const cachedResponse = await this.cacheManager.get(cacheKey);

    if (cachedResponse) {
      return res.json(cachedResponse); // Trả về cache nếu có
    }

    // Ghi đè res.json để lưu vào cache sau khi controller xử lý xong
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalJson = res.json.bind(res);
    res.json = (body: any): Response => {
      this.cacheManager.set(cacheKey, body, 300).catch((err) => {
        console.error('Cache set error:', err);
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return originalJson(body);
    };

    next(); // QUAN TRỌNG: tiếp tục request
  }
}
