import { Navigate, useOutletContext } from 'react-router-dom';

function PrivateRoute({ children }) {
  const { isAuthenticated } = useOutletContext();

  console.log('PrivateRoute - isAuthenticated:', isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute;