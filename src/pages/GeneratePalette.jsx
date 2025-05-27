import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import heic2any from 'heic2any';
import '../styles/GeneratePalette.css';

function GeneratePalette() {
  const [imageUrl, setImageUrl] = useState(null);
  const [palette, setPalette] = useState([]);
  const [paletteName, setPaletteName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const token = sessionStorage.getItem('token');
  const isLoggedIn = !!token;

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPaletteName('');
    setError('');
    setSuccess('');

    try {
      let imageBlob = file;

      // Detectar y convertir HEIC/HEIF
      const isHeicOrHeif = file.type === 'image/heic' || file.type === 'image/heif' ||
                          file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
      if (isHeicOrHeif) {
        try {
          const convertedBlob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
          imageBlob = convertedBlob;
          console.log('Conversión HEIC/HEIF a JPEG exitosa');
        } catch (conversionError) {
          console.error('Error en la conversión HEIC/HEIF:', conversionError);
          setError('No se pudo convertir el archivo HEIC/HEIF. Intentando con el original.');
        }
      }

      const objectURL = URL.createObjectURL(imageBlob);
      setImageUrl(objectURL);
      generatePaletteFromImage(objectURL);
    } catch (err) {
      console.error('Error general al procesar la imagen:', err);
      setError('No se pudo procesar la imagen. Asegúrate de que sea un formato compatible (PNG, JPEG, HEIC/HEIF).');
    }
  };

  const handleReset = () => {
    setImageUrl(null);
    setPalette([]);
    setPaletteName('');
    setError('');
    setSuccess('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }
    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const rgbToHex = (r, g, b) =>
    `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, '0')}`;

  const getBrightness = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

  const generatePaletteFromImage = (url) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const targetSize = 100;
      const aspectRatio = img.width / img.height;
      let newWidth, newHeight;
      if (aspectRatio > 1) {
        newWidth = targetSize;
        newHeight = Math.round(targetSize / aspectRatio);
      } else {
        newWidth = Math.round(targetSize * aspectRatio);
        newHeight = targetSize;
      }
      canvas.width = newWidth;
      canvas.height = newHeight;
      ctx.drawImage(img, 0, 0, newWidth, newHeight);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const colorClusters = new Map();

      // Agrupar colores en bins HSL
      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        const { h, s, l } = rgbToHsl(r, g, b);
        const key = `${Math.round(h / 15)},${Math.round(s / 10)},${Math.round(l / 10)}`;
        if (!colorClusters.has(key)) {
          colorClusters.set(key, { count: 0, rSum: 0, gSum: 0, bSum: 0, sSum: 0 });
        }
        const cluster = colorClusters.get(key);
        cluster.count += 1;
        cluster.rSum += r;
        cluster.gSum += g;
        cluster.bSum += b;
        cluster.sSum += s;
      }

      // Calcular centroides y métrica de saliencia
      const clusters = Array.from(colorClusters.values()).map(data => {
        const count = data.count;
        const r = Math.round(data.rSum / count);
        const g = Math.round(data.gSum / count);
        const b = Math.round(data.bSum / count);
        const avgSaturation = data.sSum / count;
        const brightness = getBrightness(r, g, b);
        const saliency = count * (avgSaturation / 100) * (brightness / 255);
        return { r, g, b, count, saliency };
      });

      // Filtrar y seleccionar los 7 colores más diversos
      const uniqueColors = new Set();
      const finalPalette = [];
      clusters.sort((a, b) => b.saliency - a.saliency);

      for (const cluster of clusters) {
        const hex = rgbToHex(cluster.r, cluster.g, cluster.b);
        const { h, s, l } = rgbToHsl(cluster.r, cluster.g, cluster.b);
        const color = { rgb: `rgb(${cluster.r}, ${cluster.g}, ${cluster.b})`, hsl: `hsl(${h}, ${s}%, ${l}%)`, hex, hue: h, luminosity: l };

        // Verificar si es lo suficientemente diferente
        let isUnique = true;
        for (const existingColor of finalPalette) {
          const existingHsl = existingColor.hsl.match(/\d+/g).map(Number);
          const newHsl = [h, s, l];
          const distance = Math.sqrt(
            Math.pow(existingHsl[0] - newHsl[0], 2) +
            Math.pow(existingHsl[1] - newHsl[1], 2) +
            Math.pow(existingHsl[2] - newHsl[2], 2)
          );
          if (distance < 30) {
            isUnique = false;
            break;
          }
        }

        if (isUnique && finalPalette.length < 7) {
          finalPalette.push(color);
        }
        if (finalPalette.length === 7) break;
      }

      // Completar con los más salientes si no hay 7
      if (finalPalette.length < 7) {
        const remaining = clusters.filter(c => !finalPalette.some(fc => fc.hex === rgbToHex(c.r, c.g, c.b)));
        remaining.sort((a, b) => b.saliency - a.saliency);
        finalPalette.push(...remaining.slice(0, 7 - finalPalette.length).map(c => {
          const { h, s, l } = rgbToHsl(c.r, c.g, c.b);
          return { rgb: `rgb(${c.r}, ${c.g}, ${c.b})`, hsl: `hsl(${h}, ${s}%, ${l}%)`, hex: rgbToHex(c.r, c.g, c.b), hue: h, luminosity: l };
        }));
      }

      // Ordenar por luminosidad (de mayor a menor)
      finalPalette.sort((a, b) => b.luminosity - a.luminosity);
      setPalette(finalPalette);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      setError('Error al cargar la imagen. Verifica el formato o inténtalo de nuevo.');
    };
    img.src = url;
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    try {
      const token = sessionStorage.getItem('token');
      if (!token) throw new Error('No token found. Please log in again.');
      if (!paletteName.trim()) throw new Error('Por favor ingresa un nombre para la paleta');

      const colors = palette.map((color) => {
        const rgbValues = color.rgb.match(/\d+/g).join(',');
        const hslValues = color.hsl.match(/\d+/g).join(',');
        return { rgb: rgbValues, hex: color.hex, hsl: hslValues, name: `Color_${palette.indexOf(color) + 1}` };
      });

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/palettes`,
        { colors, palette_name: paletteName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(response.data.message);
      setPaletteName('');
    } catch (err) {
      console.error('Save palette error:', err);
      if (err.response) setError(err.response.data.message || 'Error al guardar la paleta');
      else setError(err.message || 'Error al guardar la paleta');
    }
  };

  return (
    <section className="section min-vh-100 generate-palette-section">
      <div className="container has-text-centered">
        <h2 className="title is-2 generate-palette-title">¡Genera una paleta de colores a partir de una imagen!</h2>
        <p className="subtitle is-4 generate-palette-subtitle">Sube una imagen y obtén 7 colores representativos</p>

        <div className="box generate-palette-box">
          <div className="file is-centered is-large is-boxed">
            <label className="file-label">
              <input
                className="file-input"
                type="file"
                accept="image/*,image/heic,image/heif,image/jpeg,image/png"
                onChange={handleImageChange}
                ref={fileInputRef}
              />
              <span className="file-cta generate-palette-file-cta">
                <span className="file-label">Seleccionar Imagen</span>
              </span>
            </label>
          </div>

          {imageUrl && (
            <div className="mt-5">
              <div className="mb-3 generate-palette-image-container">
                <img src={imageUrl} alt="Uploaded" className="generate-palette-image" />
              </div>
              <button className="button is-light generate-palette-reset-btn" onClick={handleReset}>
                <span className="icon"><i className="fas fa-sync-alt"></i></span>
                <span>Reset</span>
              </button>
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {palette.length > 0 && (
                <div>
                  <div className="columns is-centered is-multiline generate-palette-colors">
                    {palette.map((color, index) => {
                      const rgbValues = color.rgb.match(/\d+/g).map(Number);
                      const brightness = getBrightness(rgbValues[0], rgbValues[1], rgbValues[2]);
                      const textColor = brightness < 128 ? '#fff' : '#000';
                      return (
                        <div key={index} className="column is-one-third">
                          <div className="box generate-palette-color-box" style={{ backgroundColor: color.hex }}>
                            <p className="generate-palette-color-text" style={{ color: textColor }}>
                              <strong>RGB:</strong> {color.rgb}
                            </p>
                            <p className="generate-palette-color-text" style={{ color: textColor }}>
                              <strong>HSL:</strong> {color.hsl}
                            </p>
                            <p className="generate-palette-color-text" style={{ color: textColor }}>
                              <strong>HEX:</strong> {color.hex}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="palette-strip mt-4">
                    {palette.map((color, index) => (
                      <div
                        key={index}
                        className="palette-strip-color"
                        style={{ backgroundColor: color.hex }}
                      ></div>
                    ))}
                  </div>
                  {isLoggedIn ? (
                    <div className="field has-text-left mt-4">
                      <label className="label generate-palette-label">Nombre de la Paleta</label>
                      <div className="control">
                        <input
                          className="input generate-palette-input"
                          type="text"
                          value={paletteName}
                          onChange={(e) => setPaletteName(e.target.value)}
                          placeholder="Ej. Paleta de Atardecer"
                        />
                      </div>
                      <button className="button generate-palette-save-btn mt-3" onClick={handleSave}>
                        Guardar
                      </button>
                    </div>
                  ) : (
                    <p className="generate-palette-login-prompt mt-3">
                      Por favor <Link to="/login" className="generate-palette-login-link">inicia sesión</Link> para guardar la paleta.
                    </p>
                  )}
                  {error && <p className="has-text-danger mt-2">{error}</p>}
                  {success && <p className="has-text-success mt-2">{success}</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default GeneratePalette;
