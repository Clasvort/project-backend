import { BadRequestException, Injectable, NotFoundException, Param } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument } from './task.schema';
import { Model, Types } from 'mongoose';

@Injectable()
export class TasksService {
    constructor(
        @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    ) { }

    private transformTask(task: TaskDocument): any {
        const transformed = task.toObject();
        // Convertir _id a id para facilitar uso en frontend
        transformed.id = transformed._id.toString();
        delete transformed._id;
        delete transformed.__v;
        
        // Convertir ObjectIds a strings
        if (transformed.projectId) {
            transformed.projectId = transformed.projectId.toString();
        }
        if (transformed.assignedTo) {
            transformed.assignedTo = transformed.assignedTo.toString();
        }
        
        return transformed;
    }

    private transformTasks(tasks: TaskDocument[]): any[] {
        return tasks.map(task => this.transformTask(task));
    }

    async createTask(id: string, createTaskDto: CreateTaskDto): Promise<any> {
        const createdTask = new this.taskModel(createTaskDto);
        createdTask.projectId = new Types.ObjectId(id);
        const savedTask = await createdTask.save();
        return this.transformTask(savedTask);
    }

    findAll(): Promise<any[]> {
        return this.taskModel.find().exec().then(tasks => this.transformTasks(tasks));
    }

    async findOne(id: string): Promise<any> {
        const task = await this.taskModel.findById(id).exec();
        if (!task) {
            throw new NotFoundException('Task not found');
        }
        return this.transformTask(task);
    }

    async update(id: string, updateTaskDto: UpdateTaskDto): Promise<any> {
        const updatedTask = await this.taskModel
        .findByIdAndUpdate(id, updateTaskDto, { new: true }).exec();
        if (!updatedTask) {
            throw new NotFoundException('Task not found');
        }
        return this.transformTask(updatedTask);
    }

    async remove(id: string): Promise<{ message: string }> {
        try {
            const deletedTask = await this.taskModel.findByIdAndDelete(id).exec();
            if (!deletedTask) {
                throw new NotFoundException('Task not found');
            }

            return { message: 'Task deleted successfully' };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new BadRequestException('Invalid task ID');
        }
    }

    async getTasksByProjectId(projectId: string): Promise<any[]> {
        const tasks = await this.taskModel.find({ projectId: new Types.ObjectId(projectId) }).exec();
        return this.transformTasks(tasks);
    }
}
