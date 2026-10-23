import { useEffect, useState } from 'react';
export default function Directions({ address }: { address: string }) {
  const base = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  const [route, setRoute] = useState(base);
  const [message, setMessage] = useState('La ubicación solo se utiliza al pulsar Cómo llegar. Al abrir la ruta se comparte con Google Maps.');
  const [busy, setBusy] = useState(false);
  useEffect(() => { setRoute(base); }, [base]);
  function locate() {
    if (!navigator.onLine) { setMessage('Necesitas conexión para consultar indicaciones en mapas.'); return; }
    if (!window.isSecureContext || !navigator.geolocation) { setMessage('Ubicación no disponible. Puedes abrir la dirección sin compartir tu ubicación.'); return; }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(p => {
      setRoute(`${base}&origin=${p.coords.latitude},${p.coords.longitude}`);
      setMessage('Ruta preparada. Abre las indicaciones en Google Maps.'); setBusy(false);
    }, e => { setMessage(e.code === 1 ? 'Permiso denegado. Puedes abrir la dirección sin compartir tu ubicación.' : 'No se pudo obtener tu ubicación. Puedes abrir la dirección.'); setBusy(false); }, { timeout: 10000, maximumAge: 0, enableHighAccuracy: false });
  }
  if (!address.trim()) return <p>Dirección pendiente de configuración.</p>;
  return <div style={{ marginTop: 20 }}><button type="button" disabled={busy} onClick={locate}>{busy ? 'Obteniendo ubicación…' : 'Cómo llegar'}</button><p role="status">{message}</p><a href={route} target="_blank" rel="noopener noreferrer">Abrir indicaciones en Google Maps</a><br/><a href={base} target="_blank" rel="noopener noreferrer">Abrir dirección sin mi ubicación</a></div>;
}
