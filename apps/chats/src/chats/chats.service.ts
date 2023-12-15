import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateGroupDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private readonly prismaService: PrismaService) {}

  async createGroup(data: Prisma.groupChatsUncheckedCreateInput) {
    return await this.prismaService.groupChats.create({
      data,
    })
  }

  async updateGroup(data: Prisma.groupChatsUncheckedUpdateInput, id: number) {
    return await this.prismaService.groupChats.update({
      where: {
        id,
      },
      data,
    })
  }

  async createMember(data: Prisma.groupChatMemberUncheckedCreateInput) {
    return await this.prismaService.groupChatMember.create({
      data,
    })
  }

  async updateMember(
    data: Prisma.groupChatMemberUncheckedUpdateInput,
    id: number,
    ) {
    return await this.prismaService.groupChatMember.update({
      where: {
        id
      },
      data,
    })
  }

  async findGroupChatByName(groupName: string) {
    return this.prismaService.groupChats.findFirst({
      where: {
        groupName,
        isActive: true,
      }
    })
  }

  async findActiveGroupChatById(id: number) {
    return this.prismaService.groupChats.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        groupChatMember: true
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
        isDisabled: false,
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

  async findAllActiveGroupChat() {
    return this.prismaService.groupChats.findMany({
      where: {
        isActive: true,
        groupChatMember: {
          some: {
            isDisabled: false
          }
        }
      },
      select: {
        id: true,
        groupName: true,
        maxMember:  true,
        type: true,
        isActive: true,
        groupChatMember: true
      }
    })
  }

  async findAllActiveGroupChatByUserId(userId: string) {
    return this.prismaService.groupChats.findMany({
      where: {
        isActive: true,
        groupChatMember: {
          some: {
            userId,
            isDisabled: false
          }
        },
      },
      select: {
        id: true,
        groupName: true,
        maxMember:  true,
        type: true,
        isActive: true,
        groupChatMember: true,
      }
    })
  }
}