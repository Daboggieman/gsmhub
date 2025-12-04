import { Injectable } from '@nestjs/common';
import {
  Brand,
  PhoneListItem,
  PhoneSpec,
  SpecDetail,
  SearchResultPhone,
  LatestPhone,
  TopByInterestPhone,
  TopByFansPhone
} from '@modules/external-api/dto/gsmarena.dto';
import { Device, DeviceSpec, DeviceType, Category as SharedCategory } from '@shared/types';
import { generateSlug } from '../../common/utils/slug.util'; // Our slug utility

@Injectable()
export class DataTransformationService {

  // Transforms an external API Brand to an internal Brand structure
  transformBrand(externalBrand: Brand): { name: string; slug: string; deviceCount: number } {
    return {
      name: externalBrand.brand_name,
      slug: externalBrand.brand_slug,
      deviceCount: parseInt(externalBrand.device_count, 10),
      // Add other relevant fields if needed
    };
  }

  // Transforms an external API PhoneListItem to an internal Device structure
  transformPhoneListItemToDevice(phoneListItem: PhoneListItem): Partial<Device> {
    const slug = generateSlug(phoneListItem.phone_name);
    return {
      model: phoneListItem.phone_name,
      slug: slug,
      brand: phoneListItem.brand,
      imageUrl: phoneListItem.image, // Assuming this is a primary image
      // Other fields will be filled by detailed spec
      type: DeviceType.PHONE, // Default to phone for now
      views: 0, // Default views
      isActive: true, // Default active status
      specs: [], // Initialize specs
      category: '', // Category will be set later
    };
  }

  // Transforms an external API SearchResultPhone to an internal Device structure
  transformSearchResultToDevice(searchResult: SearchResultPhone): Partial<Device> {
    const slug = generateSlug(searchResult.phone_name);
    return {
      model: searchResult.phone_name,
      slug: slug,
      imageUrl: searchResult.image,
      // Brand is often missing in search results, can be set later
      type: DeviceType.PHONE,
      views: 0,
      isActive: true,
      specs: [],
      category: '',
    };
  }

  // Transforms an external API LatestPhone to an internal Device structure
  transformLatestPhoneToDevice(latestPhone: LatestPhone): Partial<Device> {
    const slug = generateSlug(latestPhone.phone_name);
    return {
      model: latestPhone.phone_name,
      slug: slug,
      imageUrl: latestPhone.image,
      type: DeviceType.PHONE,
      views: 0,
      isActive: true,
      specs: [],
      category: '',
    };
  }

  // Transforms an external API TopByInterestPhone to an internal Device structure
  transformTopByInterestToDevice(topPhone: TopByInterestPhone): Partial<Device> {
    const slug = generateSlug(topPhone.phone_name);
    return {
      model: topPhone.phone_name,
      slug: slug,
      imageUrl: topPhone.image,
      views: parseInt(topPhone.hits, 10),
      type: DeviceType.PHONE,
      isActive: true,
      specs: [],
      category: '',
    };
  }

  // Transforms an external API TopByFansPhone to an internal Device structure
  transformTopByFansToDevice(topPhone: TopByFansPhone): Partial<Device> {
    const slug = generateSlug(topPhone.phone_name);
    return {
      model: topPhone.phone_name,
      slug: slug,
      imageUrl: topPhone.image,
      // fans is not directly mapped to Device schema, could be stored in specs or a separate field if needed.
      // For now, let's just include the other required fields.
      type: DeviceType.PHONE,
      views: 0,
      isActive: true,
      specs: [],
      category: '',
    };
  }


  // Normalizes an external API PhoneSpec to an internal Device structure
  normalizePhoneSpec(phoneSpec: PhoneSpec): Partial<Device> {
    const device: Partial<Device> = {
      model: phoneSpec.phone_name,
      slug: generateSlug(phoneSpec.phone_name),
      brand: phoneSpec.brand,
      description: '', // Can be extracted from specs if available
      imageUrl: phoneSpec.thumbnail, // Using thumbnail as primary image
      // images: phoneSpec.phone_images, // If we want to store multiple images
      releaseDate: phoneSpec.release_date,
      dimension: phoneSpec.dimension,
      os: phoneSpec.os,
      storage: this.standardizeStorage(phoneSpec.storage),
      displaySize: this.extractDisplaySize(phoneSpec.spec_detail),
      ram: this.extractRAM(phoneSpec.spec_detail),
      battery: this.extractBattery(phoneSpec.spec_detail),
      specs: this.transformSpecDetails(phoneSpec.spec_detail),
      type: DeviceType.PHONE, // Default to phone, can be refined
      views: 0, // Default views
      isActive: true, // Default active status
      category: '', // Category will be set later
    };

    return device;
  }

  private transformSpecDetails(specDetails: SpecDetail[]): DeviceSpec[] {
    const transformedSpecs: DeviceSpec[] = [];
    specDetails.forEach(specCategory => {
      specCategory.specs.forEach(specItem => {
        transformedSpecs.push({
          category: specCategory.title,
          key: specItem.key,
          value: specItem.val.join(', '), // Join array values into a single string
        });
      });
    });
    return transformedSpecs;
  }

  private standardizeStorage(storage: string): string {
    // Example: "128GB 6GB RAM" -> "128GB"
    const match = storage.match(/(\d+\s*GB)/i);
    return match ? match[0] : storage;
  }

  private extractDisplaySize(specDetails: SpecDetail[]): string {
    const displaySpec = specDetails.find(cat => cat.title === 'Display');
    if (displaySpec) {
      const sizeItem = displaySpec.specs.find(item => item.key === 'Size');
      if (sizeItem) {
        // Example: "6.7 inches, 109.8 cm2 (~87.4% screen-to-body ratio)" -> "6.7 inches"
        const match = sizeItem.val[0].match(/([\d.]+\s*inches)/i);
        return match ? match[0] : sizeItem.val[0];
      }
    }
    return 'N/A';
  }

  private extractRAM(specDetails: SpecDetail[]): string {
    const memorySpec = specDetails.find(cat => cat.title === 'Memory');
    if (memorySpec) {
      const internalMemory = memorySpec.specs.find(item => item.key === 'Internal');

      let ram = 'N/A';
      if (internalMemory && internalMemory.val.length > 0) {
        // Example: "128GB 6GB RAM, 256GB 8GB RAM"
        const ramMatches = internalMemory.val[0].match(/(\d+\s*GB\s*RAM)/i);
        if (ramMatches) {
          ram = ramMatches[0];
        }
      }
      return ram;
    }
    return 'N/A';
  }

  private extractBattery(specDetails: SpecDetail[]): string {
    const batterySpec = specDetails.find(cat => cat.title === 'Battery');
    if (batterySpec) {
      const typeItem = batterySpec.specs.find(item => item.key === 'Type');
      if (typeItem) {
        return typeItem.val[0];
      }
    }
    return 'N/A';
  }
}