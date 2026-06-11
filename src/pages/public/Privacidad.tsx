import Navbar from '../../components/public/Navbar';
import Footer from '../../components/public/Footer';

const Privacidad = () => {
  return (
    <div className="home-container">
      <Navbar onOpenModal={() => {}} isLoggedIn={false} onLogoutClick={() => {}} />
      <div style={{ padding: '120px 20px 50px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
        <h1 style={{ color: '#d4af37', marginBottom: '20px' }}>Aviso de Privacidad</h1>
        <p>Ezequiel Castillo Ángeles, mejor conocido como Ezequiel Castillo HAIR DESIGNER, con domicilio en Velázquez Ibarra 22, Colonia Centro, Huejutla, Hidalgo, C.P. 43011, es el responsable del uso y protección de sus datos personales.</p>
        
        <h3 style={{ marginTop: '20px', color: '#d4af37' }}>¿Para qué fines utilizaremos sus datos personales?</h3>
        <ul>
          <li>Agendar, confirmar y gestionar las citas solicitadas.</li>
          <li>Enviar publicidad, promociones y descuentos.</li>
          <li>Realizar encuestas de satisfacción.</li>
        </ul>

        <h3 style={{ marginTop: '20px', color: '#d4af37' }}>Derechos ARCO</h3>
        <p>Usted tiene derecho a conocer qué datos personales tenemos de usted, para qué los utilizamos y las condiciones de su uso (Acceso, Rectificación, Cancelación y Oposición). Para ejercerlos, contacte a ecastilloangeles@icloud.com.</p>
      </div>
      <Footer />
    </div>
  );
};
export default Privacidad;