import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SanitizeMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Sanitize request body
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }

    // Sanitize URL parameters
    if (req.params) {
      req.params = this.sanitizeObject(req.params);
    }

    // For query parameters, we'll sanitize them in-place without reassigning
    if (req.query) {
      this.sanitizeQueryInPlace(req.query);
    }

    next();
  }

  private sanitizeQueryInPlace(query: any): void {
    for (const key in query) {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        if (typeof query[key] === 'string') {
          query[key] = this.sanitizeValue(query[key]);
        } else if (Array.isArray(query[key])) {
          query[key] = query[key].map((item: any) => 
            typeof item === 'string' ? this.sanitizeValue(item) : item
          );
        }
      }
    }
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return this.sanitizeValue(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = this.sanitizeValue(key);
      sanitized[sanitizedKey] = this.sanitizeObject(value);
    }

    return sanitized;
  }

  private sanitizeValue(value: any): any {
    if (typeof value !== 'string') {
      return value;
    }

    // Remove HTML tags
    value = value.replace(/<[^>]*>/g, '');
    
    // Remove potentially dangerous characters
    value = value.replace(/[<>\"'%;()&+]/g, '');
    
    // Trim whitespace
    value = value.trim();

    return value;
  }
}
