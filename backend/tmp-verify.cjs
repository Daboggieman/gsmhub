require('dotenv').config();
const mongoose = require('mongoose');
(async () => {
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  const D = mongoose.connection.collection('devices');
  const C = mongoose.connection.collection('categories');
  const B = mongoose.connection.collection('brands');

  const total = await D.countDocuments({});
  const active = await D.countDocuments({ isActive: true });
  const withSpecs = await D.countDocuments({ 'specs.0': { $exists: true } });
  const withOs = await D.countDocuments({ os: { $nin: [null, ''] } });
  const withRam = await D.countDocuments({ ram: { $nin: [null, ''] } });
  const withCam = await D.countDocuments({ mainCamera: { $nin: [null, ''] } });
  const withImg = await D.countDocuments({ imageUrl: { $nin: [null, ''] } });
  const dupSlugs = await D.aggregate([{ $group: { _id: '$slug', n: { $sum: 1 } } }, { $group: { _id: null, n: { $sum: 1 } } }, { $match: { _id: 0 } }].slice(0,20)).toArray();
  const catCount = await C.countDocuments({});
  const brandCount = await B.countDocuments({});
  const sample = await D.findOne({ slug: /galaxy-s24-fe/ });
  console.log('TOTAL devices:', total, '| isActive:', active);
  console.log('with specs:', withSpecs, '| os:', withOs, '| ram:', withRam, '| cam:', withCam, '| img:', withImg);
  console.log('duplicate-slug groups:', dupSlugs.length);
  console.log('categories:', catCount, '| brands:', brandCount);
  if (sample) console.log('sample: os='+sample.os, '| ram='+sample.ram, '| cam='+sample.mainCamera, '| cat='+sample.category);
  await mongoose.disconnect();
})().catch(e => { console.error('ERR:', e.message.slice(0,200)); process.exit(1); });
