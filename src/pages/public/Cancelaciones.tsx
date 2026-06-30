import LegalDocument from '../../components/public/LegalDocument';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const Cancelaciones = () => {
  const { settings, isLoading } = useSiteSettings();

  return (
    <LegalDocument
      title="Política de Cancelación"
      content={settings.cancellation_text}
      loading={isLoading}
    />
  );
};

export default Cancelaciones;
