"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffController = void 0;
const common_1 = require("@nestjs/common");
const staff_service_1 = require("./staff.service");
const microservices_1 = require("@nestjs/microservices");
const command_1 = require("./command");
let StaffController = class StaffController {
    constructor(staffService) {
        this.staffService = staffService;
    }
    async createStaff(data) {
        try {
            const { memberId } = data;
            console.log(memberId);
            const staff = await this.staffService.createStaff(memberId);
            if (!staff) {
                return {
                    message: "Tạo thất bại",
                    status: common_1.HttpStatus.BAD_REQUEST
                };
            }
            return {
                message: "Tạo thành công",
                status: common_1.HttpStatus.OK,
                data: staff
            };
        }
        catch (error) {
            console.log(error);
            return {
                message: "Lỗi hệ thồng",
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR
            };
        }
    }
    async findStaffById(data) {
        try {
            const { id } = data;
            const staff = await this.staffService.findStaffById(id);
            if (!staff) {
                return {
                    message: "Tìm kiếm thất bại",
                    status: common_1.HttpStatus.BAD_REQUEST
                };
            }
            return {
                message: "Tìm kiếm thành công",
                status: common_1.HttpStatus.OK,
                data: staff
            };
        }
        catch (error) {
            console.log(error);
            return {
                message: "Lỗi hệ thống",
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            };
        }
    }
    async deleteStaff(data) {
        try {
            const { id } = data;
            await this.staffService.deleteStaff(id);
            const staff = await this.staffService.findStaffById(id);
            if (staff) {
                return {
                    message: "Xóa thất bại",
                    status: common_1.HttpStatus.BAD_REQUEST
                };
            }
            return {
                message: "Xóa thành công",
                status: common_1.HttpStatus.OK,
            };
        }
        catch (error) {
            console.log(error);
            return {
                message: "Lỗi hệ thống",
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            };
        }
    }
    async updateStaff(data) {
        try {
            const { id, ...payload } = data;
            const staff = await this.staffService.updateStaff(id, payload);
            return {
                message: "Xóa thành công",
                status: common_1.HttpStatus.OK,
                data: staff
            };
        }
        catch (error) {
            console.log(error);
            return {
                message: "Lỗi hệ thống",
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            };
        }
    }
    async findStaffByUserID(data) {
        try {
            const { userId } = data;
            const staff = await this.staffService.findStaffByUserId(userId);
            return {
                message: "Tìm kiếm thành công",
                status: common_1.HttpStatus.OK,
                data: staff
            };
        }
        catch (error) {
            console.log(error);
            return {
                message: "Lỗi hệ thống",
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            };
        }
    }
    async findAllStaff() {
        try {
            const staff = await this.staffService.findAllStaff();
            return {
                message: "Tìm kiếm thành công",
                status: common_1.HttpStatus.OK,
                data: staff
            };
        }
        catch (error) {
            console.log(error);
            return {
                message: "Lỗi hệ thống",
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            };
        }
    }
    async createSchedule(data) {
        try {
            const { ...payload } = data;
            const schedule = await this.staffService.createSchedule(payload);
            if (!schedule) {
                return {
                    message: "Tạo lịch làm việc thất bại",
                    status: common_1.HttpStatus.BAD_REQUEST
                };
            }
            const { startTime, endTime, ...rest } = schedule;
            const responseData = {
                startTime: startTime.toISOString().substring(0, 16).replace("T", " "),
                endTime: endTime.toISOString().substring(0, 16).replace("T", " "),
                ...rest,
            };
            return {
                message: "Tạo lịch làm việc thành công",
                status: common_1.HttpStatus.OK,
                data: responseData,
            };
        }
        catch (error) {
            console.log(error);
            return {
                message: "Lỗi hệ thống",
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            };
        }
    }
    async updateSchedule(data) {
        try {
            const { id, ...payload } = data;
            const schedule = await this.staffService.findScheduleById(id);
            if (!schedule) {
                return {
                    message: "Lịch làm việc không tồn tại",
                    status: common_1.HttpStatus.BAD_REQUEST
                };
            }
            const updatedSchedule = await this.staffService.updateSchedule(payload, id);
            const { startTime, endTime, ...rest } = updatedSchedule;
            const responseData = {
                startTime: startTime.toISOString().substring(0, 16).replace("T", " "),
                endTime: endTime.toISOString().substring(0, 16).replace("T", " "),
                ...rest,
            };
            return {
                message: "Cập nhật lịch làm việc thành công",
                status: common_1.HttpStatus.OK,
                data: responseData
            };
        }
        catch (error) {
            console.log(error);
            return {
                message: "Lỗi hệ thống",
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            };
        }
    }
    async deleteSchedule(data) {
        try {
            const { id } = data;
            await this.staffService.deleteSchdule(id);
            const schedule = await this.staffService.findScheduleById(id);
            if (schedule) {
                return {
                    message: "Xóa lịch làm việc thất bại",
                    status: common_1.HttpStatus.BAD_REQUEST,
                };
            }
            return {
                message: "Xóa lịch làm việc thành công",
                status: common_1.HttpStatus.OK,
                data: null
            };
        }
        catch (error) {
            console.log(error);
            return {
                message: "Lỗi hệ thống",
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            };
        }
    }
    async findScheduleById(data) {
        try {
            const { id } = data;
            const schedule = await this.staffService.findScheduleById(id);
            if (!schedule) {
                return {
                    message: "Tỉm kiếm lịch làm việc thất bại",
                    status: common_1.HttpStatus.BAD_REQUEST
                };
            }
            const { startTime, endTime, ...rest } = schedule;
            const responseData = {
                startTime: startTime.toISOString().substring(0, 16).replace("T", " "),
                endTime: endTime.toISOString().substring(0, 16).replace("T", " "),
                ...rest,
            };
            return {
                message: "Tìm lịch làm việc thành công",
                status: common_1.HttpStatus.OK,
                data: responseData,
            };
        }
        catch (error) {
            console.log(error);
            return {
                message: "Lỗi hệ thống",
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            };
        }
    }
    async findScheduleByStaffId(data) {
        try {
            const { staffId } = data;
            var responseList = [];
            const schedules = await this.staffService.findScheduleByStaffId(staffId);
            for (var schedule of schedules) {
                const { startTime, endTime, ...rest } = schedule;
                const responseData = {
                    startTime: startTime.toISOString().substring(0, 16).replace("T", " "),
                    endTime: endTime.toISOString().substring(0, 16).replace("T", " "),
                    ...rest,
                };
                responseList.push(responseData);
            }
            return {
                message: "Tìm lịch làm việc thành công",
                status: common_1.HttpStatus.OK,
                data: responseList,
            };
        }
        catch (error) {
            console.log(error);
            return {
                message: "Lỗi hệ thống",
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
            };
        }
    }
};
exports.StaffController = StaffController;
__decorate([
    (0, microservices_1.MessagePattern)(command_1.StaffCommand.CREATE_STAFF),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "createStaff", null);
__decorate([
    (0, microservices_1.MessagePattern)(command_1.StaffCommand.FIND_STAFF_BY_ID),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "findStaffById", null);
__decorate([
    (0, microservices_1.MessagePattern)(command_1.StaffCommand.DELETE_STAFF),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "deleteStaff", null);
__decorate([
    (0, microservices_1.MessagePattern)(command_1.StaffCommand.UPDATE_STAFF),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "updateStaff", null);
__decorate([
    (0, microservices_1.MessagePattern)(command_1.StaffCommand.FIND_STAFF_BY_USER_ID),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "findStaffByUserID", null);
__decorate([
    (0, microservices_1.MessagePattern)(command_1.StaffCommand.FIND_ALL_STAFF),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "findAllStaff", null);
__decorate([
    (0, microservices_1.MessagePattern)(command_1.StaffCommand.CREATE_SCHEDULE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "createSchedule", null);
__decorate([
    (0, microservices_1.MessagePattern)(command_1.StaffCommand.UPDATE_SCHEDULE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "updateSchedule", null);
__decorate([
    (0, microservices_1.MessagePattern)(command_1.StaffCommand.DELETE_SCHEDULE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "deleteSchedule", null);
__decorate([
    (0, microservices_1.MessagePattern)(command_1.StaffCommand.FIND_SCHEDULE_BY_ID),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "findScheduleById", null);
__decorate([
    (0, microservices_1.MessagePattern)(command_1.StaffCommand.FIND_SCHEDULE_BY_STAFF_ID),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StaffController.prototype, "findScheduleByStaffId", null);
exports.StaffController = StaffController = __decorate([
    (0, common_1.Controller)('staff'),
    __metadata("design:paramtypes", [staff_service_1.StaffService])
], StaffController);
//# sourceMappingURL=staff.controller.js.map