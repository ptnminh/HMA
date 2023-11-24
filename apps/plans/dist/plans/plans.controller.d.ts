import { HttpStatus } from '@nestjs/common';
import { PlanService } from './plans.service';
export declare class PlanController {
    private readonly planService;
    constructor(planService: PlanService);
    createPlan(data: any): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            id: number;
            planName: string;
            currentPrice: number;
            duration: number;
            description: string;
            isActive: boolean;
            updatedAt: Date;
            createdAt: Date;
        };
    } | {
        status: HttpStatus;
        message: string;
        data?: undefined;
    }>;
    updatePlan(data: any): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            id: number;
            planName: string;
            currentPrice: number;
            duration: number;
            description: string;
            isActive: boolean;
            updatedAt: Date;
            createdAt: Date;
        };
    } | {
        status: HttpStatus;
        message: string;
        data?: undefined;
    }>;
    createOption(data: any): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            id: number;
            optionName: string;
            description: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } | {
        status: HttpStatus;
        message: string;
        data?: undefined;
    }>;
    getAllActiveOptions(): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            id: number;
            optionName: string;
            description: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } | {
        status: HttpStatus;
        message: string;
        data?: undefined;
    }>;
    getPlanById(data: any): Promise<{
        status: HttpStatus;
        message: string;
        data: {
            id: number;
            planName: string;
            currentPrice: number;
            duration: number;
            description: string;
            isActive: boolean;
            updatedAt: Date;
            createdAt: Date;
        };
    } | {
        status: HttpStatus;
        message: string;
        data?: undefined;
    }>;
    getAllPlans(): Promise<{
        status: HttpStatus;
        message: string;
        data: ({
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
        })[];
    } | {
        status: HttpStatus;
        message: string;
        data?: undefined;
    }>;
}
