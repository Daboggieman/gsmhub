import { Injectable, NotFoundException } from '@nestjs/common';
import { DevicesService } from '../devices/devices.service';
import { Device } from '../devices/device.schema';

export interface ComparisonRow {
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

        const result = this.analyzeDifference(key, values);
        if (result) {
          row.difference = result.difference;
          row.betterIndex = result.betterIndex;
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

  /** Extract the unit suffix (text after the first number) from a spec value, e.g. "5000 mAh" → "mAh". */
  private extractUnit(val: string): string {
    const match = val?.match(/\d+(?:\.\d+)?\s*(.+)$/);
    if (!match) return '';
    return match[1].replace(/^[,;.\s]+/, '').trim();
  }

  /** Format a number for display: integers without decimals, thousands separators. */
  private formatNumber(n: number): string {
    return Number.isInteger(n) ? n.toLocaleString('en-US') : n.toFixed(1).replace(/\.0$/, '');
  }

  /**
   * Pick the winning device for a spec row and describe the gap.
   * Works for any number of devices; the delta badge only appears for 2.
   */
  private analyzeDifference(key: string, values: string[]): { difference?: string; betterIndex?: number } | null {
    const parsed = values.map(v => this.parseNumericValue(v));

    // WxH values (e.g. "720x1600") compare by total pixel count, not the width alone
    const isResolution = /resolution/i.test(key);
    if (isResolution) {
      for (let i = 0; i < parsed.length; i++) {
        const m = values[i]?.match(/^\s*(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
        if (m) parsed[i] = parseFloat(m[1]) * parseFloat(m[2]);
      }
    }

    if (parsed.some(v => v === null)) return null;
    const numeric = parsed as number[];

    // If all values are equal, there is no winner to show
    if (numeric.every(v => v === numeric[0])) return null;

    const lowKey = key.toLowerCase();
    const higherIsBetter = [
      'size', 'resolution', 'battery', 'ram', 'storage', 'capacity', 'mah', 'hz', 'pixels', 'mp',
    ];
    const lowerIsBetter = [
      'weight', 'thickness', 'nm', 'ms', 'latency',
    ];

    let betterIndex: number | undefined;
    if (higherIsBetter.some(k => lowKey.includes(k))) {
      betterIndex = numeric.indexOf(Math.max(...numeric));
    } else if (lowerIsBetter.some(k => lowKey.includes(k))) {
      betterIndex = numeric.indexOf(Math.min(...numeric));
    }
    if (betterIndex === undefined) return null;

    // For 2 devices, show the absolute gap with the unit from the winning value
    let difference: string | undefined;
    if (values.length === 2) {
      const loser = numeric[1 - betterIndex];
      const delta = Math.abs(numeric[betterIndex] - loser);
      const unit = isResolution ? 'px' : this.extractUnit(values[betterIndex]);
      difference = `+${this.formatNumber(delta)}${unit ? ' ' + unit : ''}`;
    }

    return { difference, betterIndex };
  }

  private parseNumericValue(val: string): number | null {
    if (!val || val === '-') return null;
    // Extract first number found in string (handles "5000 mAh", "6.7 inches", etc.)
    const match = val.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : null;
  }
}
