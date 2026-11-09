/* Temporary post-seed verification. Deleted after use. */
require('dotenv').config();
const mongoose = require('mongoose');

(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 30000 });
  const db = mongoose.connection.db;
  const devices = db.collection('devices');
  const categories = db.collection('categories');

  const total = await devices.countDocuments({});
  const byType = await devices.aggregate([{ $group: { _id: '$type', n: { $sum: 1 } } }, { $sort: { n: -1 } }]).toArray();
  const byCat = await categories.find({}, { projection: { name: 1, deviceCount: 1 } }).sort({ name: 1 }).toArray();
  const brands = await db.collection('brands').countDocuments({});

  console.log('TOTAL devices:', total);
  console.log('BY TYPE:', byType.map((d) => `${d._id}=${d.n}`).join(' | '));
  console.log('CATEGORIES:', byCat.map((c) => `${c.name}${c.deviceCount != null ? `(${c.deviceCount})` : ''}`).join(' | '));
  console.log('BRANDS:', brands);

  // Spot checks: legacy PDA in "Other", a dataset laptop, a curated watch
  const others = await devices.find({ category: (await categories.findOne({ name: 'Other' }))?._id }, { projection: { slug: 1, name: 1, type: 1 } }).limit(5).toArray();
  console.log('OTHER-category samples:', others.map((d) => `${d.slug} [${d.type}]`));
  const dl = await devices.findOne({ brand: 'Dell', name: /^Inspiron 3567/ }, { projection: { slug: 1, name: 1, type: 1 } });
  console.log('dataset laptop:', dl && `${dl.slug} [${dl.type}]`);
  const w = await devices.findOne({ slug: 'apple-watch-series-10' }, { projection: { slug: 1, name: 1, type: 1 } });
  console.log('curated watch:', w && `${w.slug} [${w.type}]`);
  const buds = await devices.findOne({ slug: 'apple-airpods-pro-2' }, { projection: { slug: 1, name: 1, type: 1 } });
  console.log('curated earbuds:', buds && `${buds.slug} [${buds.type}]`);

  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => { console.error('VERIFY FAILED:', e.message); process.exit(1); });
