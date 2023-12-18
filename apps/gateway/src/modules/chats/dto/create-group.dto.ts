import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayUnique, IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested} from "class-validator";

export class CreateGroupChatDto {

    @ApiProperty({example: "GroupChatDemo"})
    @IsString()
    @IsNotEmpty()
    groupName?: string;

    @Min(2)
    @ApiProperty({example: "15"})
    @IsNumber()
    @IsOptional()
    maxMember?: number;

    @IsIn(['one-on-one', 'group'])
    @ApiProperty({example: "group"})
    @IsString()
    @IsOptional()
    type?: string;

    @ArrayUnique()
    @IsArray()
    @ApiProperty({example: 
        []})
    @IsString({each: true})
    userList: string[]
}