import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from './project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { TasksService } from '../tasks/tasks.service';
import { TaskDocument } from '../tasks/task.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    private taskService: TasksService,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<any> {
    try {
      const createdProject = new this.projectModel({
        ...createProjectDto,
        managerId: new Types.ObjectId(createProjectDto.managerId),
        developersIds: createProjectDto.developersIds?.map(id => new Types.ObjectId(id)) || [],
      });
      const savedProject = await createdProject.save();
      
      // Transformar el resultado para el frontend
      return this.transformProject(savedProject);
    } catch (error) {
      console.error('Error creating project:', error);
      throw new BadRequestException('Error creating project');
    }
  }

  private transformProject(project: ProjectDocument): any {
    const transformed = project.toObject();
    // Convertir _id a id para facilitar uso en frontend
    transformed.id = transformed._id.toString();
    delete transformed._id;
    delete transformed.__v;
    
    // Convertir ObjectIds a strings para el frontend
    if (transformed.managerId) {
      transformed.managerId = transformed.managerId.toString();
    }
    if (transformed.developersIds) {
      transformed.developersIds = transformed.developersIds.map((id: any) => id.toString());
    }
    
    return transformed;
  }

  private transformProjects(projects: ProjectDocument[]): any[] {
    return projects.map(project => this.transformProject(project));
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status?: string,
    priority?: string,
    managerId?: string,
  ): Promise<{ projects: any[]; total: number; page: number; totalPages: number }> {
    const skip = (page - 1) * limit;
    
    // Construir filtros
    const filters: any = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (managerId) filters.managerId = new Types.ObjectId(managerId);

    const [projects, total] = await Promise.all([
      this.projectModel
        .find(filters)
        .populate('managerId', 'name email role')
        .populate('developersIds', 'name email role')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.projectModel.countDocuments(filters).exec(),
    ]);

    return {
      projects: this.transformProjects(projects),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid project ID');
    }

    const project = await this.projectModel
      .findById(id)
      .populate('managerId', 'name email role avatar')
      .populate('developersIds', 'name email role avatar')
      .exec();

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.transformProject(project);
  }

  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid project ID');
    }

    const updateData: any = { ...updateProjectDto };
    
    // Convertir IDs a ObjectId si están presentes
    if (updateProjectDto.managerId) {
      updateData.managerId = new Types.ObjectId(updateProjectDto.managerId);
    }
    if (updateProjectDto.developersIds) {
      updateData.developersIds = updateProjectDto.developersIds.map(id => new Types.ObjectId(id));
    }

    const updatedProject = await this.projectModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('managerId', 'name email role avatar')
      .populate('developersIds', 'name email role avatar')
      .exec();

    if (!updatedProject) {
      throw new NotFoundException('Project not found');
    }

    return this.transformProject(updatedProject);
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid project ID');
    }

    const deletedProject = await this.projectModel.findByIdAndDelete(id).exec();

    if (!deletedProject) {
      throw new NotFoundException('Project not found');
    }

    return { message: 'Project deleted successfully' };
  }

  // Métodos adicionales útiles
  async getProjectsByManager(managerId: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(managerId)) {
      throw new BadRequestException('Invalid manager ID');
    }

    const projects = await this.projectModel
      .find({ managerId: new Types.ObjectId(managerId) })
      .populate('developersIds', 'name email role')
      .sort({ createdAt: -1 })
      .exec();
      
    return this.transformProjects(projects);
  }

  async getProjectsByDeveloper(developerId: string): Promise<any[]> {
    if (!Types.ObjectId.isValid(developerId)) {
      throw new BadRequestException('Invalid developer ID');
    }

    const projects = await this.projectModel
      .find({ developersIds: new Types.ObjectId(developerId) })
      .populate('managerId', 'name email role')
      .populate('developersIds', 'name email role')
      .sort({ createdAt: -1 })
      .exec();
      
    return this.transformProjects(projects);
  }

  async findAllTasks(id: string): Promise<TaskDocument[]> {
    const tasks = await this.taskService.getTasksByProjectId(id);
    return tasks;
  }
}


