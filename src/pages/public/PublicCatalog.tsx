import useSWR from 'swr';
import { Link } from 'react-router-dom';
import publicApi from '../../services/publicApi';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import Directions from '../../components/public/Directions';
type Item = { id: number; name: string; description?: string; price: number; duration_minutes?: number; image_url?: string };
const fetcher = (url: string): Promise<Item[]> => publicApi.get(url).then(r => r.data);
function CatalogSection({ title, path }: { title: string; path: string }) {
  const { data, error, isLoading } = useSWR(path, fetcher, { revalidateOnReconnect: true });
  const imageUrl = (url: string) => new URL(url, String(import.meta.env.VITE_API_URL || location.origin).replace(/\/api\/?$/, '') + '/').href;
  return <section><h2>{title}</h2>{isLoading && <p>Cargando…</p>}{error && <p role="alert">No hay información pública disponible o su copia guardada venció. Conéctate y vuelve a intentar.</p>}<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(230px,1fr))', gap: 20 }}>{data?.map(item => <article key={item.id} style={{ padding: 20, border: '1px solid #ddd', borderRadius: 12 }}>
    {item.image_url && <img crossOrigin="anonymous" src={imageUrl(item.image_url)} alt={item.name} style={{ width: '100%', height: 180, objectFit: 'cover' }} onError={e => { e.currentTarget.hidden = true; }}/>}<h3>{item.name}</h3><p>{item.description || 'Descripción no configurada.'}</p><p>{Number(item.price).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</p>{item.duration_minutes != null && <p>{item.duration_minutes} minutos</p>}
  </article>)}</div>{data?.length === 0 && <p>No hay elementos disponibles.</p>}</section>;
}
export default function PublicCatalog() {
  const { settings } = useSiteSettings();
  return <main style={{ maxWidth: 1100, margin: 'auto', padding: 24 }}><Link to="/">Volver al inicio</Link><h1>Catálogo público</h1><p>Consulta informativa. Las copias sin conexión duran hasta 24 horas y pueden estar desactualizadas. Los precios y la disponibilidad se verifican al reservar o comprar con conexión.</p>
    <CatalogSection title="Servicios" path="/services/active"/><CatalogSection title="Productos" path="/products/active"/>
    <section><h2>Información del establecimiento</h2><p>{settings.business_address}</p><p>{settings.business_hours_weekdays}<br/>{settings.business_hours_saturday}</p><p>{settings.phone_primary} · {settings.phone_secondary}</p><p>{settings.location_description}</p><Directions address={settings.business_address}/></section>
  </main>;
}
