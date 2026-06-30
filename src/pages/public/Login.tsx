// src/pages/public/Login.tsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import logoImagen from '../../assets/images/LogoImagen.png';
import './Login.css';

const Login = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', password: '', confirmPassword: ''
  });

  const [errors, setErrors] = useState({
    name: '', phone: '', email: '', password: '', confirmPassword: '', terms: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field as keyof typeof errors]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  const handleTermsChange = (checked: boolean) => {
    setAcceptTerms(checked);
    if (errors.terms) setErrors({ ...errors, terms: '' });
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setFormData({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
    setAcceptTerms(false);
    setErrors({ name: '', phone: '', email: '', password: '', confirmPassword: '', terms: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors = { name: '', phone: '', email: '', password: '', confirmPassword: '', terms: '' };
    let hasError = false;

    if (!isLoginView) {
      if (formData.name.trim().length < 3) {
        newErrors.name = 'Mínimo 3 letras.';
        hasError = true;
      }
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Debe tener 10 números.';
        hasError = true;
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Las contraseñas no coinciden.';
        hasError = true;
      }
      if (!acceptTerms) {
        newErrors.terms = 'Debes aceptar los Términos.';
        hasError = true;
      }
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Mín. 8 caracteres, 1 mayúscula, 1 número y 1 especial.';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      if (isLoginView) {
        const response = await api.post('/auth/login', { email: formData.email, password: formData.password });
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.role);
        toast.success('Acceso concedido. Bienvenido.');
        if (response.data.role === 'admin') navigate('/admin/dashboard'); else navigate('/mi-cuenta');
      } else {
        await api.post('/auth/register', { full_name: formData.name, phone: formData.phone, email: formData.email, password: formData.password });
        toast.success('Cuenta creada exitosamente. Ya puedes iniciar sesión.');
        setIsLoginView(true);
        setFormData({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
        setAcceptTerms(false);
      }
    } catch (error) {
      console.error(error);
      const axiosError = error as { response?: { data?: { message?: string; error?: string } } };
      const serverMessage = axiosError.response?.data?.message || axiosError.response?.data?.error;
      if (serverMessage) toast.error(serverMessage);
      else toast.error('Verifica tus datos o intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-lux-page">
      
      {/* Botón Volver */}
      <button type="button" className="login-back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={16} />
        <span>Volver al inicio</span>
      </button>

      {/* Contenedor Principal Split-Screen Diagonal */}
      <div className="login-lux-card">
        
        {/* ── LADO IZQUIERDO: Panel Oscuro con Corte Diagonal ── */}
        <div className="login-lux-sidebar">
          <div className="login-sidebar-content">
            {/* Medallón que protege el logo original oscuro */}
            <Link to="/" title="Ir al inicio" className="login-logo-badge">
              <img src={logoImagen} alt="Nova Luxe" className="login-logo-img" />
            </Link>

            <h2 className="font-serif login-sidebar-title">
              {isLoginView ? '¡Bienvenido de nuevo!' : '¿Nuevo por aquí?'}
            </h2>
            <p className="login-sidebar-desc">
              {isLoginView 
                ? 'Para mantenerte conectado con nosotros, por favor inicia sesión con tu información personal.' 
                : 'Únete a nuestro Atelier para reservar tratamientos, adquirir productos y gestionar tus citas fácilmente.'}
            </p>

            <div className="login-toggle-text">
              <span>{isLoginView ? '¿No tienes cuenta?' : '¿Ya tienes una cuenta?'}</span>
              <button type="button" className="login-toggle-link" onClick={toggleView}>
                {isLoginView ? 'Regístrate aquí' : 'Inicia Sesión'}
              </button>
            </div>
          </div>
        </div>

        {/* ── LADO DERECHO: Formulario Claro ── */}
        <div className="login-lux-form-area">
          
          {/* El KEY es la magia: Obliga a React a re-animar el componente al cambiar de vista */}
          <div key={isLoginView ? 'login' : 'register'} className="login-form-container form-animate-switch">
            <h1 className="font-serif login-form-title">
              {isLoginView ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h1>
            
            {/* Botón oficial de Google */}
            <div className="mb-8 mt-6">
              <button type="button" className="btn-google-original" onClick={() => toast('Próximamente', {icon: '🚧'})}>
                <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continuar con Google</span>
              </button>
            </div>

            <div className="login-divider">
              <span>o usa tu correo</span>
            </div>

            <form onSubmit={handleSubmit} className="login-form" noValidate>
              
              {!isLoginView && (
                <div className="login-row">
                  <div className="login-field stagger-1">
                    <div className={`lux-input-wrap ${errors.name ? 'has-error' : ''}`}>
                      <User size={18} className="lux-icon" />
                      <input type="text" required placeholder="Nombre completo"
                        value={formData.name} onChange={e => handleInputChange('name', e.target.value)} />
                    </div>
                    {errors.name && <span className="lux-error-text"><AlertCircle size={12}/> {errors.name}</span>}
                  </div>
                  <div className="login-field stagger-2">
                    <div className={`lux-input-wrap ${errors.phone ? 'has-error' : ''}`}>
                      <Phone size={18} className="lux-icon" />
                      <input type="tel" required placeholder="WhatsApp"
                        value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} />
                    </div>
                    {errors.phone && <span className="lux-error-text"><AlertCircle size={12}/> {errors.phone}</span>}
                  </div>
                </div>
              )}

              <div className="login-field stagger-3">
                <div className={`lux-input-wrap ${errors.email ? 'has-error' : ''}`}>
                  <Mail size={18} className="lux-icon" />
                  <input type="email" required placeholder="Correo electrónico"
                    value={formData.email} onChange={e => handleInputChange('email', e.target.value)} />
                </div>
                {errors.email && <span className="lux-error-text"><AlertCircle size={12}/> {errors.email}</span>}
              </div>

              <div className="login-field stagger-4">
                <div className={`lux-input-wrap ${errors.password ? 'has-error' : ''}`}>
                  <Lock size={18} className="lux-icon" />
                  <input type={showPassword ? 'text' : 'password'} required placeholder="Contraseña"
                    value={formData.password} onChange={e => handleInputChange('password', e.target.value)} />
                  <button type="button" className="lux-eye" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && <span className="lux-error-text"><AlertCircle size={12}/> {errors.password}</span>}
              </div>

              {!isLoginView && (
                <>
                  <div className="login-field stagger-5">
                    <div className={`lux-input-wrap ${errors.confirmPassword ? 'has-error' : ''}`}>
                      <Lock size={18} className="lux-icon" />
                      <input type={showConfirmPassword ? 'text' : 'password'} required placeholder="Confirmar contraseña"
                        value={formData.confirmPassword} onChange={e => handleInputChange('confirmPassword', e.target.value)} />
                      <button type="button" className="lux-eye" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.confirmPassword && <span className="lux-error-text"><AlertCircle size={12}/> {errors.confirmPassword}</span>}
                  </div>

                  <div className="stagger-6 mt-2">
                    <label className="lux-terms">
                      <input type="checkbox" checked={acceptTerms} onChange={e => handleTermsChange(e.target.checked)} />
                      <span className="lux-terms-text">
                        Acepto los <Link to="/terminos" target="_blank">Términos</Link> y <Link to="/privacidad" target="_blank">Privacidad</Link>.
                      </span>
                    </label>
                    {errors.terms && <span className="lux-error-text"><AlertCircle size={12}/> {errors.terms}</span>}
                  </div>
                </>
              )}

              {isLoginView && (
                <div className="lux-forgot-pass stagger-7">
                  <a href="#">¿Olvidaste tu contraseña?</a>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-lux-submit stagger-8">
                {loading
                  ? <span className="flex items-center gap-2"><LoaderIcon /> Procesando...</span>
                  : (isLoginView ? 'INICIAR SESIÓN' : 'CREAR CUENTA')}
              </button>

            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

const LoaderIcon = () => (
  <svg className="login-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default Login;