import { IsString, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'The name of the category',
    example: 'Smartphones',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The slug for the category URL',
    example: 'smartphones',
    required: false,
  })
  @IsString()
  @IsOptional()
  slug?: string;
}

export class UpdateCategoryDto {
  @ApiProperty({
    description: 'The name of the category',
    example: 'Smartphones',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'The slug for the category URL',
    example: 'smartphones',
    required: false,
  })
  @IsString()
  @IsOptional()
  slug?: string;
}
