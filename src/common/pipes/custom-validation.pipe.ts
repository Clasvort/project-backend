import {
  ValidationPipe,
  BadRequestException,
  ValidationError,
} from '@nestjs/common';

export class CustomValidationPipe extends ValidationPipe {
  constructor() {
    super({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error for non-whitelisted properties
      transform: true, // Transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Enable implicit type conversion
      },
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const errors = this.formatErrors(validationErrors);
        return new BadRequestException({
          message: 'Validation failed',
          errors,
          statusCode: 400,
        });
      },
    });
  }

  private formatErrors(validationErrors: ValidationError[]): any {
    const errors = {};
    
    validationErrors.forEach((error) => {
      const property = error.property;
      const constraints = error.constraints;
      
      if (constraints) {
        errors[property] = Object.values(constraints);
      }
      
      // Handle nested validation errors
      if (error.children && error.children.length > 0) {
        errors[property] = this.formatErrors(error.children);
      }
    });
    
    return errors;
  }
}
