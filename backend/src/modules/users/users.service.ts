import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async findAll({ page, limit, search }: { page: number; limit: number; search?: string }): Promise<{ users: User[]; total: number }> {
    const filter: Record<string, any> = {};
    if (search) {
      const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [{ name: rx }, { email: rx }];
    }

    const [users, total] = await Promise.all([
      this.userModel.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);
    return { users: users as any, total };
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const { password, ...rest } = updateUserDto;

    if (updateUserDto.email) {
      const existing = await this.userModel.findOne({ email: updateUserDto.email, _id: { $ne: id } });
      if (existing) {
        throw new ConflictException('User with this email already exists');
      }
    }

    const update: Record<string, any> = { ...rest };
    if (password) {
      const salt = await bcrypt.genSalt();
      update.password = await bcrypt.hash(password, salt);
    }

    const updated = await this.userModel.findByIdAndUpdate(id, update, { new: true }).select('-password').exec();
    if (!updated) return null;
    return updated.toObject() as any;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) throw new BadRequestException('User not found');
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, ...rest } = createUserDto;

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new this.userModel({
      email,
      password: hashedPassword,
      ...rest,
    });

    const savedUser = await newUser.save();
    const userObject = savedUser.toObject() as any;
    delete userObject.password;
    return userObject as any;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async findOne(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async toggleFavorite(userId: string, deviceId: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    if (!user) return false;

    const favorites = user.favorites || [];
    const index = favorites.findIndex(f => f.toString() === deviceId);

    if (index > -1) {
      favorites.splice(index, 1);
      user.favorites = favorites;
      await user.save();
      return false; // Result is NOT favorited
    } else {
      favorites.push(new Types.ObjectId(deviceId));
      user.favorites = favorites;
      await user.save();
      return true; // Result IS favorited
    }
  }

  async getFavorites(userId: string): Promise<any[]> {
    const user = await this.userModel.findById(userId)
      .populate('favorites')
      .exec();
    return user?.favorites || [];
  }
}
