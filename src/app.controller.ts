import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: 'API is running successfully',
      version: '1.0.0',
      endpoints: {
        auth: '/api/v1/auth',
        users: '/api/v1/users',
        projects: '/api/v1/projects',
        tasks: '/api/v1/tasks'
      }
    };
  }

  @Get('endpoints')
  getEndpoints() {
    return {
      message: 'Available API Endpoints',
      baseUrl: 'http://localhost:3004/api/v1',
      authentication: {
        register: 'POST /auth/register',
        login: 'POST /auth/login',
        refresh: 'POST /auth/refresh',
        logout: 'POST /auth/logout',
        profile: 'GET /auth/profile'
      },
      users: {
        list: 'GET /users',
        filtered: 'GET /users/filtered',
        create: 'POST /users (Admin only)',
        search: 'GET /users/search',
        getById: 'GET /users/:id',
        update: 'PUT /users/:id',
        delete: 'DELETE /users/:id'
      },
      projects: {
        list: 'GET /projects',
        create: 'POST /projects',
        getById: 'GET /projects/:id',
        update: 'PUT /projects/:id',
        delete: 'DELETE /projects/:id'
      },
      tasks: {
        list: 'GET /tasks',
        getById: 'GET /tasks/:id',
        update: 'PUT /tasks/:id',
        delete: 'DELETE /tasks/:id'
      },
      notes: [
        'Most endpoints require JWT authentication via Bearer token',
        'Use POST /auth/login to get access token',
        'Admin endpoints require ADMIN role',
        'All endpoints have validation and error handling'
      ]
    };
  }
}
