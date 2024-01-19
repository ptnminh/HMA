import { Controller, HttpStatus } from '@nestjs/common';
import { StaffService } from './staff.service';
import { MessagePattern } from '@nestjs/microservices';
import { StaffCommand } from './command';
import { Prisma } from '@prisma/client';

@Controller('staff')
export class StaffController {
  constructor(private staffService: StaffService) {}

  @MessagePattern(StaffCommand.CREATE_STAFF)
  async createStaff(data: any) {
    try {
      const { memberId } = data;
      console.log(memberId);
      const staff = await this.staffService.createStaff(memberId);
      if (!staff) {
        return {
          message: 'Tạo thất bại',
          status: HttpStatus.BAD_REQUEST,
        };
      }
      return {
        message: 'Tạo thành công',
        status: HttpStatus.OK,
        data: staff,
      };
    } catch (error) {
      console.log(error);
      return {
        message: 'Lỗi hệ thồng',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @MessagePattern(StaffCommand.FIND_STAFF_BY_ID)
  async findStaffById(data: any) {
    try {
      const { id } = data;
      const staff = await this.staffService.findStaffById(id);
      if (!staff) {
        return {
          message: 'Tìm kiếm thất bại',
          status: HttpStatus.BAD_REQUEST,
        };
      }
      return {
        message: 'Tìm kiếm thành công',
        status: HttpStatus.OK,
        data: staff,
      };
    } catch (error) {
      console.log(error);
      return {
        message: 'Lỗi hệ thống',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @MessagePattern(StaffCommand.DELETE_STAFF)
  async deleteStaff(data: any) {
    try {
      const { id } = data;
      await this.staffService.deleteStaff(id);
      const staff = await this.staffService.findStaffById(id);
      if (staff) {
        return {
          message: 'Xóa thất bại',
          status: HttpStatus.BAD_REQUEST,
        };
      }
      return {
        message: 'Xóa thành công',
        status: HttpStatus.OK,
      };
    } catch (error) {
      console.log(error);
      return {
        message: 'Lỗi hệ thống',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @MessagePattern(StaffCommand.UPDATE_STAFF)
  async updateStaff(data: any) {
    try {
      const { id, ...payload } = data;
      const staff = await this.staffService.updateStaff(id, payload);
      return {
        message: 'Xóa thành công',
        status: HttpStatus.OK,
        data: staff,
      };
    } catch (error) {
      console.log(error);
      return {
        message: 'Lỗi hệ thống',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @MessagePattern(StaffCommand.FIND_STAFF_BY_USER_ID)
  async findStaffByUserID(data: any) {
    try {
      const { userId } = data;
      const staff = await this.staffService.findStaffByUserId(userId);
      return {
        message: 'Tìm kiếm thành công',
        status: HttpStatus.OK,
        data: staff,
      };
    } catch (error) {
      console.log(error);
      return {
        message: 'Lỗi hệ thống',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @MessagePattern(StaffCommand.FIND_ALL_STAFF)
  async findAllStaff() {
    try {
      const staff = await this.staffService.findAllStaff();
      return {
        message: 'Tìm kiếm thành công',
        status: HttpStatus.OK,
        data: staff,
      };
    } catch (error) {
      console.log(error);
      return {
        message: 'Lỗi hệ thống',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @MessagePattern(StaffCommand.CREATE_SCHEDULE)
  async createSchedule(data: any) {
    try {
      const { ...payload } = data;
      const schedule = await this.staffService.createSchedule(payload);
      if (!schedule) {
        return {
          message: 'Tạo lịch làm việc thất bại',
          status: HttpStatus.BAD_REQUEST,
        };
      }
      return {
        message: 'Tạo lịch làm việc thành công',
        status: HttpStatus.OK,
        data: schedule,
      };
    } catch (error) {
      console.log(error);
      return {
        message: 'Lỗi hệ thống',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @MessagePattern(StaffCommand.UPDATE_SCHEDULE)
  async updateSchedule(data: any) {
    try {
      const { staffId, scheduleList } = data;
      console.log(data);
      const staff = await this.staffService.findStaffById(staffId);
      if (!staff) {
        return {
          message: 'Nhân viên không tồn tại',
          status: HttpStatus.BAD_REQUEST,
        };
      }
      const currentSChedules =
        await this.staffService.findScheduleByStaffId(staffId);
      for (const element of currentSChedules) {
        await this.staffService.deleteSchedule(element.id);
      }
      for (const schedule of scheduleList) {
        const payload: Prisma.staffSchedulesUncheckedCreateInput = {
          staffId: staffId,
          startTime: schedule['startTime'],
          endTime: schedule['endTime'],
          day: schedule['day'],
        };
        await this.staffService.createSchedule(payload);
      }
      const updatedSchedule =
        await this.staffService.findScheduleByStaffId(staffId);
      return {
        data: updatedSchedule,
        message: 'Cập nhật thành công',
        status: HttpStatus.OK,
      };
    } catch (error) {
      console.log(error);
      return {
        message: 'Lỗi hệ thống',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @MessagePattern(StaffCommand.DELETE_SCHEDULE)
  async deleteSchedule(data: any) {
    try {
      const { id } = data;
      await this.staffService.deleteSchedule(id);
      const schedule = await this.staffService.findScheduleById(id);
      if (schedule) {
        return {
          message: 'Xóa lịch làm việc thất bại',
          status: HttpStatus.BAD_REQUEST,
        };
      }
      return {
        message: 'Xóa lịch làm việc thành công',
        status: HttpStatus.OK,
        data: null,
      };
    } catch (error) {
      console.log(error);
      return {
        message: 'Lỗi hệ thống',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @MessagePattern(StaffCommand.FIND_SCHEDULE_BY_ID)
  async findScheduleById(data: any) {
    try {
      const { id } = data;
      const schedule = await this.staffService.findScheduleById(id);
      if (!schedule) {
        return {
          message: 'Tỉm kiếm lịch làm việc thất bại',
          status: HttpStatus.BAD_REQUEST,
        };
      }
      return {
        message: 'Tìm lịch làm việc thành công',
        status: HttpStatus.OK,
        data: schedule,
      };
    } catch (error) {
      console.log(error);
      return {
        message: 'Lỗi hệ thống',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @MessagePattern(StaffCommand.FIND_SCHEDULE_BY_STAFF_ID)
  async findScheduleByStaffId(data: any) {
    try {
      const { staffId } = data;
      const schedules = await this.staffService.findScheduleByStaffId(staffId);
      return {
        message: 'Tìm lịch làm việc thành công',
        status: HttpStatus.OK,
        data: schedules,
      };
    } catch (error) {
      console.log(error);
      return {
        message: 'Lỗi hệ thống',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @MessagePattern(StaffCommand.CREATE_APPOINTMENT)
  async createAppointment(data: any) {
    try {
      const { ...payload } = data;
      const appointment = await this.staffService.createAppointment(payload);
      if (!appointment) {
        return {
          message: 'Tạo lịch hẹn thất bại',
          status: HttpStatus.BAD_REQUEST,
        };
      }
      return {
        message: 'Tạo lịch hẹn thành công',
        status: HttpStatus.OK,
        data: appointment,
      };
    } catch (error) {
      console.log(error);
      return {
        message: 'Lỗi hệ thống',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        data: null,
      };
    }
  }
}
