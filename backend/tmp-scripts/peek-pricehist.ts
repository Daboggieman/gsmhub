import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config({ path: '/home/recoding/gsmhub/backend/.env' });

(async () => {
  await mongoose.connect(process.env.MONGO_URI!);
  const db = mongoose.connection.db!;
  const docs = await db.collection('pricehistories').find({}).limit(10).toArray();
  console.log(JSON.stringify(docs, null, 2));
  await mongoose.disconnect();
})().catch((e) => { console.error(e.message); process.exit(1); });
