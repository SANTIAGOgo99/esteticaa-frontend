import useSWR from 'swr';
import api from '../services/api';

export interface SiteSettings {
  terms_text: string;
  privacy_text: string;
  cancellation_text: string;
  business_address: string;
  phone_primary: string;
  phone_secondary: string;
  business_hours_weekdays: string;
  business_hours_saturday: string;
  location_description: string;
  instagram_url: string;
  facebook_url: string;
  map_embed_url: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  terms_text:
    'Terminos y Condiciones\n\nInformacion General: Ezequiel Castillo Angeles Hair Designer.\n\nDomicilio: Velazquez Ibarra 22, colonia Centro, Huejutla, Hidalgo, C.P. 43011, Mexico.\n\nPara confirmar una cita, la estetica puede solicitar un anticipo. Los servicios, productos, garantias y responsabilidades se informan al cliente antes de finalizar cualquier compra o reservacion.',
  privacy_text:
    'Politica de Privacidad\n\nEzequiel Castillo Hair Designer es responsable del uso y proteccion de los datos personales proporcionados por sus clientes.\n\nLos datos se utilizan para agendar citas, confirmar servicios, dar seguimiento a compras, enviar avisos importantes y mejorar la atencion al cliente.',
  cancellation_text:
    'Politica de Cancelacion\n\nLas citas pueden reprogramarse avisando con anticipacion. En cancelaciones de ultimo momento o inasistencias, la estetica puede retener el anticipo o aplicar condiciones especiales segun el servicio reservado.\n\nLos productos de cuidado personal abiertos o usados no aplican para devolucion salvo defecto de fabricacion.',
  business_address: 'Velazquez Ibarra 22, Centro, Huejutla, Hgo. C.P. 43011',
  phone_primary: '771 202 8110',
  phone_secondary: '771 342 5696',
  business_hours_weekdays: 'Lunes a Viernes: 11:00 - 19:00 h',
  business_hours_saturday: 'Sabados: 11:00 - 15:00 h',
  location_description:
    'Un espacio disenado para la relajacion y el cuidado personal. Ven y descubre el lujo en cada detalle, ubicado en el corazon de Huejutla.',
  instagram_url: 'https://www.instagram.com/ezequielcastillohairdesigner/',
  facebook_url: 'https://www.facebook.com/EzequielCastilloAngeles',
  map_embed_url:
    'https://www.google.com/maps?q=Velazquez%20Ibarra%2022%2C%20Centro%2C%20Huejutla%2C%20Hgo.%20C.P.%2043011&output=embed',
};

const fetcher = (url: string) => api.get(url).then((res) => res.data);

export const useSiteSettings = () => {
  const { data, error, isLoading, mutate } = useSWR<Partial<SiteSettings>>(
    '/site-settings/public',
    fetcher,
    {
      refreshInterval: 3000,
      revalidateOnFocus: true,
    }
  );

  return {
    settings: { ...DEFAULT_SITE_SETTINGS, ...(data || {}) },
    error,
    isLoading,
    mutate,
  };
};
