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
exports.AllExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const shared_1 = require("../shared");
let AllExceptionFilter = class AllExceptionFilter {
    constructor(__configService) {
        this.__configService = __configService;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        try {
            const status = shared_1.HttpStatusCodeEnum.InternalServerError;
            const message = exception?.response?.message ||
                exception?.message ||
                "L\u1ED7i h\u1EC7 th\u1ED1ng";
            return response.status(status).json({
                status: false,
                message,
                data: null,
            });
        }
        catch (error) {
            console.log(error);
            return response.status(shared_1.HttpStatusCodeEnum.InternalServerError).json({
                status: false,
                message: "L\u1ED7i h\u1EC7 th\u1ED1ng",
                data: null,
            });
        }
    }
};
exports.AllExceptionFilter = AllExceptionFilter;
exports.AllExceptionFilter = AllExceptionFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AllExceptionFilter);
//# sourceMappingURL=all-exception.filter.js.map