// src/pages/client/ClientDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import ClientSidebar from '../../components/client/ClientSidebar';

import ClientProducts from './ClientProducts';
import ClientServices from './ClientServices';
import ClientBookAppointment from './ClientBookAppointment';

import api from '../../services/api';
import './ClientDashboard.css';

interface UserProfile {
  full_name: string;
  email: string;
  phone: string;
}

const ClientDashboard = () => {
  const [activeTab, setActiveTab] = useState('productos');
  const [userData, setUserData] = useState<UserProfile | null>(null);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await api.get('/users/profile');
        setUserData(profileRes.data);
      } catch (error) {
        const axiosError = error as { response?: { status?: number } };

        if (axiosError.response?.status === 401) {
          handleLogout();
        }
      }
    };

    fetchProfile();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen bg-[#fef9f2] text-[#5e4b3a] font-sans overflow-hidden transition-colors duration-300">
      <ClientSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleLogout}
        userData={userData}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10 w-full max-w-screen-2xl mx-auto custom-scrollbar">
          {activeTab === 'productos' && <ClientProducts />}

          {activeTab === 'servicios' && (
            <ClientServices goToAppointments={() => setActiveTab('citas')} />
          )}

          {activeTab === 'citas' && <ClientBookAppointment />}

          {activeTab === 'perfil' && <PantallaTemporal nombre="Mi Perfil" />}
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;

const PantallaTemporal = ({ nombre }: { nombre: string }) => (
  <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in border-2 border-dashed border-[#c9a87c]/30 rounded-3xl p-10 bg-white/50 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-40 h-40 bg-[#c9a87c]/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#c9a87c]/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

    <h2 className="font-serif text-3xl md:text-4xl font-light text-[#3f3a35] mb-2 z-10">
      {nombre}
    </h2>

    <p className="text-[#c9a87c] font-black tracking-[0.2em] text-xs uppercase z-10">
      Pantalla en construcción...
    </p>
  </div>
);