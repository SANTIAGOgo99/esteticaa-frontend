// src/pages/admin/AdminAppointments.tsx
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Calendar, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import api from '../../services/api';
import './AdminAppointments.css';

interface CitaAdmin {
  id: number;
  cliente: string; 
  servicio: string; 
  appointment_date: string;
  total_amount: string | number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

const AdminAppointments = () => {
  const [citas, setCitas] = useState<CitaAdmin[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCitas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/appointments');
      setCitas(response.data);
    } catch (error) {
      console.error(error); 
      toast.error('No se pudieron cargar las citas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCitas(); }, []);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      toast.loading('Actualizando estado...', { id: 'updateStatus' });
      await api.put(`/appointments/${id}/status`, { status: newStatus });
      toast.success(`Cita ${newStatus === 'confirmed' ? 'aceptada' : 'cancelada'} exitosamente.`, { id: 'updateStatus' });
      fetchCitas();
    } catch (error) {
      console.error(error); 
      toast.error('Hubo un error al actualizar la cita.', { id: 'updateStatus' });
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="badge-status badge-warning">En Espera</span>;
      case 'confirmed': return <span className="badge-status badge-success">Confirmada</span>;
      case 'cancelled': return <span className="badge-status badge-error">Cancelada</span>;
      case 'completed': return <span className="badge-status badge-gray">Completada</span>;
      default: return <span className="badge-status badge-gray">{status}</span>;
    }
  };

  if (loading) return <div className="loading-state"><Loader2 className="spinner" size={32} /></div>;

  return (
    <div className="saas-container">
      <Breadcrumbs />
      
      <div className="saas-header">
        <div>
          <p className="saas-eyebrow">Gestión de Agenda</p>
          <h1 className="saas-title">Citas Programadas</h1>
        </div>
      </div>

      <div className="saas-table-card">
        <table className="saas-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Cliente</th>
              <th>Servicio</th>
              <th>Fecha y Hora</th>
              <th>Monto</th>
              <th>Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {citas.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-muted" style={{ padding: '40px' }}>
                  No hay citas agendadas en este momento.
                </td>
              </tr>
            ) : (
              citas.map((cita) => (
                <tr key={cita.id} className={cita.status === 'pending' ? 'row-highlight' : ''}>
                  <td className="text-muted">#{cita.id}</td>
                  <td className="font-medium text-indigo">{cita.cliente || 'Usuario Web'}</td>
                  <td>{cita.servicio || 'Servicio General'}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} className="text-muted"/> 
                        {new Date(cita.appointment_date).toLocaleDateString()}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#8C7060', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} className="text-muted"/> 
                        {new Date(cita.appointment_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </td>
                  <td className="font-semibold text-emerald">${Number(cita.total_amount).toFixed(2)}</td>
                  <td>{renderStatusBadge(cita.status)}</td>
                  <td>
                    <div className="action-buttons">
                      {cita.status === 'pending' && (
                        <>
                          <button className="btn-icon text-emerald" title="Aceptar Cita" onClick={() => handleUpdateStatus(cita.id, 'confirmed')}>
                            <CheckCircle size={18} />
                          </button>
                          <button className="btn-icon text-rose" title="Cancelar Cita" onClick={() => handleUpdateStatus(cita.id, 'cancelled')}>
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAppointments;