import { ApiProperty } from "@nestjs/swagger";
import { ArrayUnique, IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";

export class staffServiceListDto {
    @ApiProperty({
        example: [1,2,4],
        description: "The list contains clinic service id"
    })
    @IsArray()
    @ArrayUnique()
    @IsNumber({}, {each: true})
    @IsOptional()    
    clinicServices?: number[]
}