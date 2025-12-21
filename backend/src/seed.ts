import { connect, disconnect } from 'mongoose';
import { config } from 'dotenv';
import { Device, DeviceSchema } from './modules/devices/device.schema';
import { Category, CategorySchema } from './modules/devices/../categories/category.schema';
import * as mongoose from 'mongoose';

config();

const MONGO_URI = process.env.MONGO_URI;

const seedData = [
  {
    slug: 'apple-iphone-14-pro',
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    name: 'Apple iPhone 14 Pro',
    category: 'Smartphones',
    imageUrl: 'https://placehold.co/600x400/2d2d2d/ffffff?text=iPhone+14+Pro',
    specs: [
      { category: 'Network', key: 'Technology', value: 'GSM / CDMA / HSPA / EVDO / LTE / 5G' },
      { category: 'Launch', key: 'Announced', value: '2022, September 07' },
      { category: 'Launch', key: 'Status', value: 'Available. Released 2022, September 16' },
      { category: 'Body', key: 'Dimensions', value: '147.5 x 71.5 x 7.9 mm (5.81 x 2.81 x 0.31 in)' },
      { category: 'Body', key: 'Weight', value: '206 g (7.27 oz)' },
      { category: 'Display', key: 'Type', value: 'LTPO Super Retina XDR OLED, 120Hz, HDR10, Dolby Vision' },
      { category: 'Display', key: 'Size', value: '6.1 inches, 91.7 cm2 (~87.0% screen-to-body ratio)' },
      { category: 'Platform', key: 'OS', value: 'iOS 16, upgradable to iOS 17.1.1' },
      { category: 'Platform', key: 'Chipset', value: 'Apple A16 Bionic (4 nm)' },
      { category: 'Memory', key: 'Internal', value: '128GB 6GB RAM, 256GB 6GB RAM, 512GB 6GB RAM, 1TB 6GB RAM' },
      { category: 'Main Camera', key: 'Triple', value: '48 MP (wide) + 12 MP (telephoto) + 12 MP (ultrawide)' },
      { category: 'Battery', key: 'Type', value: 'Li-Ion 3200 mAh, non-removable (12.38 Wh)' },
    ],
    views: 1250430,
    releaseDate: '2022, September 16',
    os: 'iOS 16',
    storage: '128GB/256GB/512GB/1TB',
    ram: '6GB',
    battery: '3200mAh',
    weight: '206g',
    chipset: 'A16 Bionic',
    displaySize: '6.1"',
    mainCamera: '48MP',
    selfieCamera: '12MP',
    videoResolution: '2160p',
    colors: 'Space Black, Silver, Gold, Deep Purple',
    networkTechnology: 'GSM / 5G',
    reviewTeaser: "Apple's iPhone 14 Pro brings the Dynamic Island, a 48MP camera, and the A16 Bionic chip to the forefront of mobile innovation...",
    opinions: [ { user: 'iFan', date: '10 Oct 2025', text: 'Dynamic Island is a game changer!', avatarInitials: 'I' } ]
  },
  {
    slug: 'samsung-galaxy-s23-ultra',
    brand: 'Samsung',
    model: 'Galaxy S23 Ultra',
    name: 'Samsung Galaxy S23 Ultra',
    category: 'Smartphones',
    imageUrl: 'https://placehold.co/600x400/2d2d2d/ffffff?text=Galaxy+S23+Ultra',
    specs: [
      { category: 'Network', key: 'Technology', value: 'GSM / CDMA / HSPA / EVDO / LTE / 5G' },
      { category: 'Launch', key: 'Announced', value: '2023, February 01' },
      { category: 'Launch', key: 'Status', value: 'Available. Released 2023, February 17' },
      { category: 'Body', key: 'Dimensions', value: '163.4 x 78.1 x 8.9 mm (6.43 x 3.07 x 0.35 in)' },
      { category: 'Body', key: 'Weight', value: '234 g (8.25 oz)' },
      { category: 'Display', key: 'Type', value: 'Dynamic AMOLED 2X, 120Hz, HDR10+, 1200 nits (HBM), 1750 nits (peak)' },
      { category: 'Display', key: 'Size', value: '6.8 inches, 114.7 cm2 (~89.9% screen-to-body ratio)' },
      { category: 'Platform', key: 'Chipset', value: 'Qualcomm SM8550-AC Snapdragon 8 Gen 2 (4 nm)' },
      { category: 'Main Camera', key: 'Quad', value: '200 MP (wide) + 10 MP (periscope) + 10 MP (telephoto) + 12 MP (ultrawide)' },
      { category: 'Battery', key: 'Type', value: 'Li-Ion 5000 mAh, non-removable' },
    ],
    views: 2105600,
    releaseDate: '2023, February 17',
    os: 'Android 13',
    storage: '256GB/512GB/1TB',
    ram: '8GB/12GB',
    battery: '5000mAh',
    weight: '234g',
    chipset: 'Snapdragon 8 Gen 2',
    displaySize: '6.8"',
    mainCamera: '200MP',
    selfieCamera: '12MP',
    videoResolution: '4320p',
    colors: 'Phantom Black, Cream, Green, Lavender',
    networkTechnology: 'GSM / 5G',
    reviewTeaser: "The S23 Ultra is the ultimate refinement of Samsung's flagship formula, boasting a massive 200MP sensor and incredible performance...",
    opinions: [ { user: 'PowerUser', date: '15 Nov 2025', text: 'The zoom on this camera is still unmatched.', avatarInitials: 'P' } ]
  },
  {
    slug: 'google-pixel-7-pro',
    brand: 'Google',
    model: 'Pixel 7 Pro',
    name: 'Google Pixel 7 Pro',
    category: 'Smartphones',
    imageUrl: 'https://placehold.co/600x400/2d2d2d/ffffff?text=Pixel+7+Pro',
    specs: [
      { category: 'Network', key: 'Technology', value: 'GSM / CDMA / HSPA / EVDO / LTE / 5G' },
      { category: 'Display', key: 'Type', value: 'LTPO AMOLED, 120Hz, HDR10+, 1000 nits (HBM), 1500 nits (peak)' },
      { category: 'Display', key: 'Size', value: '6.7 inches, 110.6 cm2 (~88.7% screen-to-body ratio)' },
      { category: 'Platform', key: 'Chipset', value: 'Google Tensor G2 (5 nm)' },
      { category: 'Main Camera', key: 'Triple', value: '50 MP (wide) + 48 MP (telephoto) + 12 MP (ultrawide)' },
      { category: 'Battery', key: 'Type', value: 'Li-Ion 5000 mAh, non-removable' },
    ],
    views: 890400,
    releaseDate: '2022, October 13',
    os: 'Android 13',
    storage: '128GB/256GB/512GB',
    ram: '12GB',
    battery: '5000mAh',
    weight: '212g',
    chipset: 'Google Tensor G2',
    displaySize: '6.7"',
    mainCamera: '50MP',
    selfieCamera: '10.8MP',
    videoResolution: '2160p',
    colors: 'Obsidian, Hazel, Snow',
    networkTechnology: 'GSM / 5G',
    reviewTeaser: "Google's smartest phone yet combines the helpfulness of Tensor G2 with a truly pro-level camera system...",
    opinions: [ { user: 'PixelLover', date: '20 Dec 2025', text: 'Best camera software in the industry.', avatarInitials: 'G' } ]
  },
  {
    slug: 'apple-macbook-pro-16-2023',
    brand: 'Apple',
    model: 'MacBook Pro 16 (2023)',
    name: 'Apple MacBook Pro 16 (2023)',
    category: 'Laptops',
    imageUrl: 'https://placehold.co/600x400/2d2d2d/ffffff?text=MacBook+Pro+16',
    specs: [
      { category: 'Display', key: 'Type', value: 'Liquid Retina XDR display' },
      { category: 'Platform', key: 'Chipset', value: 'Apple M2 Pro / M2 Max' },
      { category: 'Memory', key: 'RAM', value: 'Up to 96GB' },
      { category: 'Battery', key: 'Type', value: '100-watt-hour lithium-polymer' },
    ],
    views: 450200,
    releaseDate: '2023, January 24',
    os: 'macOS Ventura',
    storage: '512GB to 8TB SSD',
    ram: '16GB to 96GB',
    battery: '100Wh',
    weight: '2.15 kg',
    chipset: 'M2 Pro / Max',
    displaySize: '16.2"',
    mainCamera: '1080p FaceTime',
    selfieCamera: 'N/A',
    videoResolution: '1080p',
    colors: 'Space Gray, Silver',
    networkTechnology: 'Wi-Fi 6E',
    reviewTeaser: "The 16-inch MacBook Pro with M2 Pro and M2 Max takes power and efficiency to new heights for professional workflows...",
    opinions: []
  },
  {
    slug: 'samsung-galaxy-tab-s11-ultra',
    brand: 'Samsung',
    model: 'Galaxy Tab S11 Ultra',
    name: 'Samsung Galaxy Tab S11 Ultra',
    category: 'Tablets',
    imageUrl: 'https://placehold.co/600x400/2d2d2d/ffffff?text=Galaxy+Tab+S11+Ultra',
    specs: [
      { category: 'Network', key: 'Technology', value: 'GSM / HSPA / LTE / 5G' },
      { category: 'Launch', key: 'Announced', value: '2025, September 04' },
      { category: 'Launch', key: 'Status', value: 'Available. Released 2025, September 04' },
      { category: 'Body', key: 'Dimensions', value: '326.3 x 208.5 x 5.1 mm (12.85 x 8.21 x 0.20 in)' },
      { category: 'Body', key: 'Weight', value: '692 g or 695 g (1.53 lb)' },
      { category: 'Body', key: 'Build', value: 'Glass front, aluminum frame, aluminum back' },
      { category: 'Body', key: 'SIM', value: 'Nano-SIM + eSIM (cellular model only)' },
      { category: 'Body', key: 'Features', value: 'IP68 dust tight and water resistant (immersible up to 1.5m for 30 min) Stylus support Enhanced Armor aluminum' },
      { category: 'Display', key: 'Type', value: 'Dynamic AMOLED 2X, 120Hz, HDR10+, 1000 nits (typ), 1600 nits (peak)' },
      { category: 'Display', key: 'Size', value: '14.6 inches, 617.8 cm2 (~90.8% screen-to-body ratio)' },
      { category: 'Display', key: 'Resolution', value: '1848 x 2960 pixels, 16:10 ratio (~239 ppi density)' },
      { category: 'Display', key: 'Protection', value: 'Mohs level 5' },
      { category: 'Platform', key: 'OS', value: 'Android 16, One UI 8' },
      { category: 'Platform', key: 'Chipset', value: 'Mediatek Dimensity 9400+ (3 nm)' },
      { category: 'Platform', key: 'CPU', value: 'Octa-core (1x3.63 GHz Cortex-X925 & 3x3.3 GHz Cortex-X4 & 4x2.4 GHz Cortex-A720)' },
      { category: 'Platform', key: 'GPU', value: 'Immortalis-G925' },
      { category: 'Memory', key: 'Card slot', value: 'microSDXC (dedicated slot)' },
      { category: 'Memory', key: 'Internal', value: '128GB 12GB RAM, 256GB 12GB RAM, 512GB 12GB RAM, 1TB 16GB RAM' },
      { category: 'Memory', key: 'Storage Type', value: 'UFS' },
      { category: 'Main Camera', key: 'Dual', value: '13 MP, f/2.0, 26mm (wide), 1/3.4", 1.0µm, AF; 8 MP, f/2.2, (ultrawide)' },
      { category: 'Main Camera', key: 'Features', value: 'LED flash, HDR, panorama' },
      { category: 'Main Camera', key: 'Video', value: '4K@30fps, 1080p@30fps' },
      { category: 'Selfie camera', key: 'Single', value: '12 MP, f/2.4, 120˚ (ultrawide)' },
      { category: 'Selfie camera', key: 'Features', value: 'HDR' },
      { category: 'Selfie camera', key: 'Video', value: '4K@30fps, 1080p@30fps' },
      { category: 'Sound', key: 'Loudspeaker', value: 'Yes, with stereo speakers (4 speakers)' },
      { category: 'Sound', key: '3.5mm jack', value: 'No' },
      { category: 'Comms', key: 'WLAN', value: 'Wi-Fi 802.11 a/b/g/n/ac/6e/7, tri-band, Wi-Fi Direct' },
      { category: 'Comms', key: 'Bluetooth', value: '5.4, A2DP, LE' },
      { category: 'Comms', key: 'Positioning', value: 'GPS, GLONASS, BDS, GALILEO' },
      { category: 'Comms', key: 'NFC', value: 'No' },
      { category: 'Comms', key: 'Radio', value: 'No' },
      { category: 'Comms', key: 'USB', value: 'USB Type-C 3.2, magnetic connector' },
      { category: 'Features', key: 'Sensors', value: 'Fingerprint (under display, optical), accelerometer, gyro, proximity, compass' },
      { category: 'Features', key: 'Other', value: 'Wireless Samsung DeX (desktop experience support)' },
      { category: 'Battery', key: 'Type', value: 'Li-Po 11600 mAh' },
      { category: 'Battery', key: 'Charging', value: '45W wired' },
      { category: 'Misc', key: 'Colors', value: 'Moonstone Gray, Platinum Silver' },
      { category: 'Misc', key: 'Models', value: 'SM-X930, SM-X936B, SM-X936N, SM-X930N' },
      { category: 'Misc', key: 'SAR EU', value: '0.80 W/kg (body)' },
      { category: 'Misc', key: 'Price', value: '$1,099.99' },
      { category: 'Tests', key: 'Loudspeaker', value: '-20.9 LUFS (Excellent)' },
      { category: 'Tests', key: 'Battery (Active Use)', value: '13:25h' },
    ],
    views: 486947,
    releaseDate: '2025-09-04',
    os: 'Android 16',
    storage: '128GB/512GB/1TB',
    ram: '12/16GB RAM',
    battery: '11600mAh',
    weight: '692g or 695g',
    chipset: 'Dimensity 9400+',
    displaySize: '14.6"',
    mainCamera: '13MP',
    selfieCamera: '12MP',
    videoResolution: '2160p',
    versions: 'Galaxy Tab S11 Ultra Wi-Fi SM-X930; Galaxy Tab S11 Ultra 5G SM-X936B',
    models: 'SM-X930, SM-X936B, SM-X936N, SM-X930N',
    colors: 'Moonstone Gray, Platinum Silver',
    sarEU: '0.80 W/kg (body)',
    networkTechnology: 'GSM / HSPA / LTE / 5G',
    reviewTeaser: "The Galaxy Tab S11 flagship series premiered at Berlin's IFA this year and it is available in two sizes - the 11\" Tab S11 and the 14.6\" Tab S11 Ultra. Today, we will explore the larger of these...",
    opinions: [
      {
        user: 'Dude',
        date: '18 Dec 2025',
        text: 'The 9400+ used here is a beast. Look up the specs and benchmarks, you will be blown away. It\'s above the SD elite from gen 4.',
        avatarInitials: 'D'
      },
      {
        user: 'Anonymous',
        date: '16 Dec 2025',
        text: '$1000 for a mediatek chip, how laughable is that! This is why I left samsung, they are tracking garbage!',
        avatarInitials: '?'
      },
      {
        user: 'avi',
        date: '30 Nov 2025',
        text: 'No need to update',
        avatarInitials: 'a'
      }
    ]
  },
];

async function seedDB() {
  if (!MONGO_URI) {
    console.error('MONGO_URI is not defined in your .env file');
    process.exit(1);
  }
  
  await connect(MONGO_URI);

  const DeviceModel = mongoose.model('Device', DeviceSchema);
  const CategoryModel = mongoose.model('Category', CategorySchema);
  const PriceModel = mongoose.model('PriceHistory', new mongoose.Schema({
    deviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    country: String,
    price: Number,
    currency: String,
    retailer: String,
    affiliateUrl: String,
    date: { type: Date, default: Date.now }
  }));

  await DeviceModel.deleteMany({});
  await CategoryModel.deleteMany({});
  await PriceModel.deleteMany({});
  
  const categories = [...new Set(seedData.map(device => device.category))];
  const categoryDocs = await CategoryModel.insertMany(
    categories.map(name => ({ name, slug: name.toLowerCase().replace(/ /g, '-') }))
  );
  
  for (const device of seedData) {
    const category = categoryDocs.find(cat => cat.name === device.category);
    
    // Normalize specs to array if it's an object
    let specs = device.specs;
    if (!Array.isArray(specs)) {
      specs = Object.keys(specs).map(key => ({
        category: 'General',
        key: key.charAt(0).toUpperCase() + key.slice(1),
        value: (device.specs as any)[key]
      }));
    }

    const createdDevice = await (DeviceModel.create({
      ...device,
      category: category?._id,
      specs: specs,
      latestPrice: device.slug === 'apple-iphone-14-pro' ? 999.00 :
                   device.slug === 'samsung-galaxy-s23-ultra' ? 1199.99 :
                   device.slug === 'google-pixel-7-pro' ? 899.00 :
                   device.slug === 'apple-macbook-pro-16-2023' ? 2499.00 :
                   device.slug === 'samsung-galaxy-tab-s11-ultra' ? 1099.99 : 0
    }) as any);

    // Add a price history entry for each device
    await PriceModel.create({
      deviceId: createdDevice._id,
      country: 'Global',
      price: createdDevice.latestPrice,
      currency: 'USD',
      retailer: 'Official Store',
      affiliateUrl: 'https://www.google.com',
      date: new Date()
    });
  }

  await disconnect();
  
  console.log('Database seeded successfully!');
}

seedDB().catch(err => {
  console.error('Error seeding database:', err);
  process.exit(1);
});