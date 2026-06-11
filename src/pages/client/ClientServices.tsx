// src/pages/client/ClientServices.tsx
import { useState } from 'react';
import useSWR from 'swr';
import {
  Scissors,
  Clock,
  Search,
  Calendar,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flower2,
} from 'lucide-react';
import api from '../../services/api';

const fetcher = (url: string) => api.get(url).then(res => res.data);

interface Servicio {
  id: number;
  name: string;
  description: string;
  price: string | number;
  duration_minutes: number;
  image_url?: string;
  category?: string;
}

interface ClientServicesProps {
  goToAppointments: () => void;
}

const ITEMS_POR_PAGINA = 8;

const ClientServices = ({ goToAppointments }: ClientServicesProps) => {
  const { data: servicios, error, isLoading } = useSWR('/services', fetcher);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url}`;
  };

  const serviciosArray = servicios || [];

  const filteredAll = serviciosArray.filter((s: Servicio) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredAll.length / ITEMS_POR_PAGINA);
  const validCurrentPage = Math.min(currentPage, Math.max(1, totalPages));

  const currentServices = filteredAll.slice(
    (validCurrentPage - 1) * ITEMS_POR_PAGINA,
    validCurrentPage * ITEMS_POR_PAGINA
  );

  const totalServicios = serviciosArray.length;

  const duracionPromedio =
    totalServicios > 0
      ? Math.round(
          serviciosArray.reduce(
            (acc: number, curr: Servicio) => acc + curr.duration_minutes,
            0
          ) / totalServicios
        )
      : 0;

  return (
    <div className="client-services-container">
      <div className="services-header">
        <div className="header-text">
          <span className="section-badge">Experiencias de Salón</span>
          <h1>Nuestros Tratamientos</h1>
          <p>Descubre los servicios diseñados para realzar tu belleza</p>
        </div>

        <div className="header-actions">
          <div className="search-wrapper">
            <Search size={18} />
            <input
              type="text"
              placeholder="Buscar corte, tratamiento, color..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <div className="services-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Scissors size={24} />
          </div>
          <div className="stat-info">
            <span>Tratamientos Disponibles</span>
            <strong>{totalServicios}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <span>Duración Promedio</span>
            <strong>{duracionPromedio} min</strong>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando servicios...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>Error al cargar los servicios. Intenta de nuevo más tarde.</p>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {filteredAll.length === 0 ? (
            <div className="empty-state">
              <Sparkles size={48} />
              <p>No encontramos servicios que coincidan con tu búsqueda.</p>
            </div>
          ) : (
            <>
              <div className="services-grid">
                {currentServices.map((serv: Servicio) => (
                  <div key={serv.id} className="service-card">
                    <div className="service-image">
                      {getImageUrl(serv.image_url) ? (
                        <img src={getImageUrl(serv.image_url)!} alt={serv.name} />
                      ) : (
                        <div className="no-image">
                          <Flower2 size={32} />
                        </div>
                      )}

                      {serv.category && (
                        <span className="category-badge">{serv.category}</span>
                      )}
                    </div>

                    <div className="service-info">
                      <div className="duration-badge">
                        <Clock size={12} />
                        <span>{serv.duration_minutes} min</span>
                      </div>

                      <h3>{serv.name}</h3>
                      <p>{serv.description}</p>

                      <div className="service-footer">
                        <span className="service-price">
                          ${Number(serv.price).toFixed(2)}
                        </span>

                        <button
                          onClick={goToAppointments}
                          className="book-button"
                        >
                          <Calendar size={16} />
                          Reservar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={validCurrentPage === 1}
                    className="page-btn"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentPage(idx + 1)}
                      className={`page-number ${
                        validCurrentPage === idx + 1 ? 'active' : ''
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={validCurrentPage === totalPages}
                    className="page-btn"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ClientServices;