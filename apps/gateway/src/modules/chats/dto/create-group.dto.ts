import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayUnique, IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested} from "class-validator";

export class CreateGroupChatDto {

    @ApiProperty({example: "GroupChat01"})
    @IsString()
    @IsNotEmpty()
    groupName: string;

    @Min(2)
    @ApiProperty({example: "15"})
    @IsNumber()
    @IsOptional()
    maxMember?: number;

    @IsIn(['one-on-one', 'group'])
    @ApiProperty({example: "one-on-one"})
    @IsString()
    @IsOptional()
    type?: string;

    @ArrayUnique()
    @IsArray()
    @ApiProperty({example: 
        ["3c9994cb-dcc4-4a22-ac23-cd8e826604e5", "9e9b2d9c-d9f8-46d8-abf3-9d731681a670"]})
    @IsString({each: true})
    userList: string[]
}