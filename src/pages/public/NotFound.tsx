// src/pages/public/NotFound.tsx
import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import logoImagen from '../../assets/images/LogoImagen.png';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <div className="notfound-box">
        <img src={logoImagen} alt="Ezequiel Castillo" className="notfound-logo" />
        
        <div className="notfound-icon-wrapper">
          <AlertTriangle size={60} className="notfound-icon" />
        </div>
        
        <h1 className="notfound-title">¡Oops! Página no encontrada</h1>
        <p className="notfound-message">
          Parece que te has perdido. El enlace está roto, escribiste mal la dirección o la página fue movida.
        </p>
        
        <button className="btn-return-home" onClick={() => navigate('/')}>
          <Home size={20} /> Regresar al Inicio
        </button>
      </div>
    </div>
  );
};

export default NotFound;