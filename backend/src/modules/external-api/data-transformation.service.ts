import { Injectable } from '@nestjs/common';
import { Device, DeviceSpec, DeviceType } from '../../../../shared/src/types';
import { generateSlug } from '../../common/utils/slug.util';

@Injectable()
export class DataTransformationService {

  // --- SHARED HELPER ---

  private addDynamicSpecs(data: any, specs: DeviceSpec[], knownKeys: Set<string>) {
    Object.keys(data).forEach(key => {
      if (knownKeys.has(key)) return;

      const value = data[key];
      if (value === null || value === undefined || value === '') return;

      // Skip internal IDs or weird API metadata
      if (key === 'id' || key === 'slug' || key === '_id') return;

      let category = 'General';
      const lowerKey = key.toLowerCase();

      // Intelligent Categorization based on key name
      if (lowerKey.includes('camera') || lowerKey.includes('video') || lowerKey.includes('photo')) category = 'Camera';
      else if (lowerKey.includes('display') || lowerKey.includes('screen') || lowerKey.includes('resolution')) category = 'Display';
      else if (lowerKey.includes('battery') || lowerKey.includes('charge') || lowerKey.includes('charging')) category = 'Battery';
      else if (lowerKey.includes('cpu') || lowerKey.includes('gpu') || lowerKey.includes('chipset') || lowerKey.includes('processor')) category = 'Platform';
      else if (lowerKey.includes('memory') || lowerKey.includes('storage') || lowerKey.includes('ram') || lowerKey.includes('card')) category = 'Memory';
      else if (lowerKey.includes('sound') || lowerKey.includes('audio') || lowerKey.includes('jack') || lowerKey.includes('speaker')) category = 'Sound';
      else if (lowerKey.includes('network') || lowerKey.includes('wifi') || lowerKey.includes('bluetooth') || lowerKey.includes('gps') || lowerKey.includes('nfc') || lowerKey.includes('radio') || lowerKey.includes('usb')) category = 'Comms';
      else if (lowerKey.includes('sensor')) category = 'Features';
      else if (lowerKey.includes('body') || lowerKey.includes('dimension') || lowerKey.includes('weight') || lowerKey.includes('sim') || lowerKey.includes('build')) category = 'Body';

      // Format the Key (camelCase to Title Case)
      const formattedKey = key
        .replace(/([A-Z])/g, ' $1') // insert space before caps
        .replace(/^./, str => str.toUpperCase()); // capitalize first letter

      // Handle Objects (flatten them) or Arrays
      if (typeof value === 'object') {
        specs.push({ category, key: formattedKey, value: JSON.stringify(value).replace(/[{"}]/g, '').replace(/,/g, ', ') });
      } else {
        specs.push({ category, key: formattedKey, value: String(value) });
      }
    });
  }


  // --- PRIMARY API TRANSFORMERS (GSMArena Parser - 11.txt) ---

  transformPrimaryDevice(data: any, brand: string, model: string): Partial<Device> {
    const specs: DeviceSpec[] = [];
    const knownKeys = new Set<string>();

    const addSpec = (category: string, key: string, value: any, originalKey?: string) => {
      if (value) {
        specs.push({ category, key, value: String(value) });
        if (originalKey) knownKeys.add(originalKey);
      }
    };

    // 1. Explicit Mappings (High Precision)
    addSpec('Platform', 'Chipset', data.chipset, 'chipset');
    addSpec('Platform', 'CPU', data.cpu, 'cpu');
    addSpec('Platform', 'GPU', data.gpu, 'gpu');
    addSpec('Platform', 'OS', data.androidVersion ? `Android ${data.androidVersion}` : null, 'androidVersion');

    addSpec('Display', 'Size', data.displaySize, 'displaySize');
    addSpec('Display', 'Resolution', data.displayResolution, 'displayResolution');
    addSpec('Display', 'Type', data.displayType, 'displayType');

    addSpec('Memory', 'Internal', data.internal, 'internal');

    addSpec('Main Camera', 'Specs', data.mainCameraSpecs, 'mainCameraSpecs');
    addSpec('Main Camera', 'Features', data.mainCameraFeatures, 'mainCameraFeatures');
    addSpec('Main Camera', 'Video', data.mainVideoSpecs, 'mainVideoSpecs');

    addSpec('Selfie Camera', 'Specs', data.selfieCameraSpecs, 'selfieCameraSpecs');
    addSpec('Selfie Camera', 'Features', data.selfieCameraFeatures, 'selfieCameraFeatures');
    addSpec('Selfie Camera', 'Video', data.selfieVideoSpecs, 'selfieVideoSpecs');

    addSpec('Battery', 'Capacity', data.battery, 'battery');
    addSpec('Features', 'Sensors', data.sensors, 'sensors');

    // Mark other known top-level fields to skip in dynamic loop
    knownKeys.add('manufacturer');
    knownKeys.add('model');
    knownKeys.add('id');
    knownKeys.add('_id');

    // 2. Dynamic Mapping for everything else
    this.addDynamicSpecs(data, specs, knownKeys);

    return {
      model: data.model || model,
      brand: data.manufacturer || brand,
      slug: generateSlug(`${data.manufacturer || brand} ${data.model || model}`),
      imageUrl: data.img || data.image || '',
      type: DeviceType.PHONE,
      specs: specs,
      isActive: true,

      // Top-level fields
      os: data.androidVersion ? `Android ${data.androidVersion}` : '',
      storage: this.extractStorage(data.internal),
      storageValue: this.extractStorageValue(data.internal),
      ram: this.extractRam(data.internal),
      ramValue: this.extractRamValue(data.internal),
      displaySize: data.displaySize,
      displaySizeValue: this.extractDisplaySizeValue(data.displaySize),
      chipset: data.chipset,
      battery: data.battery,
      batteryValue: this.extractBatteryValue(data.battery),
      name: `${data.manufacturer || brand} ${data.model || model}`,
    };
  }

  transformPrimaryDeviceList(data: any[], brand: string): Partial<Device>[] {
    if (!Array.isArray(data)) return [];

    return data.map(item => ({
      model: item.model,
      brand: item.manufacturer || brand,
      slug: generateSlug(`${item.manufacturer || brand} ${item.model}`),
      type: DeviceType.PHONE,
      isActive: true,
      specs: [],
      os: item.androidVersion ? `Android ${item.androidVersion}` : '',
      chipset: item.chipset,
    }));
  }


  // --- SECONDARY API TRANSFORMERS (Mobile Device Hardware Specs - 33.txt) ---

  transformSecondaryDevice(data: any, brand: string, model: string): Partial<Device> {
    const specs: DeviceSpec[] = [];
    const knownKeys = new Set<string>();

    const addSpec = (category: string, key: string, value: any, originalKey?: string) => {
      if (value) {
        specs.push({ category, key, value: String(value) });
        if (originalKey) knownKeys.add(originalKey);
      }
    };

    addSpec('Body', 'Dimensions', data.dimensions, 'dimensions');
    addSpec('Body', 'Weight', data.weight, 'weight');
    addSpec('Display', 'Type', data.displayType, 'displayType');
    addSpec('Display', 'Size', data.displaySize, 'displaySize');
    addSpec('Display', 'Resolution', data.resolution, 'resolution');
    addSpec('Platform', 'Chipset', data.chipset, 'chipset');
    addSpec('Platform', 'CPU', data.cpu, 'cpu');
    addSpec('Platform', 'GPU', data.gpu, 'gpu');
    addSpec('Main Camera', 'Specs', data.mainCamera, 'mainCamera');
    addSpec('Selfie Camera', 'Specs', data.selfieCamera, 'selfieCamera');
    addSpec('Battery', 'Type', data.batteryType, 'batteryType');
    addSpec('Misc', 'Colors', data.colors, 'colors');

    knownKeys.add('name');
    knownKeys.add('brand');

    // 2. Dynamic Mapping
    this.addDynamicSpecs(data, specs, knownKeys);

    return {
      model: data.name || model,
      brand: brand,
      slug: generateSlug(data.name || `${brand} ${model}`),
      imageUrl: '',
      type: DeviceType.PHONE,
      specs: specs,
      isActive: true,

      dimension: data.dimensions,
      weight: data.weight,
      displaySize: data.displaySize,
      displaySizeValue: this.extractDisplaySizeValue(data.displaySize),
      chipset: data.chipset,
      battery: data.batteryType,
      batteryValue: this.extractBatteryValue(data.batteryType),
      name: data.name || `${brand} ${model}`,
    };
  }

  transformSecondaryDeviceList(data: any[], brand: string): Partial<Device>[] {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      model: item.name || item,
      brand: brand,
      slug: generateSlug(`${brand} ${item.name || item}`),
      type: DeviceType.PHONE,
      isActive: true,
      specs: [],
    }));
  }

  // --- UTILS ---

  private extractRam(internalString: string): string {
    if (!internalString) return '';
    const match = internalString.match(/(\d+\s*GB)\s*RAM/i);
    return match ? match[1] : '';
  }

  private extractStorage(internalString: string): string {
    if (!internalString) return '';
    const match = internalString.match(/^(\d+\s*(?:GB|TB|MB))/i);
    return match ? match[1] : '';
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
}