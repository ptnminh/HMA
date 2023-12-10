import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString} from "class-validator";

export class CreateGroupChatDto {

    @ApiProperty({example: "GroupChat01"})
    @IsString()
    @IsNotEmpty()
    groupName: string;

    @ApiProperty({example: "15"})
    @IsNumber()
    @IsOptional()
    maxMember?: number;

    @ApiProperty({example: ""})
    @IsString()
    @IsOptional()
    type?: string;

    @ApiProperty({example: ["3c9994cb-dcc4-4a22-ac23-cd8e826604e5"]})
    userList: string[]
}