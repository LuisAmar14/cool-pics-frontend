import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/CoolPics.png';
import '../styles/Navbar.css';

function Navbar({ isAuthenticated, onLogout }) {
  const [isActive, setIsActive] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => setIsActive(!isActive);

  const handleLogoutClick = () => {
    onLogout();
    setIsActive(false);
    navigate('/');
  };

  return (
    <nav className="navbar custom-navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <Link to="/" className="navbar-item">
          <img src={logo} alt="CoolPics Logo" style={{ height: '40px' }} />
        </Link>

        <a
          role="button"
          className={`navbar-burger ${isActive ? 'is-active' : ''}`}
          aria-label="menu"
          aria-expanded="false"
          onClick={toggleMenu}
        >
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </a>
      </div>

      <div className={`navbar-menu ${isActive ? 'is-active' : ''}`}>
        <div className="navbar-start">
          <Link to="/" className="navbar-item" onClick={toggleMenu}>Inicio</Link>
          <Link to="/get-color" className="navbar-item" onClick={toggleMenu}>Obtener Color</Link>
          <Link to="/generate-palette" className="navbar-item" onClick={toggleMenu}>Generar Paleta</Link>
          <Link to="/convert-colors" className="navbar-item" onClick={toggleMenu}>Convertir Colores</Link>
        </div>

        <div className="navbar-end">
          {isAuthenticated ? (
            <>
              <Link to="/edit-profile" className="navbar-item" onClick={toggleMenu}>Mi Cuenta</Link>
              <Link to="/saved-colors" className="navbar-item" onClick={toggleMenu}>Colores Guardados</Link>
              <Link to="/saved-palettes" className="navbar-item" onClick={toggleMenu}>Paletas Guardadas</Link>
              <div className="navbar-item">
                <button className="button is-light custom-logout" onClick={handleLogoutClick}>
                  <span className="icon">
                    <i className="material-symbols-outlined"></i>
                  </span>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-item" onClick={toggleMenu}>Iniciar Sesión</Link>
              <Link to="/register" className="navbar-item" onClick={toggleMenu}>Registrarse</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;