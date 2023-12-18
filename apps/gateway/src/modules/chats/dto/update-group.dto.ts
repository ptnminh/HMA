import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Min, IsIn, IsOptional, IsNumber } from "class-validator";

export class UpdatedGroupDto {
    @ApiProperty({example: "GroupChat01"})
    @IsString()
    @IsNotEmpty()
    groupName?: string;

    @Min(2)
    @ApiProperty({example: "15"})
    @IsNumber()
    @IsOptional()
    maxMember?: number;

    @IsIn(['one-on-one', 'group'])
    @IsString()
    @IsOptional()
    type?: string;
}