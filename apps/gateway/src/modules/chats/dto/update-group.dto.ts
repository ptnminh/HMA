import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdatedGroupDto {
    @ApiProperty({example: "groupNewName"})
    @IsNotEmpty()
    @IsString()
    groupName: string
}