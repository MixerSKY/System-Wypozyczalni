import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function AdminDashboard() {
  const [samochody, setSamochody] = useState([]);
  const [ladowanie, setLadowanie] = useState(true);
  const [zalogowanyUser, setZalogowanyUser] = useState(null);
  const navigate = useNavigate();

  // --- STANY DLA MODALI ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null); // Stan dla modala ze szczegółami

  const [formData, setFormData] = useState({
    marka: '',
    model: '',
    numerRejestracyjny: '',
    rokProdukcji: new Date().getFullYear(),
    przebieg: 0,
    cenaZaDzien: 0,
    statusId: 1, 
    kategoriaId: 1,
    dataWaznosciPrzegladu: '',
    dataWaznosciUbezpieczenia: ''
  });

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
    fetchSamochody();
  }, [navigate]);

  const fetchSamochody = () => {
    setLadowanie(true);
    axios.get(`${import.meta.env.VITE_API_URL}/api/Samochody`)
      .then(response => {
        setSamochody(response.data);
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
      const dataToSend = {
        ...formData,
        rokProdukcji: parseInt(formData.rokProdukcji),
        przebieg: parseInt(formData.przebieg),
        cenaZaDzien: parseFloat(formData.cenaZaDzien),
        statusId: parseInt(formData.statusId),
        kategoriaId: parseInt(formData.kategoriaId)
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/api/Samochody`, dataToSend);
      
      setIsModalOpen(false);
      fetchSamochody();
      
      setFormData({
        marka: '', model: '', numerRejestracyjny: '', rokProdukcji: new Date().getFullYear(),
        przebieg: 0, cenaZaDzien: 0, statusId: 1, kategoriaId: 1,
        dataWaznosciPrzegladu: '', dataWaznosciUbezpieczenia: ''
      });
    } catch (error) {
      console.error("Błąd przy dodawaniu pojazdu:", error);
      alert("Wystąpił błąd przy zapisie do bazy.");
    }
  };

  if (!zalogowanyUser) return null;

  return (
    <div className="flex h-screen bg-gray-100 relative">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl hidden md:flex">
        <div className="p-6 text-2xl font-bold border-b border-slate-700 tracking-wider">
          AutoRent
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="block px-4 py-2 bg-blue-600 rounded-lg text-white font-medium shadow">
            Dostępne pojazdy
          </Link>
          <Link to="/admin/wypozyczenia" className="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
          Wypożyczenia
          </Link>
          <Link to="/admin/klienci" className="block px-4 py-2 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors">
            Klienci
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-700 text-sm text-slate-400">
          Zalogowano jako: <span className="text-white font-semibold uppercase">{zalogowanyUser.login}</span>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8 z-10">
          <h1 className="text-xl font-semibold text-gray-800">Zarządzanie Flotą</h1>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-bold shadow hover:bg-blue-700 transition"
            >
              + Dodaj pojazd
            </button>
            <button 
              onClick={handleLogout} 
              className="bg-slate-100 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-50 hover:text-red-600 transition"
            >
              Wyloguj
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {ladowanie ? (
            <div className="flex items-center justify-center h-full"><p className="text-gray-500 animate-pulse">Pobieranie bazy danych...</p></div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {samochody.map(auto => (
                <div key={auto.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{auto.marka} {auto.model}</h3>
                      <p className="text-sm text-gray-500">{auto.numerRejestracyjny}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${auto.status?.nazwa === 'Dostepny' || auto.status?.nazwa === 'Dostępny' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {auto.status?.nazwa}
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Kategoria:</span><span className="font-medium">{auto.kategoria?.nazwa}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Cena za dzień:</span><span className="font-bold text-blue-600">{auto.cenaZaDzien} PLN</span></div>
                  </div>
                  
                  {/* PRZYCISK SZCZEGÓŁÓW */}
                  <button 
                    onClick={() => setSelectedCar(auto)}
                    className="mt-6 w-full bg-blue-50 text-blue-700 font-semibold py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    Szczegóły
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* MODAL 1 - DODAWANIE POJAZDU */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">Wprowadź nowy pojazd do bazy</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 text-3xl font-bold transition">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Marka</label>
                  <input type="text" name="marka" required value={formData.marka} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="np. Audi" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input type="text" name="model" required value={formData.model} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="np. A4" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nr Rejestracyjny</label>
                  <input type="text" name="numerRejestracyjny" required value={formData.numerRejestracyjny} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="np. WX 12345" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategoria pojazdu</label>
                  <select name="kategoriaId" value={formData.kategoriaId} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="1">Ekonomiczny</option>
                    <option value="2">Kombi</option>
                    <option value="3">SUV</option>
                    <option value="4">Luksusowy</option>
                    <option value="5">Dostawczy</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rok produkcji</label>
                  <input type="number" name="rokProdukcji" required min="1990" max="2026" value={formData.rokProdukcji} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Przebieg (km)</label>
                  <input type="number" name="przebieg" required min="0" value={formData.przebieg} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data ważności przeglądu</label>
                  <input type="date" name="dataWaznosciPrzegladu" required value={formData.dataWaznosciPrzegladu} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data ważności OC</label>
                  <input type="date" name="dataWaznosciUbezpieczenia" required value={formData.dataWaznosciUbezpieczenia} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cena za dzień (PLN)</label>
                  <input type="number" step="0.01" name="cenaZaDzien" required min="1" value={formData.cenaZaDzien} onChange={handleChange} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-blue-50 font-bold" />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition">
                  Anuluj
                </button>
                <button type="submit" className="px-8 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md transition">
                  Zapisz pojazd do bazy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2 - SZCZEGÓŁY POJAZDU */}
      {selectedCar && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">Karta pojazdu</h2>
              <button onClick={() => setSelectedCar(null)} className="text-gray-400 hover:text-red-500 text-3xl font-bold transition">&times;</button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Identyfikator systemowy:</span>
                <span className="font-mono text-gray-400">#{selectedCar.id}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Marka i Model:</span>
                <span className="font-bold text-gray-900">{selectedCar.marka} {selectedCar.model}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Numer Rejestracyjny:</span>
                <span className="font-medium tracking-widest uppercase">{selectedCar.numerRejestracyjny}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Rok produkcji:</span>
                <span className="font-medium">{selectedCar.rokProdukcji}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Przebieg:</span>
                <span className="font-medium">{selectedCar.przebieg.toLocaleString()} km</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Kategoria:</span>
                <span className="font-medium">{selectedCar.kategoria?.nazwa}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Status w systemie:</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedCar.status?.nazwa === 'Dostepny' || selectedCar.status?.nazwa === 'Dostępny' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {selectedCar.status?.nazwa}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Koszt wynajmu:</span>
                <span className="font-bold text-blue-600">{selectedCar.cenaZaDzien} PLN / 24h</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="text-gray-500">Ważność przeglądu:</span>
                <span className="font-medium">{selectedCar.dataWaznosciPrzegladu || 'Brak danych'}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-gray-500">Ważność polisy OC:</span>
                <span className="font-medium">{selectedCar.dataWaznosciUbezpieczenia || 'Brak danych'}</span>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
               <button 
                  onClick={() => setSelectedCar(null)} 
                  className="px-6 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-bold transition w-full"
               >
                Zamknij kartę
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}