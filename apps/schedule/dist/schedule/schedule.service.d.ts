import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
export declare class ScheduleService {
    private prismaService;
    constructor(prismaService: PrismaService);
    findScheduleById(id: number): Promise<{
        id: number;
        userId: string;
        day: number;
        startTime: string;
        endTime: string;
        createAt: Date;
        updateAt: Date;
        isDisabled: boolean;
        disabledAt: Date;
    }>;
    findScheduleByUserId(userId: string): Promise<{
        id: number;
        userId: string;
        day: number;
        startTime: string;
        endTime: string;
        createAt: Date;
        updateAt: Date;
        isDisabled: boolean;
        disabledAt: Date;
    }[]>;
    createSchedule(payload: Prisma.userSchedulesUncheckedCreateInput): Promise<{
        id: number;
        userId: string;
        day: number;
        startTime: string;
        endTime: string;
        createAt: Date;
        updateAt: Date;
        isDisabled: boolean;
        disabledAt: Date;
    }>;
    deleteSchedule(id: number): Promise<{
        id: number;
        userId: string;
        day: number;
        startTime: string;
        endTime: string;
        createAt: Date;
        updateAt: Date;
        isDisabled: boolean;
        disabledAt: Date;
    }>;
    updateSchedule(id: number, data: Prisma.userSchedulesUncheckedUpdateInput): Promise<{
        id: number;
        userId: string;
        day: number;
        startTime: string;
        endTime: string;
        createAt: Date;
        updateAt: Date;
        isDisabled: boolean;
        disabledAt: Date;
    }>;
}
