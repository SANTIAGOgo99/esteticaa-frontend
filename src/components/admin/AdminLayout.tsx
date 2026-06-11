// src/components/admin/AdminLayout.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import './AdminLayout.css';

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    // 🌟 CLAVE: flex, h-screen, w-screen y overflow-hidden
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAF6F0] font-sans">
      
      {/* 🌟 CLAVE: El sidebar es un elemento "flex" al lado del main */}
      <AdminSidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
      />

      {/* 🌟 CLAVE: El contenedor principal ocupa el resto del espacio y tiene su propio scroll */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-[#FAF6F0]">
        <AdminHeader />
        
        <main className="flex-1 overflow-y-auto overflow-x-hidden w-full relative">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;