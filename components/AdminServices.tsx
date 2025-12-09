
import React, { useState, useEffect } from 'react';
import { useClinic } from '../context';
import { Service, ServiceCategory } from '../types';
import { ClockIcon, PriceIcon, PlusIcon, TrashIcon, XIcon } from './icons';

const emptyService: Omit<Service, 'id'> = {
    name: '',
    // fix: Corrected non-existent ServiceCategory.FACIAL to ServiceCategory.AURICULAR.
    category: ServiceCategory.AURICULAR,
    duration: 30,
    price: 100
};

const ServiceForm: React.FC<{
    service: Service | null;
    onSave: (data: Service | Omit<Service, 'id'>) => void;
    onCancel: () => void;
}> = ({ service, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Service | Omit<Service, 'id'>>(
        service || emptyService
    );

    useEffect(() => {
        setFormData(service || emptyService);
    }, [service]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ 
            ...formData, 
            [name]: (name === 'duration' || name === 'price') ? Number(value) : value 
        });
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-stone-700">Nome do Serviço</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-stone-700">Categoria</label>
                    <select name="category" id="category" value={formData.category} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500">
                        {Object.values(ServiceCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-stone-700">Duração (minutos)</label>
                    <input type="number" name="duration" id="duration" value={formData.duration} onChange={handleInputChange} required min="1" className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"/>
                </div>
                 <div>
                    <label htmlFor="price" className="block text-sm font-medium text-stone-700">Preço (R$)</label>
                    <input type="number" name="price" id="price" value={formData.price} onChange={handleInputChange} required min="0" className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"/>
                </div>
            </div>
           
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="bg-stone-200 text-stone-700 px-4 py-2 rounded-md hover:bg-stone-300">Cancelar</button>
                <button type="submit" className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600">Salvar</button>
            </div>
        </form>
    )
}


const AdminServices: React.FC = () => {
    const { services, addService, updateService, removeService } = useClinic();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    const handleAddNew = () => {
        setEditingService(null);
        setIsModalOpen(true);
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setIsModalOpen(true);
    };

    const handleRemove = (serviceId: string) => {
        if(window.confirm('Tem certeza que deseja remover este serviço? Todos os agendamentos futuros para ele serão cancelados.')) {
            removeService(serviceId);
        }
    };
    
    const handleSave = (data: Service | Omit<Service, 'id'>) => {
        if ('id' in data) {
            updateService(data);
        } else {
            addService(data);
        }
        setIsModalOpen(false);
    };

    return (
        <div>
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-bold text-stone-800">Serviços</h3>
                <button onClick={handleAddNew} className="bg-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" />
                    Adicionar Serviço
                </button>
            </div>
            <div className="space-y-4">
                {services.map(service => (
                    <div key={service.id} className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                        <div className="flex justify-between items-start">
                           <div>
                                <p className="text-xs bg-pink-100 text-pink-700 font-semibold px-2 py-0.5 rounded-full inline-block mb-1">{service.category}</p>
                                <h4 className="text-lg font-bold text-stone-800">{service.name}</h4>
                                <div className="flex items-center text-sm text-stone-500 mt-2 space-x-4">
                                    <span className="flex items-center"><ClockIcon className="w-4 h-4 mr-1 text-pink-400" /> {service.duration} min</span>
                                    <span className="flex items-center"><PriceIcon className="w-4 h-4 mr-1 text-pink-400" /> R$ {service.price},00</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={() => handleEdit(service)} className="text-sm text-pink-600 font-semibold hover:underline">Editar</button>
                                <button onClick={() => handleRemove(service.id)} className="text-red-500 hover:text-red-700">
                                    <TrashIcon className="w-5 h-5"/>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                             <h3 className="text-2xl font-bold text-stone-800">{editingService ? 'Editar Serviço' : 'Adicionar Serviço'}</h3>
                             <button onClick={() => setIsModalOpen(false)}><XIcon className="w-6 h-6 text-stone-500 hover:text-stone-800" /></button>
                        </div>
                       <ServiceForm service={editingService} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminServices;