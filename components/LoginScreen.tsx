
import React, { useState } from 'react';
import { useClinic } from '../context';

const LoginScreen: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useClinic();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const success = login(username, password);
        if (!success) {
            setError('Usuário ou senha inválidos.');
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
            <div className="w-full max-w-md">
                <form onSubmit={handleLogin} className="bg-white shadow-2xl rounded-2xl px-8 pt-6 pb-8 mb-4">
                    <h2 className="text-3xl font-bold text-center text-stone-800 mb-6">Acesso Restrito</h2>
                    <div className="mb-4">
                        <label className="block text-stone-700 text-sm font-bold mb-2" htmlFor="username">
                            Usuário
                        </label>
                        <input
                            className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-stone-700 leading-tight focus:outline-none focus:ring-2 focus:ring-pink-400"
                            id="username"
                            type="text"
                            placeholder="Usuário"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-stone-700 text-sm font-bold mb-2" htmlFor="password">
                            Senha
                        </label>
                        <input
                            className="shadow-sm appearance-none border rounded-lg w-full py-3 px-4 text-stone-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-pink-400"
                            id="password"
                            type="password"
                            placeholder="******************"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                         {error && <p className="text-red-500 text-xs italic">{error}</p>}
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-full focus:outline-none focus:shadow-outline w-full transition-transform transform hover:scale-105"
                            type="submit"
                        >
                            Entrar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginScreen;
