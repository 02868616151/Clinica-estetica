
import React, { useState, useEffect } from 'react';
import { useClinic } from '../context';
import { Professional } from '../types';
import { PlusIcon, TrashIcon, XIcon } from './icons';

const emptyProfessional: Omit<Professional, 'id'> = {
    name: '',
    role: '',
    availableServices: [],
    workHours: { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null }
};

const ProfessionalForm: React.FC<{
    professional: Professional | null;
    onSave: (data: Professional | Omit<Professional, 'id'>) => void;
    onCancel: () => void;
}> = ({ professional, onSave, onCancel }) => {
    const { services } = useClinic();
    const [formData, setFormData] = useState<Professional | Omit<Professional, 'id'>>(
        professional || emptyProfessional
    );

    useEffect(() => {
        setFormData(professional || emptyProfessional);
    }, [professional]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleServiceToggle = (serviceId: string) => {
        const availableServices = formData.availableServices.includes(serviceId)
            ? formData.availableServices.filter(id => id !== serviceId)
            : [...formData.availableServices, serviceId];
        setFormData({ ...formData, availableServices });
    };

    const handleWorkHourChange = (day: number, field: 'start' | 'end', value: string) => {
        const newWorkHours = { ...formData.workHours };
        const current = newWorkHours[day];
        if (current) {
            newWorkHours[day] = { ...current, [field]: value };
        }
        setFormData({ ...formData, workHours: newWorkHours });
    };

    const handleDayToggle = (day: number, checked: boolean) => {
        const newWorkHours = { ...formData.workHours };
        newWorkHours[day] = checked ? { start: '09:00', end: '18:00' } : null;
        setFormData({ ...formData, workHours: newWorkHours });
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    }

    const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-stone-700">Nome</label>
                <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"/>
            </div>
             <div>
                <label htmlFor="role" className="block text-sm font-medium text-stone-700">Cargo</label>
                <input type="text" name="role" id="role" value={formData.role} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"/>
            </div>

            <div>
                <h4 className="text-sm font-medium text-stone-700 mb-2">Serviços Oferecidos</h4>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto bg-stone-50 p-2 rounded-md">
                    {services.map(service => (
                        <div key={service.id} className="flex items-center">
                            <input id={`service-${service.id}`} type="checkbox" checked={formData.availableServices.includes(service.id)} onChange={() => handleServiceToggle(service.id)} className="h-4 w-4 text-pink-600 border-stone-300 rounded focus:ring-pink-500" />
                            <label htmlFor={`service-${service.id}`} className="ml-2 text-sm text-stone-600">{service.name}</label>
                        </div>
                    ))}
                </div>
            </div>
            
            <div>
                 <h4 className="text-sm font-medium text-stone-700 mb-2">Horário de Trabalho</h4>
                 <div className="space-y-2">
                    {weekDays.map((dayName, dayIndex) => (
                        <div key={dayIndex} className="grid grid-cols-3 items-center gap-2 p-2 rounded-md bg-stone-50">
                            <div className="flex items-center">
                                <input type="checkbox" id={`day-${dayIndex}`} checked={!!formData.workHours[dayIndex]} onChange={e => handleDayToggle(dayIndex, e.target.checked)} className="h-4 w-4 text-pink-600 border-stone-300 rounded focus:ring-pink-500" />
                                <label htmlFor={`day-${dayIndex}`} className="ml-2 font-medium text-sm text-stone-700">{dayName}</label>
                            </div>
                            <div className="col-span-2 grid grid-cols-2 gap-2">
                                <input type="time" value={formData.workHours[dayIndex]?.start || ''} onChange={e => handleWorkHourChange(dayIndex, 'start', e.target.value)} disabled={!formData.workHours[dayIndex]} className="w-full text-sm border-stone-300 rounded-md shadow-sm disabled:bg-stone-200" />
                                <input type="time" value={formData.workHours[dayIndex]?.end || ''} onChange={e => handleWorkHourChange(dayIndex, 'end', e.target.value)} disabled={!formData.workHours[dayIndex]} className="w-full text-sm border-stone-300 rounded-md shadow-sm disabled:bg-stone-200" />
                            </div>
                        </div>
                    ))}
                 </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="bg-stone-200 text-stone-700 px-4 py-2 rounded-md hover:bg-stone-300">Cancelar</button>
                <button type="submit" className="bg-pink-500 text-white px-4 py-2 rounded-md hover:bg-pink-600">Salvar</button>
            </div>
        </form>
    )
}


const AdminProfessionals: React.FC = () => {
    const { professionals, services, addProfessional, updateProfessional, removeProfessional } = useClinic();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);

    const handleAddNew = () => {
        setEditingProfessional(null);
        setIsModalOpen(true);
    };

    const handleEdit = (professional: Professional) => {
        setEditingProfessional(professional);
        setIsModalOpen(true);
    };

    const handleRemove = (professionalId: string) => {
        if(window.confirm('Tem certeza que deseja remover este profissional? Todos os seus agendamentos futuros também serão cancelados.')) {
            removeProfessional(professionalId);
        }
    };
    
    const handleSave = (data: Professional | Omit<Professional, 'id'>) => {
        if ('id' in data) {
            updateProfessional(data);
        } else {
            addProfessional(data);
        }
        setIsModalOpen(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-3xl font-bold text-stone-800">Profissionais</h3>
                <button onClick={handleAddNew} className="bg-pink-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" />
                    Adicionar Profissional
                </button>
            </div>
            <div className="space-y-4">
                {professionals.map(prof => (
                    <div key={prof.id} className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-lg font-bold text-stone-800">{prof.name}</h4>
                                <p className="text-stone-500">{prof.role}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(prof)} className="text-sm text-pink-600 font-semibold hover:underline">Editar</button>
                                <button onClick={() => handleRemove(prof.id)} className="text-sm text-red-600 font-semibold hover:underline"><TrashIcon className="w-4 h-4 inline-block"/> </button>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <h5 className="text-sm font-semibold text-stone-600 mb-2">Serviços Oferecidos:</h5>
                            <div className="flex flex-wrap gap-2">
                                {prof.availableServices.map(serviceId => {
                                    const service = services.find(s => s.id === serviceId);
                                    return (
                                        <span key={serviceId} className="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                            {service?.name || 'Serviço desconhecido'}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                             <h3 className="text-2xl font-bold text-stone-800">{editingProfessional ? 'Editar Profissional' : 'Adicionar Profissional'}</h3>
                             <button onClick={() => setIsModalOpen(false)}><XIcon className="w-6 h-6 text-stone-500 hover:text-stone-800" /></button>
                        </div>
                       <ProfessionalForm professional={editingProfessional} onSave={handleSave} onCancel={() => setIsModalOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProfessionals;
