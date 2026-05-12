import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function KatalogPojazdow() {
  const [samochody, setSamochody] = useState([]);
  const [ladowanie, setLadowanie] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Logika rezerwacji
  const [selectedCar, setSelectedCar] = useState(null);
  const [dataOd, setDataOd] = useState('');
  const [dataDo, setDataDo] = useState('');
  const [dniWynajmu, setDniWynajmu] = useState(0);

  // Nowe stany do obsługi zajętych terminów i blokad
  const [zajeteTerminy, setZajeteTerminy] = useState([]);
  const [bladKolizji, setBladKolizji] = useState('');

  // 1. Sprawdzanie sesji i pobieranie aut
  useEffect(() => {
    const userStorage = localStorage.getItem('uzytkownik');
    if (!userStorage) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userStorage));

    axios.get('${process.env.REACT_APP_API_URL}/api/Samochody/dostepne')
      .then(response => {
        setSamochody(response.data);
        setLadowanie(false);
      })
      .catch(error => {
        console.error("Błąd pobierania pojazdów:", error);
        setLadowanie(false);
      });
  }, [navigate]);

  // 2. Pobieranie zajętych terminów z C# po kliknięciu w konkretne auto
  useEffect(() => {
    if (selectedCar) {
      axios.get(`${process.env.REACT_APP_API_URL}/api/Wypozyczenia/samochod/${selectedCar.id}/zajete-daty`)
        .then(res => setZajeteTerminy(res.data))
        .catch(err => console.error("Błąd pobierania terminów:", err));
    }
  }, [selectedCar]);

  // 3. Dynamiczne przeliczanie dni wynajmu i walidacja kolizji
  useEffect(() => {
    setBladKolizji('');
    if (dataOd && dataDo) {
      const start = new Date(dataOd);
      const end = new Date(dataDo);
      
      // Zabezpieczenie: data do musi być większa od data od
      if (end <= start) {
        setDniWynajmu(0);
        return;
      }

      // Twarda logika biznesowa: Sprawdzamy czy wybrane daty nie nakładają się na już zajęte
      let czyKolizja = false;
      for (let termin of zajeteTerminy) {
        const zajeteOd = new Date(termin.od);
        // C# formatuje słowo kluczowe @do jako do w formacie JSON
        const zajeteDo = new Date(termin.do); 
        
        // Matematyczny warunek przecięcia się dwóch przedziałów czasowych
        if (start <= zajeteDo && end >= zajeteOd) {
          czyKolizja = true;
          break;
        }
      }

      if (czyKolizja) {
        setBladKolizji('Pojazd jest już zarezerwowany w wybranym przedziale czasowym!');
        setDniWynajmu(0);
      } else {
        const roznicaCzasu = end.getTime() - start.getTime();
        setDniWynajmu(Math.ceil(roznicaCzasu / (1000 * 3600 * 24)));
      }
    } else {
      setDniWynajmu(0);
    }
  }, [dataOd, dataDo, zajeteTerminy]);

  // 4. Wysłanie poprawnej rezerwacji do serwera
  const handleRezerwacja = async (e) => {
    e.preventDefault();
    if (dniWynajmu <= 0 || bladKolizji) {
      alert("Sprawdź poprawność wybranych dat przed rezerwacją.");
      return;
    }

    try {
      const payload = {
        samochodId: selectedCar.id,
        klientId: user.klientId,
        pracownikId: 1, 
        dataOd: dataOd,
        dataDo: dataDo,
        cenaZaDzien: selectedCar.cenaZaDzien,
        statusId: 1 // Status 1 = Aktywne
      };

      await axios.post('${process.env.REACT_APP_API_URL}/api/Wypozyczenia', payload);
      alert("Twoje wypożyczenie zostało zgłoszone pomyślnie!");
      
      setSelectedCar(null);
      setDataOd('');
      setDataDo('');
      navigate('/panel-klienta');
    } catch (error) {
      console.error("Błąd zapisu wypożyczenia:", error);
      alert("Wystąpił problem podczas rezerwacji. Spróbuj ponownie.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('uzytkownik');
    navigate('/');
  };

  if (!user) return null;

  const dzisiaj = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
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
          <Link to="/panel-klienta" className="py-4 text-gray-500 hover:text-blue-600 transition font-medium">Moje Wypożyczenia</Link>
          <Link to="/panel-klienta/rezerwacja" className="py-4 border-b-2 border-blue-600 text-blue-600 font-bold">Zarezerwuj Pojazd</Link>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto p-6 w-full mt-4">
        <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-800">Dostępne pojazdy we flocie</h2>
        </div>

        {ladowanie ? (
          <p className="text-gray-500 animate-pulse">Szukanie wolnych aut...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {samochody.map(auto => (
              <div key={auto.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                <div className="h-32 bg-slate-200 flex items-center justify-center border-b border-gray-100">
                  <span className="text-slate-400 font-bold text-xl uppercase tracking-widest">{auto.marka}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900">{auto.marka} {auto.model}</h3>
                  <p className="text-sm text-gray-500 mt-1">Kategoria: {auto.kategoria?.nazwa}</p>
                  <p className="text-blue-600 font-bold mt-4 text-2xl">{auto.cenaZaDzien} <span className="text-sm text-gray-500 font-normal">PLN / 24h</span></p>
                  
                  <button 
                    onClick={() => { setSelectedCar(auto); setDataOd(''); setDataDo(''); }}
                    className="mt-6 w-full bg-blue-600 text-white font-bold py-2.5 rounded-lg hover:bg-blue-700 transition shadow-sm"
                  >
                    Wybierz ten pojazd
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL REZERWACJI */}
      {selectedCar && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-8 relative">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-gray-800">Konfiguracja Rezerwacji</h2>
              <button onClick={() => { setSelectedCar(null); setDataOd(''); setDataDo(''); }} className="text-gray-400 hover:text-red-500 text-3xl font-bold transition">&times;</button>
            </div>

            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-bold text-blue-900">{selectedCar.marka} {selectedCar.model}</h3>
              <p className="text-sm text-blue-700 mt-1">Stawka bazowa: {selectedCar.cenaZaDzien} PLN / dzień</p>
            </div>

            <form onSubmit={handleRezerwacja} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data odbioru</label>
                  <input 
                    type="date" 
                    required 
                    min={dzisiaj}
                    value={dataOd} 
                    onChange={(e) => setDataOd(e.target.value)} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data zwrotu</label>
                  <input 
                    type="date" 
                    required 
                    min={dataOd || dzisiaj}
                    value={dataDo} 
                    onChange={(e) => setDataDo(e.target.value)} 
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
              </div>

              {/* Wyświetlanie błędu w przypadku kolizji */}
              {bladKolizji && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 font-bold text-center text-sm">{bladKolizji}</p>
                  <p className="text-red-500 text-xs text-center mt-1">
                    Sprawdź inne daty lub wybierz inny pojazd.
                  </p>
                </div>
              )}

              <div className="mt-6 p-5 bg-slate-50 border border-gray-200 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Ilość dni wynajmu:</p>
                  <p className="font-bold text-lg text-gray-800">{dniWynajmu} dni</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Całkowity koszt:</p>
                  <p className="font-extrabold text-2xl text-blue-600">{dniWynajmu * selectedCar.cenaZaDzien} PLN</p>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={dniWynajmu <= 0 || bladKolizji !== ''}
                className={`w-full font-bold py-3.5 rounded-lg shadow-md transition ${dniWynajmu > 0 && !bladKolizji ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Potwierdzam Rezerwację
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}