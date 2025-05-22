import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    const user = sessionStorage.getItem('user');
    console.log('Checking auth on load - token:', token, 'user:', user);
    if (token && user) {
      setIsAuthenticated(true);
      console.log('User authenticated on load');
    }
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setIsAuthenticated(false);
    console.log('Logged out, isAuthenticated:', false);
  };

  const handleLogin = (token, userData) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    console.log('Logged in, isAuthenticated:', true, 'user:', userData);
  };

  return (
    <div className="App">
      <Navbar
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        onLogin={handleLogin}
      />
      <Outlet context={{ isAuthenticated, setIsAuthenticated }} />
    </div>
  );
}

export default App;