export enum ServiceCategory {
  AURICULAR = 'Estética Auricular',
  PIERCING = 'Piercing',
  PLASMA = 'Jato de Plasma',
  INFANTIL = 'Infantil',
}

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  duration: number; // in minutes
  price: number;
}

export interface Professional {
  id:string;
  name: string;
  role: string;
  availableServices: string[]; // array of service IDs
  workHours: {
    [day: number]: { start: string; end: string } | null; // 0 for Sunday, 1 for Monday...
  };
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  professionalId: string;
  serviceId: string;
  startTime: Date;
  endTime: Date;
}

export enum UserRole {
  SUPERADMIN = 'superadmin',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  username: string;
  password: string; 
  role: UserRole;
}