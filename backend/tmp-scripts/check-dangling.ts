import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '/home/recoding/gsmhub/backend/.env' });

(async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  const db = mongoose.connection.db!;
  const rows = await db.collection('pricehistories').find({}).toArray();
  for (const r of rows) {
    const dev = await db.collection('devices').findOne({ _id: r.deviceId });
    console.log(`price ${r._id} -> device ${r.deviceId}: ${dev ? dev.slug : 'DANGLING'}`);
  }
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
