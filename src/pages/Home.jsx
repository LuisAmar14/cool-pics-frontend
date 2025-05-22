import { Link } from 'react-router-dom';
import getColorImg from '../assets/color.png';
import generatePaletteImg from '../assets/paleta.png';
import convertColorsImg from '../assets/rgbtoHex.png';
import '../styles/Home.css';

function Home() {
  return (
    <section className="section home">
      <div className="container">
        <div className="hero has-text-centered mb-6">
          <h1 className="title is-1">Bienvenido a CoolPics</h1>
          <p className="subtitle is-4">Explora, convierte y crea colores únicos</p>
        </div>

        <div className="columns is-multiline is-variable is-8 is-centered">
          {/* CARD 1 */}
          <div className="column is-4">
            <div className="card feature-card">
              <div className="card-image has-text-centered p-5">
                <img src={getColorImg} alt="Get Color" className="feature-image" />
              </div>
              <div className="card-content has-text-centered">
                <h3 className="title is-4">Obtener Color</h3>
                <p className="subtitle is-6">Extrae colores de tus imágenes favoritas.</p>
                <Link to="/get-color" className="button is-light mt-3">Prueba Ahora</Link>
              </div>
            </div>
          </div>

          {/* CARD 2 */}
          <div className="column is-4">
            <div className="card feature-card">
              <div className="card-image has-text-centered p-5">
                <img src={generatePaletteImg} alt="Generate Palette" className="feature-image" />
              </div>
              <div className="card-content has-text-centered">
                <h3 className="title is-4">Generar Paleta</h3>
                <p className="subtitle is-6">Crea paletas de colores a partir de imágenes.</p>
                <Link to="/generate-palette" className="button is-light mt-3">Prueba Ahora</Link>
              </div>
            </div>
          </div>

          {/* CARD 3 */}
          <div className="column is-4">
            <div className="card feature-card">
              <div className="card-image has-text-centered p-5">
                <img src={convertColorsImg} alt="Convert Colors" className="feature-image" />
              </div>
              <div className="card-content has-text-centered">
                <h3 className="title is-4">Convertir Colores</h3>
                <p className="subtitle is-6">Convierte colores entre RGB, HEX y más.</p>
                <Link to="/convert-colors" className="button is-light mt-3">Prueba Ahora</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;
