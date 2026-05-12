import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function LoginPage() {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [haslo, setHaslo] = useState('');
  const [blad, setBlad] = useState('');
  const [ladowanie, setLadowanie] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setBlad('');
    setLadowanie(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/Auth/login`, {
        login: login,
        haslo: haslo
      });

      const user = response.data;
      localStorage.setItem('uzytkownik', JSON.stringify(user));
      
      // TWARDY WARUNEK RBAC (Role-Based Access Control)
      if (user.rola === 'admin' || user.rola === 'pracownik') {
        navigate('/admin');
      } else if (user.rola === 'klient') {
        navigate('/panel-klienta');
      } else {
        setBlad('Brak przypisanej roli w systemie.');
      }
      
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setBlad('Nieprawidłowy login lub hasło.');
      } else {
        setBlad('Błąd połączenia z serwerem.');
      }
    } finally {
      setLadowanie(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">AutoRent</h1>
          <p className="text-gray-500 mt-2">Zaloguj się do systemu</p>
        </div>
        
        {blad && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
            {blad}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Login</label>
            <input 
              type="text" 
              required 
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Wpisz login" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hasło</label>
            <input 
              type="password" 
              required 
              value={haslo}
              onChange={(e) => setHaslo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="••••••••" 
            />
          </div>
          <button 
            type="submit" 
            disabled={ladowanie}
            className={`w-full text-white font-bold py-3 rounded-lg transition shadow-md ${ladowanie ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {ladowanie ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>
      </div>
    </div>
  );
}