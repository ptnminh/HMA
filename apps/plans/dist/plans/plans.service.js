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
exports.PlanService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let PlanService = class PlanService {
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async createPlan(data) {
        return await this.prismaService.plans.create({
            data,
        });
    }
    async updatePlan(id, data) {
        return await this.prismaService.plans.update({
            where: {
                id,
            },
            data,
        });
    }
    async createOption(data) {
        return await this.prismaService.options.create({
            data,
        });
    }
    async findAllActiveOption() {
        return await this.prismaService.options.findMany({
            where: {
                isActive: true,
            }
        });
    }
    async findPlanById(id) {
        return await this.prismaService.plans.findUnique({
            where: {
                id,
            }
        });
    }
    async findAllPlan() {
        return this.prismaService.plans.findMany({
            include: {
                planOptions: true
            }
        });
    }
};
exports.PlanService = PlanService;
exports.PlanService = PlanService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PlanService);
//# sourceMappingURL=plans.service.js.map