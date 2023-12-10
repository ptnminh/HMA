import { Controller, HttpStatus } from '@nestjs/common';
import { ChatService } from './chats.service';
import { CreateGroupChatDto } from './dto';
import { MessagePattern } from '@nestjs/microservices';
import { ChatsCommand } from './command';
import { group } from 'console';
import { Prisma } from '@prisma/client';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @MessagePattern(ChatsCommand.CREATE_GROUP_CHAT)
  async createGroupChat(data: {dto: CreateGroupChatDto, id: string}) {
    try {
      const {groupName, maxMember, type} = {...data.dto}
      const findGroupName = await this.chatService.findActiveGroupChatByName(groupName)
      if (findGroupName) {
        return {
          message: "Tên nhóm đã tồn tại",
          status: HttpStatus.BAD_REQUEST
        }
      }
      const groupChat = await this.chatService.createGroupChat(data.dto)
      const userId = data.id
      const admin = await this.chatService.addGroupAdmin(userId, groupChat.id)
      if (!admin) {
        return {
          message: "Tạo group chat không thành công",
          status: HttpStatus.BAD_REQUEST,
        }
      }
      return {
        data: groupChat,
        message: "Tạo nhóm chat thành công",
        status: HttpStatus.OK,
      }
    } 
    catch(error) {
      console.log(error)
      return {
        message: "Lỗi hệ thống",
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      }
    }
  }

  @MessagePattern(ChatsCommand.FIND_ALL_MEMBER)
  async findMember(data: {id: string}) {
    try {
      const group = await this.chatService.findActiveGroupChatById(parseInt(data.id))
      if (!group) {
        return {
          message: "Nhóm chat không tồn tại",
          status: HttpStatus.BAD_REQUEST
        }
      }
      const member = await this.chatService.getAllGroupChatMember(parseInt(data.id))
      return {
        data: member,
        message: "Lấy danh sách member thành công",
        status: HttpStatus.OK
      }  
    }
    catch(error) {
      console.log(error)
      return {
        message: "Lổi hệ thống",
        status: HttpStatus.INTERNAL_SERVER_ERROR
      }
    }
  }

  @MessagePattern(ChatsCommand.RENAME_GROUP_CHAT)
  async renameGroupChat(data: {id: number, groupName: string}) {
    try {
      const {id, groupName} = {...data}
      const group = await this.chatService.findActiveGroupChatById(id)
      if (!group) {
        return {
          message: "Nhóm chat không hoạt động",
          status: HttpStatus.BAD_REQUEST,
        }
      }
      const findGroupName = await this.chatService.findActiveGroupChatByName(groupName)
      if (findGroupName) {
        return {
          message: "Tên nhóm tồn tại",
          status: HttpStatus.BAD_REQUEST
        }
      }
      await this.chatService.updateGroupName(id, groupName)
      const updatedGroup = await this.chatService.findActiveGroupChatById(id)
      return {
        message: "Thay đổi tên nhóm chat thành công",
        status: HttpStatus.OK,
        data: updatedGroup,
      }
    }
    catch(error) {
      return {
        message: "Lổi hệ thống",
        status: HttpStatus.INTERNAL_SERVER_ERROR
      }
    }
  }

  @MessagePattern(ChatsCommand.ADD_MEMBER)
  async addGroupMember(data: any) {
    try {
      const {groupChatId, userId} = data
      const group = await this.chatService.findActiveGroupChatById(groupChatId)
      if (!group) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Nhóm chat không hoạt động"
        }
      }
      const userInGroup = await this.chatService.findActiveGroupMember(userId, groupChatId)
      if (userInGroup) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Người dùng tồn tại trong nhóm chat"
        }
      }
      const payload: Prisma.groupChatMemberUncheckedCreateInput = {
        userId,
        groupChatId,
      }
      const member = await this.chatService.addGroupMember(payload)
      return {
        status: HttpStatus.OK,
        message: "Thêm người dùng thành công",
        data: member
      }

    } catch(error) {
      console.log(error)
      return {
        message: "Lỗi hệ thống",
        status: HttpStatus.INTERNAL_SERVER_ERROR
      }

    }
  }

  @MessagePattern(ChatsCommand.DELETE_GROUP)
  async deleteGroup(data: {id: number}) {
    try {
      const id = data.id
      const group = await this.chatService.findActiveGroupChatById(id)
      if (!group) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Nhóm chat không tồn tại"
        }
      }
      await this.chatService.deleteGroup(id)
      const deletedGroup = await this.chatService.findActiveGroupChatById(id)
      if(deletedGroup) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Xóa nhóm không thành công"
        }
      }
      return {
        status: HttpStatus.OK,
        message: "Xóa nhóm thành công"
      }
    }
    catch(error) {
      console.log(error) 
      return {
        message: "Lỗi hệ thống",
        status: HttpStatus.INTERNAL_SERVER_ERROR
      }
    }
  }

  @MessagePattern(ChatsCommand.DELETE_MEMBER)
  async deleteMember(data: {groupChatId: number, userId: string}) {
    try {
      const {userId, groupChatId} = {...data}
      const group = await this.chatService.findActiveGroupChatById(groupChatId)
      if (!group) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Nhóm chat không tồn tại"
        }
      }
      const member = await this.chatService.findActiveGroupMember(userId, groupChatId)
      if(!member) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Thành viên không tồn tại"
        }
      }
      if(member.isAdmin === true) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Thành viên đang là admin"
        }
      }
      const id = member.id
      await this.chatService.deleteMember(id)
      return {
        status: HttpStatus.OK,
        message: "Xóa thành công"
      }
    }
    catch(error) {
      console.log(error) 
      return {
        message: "Lỗi hệ thống",
        status: HttpStatus.INTERNAL_SERVER_ERROR
      }
    }
  }

  @MessagePattern(ChatsCommand.FIND_ALL_GROUP)
  async findGroupChat(data: {userId: string|undefined}) {
    try {
      var group = []
      const userId = data.userId
      if (userId !== undefined) {
        group = await this.chatService.findAllActiveGroupChat()
      } else {
        group = await this.chatService.findAllActiveGroupChatByUserId(userId)
      }
      if (group.length == 0 ) {
        return {
          message: "Không tìm thấy danh sách nhóm",
          status: HttpStatus.BAD_REQUEST,
        }
      }
      for(var i =0;i < group.length; i++) {
        var member = {}
        for(var j =0; j<group[i].groupChatMember.length; j++) {
          member = {
            userId: group[i].groupChatMember[j].userId,
            joinedAt: group[i].groupChatMember[j].joinedAt,
            isAdmin: group[i].groupChatMember[j].isActive,
            email: group[i].groupChatMember[j].users.email,
            firstName: group[i].groupChatMember[j].users.firstName,
            lastName: group[i].groupChatMember[j].users.lastName,
            role: group[i].groupChatMember[j].users.role.name,
          }
          group[i].groupChatMember[j] = member
        }
      }
      return {
        message : "Tìm kiếm nhóm chat thành công",
        status: HttpStatus.OK,
        data: group
      }  
    }
    catch(error) {
      console.log(error)
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: "Lỗi hệ thống",
      }
    }
  }
}
