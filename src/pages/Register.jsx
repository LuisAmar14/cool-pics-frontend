import { useState, useEffect } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import '../styles/Register.css';

function Register() {
  const { setIsAuthenticated } = useOutletContext();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [isCaptchaChecked, setIsCaptchaChecked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();

  // Validaciones
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.username && !validateUsername(formData.username)) {
      newErrors.username = 'El nombre de usuario debe tener entre 3 y 20 caracteres, solo letras, números y guiones bajos';
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'El correo electrónico no es válido';
    }

    if (formData.password && !validatePassword(formData.password)) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial';
    }

    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!isCaptchaChecked) {
      newErrors.captcha = 'Por favor, verifica que no eres un robot';
    }

    setErrors(newErrors);

    return (
      formData.first_name.trim() &&
      formData.last_name.trim() &&
      formData.username &&
      validateUsername(formData.username) &&
      formData.email &&
      validateEmail(formData.email) &&
      formData.password &&
      validatePassword(formData.password) &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword &&
      isCaptchaChecked
    );
  };

  useEffect(() => {
    setIsFormValid(validateForm());
  }, [formData, isCaptchaChecked]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCaptchaChange = (e) => {
    setIsCaptchaChecked(e.target.checked);
  };

  const handleShowPasswordChange = (e) => {
    setShowPassword(e.target.checked);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setErrors({});

    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        first_name: formData.first_name,
        last_name: formData.last_name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.data.token || !response.data.user) {
        throw new Error('Respuesta del servidor incompleta: falta token o user');
      }

      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));

      setIsAuthenticated(true);
      setSuccess('¡Registro exitoso! Redirigiendo...');

      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      console.error('Registration error:', err);
      setErrors({ general: err.response?.data?.error || err.message || 'Error al registrarse' });
    }
  };

  return (
    <section className="section min-vh-100 register-section">
      <div className="container has-text-centered">
        <h2 className="title is-2 register-title">Regístrate</h2>
        <p className="subtitle is-4 register-subtitle">Crea tu cuenta</p>

        <div className="box register-box">
          <form className="register-form" onSubmit={handleSubmit}>
            {errors.general && <p className="has-text-danger register-error mt-2">{errors.general}</p>}
            {success && <p className="has-text-success register-success mt-2">{success}</p>}

            <div className="field">
              <label className="label register-label">Nombre</label>
              <div className="control">
                <input
                  className="input register-input"
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="label register-label">Apellido</label>
              <div className="control">
                <input
                  className="input register-input"
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Tu apellido"
                  required
                />
              </div>
            </div>

            <div className="field">
              <label className="label register-label">Nombre de usuario</label>
              <div className="control">
                <input
                  className="input register-input"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="tu_usuario"
                  required
                />
              </div>
              {errors.username && <p className="has-text-danger register-error mt-1">{errors.username}</p>}
            </div>

            <div className="field">
              <label className="label register-label">Correo Electrónico</label>
              <div className="control">
                <input
                  className="input register-input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tuemail@ejemplo.com"
                  required
                />
              </div>
              {errors.email && <p className="has-text-danger register-error mt-1">{errors.email}</p>}
            </div>

            <div className="field">
              <label className="label register-label">Contraseña</label>
              <div className="control">
                <input
                  className="input register-input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="password-toggle mt-1">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={handleShowPasswordChange}
                  />
                  <span className="ml-2">Mostrar contraseña</span>
                </label>
              </div>
              {errors.password && <p className="has-text-danger register-error mt-1">{errors.password}</p>}
            </div>

            <div className="field">
              <label className="label register-label">Confirmar Contraseña</label>
              <div className="control">
                <input
                  className="input register-input"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
              {errors.confirmPassword && <p className="has-text-danger register-error mt-1">{errors.confirmPassword}</p>}
            </div>

            <div className="field captcha-container">
              <div className="captcha-box">
                <label className="checkbox">
                  <input
                    type="checkbox"
                    checked={isCaptchaChecked}
                    onChange={handleCaptchaChange}
                  />
                  <span className="ml-2">No soy un robot</span>
                </label>
              </div>
              {errors.captcha && <p className="has-text-danger register-error mt-1">{errors.captcha}</p>}
            </div>

            <button
              type="submit"
              className="button register-submit-btn mt-2"
              disabled={!isFormValid}
            >
              Registrarse
            </button>

            <p className="login-prompt mt-2">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="login-link">
                Inicia sesión aquí
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Register;