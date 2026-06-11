// src/components/public/AuthModal.tsx
import { useState } from 'react';
import { X, Mail, Lock, User, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import './AuthModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void; 
}

const AuthModal = ({ isOpen, onClose, onLoginSuccess }: Props) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulación de conexión
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      if (isLoginView) {
        toast.success('¡Bienvenido de vuelta!');
      } else {
        toast.success('¡Cuenta creada con éxito!');
      }

      onLoginSuccess(); 
      onClose(); 
    } catch (error) {
      console.error(error);
      toast.error('Ocurrió un error. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-card">
        <div className="auth-modal-header">
          <h2>{isLoginView ? 'Bienvenido de vuelta' : 'Crear tu Cuenta'}</h2>
          <p>{isLoginView ? 'Ingresa a tu portal de gestión.' : 'Únete para agendar y gestionar tus servicios.'}</p>
          <button onClick={onClose} className="auth-close-btn"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="auth-modal-form">
          {!isLoginView && (
            <div className="auth-form-row">
              <div className="auth-form-group">
                <label><User size={16} /> Nombre Completo</label>
                <input 
                  type="text" required placeholder="Ej. Juan Pérez"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="auth-form-group">
                <label><Phone size={16} /> WhatsApp</label>
                <input 
                  type="tel" required placeholder="10 dígitos"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
          )}

          <div className="auth-form-group">
            <label><Mail size={16} /> Correo Electrónico</label>
            <input 
              type="email" required placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div className="auth-form-group">
            <label><Lock size={16} /> Contraseña</label>
            <input 
              type="password" required placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-auth-submit">
            {loading ? 'Procesando...' : (isLoginView ? 'Iniciar Sesión' : 'Registrarme')}
          </button>

          <div className="auth-modal-toggle">
            <p>
              {isLoginView ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
              <button 
                type="button" 
                className="toggle-link-btn"
                onClick={() => setIsLoginView(!isLoginView)}
              >
                {isLoginView ? 'Regístrate aquí' : 'Inicia sesión'}
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;