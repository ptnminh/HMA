import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetListQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  clinicId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  isDisabled?: boolean;
}
