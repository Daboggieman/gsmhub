import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { DevicesService } from './modules/devices/devices.service';
import { CategoriesService } from './modules/categories/categories.service';
import { SearchService } from './modules/search/search.service';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { Roles } from './modules/auth/decorators/roles.decorator';
import { UserRole } from './modules/users/schemas/user.schema';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly devicesService: DevicesService,
    private readonly categoriesService: CategoriesService,
    private readonly searchService: SearchService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getAdminStats() {
    const [devicesCount, categoriesCount, totalViews, topDevices, topSearches] = await Promise.all([
      this.devicesService.getAllDevices({ limit: 1 }).then(res => res.total),
      this.categoriesService.count(),
      this.devicesService.getTotalViews(),
      this.devicesService.getPopularDevices(5),
      this.searchService.getPopularQueries(5),
    ]);
    
    return {
      devicesCount,
      categoriesCount,
      totalViews,
      topDevices,
      topSearches,
    };
  }
}
