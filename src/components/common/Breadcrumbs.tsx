// src/components/common/Breadcrumbs.tsx
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import './Breadcrumbs.css';

// Diccionario para traducir las rutas (URL) a nombres limpios en español
const routeNames: Record<string, string> = {
  'admin': 'Panel Admin',
  'mi-cuenta': 'Mi Panel',
  'productos': 'Productos',
  'servicios': 'Servicios',
  'usuarios': 'Usuarios',
};

const Breadcrumbs = () => {
  const location = useLocation();
  
  // Cortamos la URL para saber en qué carpetas estamos
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Si estamos en la página principal ("/"), no mostramos las migajas
  if (pathnames.length === 0) return null;

  return (
    <nav className="breadcrumbs-container" aria-label="breadcrumb">
      <ol className="breadcrumbs-list">
        {/* Siempre empezamos con el botón de Inicio */}
        <li className="breadcrumb-item">
          <Link to="/" className="breadcrumb-link home-link">
            <Home size={16} />
            <span>Inicio</span>
          </Link>
        </li>

        {/* Generamos las siguientes partes de la ruta */}
        {pathnames.map((value, index) => {
          // Construimos la ruta hacia atrás para que el link funcione
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          
          // Revisamos si es el último elemento (donde estamos parados actualmente)
          const isLast = index === pathnames.length - 1;
          
          // Buscamos el nombre en el diccionario, si no está, ponemos la palabra con mayúscula
          const displayName = routeNames[value] || value.charAt(0).toUpperCase() + value.slice(1);

          return (
            <li key={to} className="breadcrumb-item">
              <ChevronRight size={16} className="breadcrumb-separator" />
              {isLast ? (
                // Si es la página actual, solo es texto (no es clickeable)
                <span className="breadcrumb-current">{displayName}</span>
              ) : (
                // Si es una página anterior, es un enlace clickeable
                <Link to={to} className="breadcrumb-link">
                  {displayName}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;