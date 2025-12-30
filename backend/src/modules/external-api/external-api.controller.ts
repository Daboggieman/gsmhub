import { Controller, Post, Param, UseGuards, UnauthorizedException } from '@nestjs/common';
import { SyncService } from './sync.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('external-api')
export class ExternalApiController {
  constructor(private readonly syncService: SyncService) {}

  @Post('sync/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async syncAll() {
    // Fire and forget or await? 
    // Awaiting might timeout the request if there are many available brands.
    // just run it in background and return a message.
    this.syncService.fullSync().catch(err => {
      console.error('Manual Full Sync Failed:', err);
    });
    return { message: 'Full sync started in background' };
  }

  @Post('sync/brand/:brand')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async syncBrand(@Param('brand') brand: string) {
    await (this.syncService as any).fetchAndSavePhonesByBrand([brand]);
    return { message: `Sync completed for brand: ${brand}` };
  }
}
