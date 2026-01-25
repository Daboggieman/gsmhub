import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { DataTransformationService } from './data-transformation.service';

@Injectable()
export class ExternalApiService {
  private readonly logger = new Logger(ExternalApiService.name);
  private readonly rapidApiKey: string;

  private readonly primaryHost: string;
  private readonly primaryUrl: string;

  private readonly secondaryHost: string;
  private readonly secondaryUrl: string;

  private readonly tertiaryHost: string;
  private readonly tertiaryUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly transformer: DataTransformationService,
  ) {
    this.rapidApiKey = this.configService.get<string>('RAPIDAPI_KEY') || '';

    this.primaryHost = this.configService.get<string>(
      'PRIMARY_API_HOST',
      'phone-specs-explorer-api.p.rapidapi.com',
    );
    this.primaryUrl = this.configService.get<string>(
      'PRIMARY_API_URL',
      'https://phone-specs-explorer-api.p.rapidapi.com',
    );

    this.secondaryHost = this.configService.get<string>(
      'SECONDARY_API_HOST',
      'gsmarenaparser.p.rapidapi.com',
    );
    this.secondaryUrl = this.configService.get<string>(
      'SECONDARY_API_URL',
      'https://gsmarenaparser.p.rapidapi.com',
    );

    this.tertiaryHost = this.configService.get<string>(
      'TERTIARY_API_HOST',
      'mobile-phones2.p.rapidapi.com',
    );
    this.tertiaryUrl = this.configService.get<string>(
      'TERTIARY_API_URL',
      'https://mobile-phones2.p.rapidapi.com',
    );

    if (!this.rapidApiKey) {
      this.logger.warn(
        'RAPIDAPI_KEY is not set. External API calls will fail.',
      );
    }
  }

  private async makeRequest(
    url: string,
    host: string,
    params: any = {},
  ): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, {
          headers: {
            'X-RapidAPI-Key': this.rapidApiKey,
            'X-RapidAPI-Host': host,
          },
          params,
        }),
      );
      return response.data;
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      this.logger.error(`Request to ${host} failed: ${status} - ${message}`);
      throw new HttpException(
        `External API Error from ${host}: ${message}`,
        status || HttpStatus.BAD_GATEWAY,
      );
    }
  }

  // --- FETCH BRANDS ---

  async fetchAvailableBrands(
    providers: string[] = ['primary', 'secondary', 'tertiary'],
  ): Promise<string[]> {
    const allBrandsSet = new Set<string>();

    if (providers.includes('primary')) {
      try {
        const data = await this.makeRequest(
          `${this.primaryUrl}/api/values/availablebrands`,
          this.primaryHost,
        );
        if (Array.isArray(data)) data.forEach((b) => allBrandsSet.add(b));
      } catch (e) {
        this.logger.warn(`Primary brand fetch failed: ${e.message}`);
      }
    }

    if (providers.includes('secondary')) {
      try {
        const data = await this.makeRequest(
          `${this.secondaryUrl}/2162/get+brands`,
          this.secondaryHost,
        );
        const brands = data?.data || [];
        brands.forEach((b: any) => {
          const name = b.name || (typeof b === 'string' ? b : '');
          if (name && name.trim() !== '') {
            allBrandsSet.add(name);
          }
        });
      } catch (e) {
        this.logger.warn(`Secondary brand fetch failed: ${e.message}`);
      }
    }

    if (providers.includes('tertiary')) {
      try {
        const data = await this.makeRequest(
          `${this.tertiaryUrl}/brands`,
          this.tertiaryHost,
        );
        const brands = Array.isArray(data) ? data : data?.data || [];
        brands.forEach((b: any) => {
          const name = b.name || (typeof b === 'string' ? b : '');
          if (name && name.trim() !== '') {
            allBrandsSet.add(name);
          }
        });
      } catch (e) {
        this.logger.warn(`Tertiary brand fetch failed: ${e.message}`);
      }
    }

    return Array.from(allBrandsSet);
  }

  // --- FETCH DEVICES BY BRAND ---

  async fetchDevicesByBrand(
    brandName: string,
    providers: string[] = ['primary', 'secondary', 'tertiary'],
  ): Promise<any[]> {
    let results: any[] = [];

    if (providers.includes('primary')) {
      try {
        const data = await this.makeRequest(
          `${this.primaryUrl}/api/values/getdevices/${encodeURIComponent(brandName)}`,
          this.primaryHost,
        );
        results = this.transformer.transformPrimaryDeviceList(data, brandName);
        if (results.length > 0) return results;
      } catch (e) {
        this.logger.warn(
          `Primary device list fetch failed for ${brandName}: ${e.message}`,
        );
      }
    }

    if (providers.includes('secondary')) {
      try {
        // Find Brand ID first
        const brands = await this.makeRequest(
          `${this.secondaryUrl}/2162/get+brands`,
          this.secondaryHost,
        );
        const brand = brands?.data?.find(
          (b: any) => b.name.toLowerCase() === brandName.toLowerCase(),
        );
        if (brand) {
          const data = await this.makeRequest(
            `${this.secondaryUrl}/2163/get+phone+by+brand`,
            this.secondaryHost,
            { brand_id: brand.id },
          );
          results = this.transformer.transformSecondaryDeviceList(
            data,
            brandName,
          );
          if (results.length > 0) return results;
        }
      } catch (e) {
        this.logger.warn(
          `Secondary device list fetch failed for ${brandName}: ${e.message}`,
        );
      }
    }

    if (providers.includes('tertiary')) {
      try {
        const brands = await this.makeRequest(
          `${this.tertiaryUrl}/brands`,
          this.tertiaryHost,
        );
        const brand = brands?.find(
          (b: any) => b.name?.toLowerCase() === brandName.toLowerCase(),
        );
        if (brand?.id) {
          const data = await this.makeRequest(
            `${this.tertiaryUrl}/${brand.id}/phones`,
            this.tertiaryHost,
          );
          results = this.transformer.transformTertiaryDeviceList(
            data,
            brandName,
          );
          if (results.length > 0) return results;
        }
      } catch (e) {
        this.logger.warn(
          `Tertiary device list fetch failed for ${brandName}: ${e.message}`,
        );
      }
    }

    return results;
  }

  // --- FETCH DEVICE SPECS ---

  async fetchDeviceSpecs(
    brand: string,
    model: string,
    providers: string[] = ['primary', 'secondary', 'tertiary'],
  ): Promise<any> {
    if (providers.includes('primary')) {
      try {
        const data = await this.makeRequest(
          `${this.primaryUrl}/api/values/getspecs/${encodeURIComponent(brand)}/${encodeURIComponent(model)}`,
          this.primaryHost,
        );
        if (data)
          return this.transformer.transformPrimaryDevice(data, brand, model);
      } catch (e) {
        this.logger.warn(
          `Primary specs fetch failed for ${brand} ${model}: ${e.message}`,
        );
      }
    }

    if (providers.includes('secondary')) {
      try {
        // Search for phone ID first (or try slugified format)
        const phoneId = `${brand.toLowerCase()}_${model.toLowerCase().replace(/\s+/g, '_')}`;
        const data = await this.makeRequest(
          `${this.secondaryUrl}/2164/get+phone+details`,
          this.secondaryHost,
          { phone_id: phoneId },
        );
        if (data?.success)
          return this.transformer.transformSecondaryDevice(data, brand, model);
      } catch (e) {
        this.logger.warn(
          `Secondary specs fetch failed for ${brand} ${model}: ${e.message}`,
        );
      }
    }

    if (providers.includes('tertiary')) {
      try {
        // Mobile Phones2 search mapping
        const searchResults = await this.makeRequest(
          `${this.tertiaryUrl}/search`,
          this.tertiaryHost,
          { q: `${brand} ${model}` },
        );
        const match = Array.isArray(searchResults)
          ? searchResults.find((r) =>
              r.phone_name?.toLowerCase().includes(model.toLowerCase()),
            )
          : null;
        const phoneId =
          match?.id ||
          `${brand.toLowerCase()}_${model.toLowerCase().replace(/\s+/g, '_')}`;

        const data = await this.makeRequest(
          `${this.tertiaryUrl}/phones/${phoneId}`,
          this.tertiaryHost,
        );
        if (data)
          return this.transformer.transformTertiaryDevice(data, brand, model);
      } catch (e) {
        this.logger.warn(
          `Tertiary specs fetch failed for ${brand} ${model}: ${e.message}`,
        );
      }
    }

    throw new HttpException(
      'Device specifications not found in any selected provider',
      HttpStatus.NOT_FOUND,
    );
  }
}
