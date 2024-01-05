import { Controller, HttpStatus } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { MessagePattern } from '@nestjs/microservices';
import { ScheduleCommand } from 'src/command';
import { Prisma } from '@prisma/client';

@Controller('schedule')
export class ScheduleController {

    constructor(private scheduleService: ScheduleService) {}

    @MessagePattern(ScheduleCommand.FIND_SCHEDULE_BY_ID)
    async findScheduleById (data: any) {
        try {
            const {id} = data
            const schedule = await this.scheduleService.findScheduleById(id)
            if (!schedule) {
                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: "Không tìm thấy lịch"
                }
            }
            return {
                status: HttpStatus.OK,
                message: "Tìm lịch thành công",
                data: schedule
            }
    
        }
        catch(error) {
            console.log(error)
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Lỗi hệ thống"
            }
        }
    }

    @MessagePattern(ScheduleCommand.FIND_SCHEDULE_BY_USER_ID)
    async findScheduleByUserId(data: any) {
        try {
            const {userId} = data
            const schedules = await this.scheduleService.findScheduleByUserId(userId)
            return {
                status: HttpStatus.OK,
                message: "Tỉm kiếm thành công",
                data: schedules
            }
        }
        catch(error) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Lối hệ thống"
            }
        }
    }

    @MessagePattern(ScheduleCommand.CREATE_SCHEDULE)
    async createSchedule(data: any) {
        try {
            const payload: Prisma.userSchedulesUncheckedCreateInput = {...data}
            console.log({...payload})
            const schedule = await this.scheduleService.createSchedule(payload)
            if (!schedule) {
                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: "Tạo thất bại"
                }
            }
            return {
                status: HttpStatus.OK,
                message: "Tạo thành công",
                data: schedule,
            }
        }
        catch(error) {
            console.log(error)
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Lỗi hệ thống"
            }
        }
    }


    @MessagePattern(ScheduleCommand.DELETE_SCHEDULE)
    async deleteSchedule(data: any) {
        try {
            const {id} = data
            console.log(id)
            await this.scheduleService.deleteSchedule(id)
            const schedule = await this.scheduleService.findScheduleById(id)
            if (schedule) {
                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: "Xóa thất bại"
                }
            }
            return {
                status: HttpStatus.OK,
                message: "Xóa thành công",
                data: null,
            }
        }
        catch(error) {
            console.log(error)
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Lỗi hệ thống"
            }
        }
    }


    @MessagePattern(ScheduleCommand.UPDATE_SCHEDULE)
    async updateSchedule(data: any) {
        try {
            const {id, ...payload} = data
            const updateInput: Prisma.userSchedulesUncheckedUpdateInput = {...payload}
            const schedule = await this.scheduleService.updateSchedule(id, updateInput)
            return  {
                status: HttpStatus.OK,
                data: schedule,
                message: "Cập nhật thành công",
            }
        }
        catch(error) {
            console.log(error)
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Lỗi hệ thống"
            }
        }

    }
}
