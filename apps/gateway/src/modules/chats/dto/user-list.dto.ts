import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsArray, ArrayUnique } from "class-validator";

export class userListDto {
    @ArrayUnique()
    @IsNotEmpty({each: true})
    @IsArray()
    @ApiProperty({example: 
        []})
    @IsString({each: true})
    userList: string[]
}