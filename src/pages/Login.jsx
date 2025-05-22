import { useState } from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import '../styles/Login.css';

function Login() {
  const { setIsAuthenticated } = useOutletContext();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value.trim(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      console.log('Submitting login with:', formData);
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/login`, {
        email: formData.email,
        password: formData.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Login response:', response.data);

      // Verificar la estructura de la respuesta
      if (!response.data.token || !response.data.user) {
        throw new Error('Respuesta del servidor incompleta: falta token o user');
      }

      // Guardar token y usuario en sessionStorage
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));

      // Actualizar el estado de autenticación
      setIsAuthenticated(true);
      console.log('setIsAuthenticated called with true');

      setSuccess(response.data.message);

      setTimeout(() => {
        console.log('Navigating to /');
        navigate('/');
      }, 1000);
    } catch (err) {
      console.error('Login error:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      }
      setError(err.response?.data?.error || err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <section className="section min-vh-100 login-section">
      <div className="container has-text-centered">
        <h2 className="title is-2 login-title">Inicia Sesión</h2>
        <p className="subtitle is-4 login-subtitle">Accede a tu cuenta</p>

        <div className="box login-box">
          <form className="login-form" onSubmit={handleSubmit}>
            {error && <p className="has-text-danger login-error mt-3">{error}</p>}
            {success && <p className="has-text-success login-success mt-3">{success}</p>}
            <div className="field">
              <label className="label login-label">Correo Electrónico</label>
              <div className="control">
                <input
                  className="input login-input"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tuemail@ejemplo.com"
                  required
                />
              </div>
            </div>
            <div className="field">
              <label className="label login-label">Contraseña</label>
              <div className="control">
                <input
                  className="input login-input"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
            <button type="submit" className="button login-submit-btn mt-4">
              Iniciar Sesión
            </button>
            <p className="register-prompt mt-3">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="register-link">
                Regístrate aquí
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default Login;
