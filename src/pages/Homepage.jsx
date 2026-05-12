import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function HomePage() {
  const [samochody, setSamochody] = useState([]);

  useEffect(() => {
    // Pobieramy tylko dostępne auta z API i ucinamy do 3 sztuk na pokaz
    axios.get('${process.env.REACT_APP_API_URL}/api/Samochody/dostepne')
      .then(res => setSamochody(res.data.slice(0, 3)))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* NAVBAR */}
      <header className="bg-slate-900 text-white p-6 flex justify-between items-center shadow-md">
        <h1 className="text-2xl font-bold tracking-wider">AutoRent</h1>
        <Link to="/login" className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-medium transition">
          Zaloguj
        </Link>
      </header>
      
      {/* HERO SECTION */}
      <main className="flex-1 max-w-6xl mx-auto p-8 mt-8 w-full">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6">Najlepsza wypożyczalnia samochodów</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Oferujemy szeroki wybór pojazdów w najlepszych cenach. Niezależnie czy szukasz małego auta do miasta, czy pakownego SUV-a na wakacje – mamy to, czego potrzebujesz!
          </p>
        </div>

        {/* PRZYKŁADOWE AUTA */}
        <h3 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Nasze przykładowe pojazdy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {samochody.map(auto => (
            <div key={auto.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <h4 className="text-xl font-bold text-gray-900">{auto.marka} {auto.model}</h4>
              <p className="text-gray-500 mt-2">Kategoria: {auto.kategoria?.nazwa}</p>
              <p className="text-blue-600 font-bold mt-4 text-2xl">{auto.cenaZaDzien} <span className="text-sm text-gray-500 font-normal">PLN / dzień</span></p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}