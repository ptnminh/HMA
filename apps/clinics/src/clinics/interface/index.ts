interface IService {
  clinicServiceId: number;

  serviceName: string;

  amount: number;

  doctorId: number;
}

export interface ICreatePatientReception {
  clinicId: string;

  patientId: number;

  doctorId: number;

  note?: string;

  services: IService[];
}
