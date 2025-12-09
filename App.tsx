
import React, { useState, useCallback } from 'react';
import { Service, Professional, Client, Appointment, User, UserRole } from './types';
import { SERVICES, PROFESSIONALS } from './constants';
import ClientView from './components/ClientView';
import AdminView from './components/AdminView';
import LoginScreen from './components/LoginScreen';
import { ClinicContext, ClinicContextType } from './context';

type AppMode = 'client' | 'admin';

// --- INITIAL SENSITIVE DATA (MOVED FROM constants.ts) ---
// In a real application, this data would come from a secure backend API after authentication.
const INITIAL_CLIENTS: Client[] = [
  { id: 'c1', name: 'Ana Clara', email: 'anaclara@email.com', phone: '11987654321' },
  { id: 'c2', name: 'Bruno Lima', email: 'bruno@email.com', phone: '21912345678' },
];

const INITIAL_APPOINTMENTS: Appointment[] = [
    { 
        id: 'a1',
        clientId: 'c1',
        professionalId: 'p1',
        serviceId: 's1',
        startTime: new Date(new Date().setHours(10, 0, 0, 0)),
        endTime: new Date(new Date().setHours(11, 0, 0, 0)),
    },
];

const INITIAL_USERS: User[] = [
    { id: 'u1', username: 'admin', password: 'admin', role: UserRole.SUPERADMIN },
];
// --- END OF INITIAL SENSITIVE DATA ---

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('client');
  const [services, setServices] = useState<Service[]>(SERVICES);
  const [professionals, setProfessionals] = useState<Professional[]>(PROFESSIONALS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  const getAvailableSlots = useCallback((professionalId: string, serviceId: string, date: Date): Date[] => {
    const professional = professionals.find(p => p.id === professionalId);
    const service = services.find(s => s.id === serviceId);

    if (!professional || !service) return [];

    const dayOfWeek = date.getDay();
    const workHours = professional.workHours[dayOfWeek];
    if (!workHours) return [];

    const [startHour, startMinute] = workHours.start.split(':').map(Number);
    const [endHour, endMinute] = workHours.end.split(':').map(Number);

    const dayStart = new Date(date);
    dayStart.setHours(startHour, startMinute, 0, 0);

    const dayEnd = new Date(date);
    dayEnd.setHours(endHour, endMinute, 0, 0);

    const professionalAppointments = appointments.filter(
      (app) =>
        app.professionalId === professionalId &&
        app.startTime.getDate() === date.getDate() &&
        app.startTime.getMonth() === date.getMonth() &&
        app.startTime.getFullYear() === date.getFullYear()
    );

    const slots: Date[] = [];
    let currentTime = new Date(dayStart);

    while (currentTime < dayEnd) {
      const potentialEndTime = new Date(currentTime.getTime() + service.duration * 60000);

      if (potentialEndTime > dayEnd) break;

      const isOverlapping = professionalAppointments.some(
        (app) =>
          (currentTime >= app.startTime && currentTime < app.endTime) ||
          (potentialEndTime > app.startTime && potentialEndTime <= app.endTime) ||
          (currentTime <= app.startTime && potentialEndTime >= app.endTime)
      );

      if (!isOverlapping) {
        slots.push(new Date(currentTime));
      }

      currentTime.setMinutes(currentTime.getMinutes() + 15); // Check every 15 minutes for a potential start time
    }

    return slots;
  }, [professionals, services, appointments]);

  const addAppointment = useCallback((appointmentData: Omit<Appointment, 'id' | 'endTime'>) => {
    const service = services.find(s => s.id === appointmentData.serviceId);
    if (!service) return;

    const newAppointment: Appointment = {
      ...appointmentData,
      id: `a${Date.now()}`,
      endTime: new Date(appointmentData.startTime.getTime() + service.duration * 60000),
    };
    setAppointments(prev => [...prev, newAppointment]);
  }, [services]);
  
  const cancelAppointment = useCallback((appointmentId: string) => {
      setAppointments(prev => prev.filter(app => app.id !== appointmentId));
  }, []);

  const login = useCallback((username: string, password: string): boolean => {
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        setLoggedInUser(user);
        return true;
    }
    return false;
  }, [users]);

  const logout = useCallback(() => {
    setLoggedInUser(null);
    setMode('client');
  }, []);

  const addUser = useCallback((userData: Omit<User, 'id'>) => {
    const newUser: User = {
        ...userData,
        id: `u${Date.now()}`,
    };
    setUsers(prev => [...prev, newUser]);
  }, []);

  const removeUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  }, []);
  
  const addProfessional = useCallback((professionalData: Omit<Professional, 'id'>) => {
    const newProfessional: Professional = {
      ...professionalData,
      id: `p${Date.now()}`,
    };
    setProfessionals(prev => [...prev, newProfessional]);
  }, []);

  const updateProfessional = useCallback((updatedProfessional: Professional) => {
    setProfessionals(prev => prev.map(p => p.id === updatedProfessional.id ? updatedProfessional : p));
  }, []);

  const removeProfessional = useCallback((professionalId: string) => {
    // Also cancel future appointments with this professional
    setAppointments(prev => prev.filter(app => {
        const isFuture = app.startTime > new Date();
        const isByThisProfessional = app.professionalId === professionalId;
        return !(isFuture && isByThisProfessional);
    }));
    setProfessionals(prev => prev.filter(p => p.id !== professionalId));
  }, []);

  const addService = useCallback((serviceData: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...serviceData,
      id: `s${Date.now()}`,
    };
    setServices(prev => [...prev, newService]);
  }, []);

  const updateService = useCallback((updatedService: Service) => {
    setServices(prev => prev.map(s => s.id === updatedService.id ? updatedService : s));
  }, []);

  const removeService = useCallback((serviceId: string) => {
    // Also cancel future appointments for this service
    setAppointments(prev => prev.filter(app => {
        const isFuture = app.startTime > new Date();
        const isForThisService = app.serviceId === serviceId;
        return !(isFuture && isForThisService);
    }));
    setServices(prev => prev.filter(s => s.id !== serviceId));
  }, []);

  const findOrCreateClient = useCallback((clientData: Omit<Client, 'id'>): Client => {
    const existingClient = clients.find(c => c.phone === clientData.phone && c.phone);
    if (existingClient) {
        return existingClient;
    }
    const newClient: Client = {
        ...clientData,
        id: `c${Date.now()}`
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  }, [clients]);


  const contextValue: ClinicContextType = {
    services,
    professionals,
    clients,
    appointments,
    getAvailableSlots,
    addAppointment,
    cancelAppointment,
    users,
    loggedInUser,
    login,
    logout,
    addUser,
    removeUser,
    addProfessional,
    updateProfessional,
    removeProfessional,
    addService,
    updateService,
    removeService,
    findOrCreateClient,
  };
  
  const renderContent = () => {
      if (mode === 'client') {
          return <ClientView />;
      }
      if (mode === 'admin') {
          if (loggedInUser) {
              return <AdminView />;
          }
          return <LoginScreen />;
      }
      return null;
  }

  return (
    <ClinicContext.Provider value={contextValue}>
      <div className="min-h-screen bg-white text-stone-800">
        <header className="bg-white shadow-md sticky top-0 z-30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-stone-800">Tainá Batista Estética Auricular</h1>
              </div>
              <nav className="bg-stone-100 p-1 rounded-full">
                <button
                  onClick={() => setMode('client')}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
                    mode === 'client' ? 'bg-pink-400 text-white shadow' : 'text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Portal do Cliente
                </button>
                <button
                  onClick={() => setMode('admin')}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
                    mode === 'admin' ? 'bg-pink-400 text-white shadow' : 'text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Painel Administrativo
                </button>
              </nav>
            </div>
          </div>
        </header>
        <main>
          {renderContent()}
        </main>
      </div>
    </ClinicContext.Provider>
  );
};

export default App;