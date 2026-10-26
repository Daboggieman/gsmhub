import { Expose } from 'class-transformer';
import { UserRole } from '../schemas/user.schema';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  role: UserRole;

  @Expose()
  isActive: boolean;

  @Expose()
  createdAt: Date;
}
