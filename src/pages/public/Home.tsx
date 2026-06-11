import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Sparkles, Flower2, Clock, Heart, Droplets, MapPin, Phone, Star } from 'lucide-react';
import Navbar from "../../components/public/Navbar";
import Footer from "../../components/public/Footer";
import api from '../../services/api';
import "./Home.css";

interface Producto {
  id: number; name: string; brand: string; category: string;
  price: string | number; stock: number; image_url?: string;
}
interface Servicio {
  id: number; name: string; description: string;
  price: string | number; duration_minutes: number; image_url?: string;
}

const Home = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);

  const handleOpenLogin = () => navigate('/login');

  useEffect(() => {
    const fetchCatalogo = async () => {
      try {
        setLoading(true);
        const prodRes = await api.get('/products');
        setProductos(prodRes.data.slice(0, 8));
        const servRes = await api.get('/services');
        setServicios(servRes.data.slice(0, 8));
      } catch (error) {
        console.error("Error cargando el catálogo público:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogo();
  }, []);

  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6F0] font-sans text-[#3D2512]">
      <Navbar isLoggedIn={false} onLogoutClick={() => {}} onOpenModal={handleOpenLogin} />

      <main className="flex-grow">

        {/* ── HERO ── */}
        <section className="relative bg-[#2E1A0E] overflow-hidden" style={{ minHeight: '560px' }}>
          <div className="absolute right-[-80px] top-[-80px] w-[420px] h-[420px] rounded-full border border-[#C9A050]/10 animate-pulse" />
          <div className="absolute right-[-50px] top-[-50px] w-[320px] h-[320px] rounded-full border border-[#C9A050]/07" />

          <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-16 py-20 flex items-center gap-16 flex-wrap">
            
            {/* Textos del Hero */}
            <div className="flex-1 min-w-[280px]">
              <div className="flex items-center gap-3 mb-7 animate-fade-up">
                <span className="h-px w-6 bg-[#C9A050]/60" />
                <p className="text-[0.58rem] font-medium tracking-[4.5px] uppercase text-[#E8C878]">
                  Ezequiel Castillo — Huejutla, Hgo.
                </p>
                <span className="h-px w-6 bg-[#C9A050]/60" />
              </div>

              <h1 className="font-serif text-5xl md:text-7xl font-light text-white leading-[1.1] mb-2 animate-fade-up" style={{ animationDelay: '0.15s' }}>
                Belleza que<br />
                <em className="italic text-[#E8C878] not-italic">eleva.</em>
              </h1>

              <p className="font-serif text-2xl md:text-3xl font-light italic text-[#E8C8B8] mt-1 mb-5 animate-fade-up" style={{ animationDelay: '0.3s' }}>
                tu esencia natural.
              </p>

              <p className="text-white/65 text-sm md:text-base font-light leading-relaxed max-w-md mb-8 animate-fade-up" style={{ animationDelay: '0.45s' }}>
                Tratamientos estéticos de alto nivel diseñados para revelar tu luminosidad.
                Donde la ciencia del cuidado capilar se encuentra con la elegancia de un atelier exclusivo.
              </p>

              <div className="flex items-center gap-5 flex-wrap animate-fade-up" style={{ animationDelay: '0.6s' }}>
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 text-[0.62rem] font-semibold tracking-[2.5px] uppercase bg-[#C9A050] text-[#2E1A0E] rounded-full transition-all duration-300 hover:bg-[#E8C878] hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(201,160,80,.35)]"
                >
                  <Calendar size={13} />
                  Reserva tu experiencia
                </button>
                <a href="#servicios" className="text-[0.65rem] tracking-[2px] uppercase text-white/50 hover:text-[#E8C878] transition-colors">
                  Ver servicios →
                </a>
              </div>
            </div>

            {/* Imagen en Arco del Hero */}
            <div className="flex-shrink-0 hidden lg:block relative w-[380px] h-[500px] animate-fade-up" style={{ animationDelay: '0.4s' }}>
              <div className="w-full h-full rounded-t-[200px] rounded-b-[20px] overflow-hidden border-4 border-[#3D2512] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative z-10">
                <div className="absolute inset-0 bg-[#C9A050]/10 mix-blend-overlay z-10" />
                <img 
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop" 
                  alt="Interior Atelier" 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                />
              </div>

              <div className="absolute bottom-16 -left-12 bg-[#FAF6F0] border border-[#C9A050]/20 rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-4 animate-float z-20">
                <div className="w-10 h-10 rounded-full bg-[#E8C878]/20 flex items-center justify-center text-[#8B4C38]">
                  <Star size={18} fill="currentColor" />
                </div>
                <div>
                  <p className="text-[0.60rem] font-bold text-[#8C7060] uppercase tracking-[2px] mb-0.5">Experiencia</p>
                  <p className="font-serif text-lg font-medium text-[#3D2512] m-0 leading-none">8+ Años de excelencia</p>
                </div>
              </div>

              <div className="absolute top-20 -right-8 bg-[#C9A050] text-[#2E1A0E] rounded-full w-28 h-28 flex flex-col items-center justify-center text-center shadow-2xl animate-float z-20 border-4 border-[#2E1A0E]" style={{ animationDelay: '1.5s' }}>
                <span className="font-serif text-3xl font-bold leading-none mb-1">500+</span>
                <span className="text-[0.55rem] uppercase tracking-[2px] font-bold">Clientes</span>
              </div>
              
              <div className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-gradient-to-tr from-[#C9A050]/20 to-transparent blur-2xl z-0" />
            </div>
          </div>
        </section>

        {/* ── STATS BAND ── */}
        <div className="bg-[#F2E9DC] border-y border-[#B48C64]/12 py-10 px-5">
          <div className="max-w-lg mx-auto grid grid-cols-3 divide-x divide-[#B48C64]/15">
            {[
              { num: '500+', label: 'Clientes felices' },
              { num: '8', label: 'Años de trayectoria' },
              { num: '20+', label: 'Tratamientos únicos' },
            ].map(({ num, label }) => (
              <div key={label} className="text-center px-4">
                <span className="font-serif text-3xl font-medium text-[#8B4C38] block leading-none mb-1">{num}</span>
                <span className="text-[0.62rem] tracking-[2.5px] uppercase text-[#8C7060]">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── SERVICIOS ── */}
        <section className="py-20 px-5 md:px-8 bg-[#F2E9DC]" id="servicios">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-[0.58rem] font-medium tracking-[4.5px] uppercase text-[#C07A60] block mb-3">Rituales exclusivos</span>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-[#3D2512]">
              Tratamientos <em className="italic text-[#C07A60] not-italic">de lujo</em>
            </h2>
            <div className="flex justify-center gap-3 my-4">
              <div className="w-10 h-px bg-[#C9A050]/35" /><div className="w-1.5 h-1.5 rotate-45 bg-[#C9A050]" /><div className="w-10 h-px bg-[#C9A050]/35" />
            </div>
            <p className="text-[#8C7060] text-sm max-w-md mx-auto font-normal leading-relaxed">
              Cada sesión es una obra de arte, diseñada para revelar tu luminosidad natural.
            </p>
          </div>
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <p className="text-center text-[#8C7060] py-20">Cargando tratamientos...</p>
            ) : servicios.length === 0 ? (
              <p className="text-center text-[#8C7060] py-20">Próximamente nuevas experiencias.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {servicios.map(serv => (
                  <div key={serv.id}
                    className="bg-white rounded-2xl border border-[#B48C64]/14 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_50px_rgba(61,37,18,.12)] hover:border-[#C9A050]/35 group flex flex-col">
                    <div className="h-44 bg-gradient-to-br from-[#F2E3D9] to-[#DEB49E] flex items-center justify-center overflow-hidden shrink-0 relative">
                      {getImageUrl(serv.image_url) ? (
                        <img src={getImageUrl(serv.image_url)!} alt={serv.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <Flower2 size={30} className="text-[#8B4C38]/40" strokeWidth={1} />
                      )}
                      <div className="absolute top-3 left-3 bg-white/90 border border-[#C9A050]/18 rounded-full px-3 py-1 text-[0.58rem] tracking-[1.5px] text-[#8B4C38] flex items-center gap-1.5 font-medium">
                        <Clock size={10} /> {serv.duration_minutes} min
                      </div>
                    </div>
                    <div className="p-5 pb-3 flex-grow flex flex-col">
                      <h3 className="font-serif text-lg font-medium text-[#3D2512] mb-1.5">{serv.name}</h3>
                      <p className="text-[#5E412F] text-[0.8rem] leading-relaxed mb-3 flex-grow line-clamp-2 font-normal" title={serv.description}>
                        {serv.description}
                      </p>
                      <p className="font-serif text-2xl font-medium text-[#3D2512]">${Number(serv.price).toFixed(2)}</p>
                    </div>
                    <div className="p-5 pt-0 mt-auto">
                      <button onClick={() => navigate('/login')}
                        className="w-full py-2.5 text-[0.6rem] font-medium tracking-[2px] uppercase text-[#8B4C38] border border-[#C07A60] rounded-full transition-all hover:bg-[#C07A60] hover:text-white">
                        Reservar ahora
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── PRODUCTOS ── */}
        <section className="py-20 px-5 md:px-8 bg-[#FAF6F0]" id="productos">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-[0.58rem] font-medium tracking-[4.5px] uppercase text-[#C07A60] block mb-3">Esenciales seleccionados</span>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-[#3D2512]">
              Productos <em className="italic text-[#C07A60] not-italic">premium</em>
            </h2>
            <div className="flex justify-center gap-3 my-4">
              <div className="w-10 h-px bg-[#C9A050]/35" /><div className="w-1.5 h-1.5 rotate-45 bg-[#C9A050]" /><div className="w-10 h-px bg-[#C9A050]/35" />
            </div>
            <p className="text-[#8C7060] text-sm max-w-md mx-auto font-normal leading-relaxed">
              Lo mejor de la cosmética dermocosmética para prolongar los resultados en casa.
            </p>
          </div>
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <p className="text-center text-[#8C7060] py-20">Cargando productos...</p>
            ) : productos.length === 0 ? (
              <p className="text-center text-[#8C7060] py-20">Próximamente nuevas fórmulas.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {productos.map(prod => (
                  <div key={prod.id}
                    className="bg-white rounded-2xl border border-[#C9A050]/14 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_38px_rgba(61,37,18,.10)] hover:border-[#C9A050]/30 group flex flex-col">
                    <div className="h-36 bg-gradient-to-br from-[#F2E3D9] to-[#E8C9B8] flex items-center justify-center overflow-hidden shrink-0 relative">
                      {getImageUrl(prod.image_url) ? (
                        <img src={getImageUrl(prod.image_url)!} alt={prod.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <Droplets size={26} className="text-[#C9907A]/50" strokeWidth={1} />
                      )}
                    </div>
                    <div className="p-4 pb-3 flex-grow">
                      <span className="text-[0.55rem] font-medium tracking-[2.5px] uppercase text-[#C9A050]">{prod.brand}</span>
                      <h3 className="font-serif text-base font-medium text-[#3D2512] mt-0.5 mb-1.5">{prod.name}</h3>
                      <p className="font-serif text-xl font-medium text-[#8B4C38]">${Number(prod.price).toFixed(2)}</p>
                    </div>
                    <div className="p-4 pt-0 mt-auto">
                      <button onClick={() => navigate('/login')}
                        className="w-full py-2 text-[0.58rem] font-medium tracking-[2px] uppercase text-[#8C7060] border border-[#C9A050]/28 rounded-full transition-all hover:bg-[#2E1A0E] hover:text-white hover:border-[#2E1A0E]">
                        Descubrir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── FILOSOFÍA ── */}
        <section className="py-20 px-5 md:px-8 bg-[#2E1A0E] relative" id="nosotros">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A050]/50 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A050]/30 to-transparent" />
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-[0.58rem] font-medium tracking-[4.5px] uppercase text-[#E8C878] block mb-3">Nuestra esencia</span>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-white">
              Arte & <em className="italic text-[#E8C878] not-italic">ciencia</em> en armonía
            </h2>
            <div className="flex justify-center gap-3 my-4">
              <div className="w-10 h-px bg-[#C9A050]/25" /><div className="w-1.5 h-1.5 rotate-45 bg-[#C9A050]" /><div className="w-10 h-px bg-[#C9A050]/25" />
            </div>
          </div>
          <div className="max-w-3xl mx-auto grid md:grid-cols-3 border border-[#C9A050]/12 rounded-2xl overflow-hidden">
            {[
              { icon: <Heart size={22} strokeWidth={1.3} />, title: 'Cuidado personalizado', desc: 'Cada tratamiento se adapta a tu biotipo y necesidades únicas.' },
              { icon: <Flower2 size={22} strokeWidth={1.3} />, title: 'Ingredientes nobles', desc: 'Solo marcas con certificación clínica y fórmulas de alta eficacia.' },
              { icon: <Sparkles size={22} strokeWidth={1.3} />, title: 'Resultados visibles', desc: 'Compromiso con la excelencia y el bienestar integral de tu cabello.' },
            ].map(({ icon, title, desc }, i) => (
              <div key={i} className="text-center py-10 px-6 border-r border-[#C9A050]/10 last:border-r-0 hover:bg-[#C9A050]/05 transition-colors">
                <div className="w-14 h-14 rounded-full border border-[#C9A050]/28 flex items-center justify-center mx-auto mb-5 text-[#E8C878]">
                  {icon}
                </div>
                <h3 className="font-serif text-lg font-light text-white mb-2">{title}</h3>
                <p className="text-white/50 text-[0.8rem] font-light leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── UBICACIÓN Y MAPA (Actualizado por Legibilidad) ── */}
        <section className="py-24 px-5 md:px-8 bg-[#F2E9DC] border-t border-[#B48C64]/10" id="ubicacion">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
            
            {/* Información de contacto - Estilo de la imagen de referencia */}
            <div className="flex-1 text-center lg:text-left w-full">
              <span className="text-[0.65rem] font-semibold tracking-[4.5px] uppercase text-[#C07A60] block mb-3">
                Encuéntranos
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-light text-[#3D2512] mb-6">
                Nuestro <em className="italic text-[#C07A60] not-italic">Atelier</em>
              </h2>
              
              {/* Texto oscurecido para accesibilidad */}
              <p className="text-[#5E412F] text-[0.9rem] font-normal leading-relaxed mb-12 max-w-md mx-auto lg:mx-0">
                Un espacio diseñado para la relajación y el cuidado personal. Ven y descubre el lujo en cada detalle, ubicado en el corazón de Huejutla.
              </p>

              <div className="flex flex-col gap-8 max-w-md mx-auto lg:mx-0 text-left">
                {/* Dirección */}
                <div className="flex items-start gap-5 group">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#C07A60] shrink-0 shadow-sm border border-[#C9A050]/10 transition-transform group-hover:scale-105">
                    <MapPin size={22} strokeWidth={1.2} />
                  </div>
                  <div className="pt-1.5">
                    <h4 className="font-serif text-2xl text-[#3D2512] mb-1.5">Dirección</h4>
                    <p className="text-[#5E412F] text-[0.95rem] font-normal leading-relaxed m-0">Velázquez Ibarra 22, Centro,<br/>Huejutla, Hgo. C.P. 43011</p>
                  </div>
                </div>

                {/* Teléfono */}
                <div className="flex items-start gap-5 group">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#C07A60] shrink-0 shadow-sm border border-[#C9A050]/10 transition-transform group-hover:scale-105">
                    <Phone size={22} strokeWidth={1.2} />
                  </div>
                  <div className="pt-1.5">
                    <h4 className="font-serif text-2xl text-[#3D2512] mb-1.5">Reservaciones</h4>
                    <p className="text-[#5E412F] text-[0.95rem] font-normal leading-relaxed m-0">771 202 8110 <br/> 771 342 5696</p>
                  </div>
                </div>

                {/* Horarios */}
                <div className="flex items-start gap-5 group">
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-[#C07A60] shrink-0 shadow-sm border border-[#C9A050]/10 transition-transform group-hover:scale-105">
                    <Clock size={22} strokeWidth={1.2} />
                  </div>
                  <div className="pt-1.5">
                    <h4 className="font-serif text-2xl text-[#3D2512] mb-1.5">Horario</h4>
                    <p className="text-[#5E412F] text-[0.95rem] font-normal leading-relaxed m-0">Lunes a Viernes: 11:00 - 19:00 h<br/>Sábados: 11:00 - 15:00 h</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapa Interactivo */}
            <div className="flex-1 w-full max-w-[500px] lg:max-w-none mx-auto mt-10 lg:mt-0">
              <div className="w-full h-[450px] md:h-[500px] bg-white rounded-[2rem] p-2.5 border border-[#C9A050]/30 shadow-[0_20px_50px_rgba(61,37,18,.08)] relative overflow-hidden group">
                 <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3731.815598687799!2d-98.401944!3d21.140278!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d72691507f3549%3A0x6b7db0fa4b1bb9b2!2sHuejutla%20de%20Reyes%2C%20Hgo.!5e0!3m2!1ses-419!2smx!4v1700000000000!5m2!1ses-419!2smx" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0, borderRadius: '1.5rem' }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade" 
                    className="grayscale-[20%] contrast-[90%] opacity-90 group-hover:grayscale-0 group-hover:contrast-100 group-hover:opacity-100 transition-all duration-700"
                  ></iframe>
              </div>
            </div>

          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 px-5 md:px-8 bg-[#FAF6F0] text-center border-t border-[#B48C64]/10">
          <div className="max-w-xl mx-auto">
            <div className="w-px h-12 bg-gradient-to-b from-transparent to-[#C9A050] mx-auto mb-10 opacity-60" />
            <h2 className="font-serif text-3xl md:text-4xl font-light text-[#3D2512] mb-4 leading-tight">
              Tu momento de <em className="italic text-[#C07A60] not-italic">luminosidad</em><br />comienza hoy
            </h2>
            <p className="text-[#5E412F] text-[0.95rem] leading-relaxed mb-10 font-normal">
              Reserva tu primera cita y descubre la nueva dimensión del bienestar estético.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2.5 px-10 py-4 text-[0.65rem] font-medium tracking-[3px] uppercase text-white bg-[#2E1A0E] rounded-full transition-all duration-300 hover:bg-[#C07A60] hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(192,122,96,.28)]">
              <Calendar size={13} />
              Agenda tu cita
            </button>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default Home;