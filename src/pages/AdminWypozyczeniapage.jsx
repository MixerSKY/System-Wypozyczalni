import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function AdminWypozyczeniaPage() {
  const [wypozyczenia, setWypozyczenia] = useState([]);
  const [ladowanie, setLadowanie] = useState(true);
  const [zalogowanyUser, setZalogowanyUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userStorage = localStorage.getItem('uzytkownik');
    if (!userStorage) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userStorage);
    if (parsedUser.rola === 'klient') {
      navigate('/panel-klienta');
      return;
    }
    setZalogowanyUser(parsedUser);
    fetchWypozyczenia();
  }, [navigate]);

  const fetchWypozyczenia = () => {
    setLadowanie(true);
    axios.get('${import.meta.env.REACT_APP_API_URL}/api/Wypozyczenia/admin/wszystkie')
      .then(response => {
        setWypozyczenia(response.data);
        setLadowanie(false);
      })
      .catch(error => {
        console.error("Błąd:", error);
        setLadowanie(false);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('uzytkownik');
    navigate('/');
  };

  // Magia zmiany statusu w locie
  const handleStatusChange = async (wypozyczenieId, nowyStatusId) => {
    try {
      await axios.patch(`${import.meta.env.REACT_APP_API_URL}/api/Wypozyczenia/${wypozyczenieId}/status/${nowyStatusId}`);
      // Odśwież listę po udanej zmianie w bazie
      fetchWypozyczenia();
    } catch (error) {
      console.error("Błąd zmiany statusu:", error);
      alert("Nie udało się zaktualizować statusu.");
    }
  };

  if (!zalogowanyUser) return null;

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl hidden md:flex">
        <div className="p-6 text-2xl font-bold border-b border-slate-700 tracking-wider">AutoRent</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">Dostępne pojazdy</Link>
          <Link to="/admin/wypozyczenia" className="block px-4 py-2 bg-blue-600 rounded-lg text-white font-medium shadow">Wypożyczenia</Link>
          <Link to="/admin/klienci" className="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">Klienci</Link>
        </nav>
        <div className="p-4 border-t border-slate-700 text-sm text-slate-400">
          Zalogowano jako: <span className="text-white font-semibold uppercase">{zalogowanyUser.login}</span>
        </div>
      </aside>

      {/* GŁÓWNY KONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 z-10">
          <h1 className="text-xl font-semibold text-gray-800">Zarządzanie Wypożyczeniami</h1>
          <button onClick={handleLogout} className="bg-slate-100 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-50 hover:text-red-600 transition">Wyloguj</button>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {ladowanie ? (
            <div className="flex items-center justify-center h-full"><p className="text-gray-500 animate-pulse">Pobieranie bazy danych...</p></div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-gray-600 text-sm border-b border-gray-200">
                    <th className="p-4 font-semibold">Numer i Klient</th>
                    <th className="p-4 font-semibold">Pojazd</th>
                    <th className="p-4 font-semibold">Okres</th>
                    <th className="p-4 font-semibold">Akcja (Zmiana statusu)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {wypozyczenia.map(w => (
                    <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="font-mono text-sm font-bold text-gray-800">{w.numerWypozyczenia}</div>
                        <div className="text-sm text-gray-500">{w.klient?.imie} {w.klient?.nazwisko}</div>
                      </td>
                      <td className="p-4 font-bold text-gray-900">{w.samochod?.marka} {w.samochod?.model}</td>
                      <td className="p-4 text-sm text-gray-600">
                        {w.dataOd} <br/><span className="text-gray-400">do</span> {w.dataDo}
                      </td>
                      <td className="p-4">
                        {/* SELECT DO ZMIANY STATUSU */}
                        <select 
                          value={w.statusId}
                          onChange={(e) => handleStatusChange(w.id, parseInt(e.target.value))}
                          className={`border p-2 rounded-lg text-sm font-bold shadow-sm outline-none cursor-pointer
                            ${w.statusId === 1 ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                              w.statusId === 2 ? 'bg-green-50 text-green-700 border-green-200' : 
                              'bg-red-50 text-red-700 border-red-200'}`}
                        >
                          <option value="1">Aktywne (W trakcie)</option>
                          <option value="2">Zakończone (Oddane)</option>
                          <option value="3">Anulowane</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}