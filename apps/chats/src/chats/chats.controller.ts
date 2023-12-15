import { Controller, HttpStatus } from '@nestjs/common';
import { ChatService } from './chats.service';
import { CreateGroupDto } from './dto';
import { MessagePattern } from '@nestjs/microservices';
import { ChatsCommand } from './command';
import { Prisma } from '@prisma/client';
import { create } from 'domain';

@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @MessagePattern(ChatsCommand.CREATE_GROUP_CHAT)
  async createGroup(data: {dto: CreateGroupDto, adminId: string}) {
    try {
      const {userList, ...rest} = data.dto
      const adminId = data.adminId
      const existedName = await this.chatService.findGroupChatByName(rest.groupName)
      if (existedName) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Tên nhóm chat đã tồn tại"
        }
      }
      if (!userList.includes(adminId)) {
        userList.push(adminId)
      }
      if(userList.length > rest.maxMember) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Số lượng thành viên quá giới hạn"
        }
      }
      if(rest.type === 'one-on-one' && rest.maxMember > 2) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Nhóm chat đơn có số lượng thành viên không lớn hơn 2"
        }
      }
      const group = await this.chatService.createGroup(rest)
      
      const groupChatId = group.id
      const adminInput: Prisma.groupChatMemberUncheckedCreateInput = {
        groupChatId,
        userId: adminId,
      }
      if (group.type === 'group') {
        adminInput.isAdmin = true
      }
      const admin = await this.chatService.findActiveGroupMember(adminId, groupChatId)
      if(!admin) {
        await this.chatService.createMember(adminInput)
      }
      for(let userId of userList) {
        const user = await this.chatService.findActiveGroupMember(userId, groupChatId)
        if(!user) {
          const userInput: Prisma.groupChatMemberUncheckedCreateInput = {
            groupChatId,
            userId,
          }
        await this.chatService.createMember(userInput)
        }  
      }
      const returnGroup = await this.chatService.findActiveGroupChatById(groupChatId)
      return {
        data: returnGroup,
        status: HttpStatus.OK,
        message: "Tạo nhóm chat thành công"
      }
    } 
    catch(error) {
      return {
        message: "Lổi hệ thống",
        status: HttpStatus.INTERNAL_SERVER_ERROR
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
      const updateInput: Prisma.groupChatsUncheckedUpdateInput = {
        groupName,
      }
      await this.chatService.updateGroup(updateInput, id)
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
      const {groupChatId, userList} = data
      console.log(userList)
      const group = await this.chatService.findActiveGroupChatById(groupChatId)
      if (!group) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Nhóm chat không hoạt động"
        }
      }
      const checkeduserList: string[] = []
      for (let userId of userList) {
        const user = await this.chatService.findActiveGroupMember(userId, groupChatId)
        if(!user) {
          checkeduserList.push(userId)
        }
      }
      const memberList = await this.chatService.getAllGroupChatMember(groupChatId)
      if(group.type === 'one-on-one' && memberList.length + checkeduserList.length > 2) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Số lượng thành viên vượt giói hạn"
        }
      }

      if(memberList.length + checkeduserList.length > group.maxMember) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: "Số lượng thành viên vượt giói hạn"
        }
      }

      for (let userId of userList) {
        const user = await this.chatService.findActiveGroupMember(userId, groupChatId)
        if(!user){
          const createInput: Prisma.groupChatMemberUncheckedCreateInput = {
            userId,
            groupChatId,
          }
          await this.chatService.createMember(createInput)  
        }
      }
      return {
        status: HttpStatus.OK,
        message: "Thêm người dùng thành công",
        data: null
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
  async findGroupChat(data: {userId: string}) {
    try {
      var group = []
      const userId = data.userId
      if (userId === undefined) {
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
      var memberList = []
      for(let groupObj of group) {
        var member = {}
        for(let memberobj of groupObj.groupChatMember) {
          member = {
            userId: memberobj.userId,
            joinedAt: memberobj.joinedAt,
            isAdmin: memberobj.isAdmin,
            email: memberobj.users.email,
            firstName: memberobj.users.firstName,
            lastName: memberobj.users.lastName,
          }
          if(memberobj.isDisabled === false) {
            memberList.push(member)
          }
        }
        group[group.indexOf(groupObj)].groupChatMember = member
        
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
