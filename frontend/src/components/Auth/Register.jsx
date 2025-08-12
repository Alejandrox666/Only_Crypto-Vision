import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import './login.css'; // Reutilizamos los estilos del login

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPasswordValidations, setShowPasswordValidations] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    // Validaciones en tiempo real
    let newErrors = {...errors};

    if (name === 'name') {
      newErrors.name = value.length < 3 ? 'El nombre debe tener al menos 3 caracteres' : '';
    }

    if (name === 'email') {
      newErrors.email = !validateEmail(value) ? 'Ingresa un email válido' : '';
    }

    if (name === 'password') {
      let passwordError = '';
      if (value.length < 8) passwordError = 'Mínimo 8 caracteres';
      else if (!/[A-Z]/.test(value)) passwordError = 'Debe contener al menos una mayúscula';
      else if (!/[a-z]/.test(value)) passwordError = 'Debe contener al menos una minúscula';
      else if (!/\d/.test(value)) passwordError = 'Debe contener al menos un número';
      else if (!/[@$!%*?&]/.test(value)) passwordError = 'Debe contener al menos un carácter especial (@$!%*?&)';
      
      newErrors.password = passwordError;
      
      // Validar coincidencia si confirmPassword ya tiene valor
      if (formData.confirmPassword) {
        newErrors.confirmPassword = value !== formData.confirmPassword ? 'Las contraseñas no coinciden' : '';
      }
    }

    if (name === 'confirmPassword') {
      newErrors.confirmPassword = value !== formData.password ? 'Las contraseñas no coinciden' : '';
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {...errors};

    // Validar nombre
    if (formData.name.length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
      valid = false;
    }

    // Validar email
    if (!validateEmail(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
      valid = false;
    }

    // Validar contraseña
    if (formData.password.length < 8) {
      newErrors.password = 'Mínimo 8 caracteres';
      valid = false;
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Debe contener al menos una mayúscula';
      valid = false;
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Debe contener al menos una minúscula';
      valid = false;
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Debe contener al menos un número';
      valid = false;
    } else if (!/[@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Debe contener al menos un carácter especial (@$!%*?&)';
      valid = false;
    }

    // Validar confirmación de contraseña
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await authService.register({
        nombre: formData.name,
        email: formData.email,
        password: formData.password
      });
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Error al registrar el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2 className="login-title">Crear cuenta</h2>
        <p className="login-subtitle">Regístrate para comenzar</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name">Nombre</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <p className="input-error">{errors.name}</p>}
          </div>

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
            {errors.email && <p className="input-error">{errors.email}</p>}
          </div>

          <div className="input-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setShowPasswordValidations(true)}
              onBlur={() => setShowPasswordValidations(false)}
              required
            />
            
            {showPasswordValidations && (
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
            {errors.password && <p className="input-error">{errors.password}</p>}
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            {errors.confirmPassword && <p className="input-error">{errors.confirmPassword}</p>}
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Cargando...' : 'Registrarse'}
          </button>
        </form>

        <p className="register-link">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;