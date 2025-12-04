import { Injectable, NotFoundException } from '@nestjs/common';
import { DevicesService } from '../devices/devices.service';
import { Device } from '../devices/device.schema';

@Injectable()
export class CompareService {
  constructor(private readonly devicesService: DevicesService) {}

  async compareDevices(slug1: string, slug2: string): Promise<{ deviceA: Device; deviceB: Device }> {
    const deviceA = await this.devicesService.findBySlug(slug1);
    if (!deviceA) {
      throw new NotFoundException(`Device with slug ${slug1} not found`);
    }

    const deviceB = await this.devicesService.findBySlug(slug2);
    if (!deviceB) {
      throw new NotFoundException(`Device with slug ${slug2} not found`);
    }

    return { deviceA, deviceB };
  }
}
