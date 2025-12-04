import { IsString, IsNotEmpty, IsNumber, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePriceDto {
  @ApiProperty({
    description: 'The ID of the device this price belongs to',
    example: '60c72b2f9b1d8c001f8e4e1a',
  })
  @IsMongoId()
  @IsNotEmpty()
  device: string;

  @ApiProperty({
    description: 'The price of the device',
    example: 699.99,
  })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    description: 'The currency of the price',
    example: 'USD',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    description: 'The country where this price is valid',
    example: 'USA',
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    description: 'The retailer offering this price',
    example: 'Amazon',
    required: false,
  })
  @IsString()
  @IsOptional()
  retailer?: string;

  @ApiProperty({
    description: 'A direct link to the product page',
    example: 'https://www.amazon.com/dp/B08N5T6S4B',
    required: false,
  })
  @IsString()
  @IsOptional()
  url?: string;
}

export class UpdatePriceDto {
  @ApiProperty({
    description: 'The price of the device',
    example: 649.99,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  price?: number;

  @ApiProperty({
    description: 'The currency of the price',
    example: 'USD',
    required: false,
  })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({
    description: 'The country where this price is valid',
    example: 'USA',
    required: false,
  })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({
    description: 'The retailer offering this price',
    example: 'Best Buy',
    required: false,
  })
  @IsString()
  @IsOptional()
  retailer?: string;

  @ApiProperty({
    description: 'A direct link to the product page',
    example: 'https://www.bestbuy.com/site/product_name',
    required: false,
  })
  @IsString()
  @IsOptional()
  url?: string;
}
