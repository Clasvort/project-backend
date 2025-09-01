import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { DatabaseModule } from './database/database.module';
import { TasksModule } from './tasks/tasks.module';
import { RolesGuard } from './auth/guards/roles.guard';

@Module({
  imports: [AuthModule, UsersModule, ProjectsModule, DatabaseModule, TasksModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Temporarily disabled sanitize middleware due to compatibility issues
    // consumer
    //   .apply(SanitizeMiddleware)
    //   .forRoutes('*');
  }
}
