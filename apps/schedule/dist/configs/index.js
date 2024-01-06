"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const config = () => ({
    app: {
        host: process.env.SCHEDULE_SERVICE_HOST,
        port: parseInt(process.env.SCHEDULE_SERVICE_PORT),
    },
    database: {},
});
exports.config = config;
//# sourceMappingURL=index.js.map