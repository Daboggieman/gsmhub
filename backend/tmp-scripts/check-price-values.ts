import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '/home/recoding/gsmhub/backend/.env' });

(async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  const db = mongoose.connection.db!;
  // join pricehistories to devices for the cheapest 10
  const rows = await db.collection('pricehistories')
    .find({}).sort({ price: 1 }).limit(6).toArray();
  for (const r of rows) {
    const dev = await db.collection('devices').findOne({ _id: r.device });
    console.log(`$${r.price} [${r.currency}] <- ${dev ? dev.slug : 'DANGLING'} (date ${r.date?.toISOString?.().slice(0, 10)})`);
  }
  console.log('...');
  const hi = await db.collection('pricehistories')
    .find({}).sort({ price: -1 }).limit(6).toArray();
  for (const r of rows ? hi : []) {
    const dev = await db.collection('devices').findOne({ _id: r.device });
    console.log(`$${r.price} [${r.currency}] <- ${(dev as any)?.slug} (date ${r.date?.toISOString?.().slice(0, 10)})`);
  }
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
