import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateCategoryDto{

    @ApiProperty({example: "Demo updated name"})
    @IsString()
    @IsOptional()
    name?: String;
    
    @ApiProperty({example: "Updated note"})
    @IsString()
    @IsOptional()
    note?: String;

    @ApiProperty({example: "Updated description"})
    @IsString()
    @IsOptional()
    description?: String;
}