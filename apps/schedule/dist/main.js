"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const microservices_1 = require("@nestjs/microservices");
const common_1 = require("@nestjs/common");
const configs_1 = require("./configs");
const schedule_module_1 = require("./schedule/schedule.module");
async function bootstrap() {
    const configs = (0, configs_1.config)();
    const app = await core_1.NestFactory.createMicroservice(schedule_module_1.ScheduleModule, {
        transport: microservices_1.Transport.TCP,
        options: {
            host: configs.app.host,
            port: configs.app.port,
        },
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        exceptionFactory: (errors) => {
            const result = errors.map((error) => ({
                property: error.property,
                message: error.constraints[Object.keys(error.constraints)[0]],
            }));
            throw new common_1.HttpException({
                message: result[0].message,
                data: null,
                status: false,
            }, common_1.HttpStatus.BAD_REQUEST);
        },
        transform: true,
        stopAtFirstError: true,
    }));
    common_1.Logger.log(`Service is running on PORT ${configs.app.port}`);
    await app.listen();
}
bootstrap();
//# sourceMappingURL=main.js.map