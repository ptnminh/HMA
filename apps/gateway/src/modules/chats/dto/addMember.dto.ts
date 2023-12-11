import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AddMemberDto {
    @ApiProperty({example: ["3c9994cb-dcc4-4a22-ac23-cd8e826604e5"]})
    userList: string[]
}