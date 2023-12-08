import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateGroupChatDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private readonly prismaService: PrismaService) {}
  async createGroupChat(dto: CreateGroupChatDto) {
    return this.prismaService.groupChats.create({
      data: {...dto},
      select: {
        id: true,
        groupName: true,
        maxMember: true,
        type: true,
      }
    })
  }

  async findGroupChatByName(groupName: string) {
    return this.prismaService.groupChats.findFirst({
      where: {
        groupName,
      }
    })
  }

  async findActiveGroupChatById(id: number) {
    return this.prismaService.groupChats.findFirst({
      where: {
        id,
        isActive: true,
      }
    })
  }

  async findActiveGroupChatByName(groupName: string) {
    return this.prismaService.groupChats.findFirst({
      where: {
        groupName,
        isActive: true,
      },
    })

  }

  async getAllGroupChatMember(id: number) {
    return this.prismaService.groupChatMember.findMany({
      where: {
        groupChatId: id,
        isDisabled: false
      },
      select: {
        id: true,
        groupChatId: true,
        userId: true,
        isAdmin: true,
        joinedAt: true,
        isDisabled: true,
      }
    })
  }

  async updateGroupName(id: number, groupName: string) {
    return this.prismaService.groupChats.update({
      where: {
        id, 
        isActive: true,
      },
      data: {
        groupName,          
      }
    })
  }

  async findActiveGroupMember(userId: string, groupChatId: number) {
    return this.prismaService.groupChatMember.findFirst({
      where: {
        userId,
        groupChatId,
        isDisabled: false
      }
    })
  }

  async addGroupMember(payload: Prisma.groupChatMemberUncheckedCreateInput) {
    return this.prismaService.groupChatMember.create({
      data: {
        ...payload
      }
    })
  }

  async addGroupAdmin(userId: string, groupChatId: number) {
    return this.prismaService.groupChatMember.create({
      data: {
        userId,
        groupChatId,
        isAdmin: true,
      }
    })
  }

  async deleteGroup(id: number) {
    return this.prismaService.groupChats.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      }
    })
  }

  async deleteMember(id: number) {
    return this.prismaService.groupChatMember.update({
      where: {
        id,
      },
      data: {
        isDisabled: true
      }
    })
  }
}
