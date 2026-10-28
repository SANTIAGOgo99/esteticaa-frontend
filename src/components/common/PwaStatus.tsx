import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Wifi, WifiOff } from 'lucide-react';
import { warmCatalogResources } from '../../services/publicCatalog';
import './PwaStatus.css';

export default function PwaStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const registration = useRef<ServiceWorkerRegistration | undefined>(undefined);
  const location = useLocation();
  const { needRefresh: [refresh], updateServiceWorker } = useRegisterSW({
    onRegisteredSW(_url, value) { registration.current = value; warmCatalogResources(); },
    onOfflineReady() { warmCatalogResources(); },
    onRegisterError(error) { console.error('No se pudo registrar el modo offline.', error); },
  });

  useEffect(() => {
    // Public pages contain no booking form: update their shell without another banner.
    if (refresh && (location.pathname === '/' || location.pathname === '/catalogo')) {
      void updateServiceWorker(true).catch(console.error);
    }
  }, [refresh, location.pathname, updateServiceWorker]);

  useEffect(() => {
    const connected = () => {
      setOnline(true);
      warmCatalogResources();
      void registration.current?.update().catch(console.error);
    };
    const disconnected = () => setOnline(false);
    window.addEventListener('online', connected);
    window.addEventListener('offline', disconnected);
    return () => {
      window.removeEventListener('online', connected);
      window.removeEventListener('offline', disconnected);
    };
  }, []);

  return <aside className={`pwa-status ${online ? 'pwa-status--online' : 'pwa-status--offline'}`} aria-label="Estado de conexión">
    <div role="status" aria-live="polite" aria-atomic="true">
      {online ? <Wifi size={17} aria-hidden="true"/> : <WifiOff size={17} aria-hidden="true"/>}
      <span>{online ? 'Con conexión a Internet' : 'Sin conexión a Internet'}</span>
    </div>
  </aside>;
}
