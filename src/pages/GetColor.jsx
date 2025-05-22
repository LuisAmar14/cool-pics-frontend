import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/GetColor.css';

function GetColor() {
  const [imageUrl, setImageUrl] = useState(null);
  const [color, setColor] = useState({ rgb: '', hex: '', hsl: '' });
  const [colorName, setColorName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);
  const [pixelInfo, setPixelInfo] = useState(null);

  const token = sessionStorage.getItem('token');
  const isLoggedIn = !!token;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const testImage = new Image();
      testImage.onload = () => {
        setImageUrl(url);
        setColor({ rgb: '', hex: '', hsl: '' });
        setColorName('');
        setError('');
        setSuccess('');
        setPixelInfo(null);
      };
      testImage.onerror = () => {
        setError('El formato de imagen no es compatible en este navegador.');
        URL.revokeObjectURL(url);
      };
      testImage.src = url;
    }
  };

  const handleReset = () => {
    setImageUrl(null);
    setColor({ rgb: '', hex: '', hsl: '' });
    setColorName('');
    setError('');
    setSuccess('');
    setPixelInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const rgbToHsv = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const delta = max - min;
    let h = 0, s = 0, v = max;

    if (delta !== 0) {
      s = delta / max;
      if (max === r) h = (g - b) / delta + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
      h *= 60;
    }

    return { h: Math.round(h), s: Math.round(s * 100), v: Math.round(v * 100) };
  };

  const hsvToHsl = (h, s, v) => {
    s /= 100; v /= 100;
    const l = (2 - s) * v / 2;
    let newS = 0;
    if (l !== 0 && l !== 1) newS = (s * v) / (l < 0.5 ? l * 2 : 2 - l * 2);
    return { h: Math.round(h), s: Math.round(newS * 100), l: Math.round(l * 100) };
  };

  const rgbToHex = (r, g, b) =>
    `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, '0')}`;

  const drawImageOnCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
  };

  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const img = imageRef.current;
    if (!canvas || !container || !img) return;

    const rect = canvas.getBoundingClientRect();
    const scrollX = container.scrollLeft;
    const scrollY = container.scrollTop;

    const x = e.clientX - rect.left + scrollX;
    const y = e.clientY - rect.top + scrollY;

    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    const mappedX = Math.floor(x * scaleX);
    const mappedY = Math.floor(y * scaleY);

    if (mappedX >= 0 && mappedX < img.naturalWidth && mappedY >= 0 && mappedY < img.naturalHeight) {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = img.naturalWidth;
      tempCanvas.height = img.naturalHeight;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.drawImage(img, 0, 0);

      const pixelData = tempCtx.getImageData(mappedX, mappedY, 1, 1).data;
      const [r, g, b] = pixelData;
      const hex = rgbToHex(r, g, b);

      setPixelInfo({ x: e.clientX, y: e.clientY, hex });
    } else {
      setPixelInfo(null);
    }
  };

  const handleCanvasMouseLeave = () => setPixelInfo(null);

  const handleColorSelect = () => {
    if (pixelInfo) {
      const r = parseInt(pixelInfo.hex.slice(1, 3), 16);
      const g = parseInt(pixelInfo.hex.slice(3, 5), 16);
      const b = parseInt(pixelInfo.hex.slice(5, 7), 16);
      const { h, s, v } = rgbToHsv(r, g, b);
      const { h: hHsl, s: sHsl, l } = hsvToHsl(h, s, v);

      setColor({
        rgb: `rgb(${r}, ${g}, ${b})`,
        hex: pixelInfo.hex,
        hsl: `hsl(${hHsl}, ${sHsl}%, ${l}%)`,
      });
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    try {
      if (!token) throw new Error('No token. Inicia sesión de nuevo.');
      if (!colorName) throw new Error('Por favor ingresa un nombre para el color');

      const rgbValues = color.rgb.match(/\d+/g).join(',');
      const hslValues = color.hsl.match(/\d+/g).join(',');

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/colors`,
        { rgb: rgbValues, hex: color.hex, hsl: hslValues, name: colorName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(response.data.message);
      setColorName('');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Error al guardar el color';
      setError(msg);
    }
  };

  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        imageRef.current = img;
        drawImageOnCanvas();
      };
    } else {
      const canvas = canvasRef.current;
      if (canvas && canvas.getContext) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      setPixelInfo(null);
    }
  }, [imageUrl]);

  return (
    <section className="section min-vh-100 get-color-section">
      <div className="container has-text-centered">
        <h2 className="title is-2 get-color-title">¡Selecciona un color desde una imagen!</h2>
        <p className="subtitle is-4 get-color-subtitle">Pasa el cursor sobre la imagen para ver el color</p>

        <div className="box get-color-box">
          <div className="file is-centered is-large is-boxed">
            <label className="file-label">
              <input
                className="file-input"
                type="file"
                accept="image/*,image/heic,image/heif"
                onChange={handleImageChange}
                ref={fileInputRef}
              />
              <span className="file-cta get-color-file-cta">
                <span className="file-label">Seleccionar Imagen</span>
              </span>
            </label>
          </div>

          {imageUrl && (
            <div className="mt-4" style={{ position: 'relative' }}>
              <div
                ref={containerRef}
                className="get-color-image-container"
                style={{ overflow: 'auto', maxHeight: '400px', border: '1px solid #ccc', position: 'relative' }}
              >
                <canvas
                  ref={canvasRef}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseLeave={handleCanvasMouseLeave}
                  onClick={handleColorSelect}
                  style={{ cursor: 'crosshair', maxWidth: '100%', maxHeight: '400px', display: 'block' }}
                />
              </div>

              {/* Burbujita con el color */}
              {pixelInfo && (
                <div
                  className="pixel-info-bubble"
                  style={{
                    position: 'absolute',
                    left: `${Math.min(pixelInfo.x - containerRef.current?.getBoundingClientRect().left + 10, containerRef.current?.offsetWidth - 100)}px`,
                    top: `${pixelInfo.y - containerRef.current?.getBoundingClientRect().top + 10}px`,
                    backgroundColor: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '8px',
                    zIndex: 10,
                    boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
                    maxWidth: '200px',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ backgroundColor: pixelInfo.hex, width: '20px', height: '20px', display: 'inline-block', verticalAlign: 'middle', marginRight: '8px', border: '1px solid #000' }}></div>
                  <span>{pixelInfo.hex}</span>
                </div>
              )}

              {/* Detalles del color */}
              {color.rgb && (
                <div className="columns is-centered is-vcentered mt-3">
                  <div className="column is-narrow">
                    <div
                      className="box"
                      style={{ backgroundColor: color.hex, width: '100px', height: '100px', border: '1px solid #000' }}
                    ></div>
                  </div>
                  <div className="column is-narrow has-text-left">
                    <p><strong>RGB:</strong> {color.rgb}</p>
                    <p><strong>HSL:</strong> {color.hsl}</p>
                    <p><strong>HEX:</strong> {color.hex}</p>
                  </div>
                </div>
              )}

              {isLoggedIn && color.rgb && (
                <div className="field has-text-left mt-3">
                  <label className="label">Nombre del color</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      placeholder="Ej. Verde Pastel"
                      value={colorName}
                      onChange={(e) => setColorName(e.target.value)}
                    />
                  </div>
                  <button className="button is-primary mt-2" onClick={handleSave}>
                    Guardar Color
                  </button>
                </div>
              )}

              {!isLoggedIn && (
                <p className="mt-3">
                  Por favor <Link to="/login">inicia sesión</Link> para guardar colores.
                </p>
              )}

              {error && <p className="has-text-danger mt-2">{error}</p>}
              {success && <p className="has-text-success mt-2">{success}</p>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default GetColor;
