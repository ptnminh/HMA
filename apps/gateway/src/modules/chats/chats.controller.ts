import {
    Controller,
    Get,
    Delete,
    Post,
    Body,
    Param,
    Put,
    Inject,
    HttpStatus,
    HttpException,
    GatewayTimeoutException,
    Query,
    UseGuards,
  } from '@nestjs/common';
  import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiQuery,
    ApiTags,
  } from '@nestjs/swagger';
  import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
  import { ClientProxy } from '@nestjs/microservices';
  import { firstValueFrom } from 'rxjs';
import { ChatsCommand } from './command';
import { CurrentUser } from 'src/decorators';
import {  CreateGroupChatDto } from './dto';
import { AuthCommand } from '../auth/command';
import { UpdatedGroupDto } from './dto/update-group.dto';
import { group } from 'console';
import { userListDto } from './dto/user-list.dto';
  
  @Controller('chats')
  @ApiTags('Chats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('Bearer')
  export class ChatsController {
    constructor(
      @Inject('CHATS_SERVICE') private readonly ChatsServiceClient: ClientProxy,
    ) {}

    @Get(':id/users')
    async findAllGroupMembers(@Param('id') id: string) {
        const chatServiceResponse = await firstValueFrom(this.ChatsServiceClient.send(
            ChatsCommand.FIND_ALL_MEMBER, {id: parseInt(id),}
        ));
        if (chatServiceResponse.status !== HttpStatus.OK) {
            throw new HttpException(
                {
                  message: chatServiceResponse.message,
                  data: null,
                  status: false,
                },
                chatServiceResponse.status
            )
        }
        return {
            message: chatServiceResponse.message,
            data: chatServiceResponse.data,
            status: true,
        };
    }

    @Post()
    async createGroup(
        @Body() dto: CreateGroupChatDto, 
        @CurrentUser('id') adminId: string,
    ){
        const chatServiceResponse = await firstValueFrom(this.ChatsServiceClient.send(
            ChatsCommand.CREATE_GROUP_CHAT, {dto, adminId}
        ));
        if (chatServiceResponse.status !== HttpStatus.OK) {
            throw new HttpException(
                {
                  message: chatServiceResponse.message,
                  data: null,
                  status: false,
                },
                chatServiceResponse.status
            )
        }
        return {
            message: chatServiceResponse.message,
            data: chatServiceResponse.data,
            status: true,
        };

    }

    @Post(':groupChatId/user')
    async addGroupMember(@Param('groupChatId') groupChatId: string,@Body() dto: userListDto)  {
        const data = {
            userList: dto.userList,
            groupChatId: parseInt(groupChatId)
        }
        const chatServiceResponse = await firstValueFrom(this.ChatsServiceClient.send(
            ChatsCommand.ADD_MEMBER, {...data}
        ));
        if (chatServiceResponse.status !== HttpStatus.OK) {
            throw new HttpException(
                {
                  message: chatServiceResponse.message,
                  data: null,
                  status: false,
                },
                chatServiceResponse.status
            )
        }
        return {
            message: chatServiceResponse.message,
            data: chatServiceResponse.data,
            status: true,
        };


    }

    @Put(':id')
    async updateGroup (
        @Body() dto: UpdatedGroupDto,
        @Param('id') id: string,
        @CurrentUser('id') adminId: string,
    ) {
        const data = {
            dto,
            id: parseInt(id),
            adminId,
        }
        const chatServiceResponse = await firstValueFrom(this.ChatsServiceClient.send(
            ChatsCommand.RENAME_GROUP_CHAT, {...data}
        ));
        if (chatServiceResponse.status !== HttpStatus.OK) {
            throw new HttpException(
                {
                  message: chatServiceResponse.message,
                  data: null,
                  status: false,
                },
                chatServiceResponse.status
            )
        }
        return {
            message: chatServiceResponse.message,
            data: chatServiceResponse.data,
            status: true,
        };
    }

    @Delete(':groupChatId/user')
    async deleteMember (@Param('groupChatId') groupChatId: string,@Body() dto: userListDto  ) {
        const data = {
            groupChatId: parseInt(groupChatId),
            dto,
        }
        const chatServiceResponse = await firstValueFrom(this.ChatsServiceClient.send(
            ChatsCommand.DELETE_MEMBER, {...data}
        ));
        if (chatServiceResponse.status !== HttpStatus.OK) {
            throw new HttpException(
                {
                  message: chatServiceResponse.message,
                  data: null,
                  status: false,
                },
                chatServiceResponse.status
            )
        }
        return {
            message: chatServiceResponse.message,
            data: chatServiceResponse.data,
            status: true,
        };
    }

    @Delete(':id')
    async deleteGroup (@Param('id') id: string) {
        const data = {
            id: parseInt(id),
        }
        const chatServiceResponse = await firstValueFrom(this.ChatsServiceClient.send(
            ChatsCommand.DELETE_GROUP, {...data}
        ));
        if (chatServiceResponse.status !== HttpStatus.OK) {
            throw new HttpException(
                {
                  message: chatServiceResponse.message,
                  data: null,
                  status: false,
                },
                chatServiceResponse.status
            )
        }
        return {
            message: chatServiceResponse.message,
            data: chatServiceResponse.data,
            status: true,
        };
    }

    @ApiQuery({
        name: "userId",
        type: String,
        required: false,
    })
    @Get()
    async getAllGroup (@Query('userId') userId: string) {
        const data = {userId}
        const chatServiceResponse = await firstValueFrom(this.ChatsServiceClient.send(
            ChatsCommand.FIND_ALL_GROUP, {...data}
        ));
        if (chatServiceResponse.status !== HttpStatus.OK) {
            throw new HttpException(
                {
                  message: chatServiceResponse.message,
                  data: null,
                  status: false,
                },
                chatServiceResponse.status
            )
        }
        return {
            message: chatServiceResponse.message,
            data: chatServiceResponse.data,
            status: true,
        };
    }
}