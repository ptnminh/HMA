import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsArray, ArrayUnique } from "class-validator";

export class AddMemberDto {
    @ArrayUnique()
    @IsNotEmpty({each: true})
    @IsArray()
    @ApiProperty({example: 
        ["3c9994cb-dcc4-4a22-ac23-cd8e826604e5", "9e9b2d9c-d9f8-46d8-abf3-9d731681a670"]})
    @IsString({each: true})
    userList: string[]
}