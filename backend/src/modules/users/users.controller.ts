import { Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Request() req) {
        return this.usersService.findOne(req.user.userId);
    }

    @Post('favorites/:deviceId')
    @UseGuards(JwtAuthGuard)
    async toggleFavorite(@Param('deviceId') deviceId: string, @Request() req) {
        const isFavorited = await this.usersService.toggleFavorite(req.user.userId, deviceId);
        return { isFavorited };
    }

    @Get('favorites')
    @UseGuards(JwtAuthGuard)
    async getFavorites(@Request() req) {
        return this.usersService.getFavorites(req.user.userId);
    }
}
