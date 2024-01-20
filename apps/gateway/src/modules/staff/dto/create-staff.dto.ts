import { ApiProperty } from "@nestjs/swagger";
import { ArrayUnique, IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, Min } from "class-validator";

export class CreateStaffDto {
    @ApiProperty({
        example: 1,
        description: "Male: 1, Female: 0"
    })
    @IsNotEmpty()
    @IsIn([0, 1])
    gender: number;
 
    @ApiProperty({
        example: "84931231511",
        description: "Vietnamese phone number of staff"
    })
    @IsPhoneNumber('VN')
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty({
        example: "Đ. Nguyễn Văn Cứ, TP.Hồ Chí Minh",
        description: "The address of staff",
    })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({
        example: "Tim mạch",
    })
    @IsString()
    @IsOptional()
    specialize?: string;

    @ApiProperty({
        example: 1,
        description: "Years of experience. Minimum required: 0"
    })
    @IsNumber()
    @IsOptional()
    @Min(0)
    experience: number;

    @ApiProperty({
        example: [1,2,4],
        description: "The list contains clinic service id"
    })
    @IsArray()
    @ArrayUnique()
    @IsNumber({}, {each: true})
    @IsOptional()    
    services?: number[]
}
