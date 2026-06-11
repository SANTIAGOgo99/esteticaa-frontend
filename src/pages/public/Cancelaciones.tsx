import Navbar from '../../components/public/Navbar';
import Footer from '../../components/public/Footer';

const Cancelaciones = () => {
  return (
    <div className="home-container">
      <Navbar onOpenModal={() => {}} isLoggedIn={false} onLogoutClick={() => {}} />
      <div style={{ padding: '120px 20px 50px', maxWidth: '800px', margin: '0 auto', color: '#fff' }}>
        <h1 style={{ color: '#d4af37', marginBottom: '20px' }}>Política de Cancelación y Devoluciones</h1>
        
        <h3 style={{ marginTop: '20px', color: '#d4af37' }}>Citas</h3>
        <ul>
          <li><strong>Más de 24 horas de anticipación:</strong> Reembolso del 100% del anticipo o reprogramación sin costo.</li>
          <li><strong>Menos de 24 horas:</strong> No hay reembolso, pero se puede reprogramar con un cargo administrativo del 10%.</li>
          <li><strong>No presentarse:</strong> Pérdida total del anticipo.</li>
        </ul>

        <h3 style={{ marginTop: '20px', color: '#d4af37' }}>Productos</h3>
        <p>El cliente puede solicitar la devolución de un producto en un plazo máximo de 15 días naturales después de recibido. Los productos deben devolverse sin usar, en su empaque original y sellado. No aplica para productos de cuidado personal abiertos.</p>
      </div>
      <Footer />
    </div>
  );
};
export default Cancelaciones;