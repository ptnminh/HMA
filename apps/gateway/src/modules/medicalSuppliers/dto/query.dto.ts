import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetListQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  medicineName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  vendor?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  isDisabled?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  clinicId?: string;
}
