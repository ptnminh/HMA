export interface IPlans {
  id: string;
  planName: string;
  description: string;
  currentPrice: number;
  duration: number;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPlanOption {
  id: string;
  optionName: string;
  description: string;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
}
