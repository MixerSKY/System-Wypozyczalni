import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function KlienciPage() {
  const [klienci, setKlienci] = useState([]);
  const [ladowanie, setLadowanie] = useState(true);
  const [zalogowanyUser, setZalogowanyUser] = useState(null);
  const navigate = useNavigate();

  // Stany dla modala
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    imie: '', nazwisko: '', pesel: '', nrPrawaJazdy: '', telefon: '', email: '', adres: ''
  });

  useEffect(() => {
    const userStorage = localStorage.getItem('uzytkownik');
    if (!userStorage) {
      navigate('/login');
      return;
    }
    setZalogowanyUser(JSON.parse(userStorage));
    fetchKlienci();
  }, [navigate]);

  const fetchKlienci = () => {
    setLadowanie(true);
    axios.get(`${import.meta.env.VITE_API_URL}/api/Klienci`)
      .then(response => {
        setKlienci(response.data);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/Klienci`, formData);
      setIsModalOpen(false);
      fetchKlienci();
      setFormData({
        imie: '', nazwisko: '', pesel: '', nrPrawaJazdy: '', telefon: '', email: '', adres: ''
      });
    } catch (error) {
      console.error("Błąd przy dodawaniu klienta:", error);
      alert("Wystąpił błąd przy zapisie do bazy.");
    }
  };

  if (!zalogowanyUser) return null;

  return (
    <div className="flex h-screen bg-gray-100 relative">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl hidden md:flex">
        <div className="p-6 text-2xl font-bold border-b border-slate-700 tracking-wider">
          AutoRent
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            Dostępne pojazdy
          </Link>
          <Link to="/admin/wypozyczenia" className="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
          Wypożyczenia
          </Link>
          {/* Aktywna zakładka */}
          <Link to="/admin/klienci" className="block px-4 py-2 bg-blue-600 rounded-lg text-white font-medium shadow">
            Klienci
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-700 text-sm text-slate-400">
          Zalogowano jako: <span className="text-white font-semibold uppercase">{zalogowanyUser.login}</span>
        </div>
      </aside>

      {/* GŁÓWNY KONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 z-10">
          <h1 className="text-xl font-semibold text-gray-800">Zarządzanie Klientami</h1>
          <div className="flex gap-4">
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-bold shadow hover:bg-blue-700 transition">
              + Dodaj klienta
            </button>
            <button onClick={handleLogout} className="bg-slate-100 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-50 hover:text-red-600 transition">
              Wyloguj
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {ladowanie ? (
            <div className="flex items-center justify-center h-full"><p className="text-gray-500 animate-pulse">Pobieranie bazy danych...</p></div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-gray-600 text-sm border-b border-gray-200">
                    <th className="p-4 font-semibold">Imię i Nazwisko</th>
                    <th className="p-4 font-semibold">Kontakt</th>
                    <th className="p-4 font-semibold">PESEL</th>
                    <th className="p-4 font-semibold">Nr Prawa Jazdy</th>
                    <th className="p-4 font-semibold">Adres</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {klienci.map(klient => (
                    <tr key={klient.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-gray-900">{klient.imie} {klient.nazwisko}</td>
                      <td className="p-4">
                        <div className="text-sm text-gray-800">{klient.telefon}</div>
                        <div className="text-xs text-gray-500">{klient.email}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-600 font-mono">{klient.pesel}</td>
                      <td className="p-4 text-sm text-gray-600 font-mono tracking-wider">{klient.nrPrawaJazdy}</td>
                      <td className="p-4 text-sm text-gray-600 truncate max-w-xs">{klient.adres}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* MODAL - DODAWANIE KLIENTA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">Rejestracja nowego klienta</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 text-3xl font-bold transition">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imię</label>
                  <input type="text" name="imie" required value={formData.imie} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nazwisko</label>
                  <input type="text" name="nazwisko" required value={formData.nazwisko} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">PESEL</label>
                  <input type="text" name="pesel" maxLength="11" minLength="11" required value={formData.pesel} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nr Prawa Jazdy</label>
                  <input type="text" name="nrPrawaJazdy" required value={formData.nrPrawaJazdy} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input type="tel" name="telefon" required value={formData.telefon} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adres zamieszkania</label>
                  <input type="text" name="adres" value={formData.adres} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition">Anuluj</button>
                <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition">Dodaj klienta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}