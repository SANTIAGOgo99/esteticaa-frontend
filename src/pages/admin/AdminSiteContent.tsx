import { useEffect, useMemo, useState } from 'react';
import {
  Clock,
  FileText,
  Facebook,
  Globe2,
  Instagram,
  Loader2,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Breadcrumbs from '../../components/common/Breadcrumbs';
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from '../../hooks/useSiteSettings';
import './AdminSiteContent.css';

type SaveKey = 'terms' | 'privacy' | 'cancellation' | 'location' | 'socials' | null;

const AdminSiteContent = () => {
  const [form, setForm] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<SaveKey>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/site-settings');
        setForm({ ...DEFAULT_SITE_SETTINGS, ...response.data });
      } catch (error) {
        console.error(error);
        toast.error('No se pudo cargar la configuracion del sitio');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const mapPreviewUrl = useMemo(() => {
    const query = encodeURIComponent(form.business_address || DEFAULT_SITE_SETTINGS.business_address);
    return `https://www.google.com/maps?q=${query}&output=embed`;
  }, [form.business_address]);

  const updateField = (field: keyof SiteSettings, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const saveSection = async (key: SaveKey, payload: Partial<SiteSettings>, message: string) => {
    try {
      setSaving(key);
      const response = await api.put('/site-settings', payload);
      setForm({ ...DEFAULT_SITE_SETTINGS, ...response.data.settings });
      toast.success(message);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || 'No se pudo guardar la informacion');
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="site-content-loading">
        <Loader2 size={34} />
        <span>Cargando configuracion del sitio...</span>
      </div>
    );
  }

  return (
    <div className="site-content-page">
      <Breadcrumbs />

      <div className="site-content-header">
        <div>
          <span className="site-content-kicker">
            <Globe2 size={16} />
            Sitio publico
          </span>
          <h1>Contenido editable del sitio</h1>
          <p>
            Actualiza legales, direccion, telefonos y horarios sin tocar codigo. Los cambios se publican desde la base de datos.
          </p>
        </div>
      </div>

      <section className="site-content-grid">
        <article className="site-content-card">
          <div className="site-content-card-head">
            <div>
              <span><FileText size={16} /> Legal</span>
              <h2>Términos y Condiciones</h2>
            </div>
            <button
              type="button"
              onClick={() => saveSection('terms', { terms_text: form.terms_text }, 'Terminos actualizados')}
              disabled={saving !== null}
            >
              {saving === 'terms' ? <Loader2 size={16} className="site-spin" /> : <Save size={16} />}
              Guardar
            </button>
          </div>
          <textarea
            value={form.terms_text}
            onChange={(event) => updateField('terms_text', event.target.value)}
            rows={12}
            placeholder="Escribe aqui los terminos y condiciones..."
          />
        </article>

        <article className="site-content-card">
          <div className="site-content-card-head">
            <div>
              <span><ShieldCheck size={16} /> Legal</span>
              <h2>Política de Privacidad</h2>
            </div>
            <button
              type="button"
              onClick={() => saveSection('privacy', { privacy_text: form.privacy_text }, 'Privacidad actualizada')}
              disabled={saving !== null}
            >
              {saving === 'privacy' ? <Loader2 size={16} className="site-spin" /> : <Save size={16} />}
              Guardar
            </button>
          </div>
          <textarea
            value={form.privacy_text}
            onChange={(event) => updateField('privacy_text', event.target.value)}
            rows={12}
            placeholder="Escribe aqui la politica de privacidad..."
          />
        </article>

        <article className="site-content-card">
          <div className="site-content-card-head">
            <div>
              <span><FileText size={16} /> Legal</span>
              <h2>Política de Cancelación</h2>
            </div>
            <button
              type="button"
              onClick={() => saveSection('cancellation', { cancellation_text: form.cancellation_text }, 'Cancelaciones actualizadas')}
              disabled={saving !== null}
            >
              {saving === 'cancellation' ? <Loader2 size={16} className="site-spin" /> : <Save size={16} />}
              Guardar
            </button>
          </div>
          <textarea
            value={form.cancellation_text}
            onChange={(event) => updateField('cancellation_text', event.target.value)}
            rows={12}
            placeholder="Escribe aqui la politica de cancelacion..."
          />
        </article>

        <article className="site-content-card site-content-card--location">
          <div className="site-content-card-head">
            <div>
              <span><MapPin size={16} /> Ubicacion</span>
              <h2>Direccion, contacto y mapa</h2>
            </div>
            <button
              type="button"
              onClick={() =>
                saveSection(
                  'location',
                  {
                    business_address: form.business_address,
                    phone_primary: form.phone_primary,
                    phone_secondary: form.phone_secondary,
                    business_hours_weekdays: form.business_hours_weekdays,
                    business_hours_saturday: form.business_hours_saturday,
                    location_description: form.location_description,
                  },
                  'Ubicacion del sitio actualizada'
                )
              }
              disabled={saving !== null}
            >
              {saving === 'location' ? <Loader2 size={16} className="site-spin" /> : <Save size={16} />}
              Guardar
            </button>
          </div>

          <div className="site-location-layout">
            <div className="site-location-form">
              <label>
                <span><MapPin size={15} /> Direccion fisica</span>
                <input
                  value={form.business_address}
                  onChange={(event) => updateField('business_address', event.target.value)}
                  placeholder="Direccion completa del negocio"
                />
              </label>

              <label>
                <span><Phone size={15} /> Telefono principal</span>
                <input
                  value={form.phone_primary}
                  onChange={(event) => updateField('phone_primary', event.target.value)}
                  placeholder="Telefono principal"
                />
              </label>

              <label>
                <span><Phone size={15} /> Telefono secundario</span>
                <input
                  value={form.phone_secondary}
                  onChange={(event) => updateField('phone_secondary', event.target.value)}
                  placeholder="Telefono secundario"
                />
              </label>

              <label>
                <span><Clock size={15} /> Horario entre semana</span>
                <input
                  value={form.business_hours_weekdays}
                  onChange={(event) => updateField('business_hours_weekdays', event.target.value)}
                  placeholder="Lunes a Viernes: 11:00 - 19:00 h"
                />
              </label>

              <label>
                <span><Clock size={15} /> Horario sabado</span>
                <input
                  value={form.business_hours_saturday}
                  onChange={(event) => updateField('business_hours_saturday', event.target.value)}
                  placeholder="Sabados: 11:00 - 15:00 h"
                />
              </label>

              <label>
                <span><FileText size={15} /> Texto de ubicacion</span>
                <textarea
                  value={form.location_description}
                  onChange={(event) => updateField('location_description', event.target.value)}
                  rows={5}
                  placeholder="Texto que aparece junto al mapa"
                />
              </label>
            </div>

            <div className="site-map-preview">
              <iframe
                src={mapPreviewUrl}
                title="Vista previa del mapa"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </article>

        <article className="site-content-card">
          <div className="site-content-card-head">
            <div>
              <span><Instagram size={16} /> Redes</span>
              <h2>Links de redes sociales</h2>
            </div>
            <button
              type="button"
              onClick={() =>
                saveSection(
                  'socials',
                  {
                    instagram_url: form.instagram_url,
                    facebook_url: form.facebook_url,
                  },
                  'Redes sociales actualizadas'
                )
              }
              disabled={saving !== null}
            >
              {saving === 'socials' ? <Loader2 size={16} className="site-spin" /> : <Save size={16} />}
              Guardar
            </button>
          </div>

          <div className="site-location-form">
            <label>
              <span><Instagram size={15} /> Instagram</span>
              <input
                value={form.instagram_url}
                onChange={(event) => updateField('instagram_url', event.target.value)}
                placeholder="https://www.instagram.com/tu-cuenta/"
              />
            </label>

            <label>
              <span><Facebook size={15} /> Facebook</span>
              <input
                value={form.facebook_url}
                onChange={(event) => updateField('facebook_url', event.target.value)}
                placeholder="https://www.facebook.com/tu-pagina"
              />
            </label>
          </div>
        </article>
      </section>
    </div>
  );
};

export default AdminSiteContent;
