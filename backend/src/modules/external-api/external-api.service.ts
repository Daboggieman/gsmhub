import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { DataTransformationService } from './data-transformation.service';

@Injectable()
export class ExternalApiService {
  private readonly logger = new Logger(ExternalApiService.name);
  private readonly rapidApiKey: string;

  // Primary API Config (GSMArena Parser)
  private readonly primaryHost: string;
  private readonly primaryUrl: string;

  // Secondary API Config (Mobile Device Hardware Specs)
  private readonly secondaryHost: string;
  private readonly secondaryUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly transformer: DataTransformationService,
  ) {
    this.transformer = transformer; // Although not strictly necessary with private readonly, helps clarify intent
    this.rapidApiKey = this.configService.get<string>('RAPIDAPI_KEY') || '';

    // Defaults for Primary (GSMArena Parser)
    this.primaryHost = this.configService.get<string>('PRIMARY_API_HOST', 'gsmarenaparser.p.rapidapi.com');
    this.primaryUrl = this.configService.get<string>('PRIMARY_API_URL', 'https://gsmarenaparser.p.rapidapi.com');

    // Defaults for Secondary (Mobile Device Hardware Specs)
    this.secondaryHost = this.configService.get<string>('SECONDARY_API_HOST', 'mobile-device-hardware-specs.p.rapidapi.com');
    this.secondaryUrl = this.configService.get<string>('SECONDARY_API_URL', 'https://mobile-device-hardware-specs.p.rapidapi.com');

    if (!this.rapidApiKey) {
      this.logger.warn('RAPIDAPI_KEY is not set. External API calls will fail.');
    }
  }

  /**
   * General method to make RapidAPI requests
   */
  private async makeRequest(url: string, host: string, params: any = {}): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'X-RapidAPI-Key': this.rapidApiKey,
            'X-RapidAPI-Host': host,
          },
          params,
        })
      );
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      this.logger.error(`Request to ${host} failed: ${status} - ${message}`);
      throw new HttpException(`External API Error: ${message}`, status || HttpStatus.BAD_GATEWAY);
    }
  }

  /**
   * Fetch device specs with fallback strategy
   * Primary: /api/values/getspecs/{brand}/{model}
   * Secondary: /{brand}/{model}
   */
  async fetchDeviceSpecs(brand: string, model: string): Promise<any> {
    // 1. Try Primary API
    try {
      this.logger.log(`Fetching specs for ${brand} ${model} from Primary API...`);
      // Note: Primary API expects clean brand/model names, sometimes case-sensitive or requires spaces?
      // Based on snippet: Xiaomi/RedmiNote3. It seems to remove spaces from model?
      // Let's assume standard encoding first.
      const primaryData = await this.makeRequest(
        `${this.primaryUrl}/api/values/getspecs/${encodeURIComponent(brand)}/${encodeURIComponent(model)}`,
        this.primaryHost
      );
      
      if (primaryData) {
        return this.transformer.transformPrimaryDevice(primaryData, brand, model);
      }
    } catch (primaryError) {
      this.logger.warn(`Primary API failed for ${brand} ${model}. Trying Secondary...`);
    }

    // 2. Try Secondary API
    try {
      this.logger.log(`Fetching specs for ${brand} ${model} from Secondary API...`);
      // Secondary API snippet: Samsung/SamsunggalaxyS23ultra (Brand/BrandModel concatenated?)
      // Snippet URL: .../Samsung/SamsunggalaxyS23ultra.
      // This is tricky. We might need to adjust the model string for the secondary API.
      // For now, passing standard brand/model.
      const secondaryData = await this.makeRequest(
        `${this.secondaryUrl}/${encodeURIComponent(brand)}/${encodeURIComponent(model)}`,
        this.secondaryHost
      );

      if (secondaryData) {
        return this.transformer.transformSecondaryDevice(secondaryData, brand, model);
      }
    } catch (secondaryError) {
      this.logger.error(`Secondary API also failed for ${brand} ${model}.`);
      throw new HttpException('Device not found in any provider', HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Fetch devices by brand with fallback strategy
   * Primary: /api/values/getdevices/{brand}
   * Secondary: /{brand}
   */
  async fetchDevicesByBrand(brand: string): Promise<any[]> {
    // 1. Try Primary API
    try {
      this.logger.log(`Fetching devices for ${brand} from Primary API...`);
      const primaryData = await this.makeRequest(
        `${this.primaryUrl}/api/values/getdevices/${encodeURIComponent(brand)}`,
        this.primaryHost
      );

      if (primaryData) {
         // Primary response is usually a raw list, needs mapping
         return this.transformer.transformPrimaryDeviceList(primaryData, brand);
      }
    } catch (error) {
      this.logger.warn(`Primary API failed for brand ${brand}. Trying Secondary...`);
    }

    // 2. Try Secondary API
    try {
      this.logger.log(`Fetching devices for ${brand} from Secondary API...`);
      const secondaryData = await this.makeRequest(
        `${this.secondaryUrl}/${encodeURIComponent(brand)}`,
        this.secondaryHost
      );

      if (secondaryData) {
         return this.transformer.transformSecondaryDeviceList(secondaryData, brand);
      }
    } catch (error) {
      this.logger.error(`Secondary API also failed for brand ${brand}.`);
      throw new HttpException('Brand devices not found', HttpStatus.NOT_FOUND);
    }
    
    return [];
  }

  /**
   * Fetch all available brands
   */
  async fetchAvailableBrands(): Promise<string[]> {
    // 1. Try Primary API
    try {
      this.logger.log('Fetching available brands from Primary API...');
      const primaryData = await this.makeRequest(
        `${this.primaryUrl}/api/values/availablebrands`,
        this.primaryHost
      );
      if (Array.isArray(primaryData)) {
        return primaryData;
      }
    } catch (error) {
      this.logger.warn('Primary API failed to fetch brands. Trying Secondary...');
    }

    // 2. Try Secondary API
    try {
      this.logger.log('Fetching available brands from Secondary API...');
      const secondaryData = await this.makeRequest(
        `${this.secondaryUrl}/brands`, // Assuming /brands endpoint for secondary
        this.secondaryHost
      );
      // Secondary API response might need mapping if it's not a plain string array
      // 33.txt says "GET: listAllBrands"
      if (Array.isArray(secondaryData)) {
        return secondaryData.map((b: any) => b.brand_name || b.name || b);
      }
    } catch (error) {
      this.logger.error('Failed to fetch brands from all providers.');
    }

    return [];
  }
}