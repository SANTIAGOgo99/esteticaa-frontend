import { useEffect, useRef, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Link } from 'react-router-dom';
import { Wifi, WifiOff } from 'lucide-react';
import './PwaStatus.css';

interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

export default function PwaStatus() {
  const [online, setOnline] = useState(navigator.onLine);
  const [recovered, setRecovered] = useState(false);
  const [install, setInstall] = useState<InstallEvent | null>(null);
  const [failure, setFailure] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(undefined);
  const { needRefresh: [refresh], offlineReady: [ready], updateServiceWorker } = useRegisterSW({
    onRegisterError() { setFailure(true); },
    onRegisteredSW(_url, registration) { registrationRef.current = registration; },
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const connected = () => {
      clearTimeout(timer);
      setOnline(true);
      setRecovered(true);
      timer = setTimeout(() => setRecovered(false), 8000);
      void registrationRef.current?.update().catch(() => setFailure(true));
    };
    const disconnected = () => {
      clearTimeout(timer);
      setOnline(false);
      setRecovered(false);
    };
    const available = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallEvent);
    };
    const installed = () => setInstall(null);
    window.addEventListener('online', connected);
    window.addEventListener('offline', disconnected);
    window.addEventListener('beforeinstallprompt', available);
    window.addEventListener('appinstalled', installed);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', connected);
      window.removeEventListener('offline', disconnected);
      window.removeEventListener('beforeinstallprompt', available);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);

  const title = !online ? 'Sin conexión a Internet' : recovered ? 'Conexión restablecida' : 'En línea';
  const detail = !online
    ? 'Puedes consultar los catálogos públicos descargados durante las últimas 24 horas. Para iniciar sesión, reservar o comprar necesitas conexión.'
    : recovered
      ? 'Volviste a estar online. Se volverá a consultar la información pública disponible.'
      : ready ? 'Interfaz preparada para abrir sin conexión. Los catálogos deben descargarse con Internet.' : '';

  return <aside className={`pwa-status ${!online ? 'pwa-status--offline' : recovered ? 'pwa-status--recovered' : ''}`} aria-label="Estado de la aplicación">
    <div className="pwa-status__message" role="status" aria-live="polite" aria-atomic="true">
      {online ? <Wifi size={20} aria-hidden="true"/> : <WifiOff size={20} aria-hidden="true"/>}
      <div><strong>{title}</strong>{detail && <p>{detail}</p>}</div>
    </div>
    <nav className="pwa-status__actions" aria-label="Accesos de la PWA">
      <Link to="/">Inicio</Link>
      <Link to="/catalogo">Catálogo público</Link>
      {install && <button type="button" onClick={async () => {
        try { await install.prompt(); await install.userChoice; setInstall(null); }
        catch { setFailure(true); }
      }}>Instalar aplicación</button>}
      {refresh && <button type="button" onClick={() => {
        if (window.confirm('La actualización recargará la página. Termina tu reserva o guarda tus cambios antes de continuar.')) {
          void updateServiceWorker(true).catch(() => setFailure(true));
        }
      }}>Actualizar aplicación</button>}
    </nav>
    {failure && <p className="pwa-status__error" role="alert">No se pudo preparar o actualizar el modo offline. Reintenta recargando con conexión.</p>}
  </aside>;
}
