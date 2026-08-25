// src/pages/client/ClientDashboard.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import ClientSidebar from '../../components/client/ClientSidebar';

import ClientProducts from './ClientProducts';
import ClientServices from './ClientServices';
import ClientAppointments from './ClientAppointments';
import ClientCart from './ClientCart';
import ClientProfile from './ClientProfile';

import api from '../../services/api';
import { useCart } from '../../hooks/useCart';
import './ClientDashboard.css';

interface UserProfile {
  full_name: string;
  email: string;
  phone: string;
}

const validSections = new Set(['productos', 'servicios', 'citas', 'carrito', 'perfil']);

const ClientDashboard = () => {
  const { section } = useParams();
  const navigate = useNavigate();
  const activeTab = useMemo(() => section && validSections.has(section) ? section : 'productos', [section]);
  const [appointmentsInitialView, setAppointmentsInitialView] = useState<'list' | 'book'>('list');
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const cart = useCart();

  useEffect(() => {
    if (!section || !validSections.has(section)) {
      navigate('/mi-cuenta/productos', { replace: true });
    }
  }, [navigate, section]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'citas') setAppointmentsInitialView('list');
    navigate(`/mi-cuenta/${tab}`);
  };

  const goToBookAppointment = () => {
    setAppointmentsInitialView('book');
    navigate('/mi-cuenta/citas');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await api.get('/users/profile');
        setUserData(profileRes.data);
      } catch (error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 401) handleLogout();
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen bg-[#fef9f2] text-[#5e4b3a] font-sans overflow-hidden transition-colors duration-300">
      <ClientSidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        handleLogout={handleLogout}
        userData={userData}
        cartCount={cart.totalItems}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 w-full max-w-screen-2xl mx-auto custom-scrollbar">
          {activeTab === 'productos' && (
            <ClientProducts
              addToCart={cart.addItem}
              cartCount={cart.totalItems}
              openCart={() => navigate('/mi-cuenta/carrito')}
            />
          )}

          {activeTab === 'servicios' && (
            <ClientServices goToAppointments={goToBookAppointment} />
          )}

          {activeTab === 'citas' && (
            <ClientAppointments initialView={appointmentsInitialView} />
          )}

          {activeTab === 'carrito' && (
            <ClientCart
              items={cart.items}
              subtotal={cart.subtotal}
              updateQuantity={cart.updateQuantity}
              removeItem={cart.removeItem}
              clearCart={cart.clearCart}
              goToProducts={() => navigate('/mi-cuenta/productos')}
            />
          )}

          {activeTab === 'perfil' && (
            <ClientProfile
              userData={userData}
              onProfileUpdate={(updatedUser) => setUserData(updatedUser)}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;
