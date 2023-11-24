import { ApiProperty } from "@nestjs/swagger";
import { IPlanOption } from "../interface/plans";

export class GetAllActiveOptionResponse {
    @ApiProperty({example: 'true', type: Boolean})
    status : string;
    @ApiProperty({
        example: [
        {
            id: '001',
            optionName: 'Option 01',
            description: 'Description',
            isActive: 'True',
            createdAt: "2023-11-23T16:13:09.849Z",
            updatedAt: "2023-11-23T16:13:09.849Z"
        },
        {
            id: '002',
            optionName: 'Option 02',
            description: 'Description',
            isActive: 'True',
            createdAt: "2023-11-23T16:13:09.849Z",
            updatedAt: "2023-11-23T16:13:09.849Z"
        }
        ]
    })
    data: IPlanOption;
    @ApiProperty({ example: 'Lấy danh sách option thành công', nullable: true })
    message: { [key: string]: any };
}