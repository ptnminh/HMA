import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { IPlanOption, IPlans } from '../interface/plans';

export class CreatePlanDto {
  @ApiProperty({ example: 'Plan 1', description: 'The name of the Plan' })
  @IsString()
  @IsNotEmpty()
  planName: string;

  @ApiProperty({ example: 2000, description: 'The current price' })
  @IsNumber()
  currentPrice: number;

  @ApiProperty({ example: 60, description: 'The duration of the plan' })
  @IsNumber()
  duration: number;

  @ApiProperty({
    example: 'Description',
    description: 'The Description of the plan',
  })
  @IsString()
  description: string;
}

export class CreatePlanResponse {
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
  @ApiProperty({ example: 'Tạo plan thành công.', nullable: true })
  message: { [key: string]: any };
}

export class CreatePlanOptionDto {
  @ApiProperty({ example: 'Option 1', description: 'The name of the option' })
  @IsString()
  @IsNotEmpty()
  optionName: string;

  @ApiProperty({
    example: 'Description',
    description: 'The Description of the option',
  })
  @IsString()
  description: string;
}

export class CreatePlanOptionResponse {
  @ApiProperty({ example: 'true', type: Boolean })
  status: string;
  @ApiProperty({
    example: {
      id: '1',
      optionName: 'Option 1',
      description: 'The name of the option',
      isActive: true,
      createdAt: '2021-09-27T07:45:16.000Z',
      updatedAt: '2021-09-27T07:45:16.000Z',
    },
    nullable: false,
  })
  data: IPlanOption;
  @ApiProperty({ example: 'Tạo option thành công.', nullable: true })
  message: { [key: string]: any };
}
