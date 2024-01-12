"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaffModule = void 0;
const common_1 = require("@nestjs/common");
const all_exception_filter_1 = require("../filters/all-exception.filter");
const config_1 = require("@nestjs/config");
const configs_1 = require("../configs");
const prisma_service_1 = require("../prisma.service");
const staff_controller_1 = require("./staff.controller");
const staff_service_1 = require("./staff.service");
let StaffModule = class StaffModule {
};
exports.StaffModule = StaffModule;
exports.StaffModule = StaffModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configs_1.config],
            }),
        ],
        controllers: [staff_controller_1.StaffController],
        providers: [
            staff_service_1.StaffService,
            {
                provide: 'APP_FILTER',
                useClass: all_exception_filter_1.AllExceptionFilter,
            },
            prisma_service_1.PrismaService,
        ],
    })
], StaffModule);
//# sourceMappingURL=staff.module.js.map