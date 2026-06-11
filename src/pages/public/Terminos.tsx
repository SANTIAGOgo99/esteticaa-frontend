import Navbar from '../../components/public/Navbar';
import Footer from '../../components/public/Footer';

const Terminos = () => {
  return (
    <div className="home-container">
      <Navbar onOpenModal={() => {}} isLoggedIn={false} onLogoutClick={() => {}} />
      <div style={{ padding: '120px 20px 50px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
        <h1 style={{ color: '#d4af37', marginBottom: '20px' }}>Términos y Condiciones</h1>
        <p><strong>Información General:</strong> Ezequiel Castillo Ángeles Hair Designer</p>
        <p><strong>Domicilio:</strong> Velázquez Ibarra 22, colonia Centro, Huejutla, Hidalgo, C.P. 43011, México.</p>
        <p><strong>Naturaleza del Negocio:</strong> Estética integral que ofrece servicios de belleza y cuidado personal (corte de cabello, barba, depilaciones, tintes) y comercializa productos cosméticos.</p>
        
        <h3 style={{ marginTop: '20px', color: '#d4af37' }}>Proceso de Citas y Compras</h3>
        <p>Para confirmar la cita, se requiere un anticipo del 30% del valor total del servicio. El horario para servicios de tinte es limitado debido a su duración.</p>
        
        <h3 style={{ marginTop: '20px', color: '#d4af37' }}>Garantías y Responsabilidades</h3>
        <p>Los productos cuentan con garantía de 30 días por defectos de fabricación. No aplica en mal uso. En servicios, no nos hacemos responsables por reacciones alérgicas derivadas de condiciones preexistentes no informadas.</p>
      </div>
      <Footer />
    </div>
  );
};
export default Terminos;