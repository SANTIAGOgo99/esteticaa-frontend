// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Páginas del Administrador
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminServices from './pages/admin/AdminServices';
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminBackups from './pages/admin/AdminBackups';
import AdminStats from './pages/admin/AdminStats';
import AdminAnalytics from './pages/admin/AdminAnalytics'; // 🌟 1. Importamos la página de Analíticas
import AdminLayout from './components/admin/AdminLayout';

// Páginas Públicas
import Home from './pages/public/Home';
import Login from "./pages/public/Login";
import Terminos from "./pages/public/Terminos";
import Privacidad from "./pages/public/Privacidad";
import Cancelaciones from "./pages/public/Cancelaciones";
import NotFound from "./pages/public/NotFound";

// Páginas del Cliente
import ClientDashboard from "./pages/client/ClientDashboard";

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      
      <Routes>
        {/* ================= Lado Público ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/cancelaciones" element={<Cancelaciones />} />

        {/* ================= Acceso Cliente ================= */}
        <Route path="/mi-cuenta" element={<ClientDashboard />} />

        {/* ================= Panel Administrativo ================= */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="productos" element={<AdminProducts />} />
          <Route path="servicios" element={<AdminServices />} />
          <Route path="usuarios" element={<AdminUsers />} />
          <Route path="respaldos" element={<AdminBackups />} />
          <Route path="citas" element={<AdminAppointments />} />
          
          {/* El panel de telemetría y salud */}
          <Route path="stats" element={<AdminStats />} />
          
          {/* 🌟 2. NUEVA RUTA: El panel de predicciones de negocio */}
          <Route path="analiticas" element={<AdminAnalytics />} />
        </Route>

        {/* ================= Pantalla de Error (404) ================= */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;