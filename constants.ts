import { Service, Professional, ServiceCategory } from './types';

export const SERVICES: Service[] = [
  { id: 's1', name: 'Estética Auricular', category: ServiceCategory.AURICULAR, duration: 60, price: 250 },
  { id: 's2', name: 'Reconstrução Auricular', category: ServiceCategory.AURICULAR, duration: 90, price: 450 },
  { id: 's3', name: 'Primeiro Furo de Bebês (Humanizado)', category: ServiceCategory.INFANTIL, duration: 30, price: 150 },
  { id: 's4', name: 'Aplicação de Piercing (Atendimento Humanizado)', category: ServiceCategory.PIERCING, duration: 30, price: 120 },
  { id: 's5', name: 'Tratamento com Jato de Plasma', category: ServiceCategory.PLASMA, duration: 45, price: 350 },
];

export const PROFESSIONALS: Professional[] = [
  {
    id: 'p1',
    name: 'Tainá Batista',
    role: 'Especialista em Estética Auricular',
    availableServices: ['s1', 's2', 's3', 's4', 's5'],
    workHours: {
      1: null, // Monday
      2: { start: '10:00', end: '19:00' }, // Tuesday
      3: { start: '10:00', end: '19:00' }, // Wednesday
      4: { start: '10:00', end: '19:00' }, // Thursday
      5: { start: '10:00', end: '19:00' }, // Friday
      6: { start: '09:00', end: '14:00' }, // Saturday
      0: null, // Sunday
    },
  },
];
