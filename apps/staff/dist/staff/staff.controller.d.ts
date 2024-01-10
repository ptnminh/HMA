import { HttpStatus } from '@nestjs/common';
import { StaffService } from './staff.service';
export declare class StaffController {
    private staffService;
    constructor(staffService: StaffService);
    createStaff(data: any): Promise<{
        message: string;
        status: HttpStatus;
        data?: undefined;
    } | {
        message: string;
        status: HttpStatus;
        data: {
            id: number;
            memberId: number;
            createdAt: Date;
            updatedAt: Date;
            isDisabled: boolean;
            disabledAt: Date;
        };
    }>;
    findStaffById(data: any): Promise<{
        message: string;
        status: HttpStatus;
        data?: undefined;
    } | {
        message: string;
        status: HttpStatus;
        data: {
            userInClinics: {
                id: number;
                userId: string;
                clinicId: string;
                isOwner: boolean;
                isDisabled: boolean;
                disabledAt: Date;
                roleId: number;
                createdAt: Date;
                updatedAt: Date;
            };
            staffSchedules: {
                id: number;
                staffId: number;
                startTime: Date;
                endTime: Date;
                createAt: Date;
                updateAt: Date;
                isDisabled: boolean;
                disabledAt: Date;
            }[];
        } & {
            id: number;
            memberId: number;
            createdAt: Date;
            updatedAt: Date;
            isDisabled: boolean;
            disabledAt: Date;
        };
    }>;
    deleteStaff(data: any): Promise<{
        message: string;
        status: HttpStatus;
    }>;
    updateStaff(data: any): Promise<{
        message: string;
        status: HttpStatus;
        data: {
            id: number;
            memberId: number;
            createdAt: Date;
            updatedAt: Date;
            isDisabled: boolean;
            disabledAt: Date;
        };
    } | {
        message: string;
        status: HttpStatus;
        data?: undefined;
    }>;
    findStaffByUserID(data: any): Promise<{
        message: string;
        status: HttpStatus;
        data: ({
            userInClinics: {
                id: number;
                userId: string;
                clinicId: string;
                isOwner: boolean;
                isDisabled: boolean;
                disabledAt: Date;
                roleId: number;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            memberId: number;
            createdAt: Date;
            updatedAt: Date;
            isDisabled: boolean;
            disabledAt: Date;
        })[];
    } | {
        message: string;
        status: HttpStatus;
        data?: undefined;
    }>;
    findAllStaff(): Promise<{
        message: string;
        status: HttpStatus;
        data: {
            id: number;
            memberId: number;
            createdAt: Date;
            updatedAt: Date;
            isDisabled: boolean;
            disabledAt: Date;
        }[];
    } | {
        message: string;
        status: HttpStatus;
        data?: undefined;
    }>;
    createSchedule(data: any): Promise<{
        message: string;
        status: HttpStatus;
        data?: undefined;
    } | {
        message: string;
        status: HttpStatus;
        data: {
            id: number;
            staffId: number;
            startTime: Date;
            endTime: Date;
            createAt: Date;
            updateAt: Date;
            isDisabled: boolean;
            disabledAt: Date;
        };
    }>;
    updateSchedule(data: any): Promise<{
        message: string;
        status: HttpStatus;
        data?: undefined;
    } | {
        message: string;
        status: HttpStatus;
        data: {
            id: number;
            staffId: number;
            startTime: Date;
            endTime: Date;
            createAt: Date;
            updateAt: Date;
            isDisabled: boolean;
            disabledAt: Date;
        };
    }>;
    deleteSchedule(data: any): Promise<{
        message: string;
        status: HttpStatus;
        data?: undefined;
    } | {
        message: string;
        status: HttpStatus;
        data: any;
    }>;
    findScheduleById(data: any): Promise<{
        message: string;
        status: HttpStatus;
        data?: undefined;
    } | {
        message: string;
        status: HttpStatus;
        data: {
            id: number;
            staffId: number;
            startTime: Date;
            endTime: Date;
            createAt: Date;
            updateAt: Date;
            isDisabled: boolean;
            disabledAt: Date;
        };
    }>;
    findScheduleByStaffId(data: any): Promise<{
        message: string;
        status: HttpStatus;
        data: {
            id: number;
            staffId: number;
            startTime: Date;
            endTime: Date;
            createAt: Date;
            updateAt: Date;
            isDisabled: boolean;
            disabledAt: Date;
        }[];
    } | {
        message: string;
        status: HttpStatus;
        data?: undefined;
    }>;
}
