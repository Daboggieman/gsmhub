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
    category: 'Smartphones',
    imageUrl: '/images/generic-phone.png',
    specs: {
      display: '6.1-inch Super Retina XDR display',
      camera: '48MP Main camera',
      processor: 'A16 Bionic chip',
    },
    views: 1500,
    releaseDate: '2022-09-16',
    os: 'iOS 16',
    storage: '128GB, 256GB, 512GB, 1TB',
    ram: '6GB',
    battery: '3200 mAh',
  },
  {
    slug: 'samsung-galaxy-s23-ultra',
    brand: 'Samsung',
    model: 'Galaxy S23 Ultra',
    category: 'Smartphones',
    imageUrl: 'https://images.samsung.com/is/image/samsung/assets/global/about-us/newsroom/2023/galaxy-s23-ultra-unpacked-2023-product-image-green.jpg',
    specs: {
      display: '6.8-inch Dynamic AMOLED 2X',
      camera: '200MP Wide-angle Camera',
      processor: 'Snapdragon 8 Gen 2 for Galaxy',
    },
    views: 2000,
    releaseDate: '2023-02-17',
    os: 'Android 13',
    storage: '256GB, 512GB, 1TB',
    ram: '8GB, 12GB',
    battery: '5000 mAh',
  },
  {
    slug: 'google-pixel-7-pro',
    brand: 'Google',
    model: 'Pixel 7 Pro',
    category: 'Smartphones',
    imageUrl: '/images/generic-phone.png',
    specs: {
      display: '6.7-inch LTPO OLED',
      camera: '50MP wide, 12MP ultrawide, 48MP telephoto',
      processor: 'Google Tensor G2',
    },
    views: 1200,
    releaseDate: '2022-10-13',
    os: 'Android 13',
    storage: '128GB, 256GB, 512GB',
    ram: '12GB',
    battery: '5000 mAh',
  },
  {
    slug: 'apple-macbook-pro-16-2023',
    brand: 'Apple',
    model: 'MacBook Pro 16 (2023)',
    category: 'Laptops',
    imageUrl: '/images/generic-laptop.png',
    specs: {
      display: '16.2-inch Liquid Retina XDR display',
      processor: 'M2 Pro or M2 Max',
      ram: 'Up to 96GB',
      storage: 'Up to 8TB SSD',
    },
    views: 800,
    releaseDate: '2023-01-24',
    os: 'macOS Ventura',
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

  await DeviceModel.deleteMany({});
  await CategoryModel.deleteMany({});
  
  const categories = [...new Set(seedData.map(device => device.category))];
  const categoryDocs = await CategoryModel.insertMany(
    categories.map(name => ({ name, slug: name.toLowerCase() }))
  );
  
  const devicesWithCategoryIds = seedData.map(device => {
    const category = categoryDocs.find(cat => cat.name === device.category);
    return {
      ...device,
      category: category?._id,
    };
  });
  
  await DeviceModel.insertMany(devicesWithCategoryIds);

  await disconnect();
  
  console.log('Database seeded successfully!');
}

seedDB().catch(err => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
