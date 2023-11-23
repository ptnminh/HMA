import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { IPlans } from '../interface/plans';

export class UpdatePlanDto {
  @ApiProperty({ example: 'Plan 1', description: 'The name of the Plan' })
  @IsString()
  @IsOptional()
  planName: string;

  @ApiProperty({ example: 2000, description: 'The current price' })
  @IsNumber()
  @IsOptional()
  currentPrice: number;

  @ApiProperty({ example: 60, description: 'The duration of the plan' })
  @IsNumber()
  @IsOptional()
  duration: number;

  @ApiProperty({
    example: 'Description',
    description: 'The Description of the plan',
  })
  @IsString()
  @IsOptional()
  description: string;
}

export class UpdatePlanResponse {
  @ApiProperty({ example: 'true', type: Boolean })
  status: string;
  @ApiProperty({
    example: {
      id: '1',
      planName: 'Plan 1',
      description: 'The name of the Plan',
      currentPrice: 2000,
      duration: 60,
      isActive: 1,
      createdAt: '2021-09-27T07:45:16.000Z',
      updatedAt: '2021-09-27T07:45:16.000Z',
    },
    nullable: false,
  })
  data: IPlans;
  @ApiProperty({ example: 'Cập nhật plan thành công.', nullable: true })
  message: { [key: string]: any };
}
