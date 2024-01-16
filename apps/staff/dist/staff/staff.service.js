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
exports.StaffService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let StaffService = class StaffService {
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    async findAllStaff() {
        return this.prismaService.staffs.findMany({
            where: {
                isDisabled: false
            },
            orderBy: {
                userInClinics: {
                    userId: 'desc'
                }
            }
        });
    }
    async createStaff(memberId) {
        console.log(memberId);
        return this.prismaService.staffs.create({
            data: {
                memberId,
            }
        });
    }
    async deleteStaff(id) {
        return this.prismaService.staffs.update({
            where: {
                id,
            },
            data: {
                isDisabled: true,
            }
        });
    }
    async findStaffById(id) {
        return this.prismaService.staffs.findFirst({
            where: {
                id,
                isDisabled: false
            },
            include: {
                userInClinics: true,
                staffSchedules: true
            }
        });
    }
    async updateStaff(id, data) {
        return this.prismaService.staffs.update({
            where: {
                id,
            },
            data,
        });
    }
    async findStaffByUserId(userId) {
        console.log(userId);
        return this.prismaService.staffs.findMany({
            where: {
                isDisabled: false,
                userInClinics: {
                    userId,
                }
            },
            include: {
                userInClinics: true,
            }
        });
    }
    async createSchedule(payload) {
        return this.prismaService.staffSchedules.create({
            data: {
                ...payload
            }
        });
    }
    async updateSchedule(payload, id) {
        return this.prismaService.staffSchedules.update({
            where: {
                id,
            },
            data: {
                ...payload
            }
        });
    }
    async findScheduleByStaffId(staffId) {
        return this.prismaService.staffSchedules.findMany({
            where: {
                staffId,
                isDisabled: false
            },
            select: {
                id: true,
                staffId: true,
                day: true,
                startTime: true,
                endTime: true,
            },
            orderBy: {
                day: "asc",
            }
        });
    }
    async findScheduleById(id) {
        return this.prismaService.staffSchedules.findFirst({
            where: {
                id,
                isDisabled: false
            }
        });
    }
    async deleteSchedule(id) {
        return this.prismaService.staffSchedules.update({
            where: {
                id,
            },
            data: {
                isDisabled: true,
            }
        });
    }
};
exports.StaffService = StaffService;
exports.StaffService = StaffService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StaffService);
//# sourceMappingURL=staff.service.js.map