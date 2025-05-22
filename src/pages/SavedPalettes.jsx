import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/SavedPalettes.css';

function SavedPalettes() {
  const [palettes, setPalettes] = useState([]);
  const navigate = useNavigate();

  // Convertir HEX a RGB
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `RGB(${r}, ${g}, ${b})`;
  };

  // Cargar paletas desde el backend
  const fetchPalettes = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('Fetching palettes...');
      const response = await axios.get('http://localhost:5000/api/palettes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Raw response data:', response.data);

      const fetchedPalettes = response.data.palettes || [];
      setPalettes(fetchedPalettes);
    } catch (err) {
      console.error('Error fetching palettes:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      }
    }
  };

  // Eliminar una paleta
  const handleDelete = async (paletteId) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/palettes/${paletteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`Palette ${paletteId} deleted successfully`);
      // Actualizar la lista de paletas después de eliminar
      setPalettes(palettes.filter((palette) => palette.id !== paletteId));
    } catch (err) {
      console.error('Error deleting palette:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      }
    }
  };

  // Cargar paletas al montar el componente
  useEffect(() => {
    fetchPalettes();
  }, []);

  return (
    <section className="section min-vh-100 saved-palettes-section">
      <div className="container has-text-centered">
        <h2 className="title is-2 saved-palettes-title">Paletas Guardadas</h2>
        <p className="subtitle is-4 saved-palettes-subtitle">Revisa tus paletas de colores guardadas</p>

        <div className="box saved-palettes-box">
          <div className="palettes-container">
            {palettes.length > 0 ? (
              palettes.map((palette) => (
                <div key={palette.id} className="palette-strip-container">
                  <div className="palette-header">
                    <h3 className="palette-name">{palette.name}</h3>
                    <button
                      className="button is-danger is-small delete-btn"
                      onClick={() => handleDelete(palette.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                  <div className="palette-strip">
                    {palette.colors.map((color, index) => (
                      <div key={index} className="palette-strip-color">
                        <div
                          className="color-box"
                          style={{ backgroundColor: color.hex }}
                        ></div>
                        <span className="color-code">{hexToRgb(color.hex)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="saved-palettes-empty">No tienes paletas guardadas.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SavedPalettes;