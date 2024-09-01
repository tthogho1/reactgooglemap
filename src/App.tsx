import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation , Outlet } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import GoogleMap from './components/GoogleMap';
import { cognitoConstants } from './constants/auth';
import SignUp from './components/SignUp';

Amplify.configure(cognitoConstants);

interface PrivateRouteProps {
  element: React.ReactElement;
  path: string;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element, ...rest }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? (
      <Outlet />
    ) : (
      <Navigate to="/login" state={{ from: location }} replace />
    );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route  path="/login" element={<Login/>} />
          // <Route path="/map" element={<PrivateRoute element={<GoogleMap />} path="/map" />} />
          <Route path="/usermap" element={<GoogleMap/>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/signup" element={<SignUp/>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
