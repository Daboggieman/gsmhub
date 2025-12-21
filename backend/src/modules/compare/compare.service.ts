import { Injectable, NotFoundException } from '@nestjs/common';
import { DevicesService } from '../devices/devices.service';
import { Device } from '../devices/device.schema';

interface ComparisonRow {
  item: string;
  category: string;
  values: string[];
  difference?: string;
  betterIndex?: number;
}

@Injectable()
export class CompareService {
  constructor(private readonly devicesService: DevicesService) {}

  async compareDevices(slug1: string, slug2: string): Promise<{ deviceA: Device; deviceB: Device }> {
    const deviceA = await this.devicesService.findBySlug(slug1);
    const deviceB = await this.devicesService.findBySlug(slug2);
    
    if (!deviceA) throw new NotFoundException(`Device with slug ${slug1} not found`);
    if (!deviceB) throw new NotFoundException(`Device with slug ${slug2} not found`);

    return { deviceA, deviceB };
  }

  async getDetailedComparison(slugs: string[]) {
    const devices = await Promise.all(
      slugs.map(async (slug) => {
        const device = await this.devicesService.findBySlug(slug);
        if (!device) throw new NotFoundException(`Device with slug ${slug} not found`);
        return device;
      })
    );

    // Extract all unique categories and keys
    const allSpecs: { [category: string]: Set<string> } = {};
    devices.forEach(device => {
      device.specs.forEach(spec => {
        if (!allSpecs[spec.category]) {
          allSpecs[spec.category] = new Set<string>();
        }
        allSpecs[spec.category].add(spec.key);
      });
    });

    const comparison: ComparisonRow[] = [];

    Object.keys(allSpecs).forEach(category => {
      allSpecs[category].forEach(key => {
        const values = devices.map(device => {
          const spec = device.specs.find(s => s.category === category && s.key === key);
          return spec ? spec.value : '-';
        });

        const row: ComparisonRow = {
          category,
          item: key,
          values,
        };

        // If exactly 2 devices, calculate difference and better
        if (devices.length === 2) {
          const result = this.analyzeDifference(key, values[0], values[1]);
          if (result) {
            row.difference = result.difference;
            row.betterIndex = result.betterIndex;
          }
        }

        comparison.push(row);
      });
    });

    return {
      devices: devices.map(d => ({
        name: d.name,
        brand: d.brand,
        model: d.model,
        slug: d.slug,
        imageUrl: d.imageUrl,
        latestPrice: (d as any).latestPrice
      })),
      comparison
    };
  }

  private analyzeDifference(key: string, valA: string, valB: string): { difference: string; betterIndex?: number } | null {
    const numA = this.parseNumericValue(valA);
    const numB = this.parseNumericValue(valB);

    if (numA === null || numB === null) return null;

    const diff = numB - numA;
    const diffStr = diff > 0 ? `+${diff.toFixed(1)}` : diff.toFixed(1);

    // Determine which is better based on the spec key
    let betterIndex: number | undefined;
    
    const higherIsBetter = [
      'size', 'resolution', 'battery', 'ram', 'storage', 'capacity', 'mah', 'hz', 'pixels', 'mp'
    ];
    const lowerIsBetter = [
      'weight', 'thickness', 'thickness', 'nm', 'ms', 'latency'
    ];

    const lowKey = key.toLowerCase();
    
    if (higherIsBetter.some(k => lowKey.includes(k))) {
      if (diff > 0) betterIndex = 1;
      else if (diff < 0) betterIndex = 0;
    } else if (lowerIsBetter.some(k => lowKey.includes(k))) {
      if (diff < 0) betterIndex = 1;
      else if (diff > 0) betterIndex = 0;
    }

    return { difference: diffStr, betterIndex };
  }

  private parseNumericValue(val: string): number | null {
    if (!val || val === '-') return null;
    // Extract first number found in string (handles "5000 mAh", "6.7 inches", etc.)
    const match = val.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  }
}