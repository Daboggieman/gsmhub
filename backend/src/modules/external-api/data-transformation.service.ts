import { Injectable } from '@nestjs/common';
import { Device, DeviceSpec, DeviceType } from '../../../../shared/src/types';
import { generateSlug } from '../../common/utils/slug.util';

@Injectable()
export class DataTransformationService {
  // --- SHARED HELPER ---

  private addDynamicSpecs(
    data: any,
    specs: DeviceSpec[],
    knownKeys: Set<string>,
  ) {
    Object.keys(data).forEach((key) => {
      if (knownKeys.has(key)) return;

      const value = data[key];
      if (value === null || value === undefined || value === '') return;

      // Skip internal IDs or weird API metadata
      if (key === 'id' || key === 'slug' || key === '_id') return;

      let category = 'General';
      const lowerKey = key.toLowerCase();

      // Intelligent Categorization based on key name
      if (
        lowerKey.includes('camera') ||
        lowerKey.includes('video') ||
        lowerKey.includes('photo')
      )
        category = 'Camera';
      else if (
        lowerKey.includes('display') ||
        lowerKey.includes('screen') ||
        lowerKey.includes('resolution')
      )
        category = 'Display';
      else if (
        lowerKey.includes('battery') ||
        lowerKey.includes('charge') ||
        lowerKey.includes('charging')
      )
        category = 'Battery';
      else if (
        lowerKey.includes('cpu') ||
        lowerKey.includes('gpu') ||
        lowerKey.includes('chipset') ||
        lowerKey.includes('processor')
      )
        category = 'Platform';
      else if (
        lowerKey.includes('memory') ||
        lowerKey.includes('storage') ||
        lowerKey.includes('ram') ||
        lowerKey.includes('card')
      )
        category = 'Memory';
      else if (
        lowerKey.includes('sound') ||
        lowerKey.includes('audio') ||
        lowerKey.includes('jack') ||
        lowerKey.includes('speaker')
      )
        category = 'Sound';
      else if (
        lowerKey.includes('network') ||
        lowerKey.includes('wifi') ||
        lowerKey.includes('bluetooth') ||
        lowerKey.includes('gps') ||
        lowerKey.includes('nfc') ||
        lowerKey.includes('radio') ||
        lowerKey.includes('usb')
      )
        category = 'Comms';
      else if (lowerKey.includes('sensor')) category = 'Features';
      else if (lowerKey.includes('color') || lowerKey.includes('colour')) category = 'Misc';
      else if (
        lowerKey.includes('body') ||
        lowerKey.includes('dimension') ||
        lowerKey.includes('weight') ||
        lowerKey.includes('sim') ||
        lowerKey.includes('build')
      )
        category = 'Body';

      // Format the Key (camelCase to Title Case)
      const formattedKey = key
        .replace(/([A-Z])/g, ' $1') // insert space before caps
        .replace(/^./, (str) => str.toUpperCase()); // capitalize first letter

      // Handle Objects (flatten them) or Arrays
      if (typeof value === 'object') {
        specs.push({
          category,
          key: formattedKey,
          value: JSON.stringify(value)
            .replace(/[{"}]/g, '')
            .replace(/,/g, ', '),
        });
      } else {
        specs.push({ category, key: formattedKey, value: String(value) });
      }
    });
  }

  // --- PRIMARY API TRANSFORMERS (Phone Specs Explorer - 11.txt) ---

  transformPrimaryDevice(
    data: any,
    brand: string,
    model: string,
  ): Partial<Device> {
    const specs: DeviceSpec[] = [];
    const knownKeys = new Set<string>();

    const addSpec = (
      category: string,
      key: string,
      value: any,
      originalKey?: string,
    ) => {
      if (value && value !== ' ') {
        specs.push({ category, key, value: String(value) });
        if (originalKey) knownKeys.add(originalKey);
      }
    };

    const details = data.data || data;
    // Providers return either nested GSMA-style payloads or a flat device object.
    // Normalize the flat form into the same spotlight fields used below.
    if (!details.spotlight) {
      details.spotlight = {
        chipset: details.chipset,
        os: details.androidVersion ? `Android ${details.androidVersion}` : details.os,
        display_size: details.displaySize,
        display_resolution: details.displayResolution,
        battery_size: details.battery,
        ram: this.extractRam(details.internal || details.ram || ''),
      };
    }

    // 1. Process "spotlight"
    if (details.spotlight) {
      const s = details.spotlight;
      addSpec('Display', 'Size', s.display_size, 'display_size');
      addSpec(
        'Display',
        'Resolution',
        s.display_resolution,
        'display_resolution',
      );
      addSpec('Camera', 'Pixels', s.camera_pixels, 'camera_pixels');
      addSpec('Platform', 'Chipset', s.chipset, 'chipset');
      addSpec('Battery', 'Size', s.battery_size, 'battery_size');
      addSpec('Memory', 'RAM', s.ram, 'ram');
      addSpec('Platform', 'OS', s.os, 'os');
      addSpec('Launch', 'Release Date', s.releaseDate, 'releaseDate');
    }

    // 2. Process "all_specs"
    if (details.all_specs) {
      Object.keys(details.all_specs).forEach((category) => {
        const catArray = details.all_specs[category];
        if (Array.isArray(catArray)) {
          catArray.forEach((item) => {
            if (item.title && item.title.trim() && item.info) {
              specs.push({
                category: category.charAt(0).toUpperCase() + category.slice(1),
                key: item.title,
                value: item.info,
              });
            }
          });
        }
      });
    }

    knownKeys.add('spotlight');
    knownKeys.add('all_specs');
    knownKeys.add('phoneName');
    knownKeys.add('brandName');
    knownKeys.add('image_url');
    knownKeys.add('phone_model');
    knownKeys.add('brand_name');
    knownKeys.add('model');
    knownKeys.add('manufacturer');

    // Dynamic loop for remainder
    this.addDynamicSpecs(details, specs, knownKeys);

    return {
      model: details.phone_model || model,
      brand: details.brand_name || brand,
      slug: generateSlug(details.phone_model || `${brand} ${model}`),
      imageUrl: details.image_url || details.img || details.image || '',
      type: DeviceType.PHONE,
      specs: specs,
      isActive: true,

      displaySize: details.spotlight?.display_size || '',
      chipset: details.spotlight?.chipset,
      battery: details.spotlight?.battery_size,
      os: details.spotlight?.os,
      ram: details.spotlight?.ram || this.extractRam(details.internal || ''),
      storage: this.extractStorage(details.internal || ''),
      name: details.phone_model || `${brand} ${model}`,
    };
  }

  transformPrimaryDeviceList(data: any, brand: string): Partial<Device>[] {
    const list = Array.isArray(data) ? data : data?.data || [];
    return list.map((item: any) => ({
      model: item.phone_model || item.phoneName || item.name,
      brand: item.brand_name || brand,
      slug: generateSlug(item.phone_model || `${brand} ${item.phone_model}`),
      type: DeviceType.PHONE,
      isActive: true,
      specs: [],
      imageUrl: item.image_url || '',
    }));
  }

  // --- SECONDARY API TRANSFORMERS (GSMArena Parser) ---

  transformSecondaryDevice(
    data: any,
    brand: string,
    model: string,
  ): Partial<Device> {
    const specs: DeviceSpec[] = [];
    const knownKeys = new Set<string>();

    const addSpec = (
      category: string,
      key: string,
      value: any,
      originalKey?: string,
    ) => {
      if (value) {
        specs.push({ category, key, value: String(value) });
        if (originalKey) knownKeys.add(originalKey);
      }
    };

    addSpec('Platform', 'Chipset', data.chipset, 'chipset');
    addSpec('Platform', 'CPU', data.cpu, 'cpu');
    addSpec('Platform', 'GPU', data.gpu, 'gpu');
    addSpec(
      'Platform',
      'OS',
      data.androidVersion ? `Android ${data.androidVersion}` : null,
      'androidVersion',
    );
    addSpec('Display', 'Size', data.displaySize, 'displaySize');
    addSpec(
      'Display',
      'Resolution',
      data.displayResolution,
      'displayResolution',
    );
    addSpec('Display', 'Type', data.displayType, 'displayType');
    addSpec('Memory', 'Internal', data.internal, 'internal');
    addSpec('Main Camera', 'Specs', data.mainCameraSpecs, 'mainCameraSpecs');
    addSpec('Battery', 'Capacity', data.battery || data.batteryType, 'battery');

    knownKeys.add('manufacturer');
    knownKeys.add('model');
    knownKeys.add('id');
    knownKeys.add('_id');

    this.addDynamicSpecs(data, specs, knownKeys);

    return {
      model: data.model || model,
      brand: data.manufacturer || brand,
      slug: generateSlug(
        `${data.manufacturer || brand} ${data.model || model}`,
      ),
      imageUrl: data.img || data.image || '',
      type: DeviceType.PHONE,
      specs: specs,
      isActive: true,
      os: data.androidVersion ? `Android ${data.androidVersion}` : '',
      displaySize: data.displaySize,
      chipset: data.chipset,
      battery: data.battery || data.batteryType,
      dimension: data.dimension || data.dimensions,
      name: `${data.manufacturer || brand} ${data.model || model}`,
    };
  }

  private extractRam(value: string): string {
    const match = String(value || '').match(/(\d+(?:\.\d+)?\s*(?:GB|TB|MB))\s*RAM/i);
    return match?.[1] || '';
  }

  private extractStorage(value: string): string {
    const match = String(value || '').match(/\b\d+(?:\.\d+)?\s*(?:TB|GB|MB)\b/i);
    return match?.[0] || '';
  }

  transformSecondaryDeviceList(data: any[], brand: string): Partial<Device>[] {
    if (!Array.isArray(data)) return [];
    return data.map((item) => ({
      model: item.model,
      brand: item.manufacturer || brand,
      slug: generateSlug(`${item.manufacturer || brand} ${item.model}`),
      type: DeviceType.PHONE,
      isActive: true,
      specs: [],
      chipset: item.chipset,
    }));
  }

  // --- TERTIARY API TRANSFORMERS (Mobile Phones2 - 44.txt) ---

  transformTertiaryDevice(
    data: any,
    brand: string,
    model: string,
  ): Partial<Device> {
    const specs: DeviceSpec[] = [];
    const knownKeys = new Set<string>();

    const addSpec = (
      category: string,
      key: string,
      value: any,
      originalKey?: string,
    ) => {
      if (value && value !== ' ') {
        specs.push({ category, key, value: String(value) });
        if (originalKey) knownKeys.add(originalKey);
      }
    };

    if (data.spotlight) {
      const s = data.spotlight;
      addSpec('Display', 'Size', s.display_size, 'display_size');
      addSpec(
        'Display',
        'Resolution',
        s.display_resolution,
        'display_resolution',
      );
      addSpec('Camera', 'Pixels', s.camera_pixels, 'camera_pixels');
      addSpec('Platform', 'Chipset', s.chipset, 'chipset');
      addSpec('Battery', 'Size', s.battery_size, 'battery_size');
      addSpec('Memory', 'RAM', s.ram_size, 'ram_size');
      addSpec('Platform', 'OS', s.os, 'os');
    }

    if (data.all_specs) {
      Object.keys(data.all_specs).forEach((category) => {
        const catArray = data.all_specs[category];
        if (Array.isArray(catArray)) {
          catArray.forEach((item) => {
            if (item.title && item.title.trim() && item.info) {
              specs.push({
                category,
                key: item.title,
                value: item.info,
              });
            }
          });
        }
      });
    }

    knownKeys.add('spotlight');
    knownKeys.add('all_specs');
    knownKeys.add('phoneName');
    knownKeys.add('brandName');

    this.addDynamicSpecs(data, specs, knownKeys);

    return {
      model: data.phoneName || model,
      brand: data.brandName || brand,
      slug: generateSlug(data.phoneName || `${brand} ${model}`),
      imageUrl: data.phoneImage || data.image_url || '',
      type: DeviceType.PHONE,
      specs: specs,
      isActive: true,
      displaySize: data.spotlight?.display_size || '',
      chipset: data.spotlight?.chipset || '',
      battery: data.spotlight?.battery_size || '',
      name: data.phoneName || `${brand} ${model}`,
    };
  }

  transformTertiaryDeviceList(data: any, brand: string): Partial<Device>[] {
    const list = Array.isArray(data) ? data : data?.data || [];
    return list.map((item: any) => ({
      model: item.phone_name || item.name || item.phoneName || item,
      brand: item.brand_name || brand,
      slug: generateSlug(
        `${item.brand_name || brand} ${item.phone_name || item.name || item.phoneName || item}`,
      ),
      type: DeviceType.PHONE,
      isActive: true,
      specs: [],
      imageUrl: item.image_url || item.image || '',
    }));
  }

  // --- UTILS ---

  private extractRamValue(internalString: string): number {
    if (!internalString) return 0;
    const match = internalString.match(/(\d+)\s*GB\s*RAM/i);
    return match ? parseInt(match[1]) : 0;
  }

  private extractBatteryValue(batteryString: string): number {
    if (!batteryString) return 0;
    const match = batteryString.match(/(\d+)\s*mAh/i);
    return match ? parseInt(match[1]) : 0;
  }

  private extractDisplaySizeValue(displayString: string): number {
    if (!displayString) return 0;
    const match = displayString.match(/(\d+(\.\d+)?)\s*inches/i);
    return match ? parseFloat(match[1]) : 0;
  }

  private extractStorageValue(internalString: string): number {
    if (!internalString) return 0;
    const match = internalString.match(/(\d+)\s*(GB|TB|MB)/i);
    if (!match) return 0;
    let val = parseInt(match[1]);
    const unit = match[2].toUpperCase();
    if (unit === 'TB') val *= 1024;
    if (unit === 'MB') val /= 1024;
    return val;
  }
}
