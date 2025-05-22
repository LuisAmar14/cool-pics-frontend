import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import Home from './pages/Home.jsx';
import GetColor from './pages/GetColor.jsx';
import GeneratePalette from './pages/GeneratePalette.jsx';
import ConvertColors from './pages/ConvertColors.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import EditProfile from './pages/EditProfile.jsx';
import SavedPalettes from './pages/SavedPalettes.jsx';
import SavedColors from './pages/SavedColors.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import 'bulma/css/bulma.min.css';

function Main() {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="get-color" element={<GetColor />} />
            <Route path="generate-palette" element={<GeneratePalette />} />
            <Route path="convert-colors" element={<ConvertColors />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route
              path="edit-profile"
              element={
                <PrivateRoute>
                  <EditProfile />
                </PrivateRoute>
              }
            />
            <Route
              path="saved-palettes"
              element={
                <PrivateRoute>
                  <SavedPalettes />
                </PrivateRoute>
              }
            />
            <Route
              path="saved-colors"
              element={
                <PrivateRoute>
                  <SavedColors />
                </PrivateRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Main />);