import { MapPin, Phone, Clock, Instagram, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoImagen from '../../assets/images/LogoImagen.png';
import { useSiteSettings } from '../../hooks/useSiteSettings';

const Footer = () => {
  const { settings } = useSiteSettings();
  const phones = [settings.phone_primary, settings.phone_secondary].filter(Boolean).join(' / ');
  const socialLinks = [
    { href: settings.instagram_url, label: 'Instagram', icon: <Instagram size={15} /> },
    { href: settings.facebook_url, label: 'Facebook', icon: <Facebook size={15} /> },
  ].filter((item) => Boolean(item.href));

  return (
    <footer className="bg-[#1E1108] text-[#F8F4EF] pt-16 pb-0 px-8 font-sans border-t border-[#C9A050]/14 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A050]/50 to-transparent" />

      <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1.5fr_1fr] gap-12 pb-14">
        <div>
          <div className="flex items-center gap-3.5 mb-1.5">
            <img
              src={logoImagen}
              alt="Ezequiel Castillo"
              className="h-10 w-auto bg-white rounded-lg p-0.5 shadow-[0_2px_8px_rgba(0,0,0,.2)]"
            />
            <div className="flex flex-col gap-0.5">
              <span className="font-serif text-lg font-medium text-white tracking-[1.5px]">
                Ezequiel Castillo
              </span>
              <span className="text-[0.58rem] tracking-[3px] uppercase text-[#C9A050] font-medium">
                Hair Designer - Atelier
              </span>
            </div>
          </div>

          <p className="text-white/40 text-[0.82rem] leading-[1.85] max-w-[270px] mb-6 font-light mt-4">
            Redefiniendo el arte del estilo personal con atencion a cada detalle.
            Una experiencia de belleza verdaderamente exclusiva.
          </p>

          <div className="flex gap-2.5">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                aria-label={item.label}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-full border border-[#C9A050]/18 bg-transparent flex items-center justify-center text-[#C9A050]/70 transition-all hover:bg-[#C9A050]/10 hover:border-[#C9A050]/40 hover:text-[#E8C878] hover:-translate-y-0.5"
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-serif text-[0.88rem] font-light tracking-[2px] uppercase text-white/85 mb-5 pb-3 border-b border-[#C9A050]/14">
            Contacto
          </h3>
          <ul className="flex flex-col gap-4">
            <li className="flex items-start gap-3 text-white/42 text-[0.8rem] leading-relaxed font-light">
              <div className="bg-[#C9A050]/10 text-[#C9A050]/70 p-1.5 flex-shrink-0 rounded-sm mt-0.5">
                <MapPin size={14} />
              </div>
              <span>{settings.business_address}</span>
            </li>
            <li className="flex items-start gap-3 text-white/42 text-[0.8rem] leading-relaxed font-light">
              <div className="bg-[#C9A050]/10 text-[#C9A050]/70 p-1.5 flex-shrink-0 rounded-sm">
                <Phone size={14} />
              </div>
              <span>{phones}</span>
            </li>
            <li className="flex items-start gap-3 text-white/42 text-[0.8rem] leading-relaxed font-light">
              <div className="bg-[#C9A050]/10 text-[#C9A050]/70 p-1.5 flex-shrink-0 rounded-sm mt-0.5">
                <Clock size={14} />
              </div>
              <span>
                {settings.business_hours_weekdays}<br />
                {settings.business_hours_saturday}
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-[0.88rem] font-light tracking-[2px] uppercase text-white/85 mb-5 pb-3 border-b border-[#C9A050]/14">
            Legal
          </h3>
          <ul className="flex flex-col gap-3.5">
            {[
              { to: '/terminos', label: 'Términos y Condiciones' },
              { to: '/privacidad', label: 'Política de Privacidad' },
              { to: '/cancelaciones', label: 'Política de Cancelación' },
            ].map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className="text-white/42 text-[0.8rem] font-light no-underline transition-colors hover:text-[#E8C878] relative inline-block after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-px after:bg-[#C9A050]/50 after:transition-[width] after:duration-300 hover:after:w-full"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-[#C9A050]/10 py-5 text-center text-white/22 text-[0.7rem] tracking-[0.8px] max-w-[1200px] mx-auto">
        <p>© {new Date().getFullYear()} Ezequiel Castillo Hair Designer - Todos los derechos reservados</p>
      </div>
    </footer>
  );
};

export default Footer;
