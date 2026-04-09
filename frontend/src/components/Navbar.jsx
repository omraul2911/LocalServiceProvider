import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Search, UserCircle, LogOut } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold tracking-tighter">LP</div>
              <span className="font-heading font-bold text-xl text-gray-900 tracking-tight hidden sm:block">LocalPro</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-6">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/search" className="text-gray-500 hover:text-primary transition flex items-center gap-1 font-medium mr-2">
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Search</span>
                </Link>
                {user.role === 'provider' ? (
                  <Link to="/provider-dashboard" className="text-gray-600 hover:text-primary font-medium flex items-center gap-1">
                    <UserCircle className="w-5 h-5" />
                    <span>Provider Dashboard</span>
                  </Link>
                ) : (
                  <Link to="/dashboard" className="text-gray-600 hover:text-primary font-medium flex items-center gap-1">
                    <UserCircle className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                )}
                <button 
                  onClick={handleLogout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="text-gray-600 hover:text-primary font-medium px-2">Login</Link>
                <Link to="/register" className="bg-primary hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium shadow-md shadow-blue-500/20 transition transform hover:-translate-y-0.5">Register</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
