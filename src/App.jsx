import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/Homepage';
import LoginPage from './pages/Loginpage'; 
import AdminDashboard from './pages/AdminDashboard';
import KlienciPage from './pages/Kliencipage';
import KlientDashboard from './pages/KlientDashboard';
import KatalogPojazdow from './pages/KatalogPojazdow';
import AdminWypozyczeniaPage from "./pages/AdminWypozyczeniapage";

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