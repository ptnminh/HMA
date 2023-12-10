
export class CreateGroupDto {
    groupName: string;

    maxMember?: number;

    type?: string;

    userList: string[];
}