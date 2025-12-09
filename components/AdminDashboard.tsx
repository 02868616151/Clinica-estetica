import React, { useState, useMemo } from 'react';
import { useClinic } from '../context';
import { UserIcon, CalendarIcon, ClockIcon, PriceIcon } from './icons';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-stone-50 p-6 rounded-lg shadow-sm flex items-center">
        <div className="bg-pink-100 p-3 rounded-full mr-4">
            {icon}
        </div>
        <div>
            <p className="text-sm text-stone-500">{title}</p>
            <p className="text-2xl font-bold text-stone-800">{value}</p>
        </div>
    </div>
);

const BarChart: React.FC<{ title: string; data: { label: string; value: number }[], formatAsCurrency?: boolean }> = ({ title, data, formatAsCurrency = false }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0) || 1;
    return (
        <div className="bg-stone-50 p-6 rounded-lg shadow-sm h-full">
            <h4 className="text-lg font-bold text-stone-700 mb-4">{title}</h4>
            <div className="space-y-3">
                {data.length > 0 ? data.map(item => (
                    <div key={item.label} className="flex items-center gap-2 text-sm">
                        <div className="w-1/3 text-stone-600 truncate" title={item.label}>{item.label}</div>
                        <div className="w-2/3 bg-stone-200 rounded-full h-5 relative">
                            <div
                                className="bg-pink-400 h-5 rounded-full text-right pr-2 text-white flex items-center justify-end"
                                style={{ width: `${(item.value / maxValue) * 100}%` }}
                            >
                                <span className="text-xs font-bold">
                                {formatAsCurrency 
                                    ? item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                    : item.value
                                }
                                </span>
                            </div>
                        </div>
                    </div>
                )) : <p className="text-stone-500 text-center py-8">Nenhum dado para exibir.</p>}
            </div>
        </div>
    );
};

const RevenueChart: React.FC<{ data: { date: string; revenue: number }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.revenue), 0) || 1;

    return (
        <div className="bg-stone-50 p-6 rounded-lg shadow-sm">
             <h4 className="text-lg font-bold text-stone-700 mb-4">Faturamento no Período</h4>
             {data.length > 0 ? (
                <div className="flex gap-2 items-end h-64 border-l border-b border-stone-200 pl-4 pb-4">
                    {data.map(item => (
                        <div key={item.date} className="flex-1 flex flex-col justify-end items-center gap-2 group relative">
                            <div className="absolute -top-8 bg-stone-700 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                               {item.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </div>
                            <div 
                                className="w-full bg-pink-400 hover:bg-pink-500 transition-colors rounded-t-md"
                                style={{ height: `${(item.revenue / maxValue) * 100}%` }}
                            ></div>
                            <div className="text-xs text-stone-500">{new Date(item.date + 'T00:00:00').getDate()}</div>
                        </div>
                    ))}
                </div>
             ) : <p className="text-stone-500 text-center py-8 h-64 flex items-center justify-center">Nenhum dado para exibir.</p>}
        </div>
    )
}


const AdminDashboard: React.FC = () => {
    const { appointments, professionals, clients, services } = useClinic();
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(new Date().getDate() - 30);

    const [startDate, setStartDate] = useState(thirtyDaysAgo.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedProfessionalId, setSelectedProfessionalId] = useState('all');

    const filteredAppointments = useMemo(() => {
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');

        return appointments.filter(app => {
            const appDate = app.startTime;
            const professionalMatch = selectedProfessionalId === 'all' || app.professionalId === selectedProfessionalId;
            return appDate >= start && appDate <= end && professionalMatch;
        });
    }, [appointments, startDate, endDate, selectedProfessionalId]);
    
    const dateRangeAppointments = useMemo(() => {
        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');
         return appointments.filter(app => app.startTime >= start && app.startTime <= end);
    }, [appointments, startDate, endDate]);

    const dashboardData = useMemo(() => {
        const completed = filteredAppointments.filter(app => app.endTime < new Date());
        
        const totalRevenue = completed.reduce((sum, app) => {
            const service = services.find(s => s.id === app.serviceId);
            return sum + (service?.price || 0);
        }, 0);

        const averageTicket = completed.length > 0 ? totalRevenue / completed.length : 0;
        
        const revenueByService = services.map(service => ({
            label: service.name,
            value: completed
                .filter(app => app.serviceId === service.id)
                .reduce((sum) => sum + service.price, 0)
        })).filter(item => item.value > 0).sort((a,b) => b.value - a.value);

        const appointmentsByProfessional = professionals.map(prof => ({
            label: prof.name,
            value: dateRangeAppointments.filter(app => app.professionalId === prof.id).length
        })).filter(item => item.value > 0).sort((a,b) => b.value - a.value);

        const revenueOverTime = completed.reduce((acc, app) => {
            const dateStr = app.startTime.toISOString().split('T')[0];
            const service = services.find(s => s.id === app.serviceId);
            acc[dateStr] = (acc[dateStr] || 0) + (service?.price || 0);
            return acc;
        }, {} as Record<string, number>);

        const revenueOverTimeData = Object.entries(revenueOverTime).map(([date, revenue]) => ({ date, revenue })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return { 
            totalRevenue, 
            averageTicket, 
            appointmentsInPeriod: filteredAppointments.length,
            revenueByService,
            appointmentsByProfessional,
            revenueOverTimeData,
        };
    }, [filteredAppointments, dateRangeAppointments, services, professionals]);
    
    const upcomingAppointments = appointments
        .filter(app => app.startTime > new Date())
        .sort((a,b) => a.startTime.getTime() - b.startTime.getTime())
        .slice(0, 5);

    const getAppointmentDetails = (app: typeof appointments[0]) => {
      const client = clients.find(c => c.id === app.clientId);
      const service = services.find(s => s.id === app.serviceId);
      const professional = professionals.find(p => p.id === app.professionalId);
      return { client, service, professional };
    };

    return (
        <div>
            <h3 className="text-3xl font-bold text-stone-800 mb-6">Dashboard</h3>
            
            <div className="bg-stone-100 p-4 rounded-lg mb-8 flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium text-stone-600">Período</label>
                    <div className="flex gap-2">
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 border border-stone-300 rounded-md" />
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 border border-stone-300 rounded-md" />
                    </div>
                </div>
                 <div className="flex-1 min-w-[200px]">
                    <label className="text-sm font-medium text-stone-600">Profissional</label>
                    <select value={selectedProfessionalId} onChange={e => setSelectedProfessionalId(e.target.value)} className="w-full p-2 border border-stone-300 rounded-md bg-white">
                        <option value="all">Todos os Profissionais</option>
                        {professionals.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    title="Faturamento no Período" 
                    value={dashboardData.totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                    icon={<PriceIcon className="w-6 h-6 text-pink-500" />} />
                <StatCard 
                    title="Agendamentos no Período" 
                    value={dashboardData.appointmentsInPeriod} 
                    icon={<CalendarIcon className="w-6 h-6 text-pink-500" />} />
                <StatCard 
                    title="Ticket Médio" 
                    value={dashboardData.averageTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
                    icon={<PriceIcon className="w-6 h-6 text-pink-500" />} />
                <StatCard 
                    title="Total de Clientes" 
                    value={clients.length} 
                    icon={<UserIcon className="w-6 h-6 text-pink-500" />} />
            </div>

            <div className="mb-8">
                 <RevenueChart data={dashboardData.revenueOverTimeData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <BarChart title="Receita por Serviço" data={dashboardData.revenueByService} formatAsCurrency />
                <BarChart title="Agendamentos por Profissional (no período)" data={dashboardData.appointmentsByProfessional} />
            </div>

            <div>
                <h4 className="text-xl font-bold text-stone-700 mb-4">Próximos Agendamentos</h4>
                <div className="space-y-3">
                {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map(app => {
                        const { client, service, professional } = getAppointmentDetails(app);
                        return (
                            <div key={app.id} className="bg-stone-50 p-4 rounded-lg flex items-center justify-between border border-stone-200">
                                <div>
                                    <p className="font-semibold text-stone-700">{service?.name}</p>
                                    <p className="text-sm text-stone-500">{client?.name} com {professional?.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-pink-500 flex items-center">
                                        <ClockIcon className="w-4 h-4 mr-1"/>
                                        {app.startTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <p className="text-xs text-stone-400">
                                        {app.startTime.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-stone-500 text-center py-4">Nenhum agendamento futuro.</p>
                )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
