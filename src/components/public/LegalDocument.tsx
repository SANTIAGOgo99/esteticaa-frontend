import Navbar from './Navbar';
import Footer from './Footer';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface LegalDocumentProps {
  title: string;
  content: string;
  loading?: boolean;
}

const LegalDocument = ({ title, content, loading = false }: LegalDocumentProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#1E1108] text-[#F8F4EF] font-sans">
      <Navbar onOpenModal={() => navigate('/login')} isLoggedIn={false} onLogoutClick={() => {}} />

      <main className="flex-grow px-5 pt-32 pb-16">
        <article className="max-w-3xl mx-auto bg-[#2E1A0E]/72 border border-[#C9A050]/18 rounded-2xl p-7 md:p-10 shadow-[0_20px_48px_rgba(0,0,0,.18)]">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[#C9A050] no-underline text-[0.72rem] font-semibold tracking-[2px] uppercase mb-7 transition-colors hover:text-[#F8E0A0]"
          >
            <ArrowLeft size={15} />
            Volver al inicio
          </Link>

          <span className="block text-[0.68rem] uppercase tracking-[3px] text-[#C9A050] font-semibold mb-3">
            Legal
          </span>
          <h1 className="font-serif text-3xl md:text-5xl font-light text-white mb-7">
            {title}
          </h1>

          {loading ? (
            <p className="text-white/55 leading-relaxed">Cargando contenido...</p>
          ) : (
            <div className="legal-document-body">
              {content.split('\n').map((line, index) => {
                if (!line.trim()) {
                  return <br key={index} />;
                }

                return (
                  <p key={index} className="text-white/72 leading-[1.85] mb-3">
                    {line}
                  </p>
                );
              })}
            </div>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default LegalDocument;
