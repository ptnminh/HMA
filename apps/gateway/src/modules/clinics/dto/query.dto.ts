import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetClinicsDto {
  @ApiProperty({ required: false, example: 'uuid' })
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiProperty({ required: false, example: '1' })
  @IsOptional()
  @IsNumber()
  staffId?: number;

  @ApiProperty({ required: false, example: 'name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, example: 'address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false, example: 'isActive' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
