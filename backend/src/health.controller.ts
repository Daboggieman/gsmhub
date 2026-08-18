import { Controller, Get, HttpCode, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get('live')
  @HttpCode(200)
  live() {
    return { status: 'ok', uptime: process.uptime() };
  }

  @Get('ready')
  @HttpCode(200)
  ready() {
    if (this.connection.readyState !== 1) {
      throw new ServiceUnavailableException({ status: 'not_ready', database: 'unavailable' });
    }
    return { status: 'ok', database: 'connected' };
  }

  @Get()
  check() {
    return this.ready();
  }
}
