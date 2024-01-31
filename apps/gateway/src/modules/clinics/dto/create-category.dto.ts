import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateCategoryDto{
    @ApiProperty({example: "Demo Category"})
    @IsString()
    @IsNotEmpty()
    name: String;
    
    @ApiProperty({example: 1})
    @IsInt()
    @IsIn([1,2,3])
    type: Number;

    @ApiProperty({example: "Demo note"})
    @IsString()
    @IsOptional()
    note?: String;

    @ApiProperty({example: "The description for this category"})
    @IsString()
    @IsOptional()
    description?: String;
}