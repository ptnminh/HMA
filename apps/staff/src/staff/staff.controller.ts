import { Controller, HttpStatus, Inject } from '@nestjs/common';
import { StaffService } from './staff.service';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { AuthCommand, StaffCommand } from './command';
import { Prisma } from '@prisma/client';
import { mapDateToNumber } from 'src/shared';
import { some } from 'lodash';
import { convertVietnameseString, isContainSpecialChar } from './utils';
import { firstValueFrom } from 'rxjs';

@Controller('staff')
export class StaffController {
  constructor(
    private staffService: StaffService,
    @Inject('AUTH_SERVICE') private readonly authServiceClient: ClientProxy,
  ) {}

  @MessagePattern(StaffCommand.CREATE_STAFF)
  async createStaff(data: any) {
    try {
      const { userInfo, clinicId, roleId, services, ...rest } = data;
      let userId = data.userId;
      let uniqueId: string = '';
      if (!userId) {
        const randomPassword = Math.random().toString(36).slice(-8);
        uniqueId = randomPassword;
        const userPayload: Prisma.usersUncheckedCreateInput = {
          email: userInfo.email,
          firstName: userInfo?.firstName,
          lastName: userInfo?.lastName,
          phone: userInfo?.phone,
          password: randomPassword,
          avatar: userInfo?.avatar,
          isInputPassword: false,
          gender: userInfo?.gender,
          address: userInfo?.address,
          moduleId: 5,
          emailVerified: false,
          ...(userInfo.birthday && {
            birthday: new Date(userInfo.birthday).toISOString(),
          }),
        };
        const createUserResponse = await firstValueFrom(
          this.authServiceClient.send(AuthCommand.USER_CREATE, {
            ...userPayload,
            type: 'CREATE_STAFF',
            rawPassword: randomPassword,
            uniqueId,
          }),
        );
        if (createUserResponse.status !== HttpStatus.CREATED) {
          return {
            message: createUserResponse.message,
            status: HttpStatus.BAD_REQUEST,
          };
        }
        userId = createUserResponse.id;
      }
      const payload: Prisma.staffsUncheckedCreateInput = {
        userId,
        roleId,
        clinicId,
        isAcceptInvite: userInfo ? false : true,
        ...(uniqueId ? { uniqueId } : {}),
        ...rest,
      };
      const staff = await this.staffService.createStaff(payload);
      if (!staff) {
        return {
          message: 'Tạo staff thất bại',
          status: HttpStatus.BAD_REQUEST,
        };
      }
      if (services !== null || services !== undefined) {
        for (const clinciServiceId of services) {
          const clinicService =
            await this.staffService.findClinicServiceById(clinciServiceId);
          if (clinicService) {
            const payload = {
              clinicServiceId: clinicService.id,
              staffId: staff.id,
            };
            await this.staffService.createStaffService(payload);
          }
        }
      }
      const createdStaff = await this.staffService.findStaffById(staff.id);
      return {
        message: 'Tạo staff thành công',
        status: HttpStatus.OK,
        data: createdStaff,
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
          message: 'Nhân viên không tồn tại',
          status: HttpStatus.BAD_REQUEST,
        };
      }
      delete staff.users.password;
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
      const staff = await this.staffService.findStaffById(id);
      if (!staff) {
        return {
          message: 'Nhân viên không tồn tại',
          status: HttpStatus.BAD_REQUEST,
        };
      }
      await this.staffService.deleteStaff(id);
      const deletedStaff = await this.staffService.findStaffById(id);
      if (deletedStaff) {
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
      const { id, services, ...payload } = data;
      const staff = await this.staffService.findStaffById(id);
      if (!staff) {
        return {
          message: 'Nhân viên không tồn tại',
          status: HttpStatus.BAD_REQUEST,
        };
      }
      if (services !== null && services !== undefined) {
        await this.staffService.deleteStaffServiceByStaffId(id);
        for (const clinciServiceId of services) {
          const clinicService =
            await this.staffService.findClinicServiceById(clinciServiceId);
          if (clinicService) {
            const payload = {
              clinicServiceId: clinicService.id,
              staffId: id,
            };
            await this.staffService.createStaffService(payload);
          }
        }
      }

      await this.staffService.updateStaff(id, payload);
      const updatedStaff = await this.staffService.findStaffById(id);
      return {
        message: 'Cập nhật staff thành công',
        status: HttpStatus.OK,
        data: updatedStaff,
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
      const staff = await this.staffService.findStaffById(payload.staffId);
      if (!staff) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: true,
        };
      }
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

  @MessagePattern(StaffCommand.FIND_SCHEDULE_BY_STAFF_ID)
  async findScheduleByStaffId(data: any) {
    try {
      const { staffId } = data;
      const staff = await this.staffService.findStaffById(staffId);
      if (!staff) {
        return {
          message: 'Nhân viên không tồn tại',
          status: HttpStatus.BAD_REQUEST,
        };
      }
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

  @MessagePattern(StaffCommand.UPDATE_STAFF_SERVICE)
  async updateStaffService(data: any) {
    try {
      const { clinicServiceList, staffId } = data;
      await this.staffService.deleteStaffServiceByStaffId(staffId);
      for (const clinciServiceId of clinicServiceList) {
        const clinicService =
          await this.staffService.findClinicServiceById(clinciServiceId);
        if (clinicService) {
          const payload = {
            clinicServiceId: clinicService.id,
            staffId,
          };
          await this.staffService.createStaffService(payload);
        }
      }
      const createdStaffService =
        await this.staffService.findStaffServiceByStaffId(staffId);
      return {
        data: createdStaffService,
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

  @MessagePattern(StaffCommand.FIND_SERVICE_BY_STAFF_ID)
  async findServiceByStaffId(data: any) {
    try {
      const { staffId } = data;
      const staff = await this.staffService.findStaffById(staffId);
      if (!staff) {
        return {
          message: 'Nhân viên không tồn tại',
          status: HttpStatus.BAD_REQUEST,
        };
      }
      const services =
        await this.staffService.findStaffServiceByStaffId(staffId);
      return {
        message: 'Lấy danh sách thông tin service thành công',
        status: HttpStatus.OK,
        data: services,
      };
    } catch (error) {
      console.log(error);
      return {
        message: 'Lỗi hệ thống',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @MessagePattern(StaffCommand.FIND_APPOINTMENT_BY_STAFF_ID)
  async getAppointmentsByStaffId(data: any) {
    try {
      const { staffId } = data;
      const staff = await this.staffService.findStaffById(staffId);
      if (!staff) {
        return {
          message: 'Nhân viên không tồn tại',
          status: HttpStatus.BAD_REQUEST,
        };
      }
      const appointments =
        await this.staffService.findAppointmentByStaffId(staffId);
      return {
        message: 'Lấy danh sách thông tin service thành công',
        status: HttpStatus.OK,
        data: appointments,
      };
    } catch (error) {
      console.log(error);
      return {
        message: 'Lỗi hệ thống',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @MessagePattern(StaffCommand.FIND_FREE_APPOINTMENT_BY_STAFF_ID)
  async findFreeAppointmentByStaffId(data: any) {
    try {
      const { staffId, date } = data;
      const staff = await this.staffService.findStaffById(staffId);
      if (!staff) {
        return {
          message: 'Nhân viên không tồn tại',
          status: HttpStatus.BAD_REQUEST,
        };
      }
      const appointments = await this.staffService.findAppointmentByStaffId(
        staffId,
        date,
      );
      const day = mapDateToNumber(date);
      const staffSchedules =
        await this.staffService.findScheduleByStaffId(staffId);
      const scheduleInDay = staffSchedules.filter(
        (schedule) => schedule.day === day,
      );
      const freeSchedule = scheduleInDay.filter((schedule) => {
        const startTime = schedule.startTime;
        const endTime = schedule.endTime;
        const isExistsAppointment = some(appointments, (appointment) => {
          return (
            appointment.startTime === startTime &&
            appointment.endTime === endTime
          );
        });
        return !isExistsAppointment;
      });
      return {
        message: 'Lấy danh sách lịch trống thành công',
        status: HttpStatus.OK,
        data: freeSchedule,
      };
    } catch (error) {
      console.log(error);
      return {
        message: 'Lỗi hệ thống',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @MessagePattern(StaffCommand.SEARCH_STAFF)
  async searchStaff(data: any) {
    try {
      const { name, ...query } = data;
      const isEmpty = Object.values(data).every(
        (value) => value === null || value === '',
      );
      console.log(query)
      if (isEmpty) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Không có dữ liệu tìm kiếm',
        };
      }
      var stringName = name ? convertVietnameseString(name) : '';
      if (
        (name && !name.replace(/^\s+|\s+$/g, '')) ||
        (name && isContainSpecialChar(name))
      ) {
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Tên không hợp lệ',
        };
      }
      var staffs = await this.staffService.searchStaff(query);

      return {
        status: HttpStatus.OK,
        message: 'Lấy danh sách thông tin staff thành công',
        data: staffs.map((value) => {
          const {users, role, ... rest} = value
          if(users) delete(users.password)
          const {rolePermissions, ...roleData} = role
          return {
            ...rest,
            users,
            role: {
              ...roleData,
              permissions: rolePermissions.map((item) => {
                return item.permission
              })
            }
          }
        })
      };
    } catch (error) {
      console.log(error);
      return {
        message: 'Lỗi hệ thống',
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }
}
