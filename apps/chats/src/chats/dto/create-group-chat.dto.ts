import { IsNotEmpty, IsNumber, IsString} from "class-validator";

export class CreateGroupChatDto {
    groupName: string;

    maxMember?: number;

    type?: string;
}