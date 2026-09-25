// src/App.tsx
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/common/ProtectedRoute';
import Home from './pages/public/Home';

// Las rutas que no pertenecen a la portada se cargan solo cuando se visitan.
// Esto reduce el JavaScript inicial, especialmente importante en móviles.
const Login = lazy(() => import('./pages/public/Login'));
const Terminos = lazy(() => import('./pages/public/Terminos'));
const Privacidad = lazy(() => import('./pages/public/Privacidad'));
const Cancelaciones = lazy(() => import('./pages/public/Cancelaciones'));
const NotFound = lazy(() => import('./pages/public/NotFound'));
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminServices = lazy(() => import('./pages/admin/AdminServices'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAppointments = lazy(() => import('./pages/admin/AdminAppointments'));
const AdminDatabase = lazy(() => import('./pages/admin/AdminDatabase'));
const AdminSiteContent = lazy(() => import('./pages/admin/AdminSiteContent'));
const AdminClients = lazy(() => import('./pages/admin/AdminClients'));

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#FAF6F0] text-[#3D2512]">
    Cargando...
  </div>
);

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />

      <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* ================= Lado Público ================= */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/cancelaciones" element={<Cancelaciones />} />

          {/* ================= Acceso Cliente ================= */}
          <Route element={<ProtectedRoute allowedRoles={['client', 'employee']} unauthorizedPath="/admin/dashboard" />}>
            <Route path="/mi-cuenta/:section?" element={<ClientDashboard />} />
          </Route>

          {/* ================= Panel Administrativo ================= */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} unauthorizedPath="/mi-cuenta/productos" />}>
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
      </Suspense>
    </>
  );
}

export default App;
