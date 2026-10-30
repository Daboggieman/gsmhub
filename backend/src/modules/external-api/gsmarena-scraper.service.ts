import { Injectable, Logger } from '@nestjs/common';
import { Device, DeviceSpec } from '@shared/types';
import { generateSlug } from '../../common/utils/slug.util';

export interface GsmarenaBrand {
  name: string;
  slug: string; // e.g. "apple-phones-48"
}

export interface GsmarenaDeviceListItem {
  slug: string; // e.g. "apple_iphone_18_pro-14934"
  name: string; // e.g. "iPhone 18 Pro"
  brand: string;
  imageUrl?: string;
}

@Injectable()
export class GsmarenaScraperService {
  private readonly logger = new Logger(GsmarenaScraperService.name);
  private readonly baseUrl = 'https://www.gsmarena.com';
  private readonly userAgent =
    'Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/121.0';

  // Cache brand → device list for the lifetime of the process so deep syncs
  // don't re-scrape the brand page for every device.
  private readonly deviceListCache = new Map<
    string,
    GsmarenaDeviceListItem[]
  >();

  // Rate-limit delays (ms). seedMode skips these for the initial bulk load.
  private readonly BRAND_DELAY = 2000; // between brand pages
  private readonly DEVICE_DELAY = 5000; // between deep-spec fetches

  // Seed mode skips the rate-limit pauses (used by the one-time bulk load).
  public seedMode = false;

  clearCache() {
    this.deviceListCache.clear();
  }

  // ----------------------------------------------------------------
  // Public entry points (called by ExternalApiService)
  // ----------------------------------------------------------------

  async fetchBrands(): Promise<string[]> {
    const brands = await this.scrapeBrands();
    return brands.map((b) => b.name);
  }

  async fetchDevicesByBrand(
    brandName: string,
  ): Promise<GsmarenaDeviceListItem[]> {
    const cacheKey = brandName.toLowerCase();
    if (this.deviceListCache.has(cacheKey)) {
      return this.deviceListCache.get(cacheKey)!;
    }

    const allBrands = await this.scrapeBrands();
    const match = allBrands.find(
      (b) => b.name.toLowerCase() === brandName.toLowerCase(),
    );
    if (!match) {
      this.logger.warn(`GSMArena: brand not found: ${brandName}`);
      return [];
    }

    const devices = await this.scrapeDeviceList(match.slug, brandName);
    this.deviceListCache.set(cacheKey, devices);
    return devices;
  }

  async fetchDeviceSpecs(
    deviceSlug: string,
    brandName: string,
    model: string,
  ): Promise<Partial<Device>> {
    const html = await this.httpGet(`${this.baseUrl}/${deviceSlug}.php`);
    return this.parseDevicePage(html, brandName, model);
  }

  // Resolve "Brand Model" → GSMArena device slug using the brand listing
  // scraped during the current run (cached per brand), then fetch specs.
  async fetchSpecsByModel(
    brandName: string,
    model: string,
  ): Promise<Partial<Device>> {
    const list = await this.fetchDevicesByBrand(brandName);
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const target = norm(model);
    const item =
      list.find((d) => norm(d.name) === target) ||
      list.find((d) => norm(d.name).includes(target)) ||
      list.find((d) => target.includes(norm(d.name)));
    if (!item) {
      throw new Error(`Device not found on GSMArena: ${brandName} ${model}`);
    }
    return this.fetchDeviceSpecs(item.slug, brandName, model);
  }

  // ----------------------------------------------------------------
  // 1. Brand list — https://www.gsmarena.com/makers.php3
  // ----------------------------------------------------------------

  async scrapeBrands(): Promise<GsmarenaBrand[]> {
    const html = await this.httpGet(`${this.baseUrl}/makers.php3`);
    const brands: GsmarenaBrand[] = [];

    // <a href=apple-phones-48.php>Apple<br><span>153 devices</span></a>
    const brandRegex =
      /<a href="?([^"\s>]+)-phones-(\d+)\.php"?>\s*([^<]+?)\s*<br>/g;
    let match: RegExpExecArray | null;
    while ((match = brandRegex.exec(html)) !== null) {
      brands.push({
        name: match[3].trim(),
        slug: `${match[1]}-phones-${match[2]}`,
      });
    }

    this.logger.log(`GSMArena: scraped ${brands.length} brands`);
    return brands;
  }

  // ----------------------------------------------------------------
  // 2. Device list for a brand — https://www.gsmarena.com/{brandSlug}.php
  //    (paginated via ?page=N when >1 page)
  // ----------------------------------------------------------------

  async scrapeDeviceList(
    brandSlug: string,
    brandName: string,
  ): Promise<GsmarenaDeviceListItem[]> {
    const devices: GsmarenaDeviceListItem[] = [];
    let url = `${this.baseUrl}/${brandSlug}.php`;

    for (let page = 0; page < 50; page++) {
      const html = await this.httpGet(url);
      devices.push(...this.parseDeviceListPage(html, brandName));

      // GSMArena paginates with a "►" prevnextbutton link (title="Next page")
      const nextPageHref = nextPageLink(html);
      if (!nextPageHref) break;
      url = `${this.baseUrl}/${nextPageHref}`;

      // Rate-limit: pause between listing pages. Seed mode uses a shorter
      // pause — zero delay gets the whole scraper 429-blocked within minutes.
      if (!this.seedMode) {
        await this.sleep(this.BRAND_DELAY);
      } else {
        await this.sleep(1000);
      }
    }

    this.logger.debug(
      `GSMArena: scraped ${devices.length} devices for "${brandName}"`,
    );
    return devices;
  }

  // One listing page: <li><a href="slug.php"><img src=... title="..."><strong><span>Name</span>
  // (img src may be quoted or unquoted in GSMArena's HTML)
  parseDeviceListPage(
    html: string,
    brandName: string,
  ): GsmarenaDeviceListItem[] {
    const devices: GsmarenaDeviceListItem[] = [];
    const deviceRegex =
      /<li><a href="([^"]+\.php)"><img src=(?:"([^"]*)"|(\S+?))\s+title="[^"]*"[^>]*><strong><span>([^<]*)<\/span>/g;
    let match: RegExpExecArray | null;
    while ((match = deviceRegex.exec(html)) !== null) {
      const href = match[1].replace(/\.php$/, '');
      const rawImg = match[2] || match[3] || '';
      const imageUrl = rawImg
        ? rawImg.startsWith('//')
          ? `https:${rawImg}`
          : rawImg
        : undefined;
      devices.push({
        slug: href,
        name: match[4].trim(),
        brand: brandName,
        imageUrl,
      });
    }
    return devices;
  }

  // ----------------------------------------------------------------
  // 3. Device detail page → Partial<Device>
  // ----------------------------------------------------------------

  parseDevicePage(
    html: string,
    brandName: string,
    model: string,
  ): Partial<Device> {
    const nameMatch = html.match(
      /<h1 class="specs-phone-name-title[^"]*"[^>]*>([^<]+)<\/h1>/,
    );
    const name = nameMatch
      ? nameMatch[1].trim()
      : `${brandName} ${model}`.trim();

    const imgMatch = html.match(
      /class="specs-photo-main"[\s\S]*?src=("|')?([^"'\s>]+)/,
    );
    const imageUrl = imgMatch
      ? imgMatch[2].startsWith('//')
        ? `https:${imgMatch[2]}`
        : imgMatch[2]
      : undefined;

    const specs = this.parseSpecTables(html);

    const getSpec = (key: string): string | undefined => {
      const s = specs.find((x) => x.key === key);
      return s?.value || undefined;
    };

    const slug = generateSlug(name);

    return {
      slug,
      name,
      brand: brandName,
      model,
      category: brandName,
      imageUrl,
      description: getSpec('comment') || undefined,
      releaseDate: getSpec('year') || undefined,
      dimension: getSpec('dimensions') || undefined,
      weight: getSpec('weight') || undefined,
      os: getSpec('os') || undefined,
      displaySize: getSpec('displaysize') || undefined,
      storage: getSpec('internalmemory')?.split(',')[0] || undefined,
      ram: getSpec('internalmemory')?.match(/(\d+)\s*GB RAM/)?.[0] || undefined,
      battery: getSpec('batdescription1') || undefined,
      chipset: getSpec('chipset') || undefined,
      mainCamera: getSpec('cam1modules') || undefined,
      selfieCamera: getSpec('cam2modules') || undefined,
      videoResolution: getSpec('cam1video') || undefined,
      colors: getSpec('colors') || undefined,
      networkTechnology: getSpec('nettech') || undefined,
      specs,
    };
  }

  // Each spec section is its own <table> with a single <th> header (the
  // category) followed by rows of <td class="ttl"> (label) and
  // <td class="nfo" data-spec="key"> (value).
  parseSpecTables(html: string): DeviceSpec[] {
    const specs: DeviceSpec[] = [];

    const tables = html.match(/<table[^>]*>([\s\S]*?)<\/table>/g) || [];
    for (const table of tables) {
      const thMatch = table.match(/<th[^>]*>([^<]+)<\/th>/);
      if (!thMatch) continue;
      const category = thMatch[1].trim();

      const cellRegex =
        /<td[^>]*class="nfo"[^>]*data-spec="([^"]*)"[^>]*>([\s\S]*?)<\/td>/g;
      let cell: RegExpExecArray | null;
      while ((cell = cellRegex.exec(table)) !== null) {
        const key = cell[1];
        // strip tags, collapse whitespace, convert middot list separators
        const value = cell[2]
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&thinsp;/g, ' ')
          .replace(/&#8364;/g, 'EUR ')
          .replace(/&#163;/g, 'GBP')
          .replace(/&#8377;/g, 'INR')
          .replace(/&Prime;/g, '"')
          .replace(/\s+/g, ' ')
          .replace(/·\s*/g, ' | ')
          .trim();

        if (key && value) {
          specs.push({ category, key, value });
        }
      }
    }

    return specs;
  }

  // ----------------------------------------------------------------
  // HTTP helper (native fetch, no extra deps)
  // ----------------------------------------------------------------

  private async httpGet(url: string): Promise<string> {
    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const res = await fetch(url, {
        headers: {
          'User-Agent': this.userAgent,
          Accept: 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: AbortSignal.timeout(20_000),
      });
      if (res.status === 429) {
        const retryAfter =
          Number(res.headers.get('retry-after')) || 30 * attempt;
        this.logger.warn(
          `GSMArena 429 for ${url} — backing off ${retryAfter}s (attempt ${attempt}/${maxAttempts})`,
        );
        await this.sleep(retryAfter * 1000);
        continue;
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} for ${url}`);
      }
      return res.text();
    }
    throw new Error(
      `HTTP 429 persisted for ${url} after ${maxAttempts} attempts`,
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Helper: find the "next page" link on brand listing pages
function nextPageLink(html: string): string | null {
  // <a href="samsung-phones-f-9-0-p2.php" class="prevnextbutton" title="Next page">►</a>
  const m = html.match(
    /<a href="([^"]*?)"[^>]*class="prevnextbutton"[^>]*title="Next page"/,
  );
  return m ? m[1] : null;
}
