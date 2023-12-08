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
}