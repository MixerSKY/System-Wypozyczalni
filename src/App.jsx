import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import KlienciPage from './pages/KlienciPage';
import KlientDashboard from './pages/KlientDashboard';
import KatalogPojazdow from './pages/KatalogPojazdow';
import AdminWypozyczeniaPage from './pages/AdminWypozyczeniaPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Moduł Administracyjny */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/klienci" element={<KlienciPage />} />
        <Route path="/admin/wypozyczenia" element={<AdminWypozyczeniaPage />} />
        
        {/* Moduł Klienta */}
        <Route path="/panel-klienta" element={<KlientDashboard />} />
        <Route path="/panel-klienta/rezerwacja" element={<KatalogPojazdow />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;