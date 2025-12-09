
import React, { useState } from 'react';
import { useClinic } from '../context';
import { UserRole } from '../types';

const AdminUsers: React.FC = () => {
    const { users, addUser, removeUser, loggedInUser } = useClinic();
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    
    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if(!newUsername.trim() || !newPassword.trim()) {
            setError('Usuário e senha são obrigatórios.');
            return;
        }
        if(users.some(u => u.username === newUsername)) {
            setError('Este nome de usuário já existe.');
            return;
        }

        setError('');
        addUser({
            username: newUsername,
            password: newPassword,
            role: UserRole.ADMIN,
        });
        setNewUsername('');
        setNewPassword('');
    }

    return (
        <div>
            <h3 className="text-3xl font-bold text-stone-800 mb-6">Gerenciar Usuários</h3>
            
            <div className="bg-stone-50 p-6 rounded-lg border border-stone-200 mb-8">
                <h4 className="text-xl font-bold text-stone-700 mb-4">Adicionar Novo Administrador</h4>
                <form onSubmit={handleAddUser} className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-1 w-full">
                        <label htmlFor="newUsername" className="sr-only">Nome de usuário</label>
                        <input 
                            type="text" 
                            id="newUsername"
                            value={newUsername}
                            onChange={e => setNewUsername(e.target.value)}
                            placeholder="Nome de usuário"
                            className="w-full p-2 border border-stone-300 rounded-md"
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label htmlFor="newPassword" className="sr-only">Senha</label>
                        <input 
                            type="password" 
                            id="newPassword"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            placeholder="Senha"
                            className="w-full p-2 border border-stone-300 rounded-md"
                        />
                    </div>
                    <button type="submit" className="bg-pink-500 text-white font-bold py-2 px-4 rounded-md hover:bg-pink-600 transition-colors w-full md:w-auto">
                        Adicionar
                    </button>
                </form>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

            <div>
                 <h4 className="text-xl font-bold text-stone-700 mb-4">Administradores Existentes</h4>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-stone-500">
                        <thead className="text-xs text-stone-700 uppercase bg-stone-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Usuário</th>
                                <th scope="col" className="px-6 py-3">Cargo</th>
                                <th scope="col" className="px-6 py-3">Ação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="bg-white border-b hover:bg-stone-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-stone-900 whitespace-nowrap">
                                        {user.username}
                                    </th>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === UserRole.SUPERADMIN ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.id !== loggedInUser?.id ? (
                                             <button onClick={() => removeUser(user.id)} className="font-medium text-red-600 hover:underline">Remover</button>
                                        ) : (
                                             <span className="text-stone-400">--</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
