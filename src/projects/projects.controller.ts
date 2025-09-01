import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ValidationPipe,
  ParseIntPipe,
  DefaultValuePipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, ParamsCreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CreateTaskDto } from 'src/tasks/dto/create-task.dto';
import { TasksService } from '../tasks/tasks.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('projects')
@UseGuards(AuthGuard('jwt'))
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService,
    private taskService: TasksService) { }

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('managerId') managerId?: string,
  ) {
    return this.projectsService.findAll(page, limit, status, priority, managerId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Body() ParamsCreateProjectDto: any,
    @GetUser() user: any
  ) {
    try {
      const payload = ParamsCreateProjectDto;
      payload.managerId = user.id;
      return await this.projectsService.create(payload as CreateProjectDto);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }



  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }
  @Get(':id/tasks')
  async findTasks(@Param('id') id: string) {
    return this.projectsService.findAllTasks(id);
  }

  @Post(':id/tasks')
  async createTask(@Param('id') id: string, @Body() createTaskDto: CreateTaskDto) {

    return this.taskService.createTask(id, createTaskDto);
  }
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateProjectDto: UpdateProjectDto
  ) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }

  // Rutas adicionales útiles
  @Get('manager/:managerId')
  async getProjectsByManager(@Param('managerId') managerId: string) {
    return this.projectsService.getProjectsByManager(managerId);
  }

  @Get('developer/:developerId')
  async getProjectsByDeveloper(@Param('developerId') developerId: string) {
    return this.projectsService.getProjectsByDeveloper(developerId);
  }
}
