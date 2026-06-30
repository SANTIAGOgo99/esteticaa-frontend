// src/components/public/Navbar.tsx
import { useState, useEffect } from 'react';
import { Menu, X, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoImagen from '../../assets/images/LogoImagen.png';

interface Props {
  onOpenModal: () => void;
  isLoggedIn: boolean;
  onLogoutClick: () => void;
}

const Navbar = ({ onOpenModal, isLoggedIn, onLogoutClick }: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [prevScrollY, setPrevScrollY] = useState(0);
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);
      if (currentScrollY > prevScrollY && currentScrollY > 80) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      setPrevScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollY]);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const navLinks = [
    { href: '#inicio', label: 'Inicio' },
    { href: '#servicios', label: 'Servicios' },
    { href: '#productos', label: 'Tienda' },
    { href: '#nosotros', label: 'Nosotros' },
  ];

  return (
    <nav
      className={`
        fixed top-0 left-0 right-0 h-[70px] z-[1000] font-sans
        transition-all duration-300
        bg-white border-b border-[#C9A050]/14
        ${visible ? 'translate-y-0' : '-translate-y-full'}
        ${scrolled ? 'shadow-[0_2px_20px_rgba(46,26,14,.06)]' : ''}
      `}
    >
      <div className="flex items-center justify-between w-full max-w-[1200px] px-8 md:px-10 h-full gap-8 mx-auto">

        {/* Logo — siempre sobre fondo blanco, nunca se pierde */}
        <a href="/#inicio"
          className="flex items-center gap-3 flex-shrink-0 transition-opacity hover:opacity-80 no-underline">
          <img src={logoImagen} alt="Ezequiel Castillo"
            className="h-[44px] w-[44px] object-contain" />
          <div className="flex flex-col gap-0.5">
            <span className="font-serif text-[1rem] font-semibold text-[#2E1A0E] tracking-[2px] whitespace-nowrap">
              EZEQUIEL CASTILLO
            </span>
            <span className="text-[0.55rem] text-[#C9A050] tracking-[3px] font-medium uppercase">
              Hair Designer · Atelier
            </span>
          </div>
        </a>

        {/* Links desktop */}
        <div className={`
          flex-1 justify-center
          hidden md:flex
        `}>
          <div className="flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <a key={href} href={`/${href}`}
                className="relative text-[#8C7060] no-underline text-[0.68rem] font-medium tracking-[2px] uppercase py-2 px-4 transition-colors hover:text-[#2E1A0E] after:content-[''] after:absolute after:bottom-1 after:left-4 after:right-4 after:h-px after:bg-[#C9A050] after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100">
                {label}
              </a>
            ))}

            {isLoggedIn ? (
              <span
                onClick={onLogoutClick}
                className="relative text-[#8C7060] no-underline text-[0.68rem] font-medium tracking-[2px] uppercase py-2 px-4 cursor-pointer transition-colors hover:text-[#2E1A0E] after:content-[''] after:absolute after:bottom-1 after:left-4 after:right-4 after:h-px after:bg-[#C9A050] after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100">
                Cerrar Sesión
              </span>
            ) : (
              <Link to="/login"
                className="relative text-[#8C7060] no-underline text-[0.68rem] font-medium tracking-[2px] uppercase py-2 px-4 transition-colors hover:text-[#2E1A0E] after:content-[''] after:absolute after:bottom-1 after:left-4 after:right-4 after:h-px after:bg-[#C9A050] after:scale-x-0 after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100">
                Iniciar Sesión
              </Link>
            )}
          </div>
        </div>

        {/* CTA desktop */}
        <button
          onClick={onOpenModal}
          className="hidden md:inline-flex items-center gap-2 px-6 py-2.5 text-[0.62rem] font-medium tracking-[2.5px] uppercase text-[#2E1A0E] bg-transparent border border-[#C9A050] rounded-full transition-all hover:bg-[#2E1A0E] hover:text-white hover:border-[#2E1A0E] flex-shrink-0">
          <Calendar size={14} /> Agendar Cita
        </button>

        {/* Hamburguesa mobile */}
        <button
          className="flex md:hidden items-center justify-center w-10 h-10 border border-[#C9A050]/20 bg-transparent text-[#2E1A0E] transition-all hover:border-[#C9A050] hover:text-[#C9A050] flex-shrink-0"
          onClick={toggleMenu}>
          {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menú mobile drawer */}
      {isMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-[#2E1A0E]/35 backdrop-blur-sm z-[-1] md:hidden"
            onClick={toggleMenu} />
          {/* Drawer */}
          <div className="fixed top-[70px] right-0 w-[280px] h-screen bg-white border-l border-[#C9A050]/14 shadow-[-8px_0_32px_rgba(46,26,14,.08)] z-[1001] md:hidden">
            <div className="flex flex-col p-6 gap-1">
              {navLinks.map(({ href, label }) => (
                <a key={href} href={`/${href}`} onClick={toggleMenu}
                  className="text-[#8C7060] no-underline text-[0.78rem] font-medium tracking-[2px] uppercase py-3.5 px-3 border-b border-[#C9A050]/10 transition-colors hover:text-[#2E1A0E] last:border-b-0">
                  {label}
                </a>
              ))}
              {isLoggedIn ? (
                <span onClick={() => { onLogoutClick(); toggleMenu(); }}
                  className="text-[#8C7060] text-[0.78rem] font-medium tracking-[2px] uppercase py-3.5 px-3 cursor-pointer transition-colors hover:text-[#2E1A0E]">
                  Cerrar Sesión
                </span>
              ) : (
                <Link to="/login" onClick={toggleMenu}
                  className="text-[#8C7060] no-underline text-[0.78rem] font-medium tracking-[2px] uppercase py-3.5 px-3 transition-colors hover:text-[#2E1A0E]">
                  Iniciar Sesión
                </Link>
              )}
              <button
                onClick={() => { onOpenModal(); toggleMenu(); }}
                className="inline-flex items-center justify-center gap-2 mt-5 py-3.5 text-[0.68rem] font-medium tracking-[2.5px] uppercase text-[#2E1A0E] border border-[#C9A050] bg-transparent rounded-full transition-all hover:bg-[#2E1A0E] hover:text-white">
                <Calendar size={15} /> Agendar Cita
              </button>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
