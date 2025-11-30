import { MongooseModuleOptions } from '@nestjs/mongoose';

export const mongooseConfig: MongooseModuleOptions = {
  uri: process.env.MONGO_URI || 'mongodb://localhost:27017/gsmhub',
};