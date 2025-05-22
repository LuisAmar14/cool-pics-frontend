import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/SavedColors.css';

function SavedColors() {
  const [colors, setColors] = useState([]);
  const navigate = useNavigate();

  // Cargar colores desde el backend
  const fetchColors = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('Fetching colors...');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/colors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Raw response data:', response.data);

      const fetchedColors = response.data.colors || [];
      setColors(fetchedColors);
    } catch (err) {
      console.error('Error fetching colors:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      }
    }
  };

  // Eliminar un color
  const handleDelete = async (colorId) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/colors/${colorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`Color ${colorId} deleted successfully`);
      // Actualizar la lista de colores después de eliminar
      setColors(colors.filter((color) => color.id !== colorId));
    } catch (err) {
      console.error('Error deleting color:', err);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
      }
    }
  };

  // Cargar colores al montar el componente
  useEffect(() => {
    fetchColors();
  }, []);

  return (
    <section className="section min-vh-100 saved-colors-section">
      <div className="container has-text-centered">
        <h2 className="title is-2 saved-colors-title">Colores Guardados</h2>

        <div className="box saved-colors-box">
          <div className="colors-grid">
            {colors.length > 0 ? (
              colors.map((color) => (
                <div key={color.id} className="color-card">
                  <div
                    className="color-swatch"
                    style={{ backgroundColor: color.hex }}
                  ></div>
                  <p className="color-hex">{color.hex}</p>
                  {color.name && <p className="color-name">{color.name}</p>}
                  <button
                    className="button is-danger is-small delete-btn"
                    onClick={() => handleDelete(color.id)}
                  >
                    Eliminar
                  </button>
                </div>
              ))
            ) : (
              <p className="saved-colors-empty"></p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default SavedColors;
