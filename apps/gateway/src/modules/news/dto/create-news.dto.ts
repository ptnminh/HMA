import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateNewsDto {
    @ApiProperty({example: "Demo news"})
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({example: "Demo content"})
    @IsString()
    @IsOptional()
    content?: string;

    @ApiProperty({example: "Demo logo"})
    @IsString()
    @IsOptional()
    logo?: string;

    @ApiProperty({example: "6f9986f6-705c-48f6-ac13-c4b7ecde4547"})
    @IsString()
    @IsNotEmpty()
    clinicId: string;

    @ApiProperty({example: true})
    @IsBoolean()
    @Type(() => Boolean)
    @IsOptional()
    isShow?: Boolean;
}