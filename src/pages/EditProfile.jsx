import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/EditProfile.css';

function EditProfile() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSection, setActiveSection] = useState('username');
  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    console.log('Token from sessionStorage:', token);
    const user = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')) : null;
    console.log('User data from sessionStorage:', user);

    if (!token || !user) {
      console.log('No token or user found, redirecting to login');
      navigate('/login');
      return;
    }

    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      username: user.username || '',
      email: user.email || '',
      password: '',
      confirmPassword: '',
    });
  }, [navigate]);

  const validateUsername = (username) => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return 'El nombre de usuario debe tener de 3 a 20 caracteres, solo letras, números y guiones bajos.';
    }
    return '';
  };

  const validatePassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&).';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Changing ${name} to ${value}`);
    setFormData({
      ...formData,
      [name]: value,
    });
    // Validación en tiempo real
    if (name === 'username') {
      const usernameError = validateUsername(value);
      setError(usernameError || '');
    }
    if (name === 'password' || name === 'confirmPassword') {
      const passwordError = validatePassword(formData.password);
      const confirmError = formData.password !== formData.confirmPassword && formData.confirmPassword !== '' ? 'Las contraseñas no coinciden' : '';
      setError(passwordError || confirmError || '');
    }
  };

  const handleSubmitUsername = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const usernameError = validateUsername(formData.username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      console.log('Token:', token);
      if (!token) {
        throw new Error('No token found. Please log in again.');
      }

      console.log('Submitting username update with:', { username: formData.username });
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/auth/profile`,
        {
          username: formData.username,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Username update response:', response.data);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
      setSuccess(response.data.message);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      console.error('Username update error:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        setError(err.response.data.message || 'Error al actualizar el nombre de usuario');
        if (err.response.data.details) {
          console.error('Error details:', err.response.data.details);
          setError(`${err.response.data.message}: ${err.response.data.details}`);
        }
      } else {
        setError(err.message || 'Error al actualizar el nombre de usuario');
      }
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      console.log('Token:', token);
      if (!token) {
        throw new Error('No token found. Please log in again.');
      }

      console.log('Submitting password update with:', { password: formData.password });
      const response = await axios.put(
               `${import.meta.env.VITE_API_URL}/api/auth/profile`,
        {
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Password update response:', response.data);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
      setSuccess(response.data.message);
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err) {
      console.error('Password update error:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        setError(err.response.data.message || 'Error al actualizar la contraseña');
        if (err.response.data.details) {
          console.error('Error details:', err.response.data.details);
          setError(`${err.response.data.message}: ${err.response.data.details}`);
        }
      } else {
        setError(err.message || 'Error al actualizar la contraseña');
      }
    }
  };

  return (
    <section className="section min-vh-100 edit-profile-section">
      <div className="container has-text-centered">
        <h2 className="title is-2 edit-profile-title">Editar Perfil</h2>
        <p className="subtitle is-4 edit-profile-subtitle">Actualiza tu información</p>

        <div className="box edit-profile-box">
          <div className="edit-profile-content">
            <div className="option-selector">
              <button
                className={`button option-btn ${activeSection === 'username' ? 'is-active' : ''}`}
                onClick={() => setActiveSection('username')}
              >
                Cambiar Nombre de Usuario
              </button>
              <button
                className={`button option-btn ${activeSection === 'password' ? 'is-active' : ''}`}
                onClick={() => setActiveSection('password')}
              >
                Cambiar Contraseña
              </button>
            </div>
            <form
              className="edit-profile-form"
              onSubmit={activeSection === 'username' ? handleSubmitUsername : handleSubmitPassword}
            >
              {error && <p className="has-text-danger edit-profile-error mt-3">{error}</p>}
              {success && <p className="has-text-success edit-profile-success mt-3">{success}</p>}
              {activeSection === 'username' && (
                <>
                  <div className="field">
                    <label className="label edit-profile-label">Nombre de usuario</label>
                    <div className="control">
                      <input
                        className="input edit-profile-input"
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="tu_usuario (3-20 caracteres, letras, números, _)"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="button edit-profile-submit-btn mt-4">
                    Guardar Cambios
                  </button>
                </>
              )}
              {activeSection === 'password' && (
                <>
                  <div className="field">
                    <label className="label edit-profile-label">Nueva Contraseña</label>
                    <div className="control">
                      <input
                        className="input edit-profile-input"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Mínimo 8 caracteres, mayúscula, minúscula, número, especial"
                        required
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label className="label edit-profile-label">Confirmar Nueva Contraseña</label>
                    <div className="control">
                      <input
                        className="input edit-profile-input"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirma tu contraseña"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="button edit-profile-submit-btn mt-4">
                    Guardar Cambios
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default EditProfile;
