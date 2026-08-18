import { Controller, Get, UseGuards, Optional } from '@nestjs/common';
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
    @Optional() private readonly devicesService: DevicesService,
    @Optional() private readonly categoriesService: CategoriesService,
    @Optional() private readonly searchService: SearchService,
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
    
    // Mock Revenue Data (Placeholder until real integrations)
    const revenueData = [
      { name: 'Jan', revenue: 4000, ads: 2400 },
      { name: 'Feb', revenue: 3000, ads: 1398 },
      { name: 'Mar', revenue: 2000, ads: 9800 },
      { name: 'Apr', revenue: 2780, ads: 3908 },
      { name: 'May', revenue: 1890, ads: 4800 },
      { name: 'Jun', revenue: 2390, ads: 3800 },
      { name: 'Jul', revenue: 3490, ads: 4300 },
    ];

    const affiliatePerformance = [
      { name: 'Jumia', value: 400 },
      { name: 'Amazon', value: 300 },
      { name: 'Konga', value: 300 },
      { name: 'Slot', value: 200 },
    ];
    
    return {
      devicesCount,
      categoriesCount,
      totalViews,
      topDevices,
      topSearches,
      revenueData,
      affiliatePerformance,
    };
  }
}
