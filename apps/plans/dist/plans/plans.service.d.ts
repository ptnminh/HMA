import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
export declare class PlanService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    createPlan(data: Prisma.plansUncheckedCreateInput): Promise<{
        id: number;
        planName: string;
        currentPrice: number;
        duration: number;
        description: string;
        isActive: boolean;
        updatedAt: Date;
        createdAt: Date;
    }>;
    updatePlan(id: any, data: Prisma.plansUncheckedUpdateInput): Promise<{
        id: number;
        planName: string;
        currentPrice: number;
        duration: number;
        description: string;
        isActive: boolean;
        updatedAt: Date;
        createdAt: Date;
    }>;
    createOption(data: Prisma.optionsUncheckedCreateInput): Promise<{
        id: number;
        optionName: string;
        description: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAllActiveOption(): Promise<{
        id: number;
        optionName: string;
        description: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findPlanById(id: number): Promise<{
        id: number;
        planName: string;
        currentPrice: number;
        duration: number;
        description: string;
        isActive: boolean;
        updatedAt: Date;
        createdAt: Date;
    }>;
    findAllPlan(): Promise<({
        planOptions: {
            id: number;
            planId: number;
            optionId: number;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: number;
        planName: string;
        currentPrice: number;
        duration: number;
        description: string;
        isActive: boolean;
        updatedAt: Date;
        createdAt: Date;
    })[]>;
}
