
import React, { useState } from 'react';
import { useClinic } from '../context';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';

const AdminCalendar: React.FC = () => {
    const { appointments, professionals, clients, services } = useClinic();
    const [currentDate, setCurrentDate] = useState(new Date());

    const startOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        return new Date(d.setDate(diff));
    };
    
    const [weekStartDate, setWeekStartDate] = useState(startOfWeek(currentDate));

    const addDays = (date: Date, days: number) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    };
    
    const changeWeek = (amount: number) => {
        setWeekStartDate(prev => addDays(prev, amount * 7));
    };
    
    const weekDays = Array.from({length: 7}).map((_, i) => addDays(weekStartDate, i));
    
    const getAppointmentsForDay = (day: Date) => {
        return appointments.filter(app => {
            const appDate = app.startTime;
            return appDate.getDate() === day.getDate() &&
                   appDate.getMonth() === day.getMonth() &&
                   appDate.getFullYear() === day.getFullYear();
        }).sort((a,b) => a.startTime.getTime() - b.startTime.getTime());
    };
    
    const getAppointmentDetails = (app: typeof appointments[0]) => {
        const client = clients.find(c => c.id === app.clientId);
        const service = services.find(s => s.id === app.serviceId);
        const professional = professionals.find(p => p.id === app.professionalId);
        return { client, service, professional };
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-3xl font-bold text-stone-800">Agenda da Clínica</h3>
                <div className="flex items-center space-x-2">
                    <button onClick={() => changeWeek(-1)} className="p-2 rounded-full hover:bg-stone-100"><ChevronLeftIcon className="w-6 h-6" /></button>
                     <span className="text-lg font-semibold text-stone-700 w-48 text-center">
                        {weekStartDate.toLocaleDateString('pt-BR', {month: 'long', year: 'numeric'})}
                    </span>
                    <button onClick={() => changeWeek(1)} className="p-2 rounded-full hover:bg-stone-100"><ChevronRightIcon className="w-6 h-6" /></button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-1 bg-stone-100 p-1 rounded-lg">
                {weekDays.map(day => (
                    <div key={day.toISOString()} className="bg-white rounded-md p-2">
                        <div className="text-center py-2">
                            <p className="text-xs text-stone-500">{day.toLocaleDateString('pt-BR', {weekday: 'short'})}</p>
                            <p className={`font-bold text-lg ${new Date().toDateString() === day.toDateString() ? 'text-pink-500' : 'text-stone-700'}`}>{day.getDate()}</p>
                        </div>
                        <div className="space-y-2">
                            {getAppointmentsForDay(day).map(app => {
                                const { client, service, professional } = getAppointmentDetails(app);
                                return (
                                    <div key={app.id} className="bg-pink-50 border-l-4 border-pink-400 p-2 rounded-r-md">
                                        <p className="text-xs font-bold text-pink-800">{app.startTime.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</p>
                                        <p className="text-sm font-semibold text-stone-700">{client?.name}</p>
                                        <p className="text-xs text-stone-500">{service?.name}</p>
                                        <p className="text-xs text-stone-500 italic">com {professional?.name}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminCalendar;
