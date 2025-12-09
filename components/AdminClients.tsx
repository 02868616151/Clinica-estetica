
import React from 'react';
import { useClinic } from '../context';

const AdminClients: React.FC = () => {
    const { clients, appointments } = useClinic();
    
    const getClientHistoryCount = (clientId: string) => {
        return appointments.filter(app => app.clientId === clientId).length;
    }

    return (
        <div>
            <h3 className="text-3xl font-bold text-stone-800 mb-6">Clientes</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-stone-500">
                    <thead className="text-xs text-stone-700 uppercase bg-stone-100">
                        <tr>
                            <th scope="col" className="px-6 py-3">Nome</th>
                            <th scope="col" className="px-6 py-3">Contato</th>
                            <th scope="col" className="px-6 py-3">Histórico</th>
                            <th scope="col" className="px-6 py-3">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clients.map(client => (
                            <tr key={client.id} className="bg-white border-b hover:bg-stone-50">
                                <th scope="row" className="px-6 py-4 font-medium text-stone-900 whitespace-nowrap">
                                    {client.name}
                                </th>
                                <td className="px-6 py-4">
                                    <p>{client.email}</p>
                                    <p className="text-xs text-stone-400">{client.phone}</p>
                                </td>
                                <td className="px-6 py-4">
                                    {getClientHistoryCount(client.id)} agendamento(s)
                                </td>
                                <td className="px-6 py-4">
                                    <a href="#" className="font-medium text-pink-600 hover:underline">Ver Detalhes</a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminClients;
