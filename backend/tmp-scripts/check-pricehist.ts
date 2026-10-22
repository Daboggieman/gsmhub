import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '/home/recoding/gsmhub/backend/.env' });

(async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  const db = mongoose.connection.db!;
  const colls = await db.listCollections().toArray();
  console.log('collections:', colls.map((c) => c.name).join(', '));
  for (const name of ['pricehistories', 'prices', 'devices']) {
    try {
      const count = await db.collection(name).countDocuments({});
      console.log(name, 'count:', count);
    } catch (e) {
      console.log(name, 'err:', (e as Error).message);
    }
  }
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
