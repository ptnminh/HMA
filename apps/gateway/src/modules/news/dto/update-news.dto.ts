import { Type } from "class-transformer";
import { IsBoolean, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class UpdateNewsDto {
    @ApiProperty({example: "Updated demo news"})
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({example: "Updated demo content"})
    @IsString()
    @IsOptional()
    content?: string;

    @ApiProperty({example: "Updated demo logo"})
    @IsString()
    @IsOptional()
    logo?: string;


    @ApiProperty({example: true})
    @IsBoolean()
    @Type(() => Boolean)
    @IsOptional()
    isShow?: Boolean;
}