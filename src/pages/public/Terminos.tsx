import LegalDocument from '../../components/public/LegalDocument';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const Terminos = () => {
  const { settings, isLoading } = useSiteSettings();

  return (
    <LegalDocument
      title="Términos y Condiciones"
      content={settings.terms_text}
      loading={isLoading}
    />
  );
};

export default Terminos;
