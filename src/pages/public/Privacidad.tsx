import LegalDocument from '../../components/public/LegalDocument';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const Privacidad = () => {
  const { settings, isLoading } = useSiteSettings();

  return (
    <LegalDocument
      title="Política de Privacidad"
      content={settings.privacy_text}
      loading={isLoading}
    />
  );
};

export default Privacidad;
