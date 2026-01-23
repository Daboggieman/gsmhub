import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
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
  async syncAll(
    @Body() options: { providers?: string[]; forceUpdate?: boolean },
  ) {
    this.syncService.fullSync(options).catch((err) => {
      console.error('Manual Full Sync Failed:', err);
    });
    return { message: 'Full sync started in background' };
  }

  @Post('sync/brand/:brand')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async syncBrand(
    @Param('brand') brand: string,
    @Body() options: { providers?: string[]; forceUpdate?: boolean },
  ) {
    await this.syncService.fetchAndSavePhonesByBrand([brand], true, options);
    return { message: `Deep sync completed for brand: ${brand}` };
  }
}
