import { HttpStatus } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
export declare class ScheduleController {
    private scheduleService;
    constructor(scheduleService: ScheduleService);
    findScheduleById(data: any): Promise<{
        status: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        status: HttpStatus;
        message: string;
        data: {
            id: number;
            userId: string;
            day: number;
            startTime: string;
            endTime: string;
            createAt: Date;
            updateAt: Date;
            isDisabled: boolean;
            disabledAt: Date;
        };
    }>;
    findScheduleByUserId(data: any): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            id: number;
            userId: string;
            day: number;
            startTime: string;
            endTime: string;
            createAt: Date;
            updateAt: Date;
            isDisabled: boolean;
            disabledAt: Date;
        }[];
    } | {
        status: HttpStatus;
        message: string;
        data?: undefined;
    }>;
    createSchedule(data: any): Promise<{
        status: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        status: HttpStatus;
        message: string;
        data: {
            id: number;
            userId: string;
            day: number;
            startTime: string;
            endTime: string;
            createAt: Date;
            updateAt: Date;
            isDisabled: boolean;
            disabledAt: Date;
        };
    }>;
    deleteSchedule(data: any): Promise<{
        status: HttpStatus;
        message: string;
        data?: undefined;
    } | {
        status: HttpStatus;
        message: string;
        data: any;
    }>;
    updateSchedule(data: any): Promise<{
        status: HttpStatus;
        data: {
            id: number;
            userId: string;
            day: number;
            startTime: string;
            endTime: string;
            createAt: Date;
            updateAt: Date;
            isDisabled: boolean;
            disabledAt: Date;
        };
        message: string;
    } | {
        status: HttpStatus;
        message: string;
        data?: undefined;
    }>;
}
