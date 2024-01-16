import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
export declare class StaffService {
    private prismaService;
    constructor(prismaService: PrismaService);
    findAllStaff(): Promise<{
        id: number;
        memberId: number;
        createdAt: Date;
        updatedAt: Date;
        isDisabled: boolean;
        disabledAt: Date;
    }[]>;
    createStaff(memberId: number): Promise<{
        id: number;
        memberId: number;
        createdAt: Date;
        updatedAt: Date;
        isDisabled: boolean;
        disabledAt: Date;
    }>;
    deleteStaff(id: number): Promise<{
        id: number;
        memberId: number;
        createdAt: Date;
        updatedAt: Date;
        isDisabled: boolean;
        disabledAt: Date;
    }>;
    findStaffById(id: number): Promise<{
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
            startTime: string;
            endTime: string;
            day: number;
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
    }>;
    updateStaff(id: number, data: Prisma.staffsUncheckedUpdateInput): Promise<{
        id: number;
        memberId: number;
        createdAt: Date;
        updatedAt: Date;
        isDisabled: boolean;
        disabledAt: Date;
    }>;
    findStaffByUserId(userId: string): Promise<({
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
    })[]>;
    createSchedule(payload: Prisma.staffSchedulesUncheckedCreateInput): Promise<{
        id: number;
        staffId: number;
        startTime: string;
        endTime: string;
        day: number;
        createAt: Date;
        updateAt: Date;
        isDisabled: boolean;
        disabledAt: Date;
    }>;
    updateSchedule(payload: Prisma.staffSchedulesUncheckedUpdateInput, id: number): Promise<{
        id: number;
        staffId: number;
        startTime: string;
        endTime: string;
        day: number;
        createAt: Date;
        updateAt: Date;
        isDisabled: boolean;
        disabledAt: Date;
    }>;
    findScheduleByStaffId(staffId: number): Promise<{
        id: number;
        staffId: number;
        startTime: string;
        endTime: string;
        day: number;
    }[]>;
    findScheduleById(id: number): Promise<{
        id: number;
        staffId: number;
        startTime: string;
        endTime: string;
        day: number;
        createAt: Date;
        updateAt: Date;
        isDisabled: boolean;
        disabledAt: Date;
    }>;
    deleteSchedule(id: number): Promise<{
        id: number;
        staffId: number;
        startTime: string;
        endTime: string;
        day: number;
        createAt: Date;
        updateAt: Date;
        isDisabled: boolean;
        disabledAt: Date;
    }>;
}
