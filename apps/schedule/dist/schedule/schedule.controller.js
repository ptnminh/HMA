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
exports.ScheduleController = void 0;
const common_1 = require("@nestjs/common");
const schedule_service_1 = require("./schedule.service");
const microservices_1 = require("@nestjs/microservices");
const command_1 = require("../command");
let ScheduleController = class ScheduleController {
    constructor(scheduleService) {
        this.scheduleService = scheduleService;
    }
    async findScheduleById(data) {
        try {
            const { id } = data;
            const schedule = await this.scheduleService.findScheduleById(id);
            if (!schedule) {
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: "Không tìm thấy lịch"
                };
            }
            return {
                status: common_1.HttpStatus.OK,
                message: "Tìm lịch thành công",
                data: schedule
            };
        }
        catch (error) {
            console.log(error);
            return {
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Lỗi hệ thống"
            };
        }
    }
    async findScheduleByUserId(data) {
        try {
            const { userId } = data;
            const schedules = await this.scheduleService.findScheduleByUserId(userId);
            return {
                status: common_1.HttpStatus.OK,
                message: "Tỉm kiếm thành công",
                data: schedules
            };
        }
        catch (error) {
            return {
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Lối hệ thống"
            };
        }
    }
    async createSchedule(data) {
        try {
            const payload = { ...data };
            console.log({ ...payload });
            const schedule = await this.scheduleService.createSchedule(payload);
            if (!schedule) {
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: "Tạo thất bại"
                };
            }
            return {
                status: common_1.HttpStatus.OK,
                message: "Tạo thành công",
                data: schedule,
            };
        }
        catch (error) {
            console.log(error);
            return {
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Lỗi hệ thống"
            };
        }
    }
    async deleteSchedule(data) {
        try {
            const { id } = data;
            console.log(id);
            await this.scheduleService.deleteSchedule(id);
            const schedule = await this.scheduleService.findScheduleById(id);
            if (schedule) {
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: "Xóa thất bại"
                };
            }
            return {
                status: common_1.HttpStatus.OK,
                message: "Xóa thành công",
                data: null,
            };
        }
        catch (error) {
            console.log(error);
            return {
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Lỗi hệ thống"
            };
        }
    }
    async updateSchedule(data) {
        try {
            const { id, ...payload } = data;
            const updateInput = { ...payload };
            const schedule = await this.scheduleService.updateSchedule(id, updateInput);
            return {
                status: common_1.HttpStatus.OK,
                data: schedule,
                message: "Cập nhật thành công",
            };
        }
        catch (error) {
            console.log(error);
            return {
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Lỗi hệ thống"
            };
        }
    }
};
exports.ScheduleController = ScheduleController;
__decorate([
    (0, microservices_1.MessagePattern)(command_1.ScheduleCommand.FIND_SCHEDULE_BY_ID),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "findScheduleById", null);
__decorate([
    (0, microservices_1.MessagePattern)(command_1.ScheduleCommand.FIND_SCHEDULE_BY_USER_ID),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "findScheduleByUserId", null);
__decorate([
    (0, microservices_1.MessagePattern)(command_1.ScheduleCommand.CREATE_SCHEDULE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "createSchedule", null);
__decorate([
    (0, microservices_1.MessagePattern)(command_1.ScheduleCommand.DELETE_SCHEDULE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "deleteSchedule", null);
__decorate([
    (0, microservices_1.MessagePattern)(command_1.ScheduleCommand.UPDATE_SCHEDULE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "updateSchedule", null);
exports.ScheduleController = ScheduleController = __decorate([
    (0, common_1.Controller)('schedule'),
    __metadata("design:paramtypes", [schedule_service_1.ScheduleService])
], ScheduleController);
//# sourceMappingURL=schedule.controller.js.map