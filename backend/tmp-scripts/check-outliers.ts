import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '/home/recoding/gsmhub/backend/.env' });

(async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  const db = mongoose.connection.db!;
  const slugs = [
    'samsung-galaxy-watch5-44mm',
    'asus-zenfone-11-ultra',
    'oppo-pad-air-10-4-wifi',
  ];
  for (const slug of slugs) {
    const dev = await db.collection('devices').findOne({ slug });
    if (!dev) { console.log(slug, '-> not found'); continue; }
    const rows = await db.collection('pricehistories').find({ device: dev._id }).toArray();
    console.log(slug, '->', rows.map((r) => `$${r.price} @ ${r.date?.toISOString?.().slice(0, 10)}`).join(', ') || 'none');
  }
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
