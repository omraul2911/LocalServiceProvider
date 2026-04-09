import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import ProviderProfile from './pages/ProviderProfile';
import Dashboard from './pages/Dashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import { useAuth } from './hooks/useAuth';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const RoleRoute = ({ children, role }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }
  if (user.role !== role) {
    return <Navigate to={user.role === 'provider' ? '/provider-dashboard' : '/dashboard'} replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/search" 
              element={
                <ProtectedRoute>
                  <Search />
                </ProtectedRoute>
              } 
            />
            <Route path="/provider/:id" element={<ProviderProfile />} />
            <Route 
              path="/dashboard" 
              element={
                <RoleRoute role="customer">
                  <Dashboard />
                </RoleRoute>
              } 
            />
            <Route 
              path="/provider-dashboard" 
              element={
                <RoleRoute role="provider">
                  <ProviderDashboard />
                </RoleRoute>
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
