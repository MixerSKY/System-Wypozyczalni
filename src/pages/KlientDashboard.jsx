import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function KlientDashboard() {
  const [wypozyczenia, setWypozyczenia] = useState([]);
  const [ladowanie, setLadowanie] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userStorage = localStorage.getItem('uzytkownik');
    if (!userStorage) {
      navigate('/login');
      return;
    }
    
    const parsedUser = JSON.parse(userStorage);
    // Zabezpieczenie: Admin nie powinien wchodzić na panel klienta
    if (parsedUser.rola === 'admin') {
      navigate('/admin');
      return;
    }
    
    setUser(parsedUser);
    
    // Pobieramy historię wypożyczeń konkretnego klienta
    axios.get(`${process.env.REACT_APP_API_URL}/api/Wypozyczenia/klient/${parsedUser.klientId}`)
      .then(response => {
        setWypozyczenia(response.data);
        setLadowanie(false);
      })
      .catch(error => {
        console.error("Błąd pobierania wypożyczeń:", error);
        setLadowanie(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('uzytkownik');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-wider">AutoRent <span className="text-blue-200 text-sm font-normal">| Strefa Klienta</span></h1>
          <div className="flex gap-4 items-center">
            <span className="text-sm">Witaj, <strong>{user.login}</strong></span>
            <button onClick={handleLogout} className="bg-blue-800 px-4 py-2 rounded text-sm font-medium hover:bg-blue-900 transition">
              Wyloguj
            </button>
          </div>
        </div>
      </header>

      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 flex gap-6">
          <Link to="/panel-klienta" className="py-4 border-b-2 border-blue-600 text-blue-600 font-bold">Moje Wypożyczenia</Link>
          <Link to="/panel-klienta/rezerwacja" className="py-4 text-gray-500 hover:text-blue-600 transition font-medium">Zarezerwuj Pojazd</Link>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto p-6 w-full mt-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Historia Twoich wynajmów</h2>
        
        {ladowanie ? (
          <p className="text-gray-500 animate-pulse">Ładowanie historii...</p>
        ) : wypozyczenia.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-gray-100 text-center shadow-sm">
            <p className="text-gray-500 mb-4">Nie masz jeszcze żadnych wypożyczeń na swoim koncie.</p>
            <Link to="/panel-klienta/rezerwacja" className="inline-block bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition">
              Zarezerwuj swoje pierwsze auto
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-gray-600 text-sm border-b border-gray-200">
                  <th className="p-4 font-semibold">Numer rezerwacji</th>
                  <th className="p-4 font-semibold">Pojazd</th>
                  <th className="p-4 font-semibold">Termin wynajmu</th>
                  <th className="p-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {wypozyczenia.map(w => (
                  <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-sm text-gray-600">{w.numerWypozyczenia}</td>
                    
                    <td className="p-4 font-bold text-gray-900">{w.samochod?.marka} {w.samochod?.model}</td>
                    
                    <td className="p-4 text-sm text-gray-600">
                      {w.dataOd} <span className="text-gray-400 mx-1">do</span> {w.dataDo}
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${w.status?.nazwa === 'Aktywne' ? 'bg-blue-100 text-blue-700' : w.status?.nazwa === 'Zakończone' ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-700'}`}>
                        {w.status?.nazwa}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}