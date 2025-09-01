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
  DefaultValuePipe,
  ParseBoolPipe,
  Patch
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUsersDto } from './dto/filter-users.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UserRole } from '../schemas/enums';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('role') role?: string,
    @Query('isActive', new DefaultValuePipe(undefined)) isActive?: string,
  ) {
    const isActiveBoolean = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.usersService.findAll(page, limit, role, isActiveBoolean);
  }

  @Get('filtered')
  async findAllFiltered(@Query(ValidationPipe) filterDto: FilterUsersDto) {
    return this.usersService.findAllPaginated(filterDto);
  }

  @Post()
  @UseGuards(AdminGuard)
  @Roles(UserRole.ADMIN)
  async create(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('search')
  async searchUsers(@Query('q') query: string) {
    return this.usersService.searchUsers(query);
  }

  @Get('developers')
  async getDevelopers() {
    return this.usersService.getDevelopers();
  }

  @Get('managers')
  async getManagers() {
    return this.usersService.getManagers();
  }

  @Get('role/:role')
  async getUsersByRole(@Param('role') role: string) {
    return this.usersService.getUsersByRole(role);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    return this.usersService.toggleUserStatus(id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
