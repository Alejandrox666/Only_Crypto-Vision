import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './login.css'; // Importamos el CSS

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await authService.login(formData.email, formData.password);
      navigate('/dash');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2 className="login-title">CryptoVision</h2>
        <p className="login-subtitle">Inicia sesión para continuar</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
       <div className="input-group">
  <label htmlFor="email">Email</label>
  <input
    id="email"
    type="email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    required
  />
</div>
   <div className="input-group">
  <label htmlFor="password">Contraseña</label>
  <input
    id="password"
    type="password"
    name="password"
    value={formData.password}
    onChange={handleChange}
    required
    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
    title="La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial"
  />
  {formData.password && (
    <div className="password-validations">
      <p className={formData.password.length >= 8 ? "valid" : "invalid"}>
        ✓ Mínimo 8 caracteres
      </p>
      <p className={/[A-Z]/.test(formData.password) ? "valid" : "invalid"}>
        ✓ Al menos una letra mayúscula
      </p>
      <p className={/[a-z]/.test(formData.password) ? "valid" : "invalid"}>
        ✓ Al menos una letra minúscula
      </p>
      <p className={/\d/.test(formData.password) ? "valid" : "invalid"}>
        ✓ Al menos un número
      </p>
      <p className={/[@$!%*?&]/.test(formData.password) ? "valid" : "invalid"}>
        ✓ Al menos un carácter especial (@$!%*?&)
      </p>
    </div>
  )}
</div>
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Ingresar'}
          </button>
          <p className="register-link">¿No tienes cuenta? <a href="/register">Regístrate</a></p>

        </form>
      </div>
    </div>
  );
};

export default Login;
