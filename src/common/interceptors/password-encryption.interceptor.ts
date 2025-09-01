import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class PasswordEncryptionInterceptor implements NestInterceptor {
  private readonly sensitiveFields = ['password', 'newPassword', 'confirmPassword'];

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    
    if (request.body) {
      this.maskSensitiveData(request.body);
    }

    return next.handle();
  }

  private maskSensitiveData(obj: any): void {
    if (typeof obj !== 'object' || obj === null) {
      return;
    }

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (this.sensitiveFields.includes(key) && typeof obj[key] === 'string') {
          // Password field detected - will be encrypted
        } else if (typeof obj[key] === 'object') {
          this.maskSensitiveData(obj[key]);
        }
      }
    }
  }
}
