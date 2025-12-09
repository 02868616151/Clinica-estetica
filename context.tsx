
import React, { createContext, useContext } from 'react';
import { Service, Professional, Client, Appointment, User } from './types';

export interface ClinicContextType {
  services: Service[];
  professionals: Professional[];
  clients: Client[];
  appointments: Appointment[];
  getAvailableSlots: (professionalId: string, serviceId: string, date: Date) => Date[];
  addAppointment: (appointment: Omit<Appointment, 'id' | 'endTime'>) => void;
  cancelAppointment: (appointmentId: string) => void;
  
  // Auth and User Management
  users: User[];
  loggedInUser: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => void;
  removeUser: (userId: string) => void;

  // Professional Management
  addProfessional: (professional: Omit<Professional, 'id'>) => void;
  updateProfessional: (professional: Professional) => void;
  removeProfessional: (professionalId: string) => void;

  // Service Management
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (service: Service) => void;
  removeService: (serviceId: string) => void;

  // Client Management
  findOrCreateClient: (clientData: Omit<Client, 'id'>) => Client;
}

export const ClinicContext = createContext<ClinicContextType | null>(null);

export const useClinic = () => {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
};