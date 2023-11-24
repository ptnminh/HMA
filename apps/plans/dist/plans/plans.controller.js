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
exports.PlanController = void 0;
const common_1 = require("@nestjs/common");
const plans_service_1 = require("./plans.service");
const microservices_1 = require("@nestjs/microservices");
const command_1 = require("./command");
let PlanController = class PlanController {
    constructor(planService) {
        this.planService = planService;
    }
    async createPlan(data) {
        try {
            const plan = await this.planService.createPlan(data);
            return {
                status: common_1.HttpStatus.CREATED,
                message: 'Tạo thành công',
                data: plan,
            };
        }
        catch (error) {
            console.log(error);
            return {
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Lỗi hệ thống',
            };
        }
    }
    async updatePlan(data) {
        try {
            const { id, ...rest } = data;
            const plan = await this.planService.updatePlan(id, rest);
            return {
                status: common_1.HttpStatus.OK,
                message: 'Cập nhật thành công',
                data: plan,
            };
        }
        catch (error) {
            console.log(error);
            return {
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Lỗi hệ thống',
            };
        }
    }
    async createOption(data) {
        try {
            const plan = await this.planService.createOption(data);
            return {
                status: common_1.HttpStatus.CREATED,
                message: 'Tạo option thành công',
                data: plan,
            };
        }
        catch (error) {
            console.log(error);
            return {
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Lỗi hệ thống',
            };
        }
    }
    async getAllActiveOptions() {
        try {
            const option = await this.planService.findAllActiveOption();
            return {
                status: common_1.HttpStatus.OK,
                message: 'Lấy danh sách option thành công',
                data: option
            };
        }
        catch (error) {
            console.log(error);
            return {
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Lỗi hệ thống'
            };
        }
    }
    async getPlanById(data) {
        try {
            const id = data['id'];
            const plan = await this.planService.findPlanById(id);
            if (!plan) {
                return {
                    status: common_1.HttpStatus.BAD_REQUEST,
                    message: 'Gói không tồn tại',
                    data: null,
                };
            }
            return {
                status: common_1.HttpStatus.OK,
                message: 'Tìm kiếm thành công',
                data: plan,
            };
        }
        catch (error) {
            console.log(error);
            return {
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Lỗi hệ thống'
            };
        }
    }
    async getAllPlans() {
        try {
            const option = await this.planService.findAllPlan();
            return {
                status: common_1.HttpStatus.OK,
                message: 'Lấy danh sách plan thành công',
                data: option
            };
        }
        catch (error) {
            console.log(error);
            return {
                status: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Lỗi hệ thống'
            };
        }
    }
};
exports.PlanController = PlanController;
__decorate([
    (0, microservices_1.MessagePattern)(command_1.PlanCommand.PLAN_CREATE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlanController.prototype, "createPlan", null);
__decorate([
    (0, microservices_1.MessagePattern)(command_1.PlanCommand.PLAN_UPDATE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlanController.prototype, "updatePlan", null);
__decorate([
    (0, microservices_1.MessagePattern)(command_1.PlanCommand.CREATE_OPTION),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PlanController.prototype, "createOption", null);
__decorate([
    (0, microservices_1.MessagePattern)(command_1.PlanCommand.GET_ALL_ACTIVE_OPTION),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlanController.prototype, "getAllActiveOptions", null);
__decorate([
    (0, microservices_1.MessagePattern)(command_1.PlanCommand.GET_ALL_PLAN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PlanController.prototype, "getAllPlans", null);
exports.PlanController = PlanController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [plans_service_1.PlanService])
], PlanController);
//# sourceMappingURL=plans.controller.js.map