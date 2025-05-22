import { useState } from 'react';
import '../styles/ConvertColors.css';

function ConvertColors() {
  const [rgb, setRgb] = useState({ r: '', g: '', b: '' });
  const [hex, setHex] = useState('');
  const [hsl, setHsl] = useState({ h: '', s: '', l: '' });
  const [error, setError] = useState('');

  // Conversión local RGB a HEX
  const rgbToHex = (r, g, b) => {
    const toHex = (value) => Math.max(0, Math.min(255, value)).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  };

  // Conversión local HEX a RGB
  const hexToRgb = (hex) => {
    const cleanHex = hex.replace(/^#/, '');
    if (!/^[0-9A-F]{3,6}$/i.test(cleanHex)) return null;
    const isShort = cleanHex.length === 3;
    const r = parseInt(isShort ? cleanHex[0] + cleanHex[0] : cleanHex.slice(0, 2), 16);
    const g = parseInt(isShort ? cleanHex[1] + cleanHex[1] : cleanHex.slice(2, 4), 16);
    const b = parseInt(isShort ? cleanHex[2] + cleanHex[2] : cleanHex.slice(4, 6), 16);
    return { r, g, b };
  };

  // Conversión local RGB a HSL
  const rgbToHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    let h = 0, s = 0, l = (max + min) / 2;

    if (delta !== 0) {
      s = delta / (1 - Math.abs(2 * l - 1));
      if (max === r) h = (g - b) / delta + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / delta + 2;
      else h = (r - g) / delta + 4;
      h *= 60;
    }
    return {
      h: Math.round(h),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const validateRgb = (r, g, b) => {
    if (isNaN(r) || isNaN(g) || isNaN(b)) return 'Ingresa valores numéricos para R, G y B.';
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) return 'RGB debe estar entre 0 y 255.';
    return '';
  };

  const validateHex = (hex) => {
    if (!/^#?[0-9A-F]{3,6}$/i.test(hex)) return 'Ingresa un HEX válido (ej. #FF0000 o #F00).';
    return '';
  };

  const handleConvert = () => {
    setError('');

    if (rgb.r && rgb.g && rgb.b) {
      const errorMsg = validateRgb(parseInt(rgb.r), parseInt(rgb.g), parseInt(rgb.b));
      if (errorMsg) return setError(errorMsg);

      const r = parseInt(rgb.r);
      const g = parseInt(rgb.g);
      const b = parseInt(rgb.b);
      setHex(rgbToHex(r, g, b));
      setHsl(rgbToHsl(r, g, b));
    } else if (hex) {
      const errorMsg = validateHex(hex);
      if (errorMsg) return setError(errorMsg);

      const rgbValue = hexToRgb(hex);
      if (rgbValue) {
        setRgb(rgbValue);
        setHsl(rgbToHsl(rgbValue.r, rgbValue.g, rgbValue.b));
      } else {
        setError('HEX inválido.');
      }
    } else {
      setError('Ingresa un valor en RGB o HEX.');
    }
  };

  const handleRgbChange = (e) => {
    const { name, value } = e.target;
    const newValue = value === '' ? '' : Math.max(0, Math.min(255, parseInt(value) || 0)).toString();
    setRgb((prev) => ({ ...prev, [name]: newValue }));
    setHex('');
    setHsl({ h: '', s: '', l: '' });
    setError('');
  };

  const handleHexChange = (e) => {
    let newHex = e.target.value.replace(/[^#0-9A-F]/gi, '');
    if (newHex && !newHex.startsWith('#')) newHex = '#' + newHex;
    setHex(newHex.slice(0, 7));
    setRgb({ r: '', g: '', b: '' });
    setHsl({ h: '', s: '', l: '' });
    setError('');
  };

  const handleColorChange = (e) => {
    const newHex = e.target.value;
    setHex(newHex);
    const rgbValue = hexToRgb(newHex);
    if (rgbValue) {
      setRgb(rgbValue);
      setHsl(rgbToHsl(rgbValue.r, rgbValue.g, rgbValue.b));
    }
  };

  const handleColorPick = () => {
    const colorPicker = document.querySelector('.color-picker');
    if (colorPicker) {
      colorPicker.click(); // Simula un clic en el input type="color" para abrir el picker
    }
  };

  const displayColor = hex || (rgb.r && rgb.g && rgb.b && rgbToHex(parseInt(rgb.r), parseInt(rgb.g), parseInt(rgb.b)));

  return (
    <section className="section min-vh-100 convert-colors-section">
      <div className="container has-text-centered">
        <h2 className="title is-2 convert-colors-title">¡Convierte colores!</h2>
        <h2 className="title is-2 convert-colors-title">Ingresa un color en RGB o HEX y conviértelo</h2>

        <div className="box convert-colors-box">
          <div className="convert-colors-content">
            <div className="columns">
              <div className="column is-half">
                <div className="color-section">
                  <h3 className="convert-colors-section-title">RGB</h3>
                  <div className="field has-addons convert-colors-input-group">
                    <div className="control">
                      <input
                        className="input convert-colors-input"
                        type="number"
                        name="r"
                        value={rgb.r}
                        onChange={handleRgbChange}
                        min="0"
                        max="255"
                        placeholder="0-255"
                      />
                    </div>
                    <div className="control">
                      <input
                        className="input convert-colors-input"
                        type="number"
                        name="g"
                        value={rgb.g}
                        onChange={handleRgbChange}
                        min="0"
                        max="255"
                        placeholder="0-255"
                      />
                    </div>
                    <div className="control">
                      <input
                        className="input convert-colors-input"
                        type="number"
                        name="b"
                        value={rgb.b}
                        onChange={handleRgbChange}
                        min="0"
                        max="255"
                        placeholder="0-255"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="column is-half">
                <div className="color-section">
                  <h3 className="convert-colors-section-title">HEX</h3>
                  <div className="field">
                    <div className="control">
                      <input
                        className="input convert-colors-input"
                        type="text"
                        value={hex}
                        onChange={handleHexChange}
                        placeholder="#RRGGBB"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="color-section hsl-section">
              <h3 className="convert-colors-section-title">HSL</h3>
              <div className="field has-addons convert-colors-input-group">
                <div className="control">
                  <input
                    className="input convert-colors-input"
                    type="text"
                    value={hsl.h}
                    readOnly
                    placeholder="0-360"
                  />
                </div>
                <div className="control">
                  <input
                    className="input convert-colors-input"
                    type="text"
                    value={hsl.s ? `${hsl.s}%` : ''}
                    readOnly
                    placeholder="0-100%"
                  />
                </div>
                <div className="control">
                  <input
                    className="input convert-colors-input"
                    type="text"
                    value={hsl.l ? `${hsl.l}%` : ''}
                    readOnly
                    placeholder="0-100%"
                  />
                </div>
              </div>
            </div>
            <button className="button convert-colors-convert-btn mt-5" onClick={handleConvert}>
              Convertir
            </button>
            {error && <p className="has-text-danger convert-colors-error mt-3">{error}</p>}
            {(hex || (rgb.r && rgb.g && rgb.b)) && !error && (
              <div className="color-info mt-5">
                <div className="color-swatch-wrapper">
                  <div
                    className="color-swatch"
                    onClick={handleColorPick}
                    style={{ backgroundColor: displayColor || '#000000' }}
                  />
                  <input
                    type="color"
                    className="color-picker"
                    value={displayColor || '#000000'}
                    onChange={handleColorChange}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ConvertColors;