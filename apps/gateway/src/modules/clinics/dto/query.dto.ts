import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class GetClinicsDto {
  @ApiProperty({ required: false, example: 'uuid' })
  @IsOptional()
  ownerId?: string;

  @ApiProperty({ required: false, example: '1' })
  @IsOptional()
  staffId?: number;

  @ApiProperty({ required: false, example: 'name' })
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false, example: 'address' })
  @IsOptional()
  address?: string;

  @ApiProperty({ required: false, example: 'true' })
  @IsOptional()
  isActive?: string;

  @ApiProperty({ required: false, example: 'suid' })
  @IsOptional()
  suid?: string;

  @ApiProperty({ required: false, example: 'puid' })
  @IsOptional()
  puid?: string;
}
