import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsDate, IsDateString, IsEmail, IsIn, IsOptional, IsPhoneNumber, IsString } from "class-validator";

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    @ApiProperty({example: "Clinic"})
    firstName?: String;

    @ApiProperty({example: "Test User"})
    @IsString()
    @IsOptional()
    lastName?: String;

    @ApiProperty({example: 0})
    @IsIn([0,1])
    @IsOptional()
    gender?: number;

    @ApiProperty({example: "01/01/2001"})
    @IsDate()
    @IsOptional()
    @Type(() => Date)
    birthday?: Date;

    @ApiProperty({example: "Nguyễn Văn Cứ, P5, TP.Hồ Chí Minh"})
    @IsString()
    @IsOptional()
    address?: String;

    @ApiProperty({example: "84926251488"})
    @IsPhoneNumber('VN')
    @IsOptional()
    phone?: String;
    
    @ApiProperty({example: "avatar"})
    @IsString()
    @IsOptional()
    avatar?: String;

    @ApiProperty({example: "example@email.com"})
    @IsEmail()
    @IsOptional()
    email?: String;
}