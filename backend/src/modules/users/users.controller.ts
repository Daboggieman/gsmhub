import {
  Controller, Get, Post, Patch, Delete, Param, Body,
  Query, UseGuards, Req, ForbiddenException, BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './schemas/user.schema';
import { plainToInstance } from 'class-transformer';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
    const limitNum = Number.isFinite(Number(limit)) && Number(limit) > 0
      ? Math.min(Number(limit), 50) : 10;
    const { users, total } = await this.usersService.findAll({
      page: pageNum,
      limit: limitNum,
      search,
    });
    return {
      users: plainToInstance(UserResponseDto, users.map(toResponse), { excludeExtraneousValues: true }),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return plainToInstance(UserResponseDto, toResponse(user), { excludeExtraneousValues: true });
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: any) {
    // Prevent demoting or deactivating yourself
    if (id === req.user.userId) {
      if (updateUserDto.isActive === false) {
        throw new ForbiddenException('Cannot deactivate your own account');
      }
      if (updateUserDto.role && updateUserDto.role !== UserRole.ADMIN) {
        throw new ForbiddenException('Cannot change your own role');
      }
    }
    const user = await this.usersService.update(id, updateUserDto);
    if (!user) throw new BadRequestException('User not found');
    return plainToInstance(UserResponseDto, toResponse(user), { excludeExtraneousValues: true });
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    if (id === req.user.userId) {
      throw new ForbiddenException('Cannot delete your own account');
    }
    await this.usersService.remove(id);
    return { success: true };
  }
}

/** Map a user document to the response shape (Mongo `_id` → `id`, password stripped). */
function toResponse(user: any) {
  const { _id, password, ...rest } = user;
  return { id: _id?.toString?.() ?? _id, ...rest };
}
