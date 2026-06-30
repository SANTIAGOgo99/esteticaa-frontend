// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Páginas del Administrador
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminServices from './pages/admin/AdminServices';
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminDatabase from './pages/admin/AdminDatabase';
import AdminSiteContent from './pages/admin/AdminSiteContent';
import AdminClients from './pages/admin/AdminClients';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/common/ProtectedRoute';

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
        <Route element={<ProtectedRoute allowedRoles={['client', 'employee']} unauthorizedPath="/admin/dashboard" />}>
          <Route path="/mi-cuenta" element={<ClientDashboard />} />
        </Route>

        {/* ================= Panel Administrativo ================= */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} unauthorizedPath="/mi-cuenta" />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="productos" element={<AdminProducts />} />
            <Route path="servicios" element={<AdminServices />} />
            <Route path="clientes" element={<AdminClients />} />
            <Route path="usuarios" element={<AdminUsers />} />
            <Route path="sitio-web" element={<AdminSiteContent />} />
            <Route path="base-datos" element={<AdminDatabase />} />
            <Route path="citas" element={<AdminAppointments />} />
          </Route>
        </Route>

        {/* ================= Pantalla de Error (404) ================= */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
