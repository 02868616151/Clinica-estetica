import React, { useState } from 'react';
import AdminDashboard from './AdminDashboard';
import AdminCalendar from './AdminCalendar';
import AdminProfessionals from './AdminProfessionals';
import AdminServices from './AdminServices';
import AdminClients from './AdminClients';
import AdminUsers from './AdminUsers';
import { useClinic } from '../context';
import { UserRole } from '../types';
// Fix: Import PriceIcon and SparklesIcon
import { ChartBarIcon, UserIcon, CalendarIcon, UsersIcon, PriceIcon, SparklesIcon } from './icons'; // Simplified imports for brevity

type AdminTab = 'dashboard' | 'calendar' | 'professionals' | 'services' | 'clients' | 'users';

const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const { loggedInUser, logout } = useClinic();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'calendar':
        return <AdminCalendar />;
      case 'professionals':
        return <AdminProfessionals />;
      case 'services':
        return <AdminServices />;
      case 'clients':
        return <AdminClients />;
      case 'users':
        return <AdminUsers />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{ tabName: AdminTab; label: string, icon: React.ReactNode }> = ({ tabName, label, icon }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center gap-3 px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 w-full text-left ${
        activeTab === tabName
          ? 'bg-pink-100 text-pink-600'
          : 'text-stone-600 hover:bg-stone-100'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-1/5 flex flex-col">
          <div>
            <h2 className="text-2xl font-bold mb-6 text-stone-800">Gerenciamento</h2>
            <nav className="flex flex-col gap-2">
              <TabButton tabName="dashboard" label="Dashboard" icon={<ChartBarIcon className="w-5 h-5"/>} />
              <TabButton tabName="calendar" label="Agenda" icon={<CalendarIcon className="w-5 h-5"/>} />
              <TabButton tabName="professionals" label="Profissionais" icon={<UserIcon className="w-5 h-5"/>} />
              <TabButton tabName="services" label="Serviços" icon={<SparklesIcon className="w-5 h-5"/>}/>
              <TabButton tabName="clients" label="Clientes" icon={<UsersIcon className="w-5 h-5"/>}/>
              {loggedInUser?.role === UserRole.SUPERADMIN && (
                <TabButton tabName="users" label="Usuários" icon={<UsersIcon className="w-5 h-5"/>} />
              )}
            </nav>
          </div>
          <div className="mt-auto pt-6 border-t mt-6">
            <p className="text-sm text-stone-500 mb-2">Logado como <span className="font-bold text-stone-700">{loggedInUser?.username}</span></p>
            <button
              onClick={logout}
              className="w-full bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Sair
            </button>
          </div>
        </aside>
        <main className="lg:w-4/5">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl min-h-[600px]">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminView;