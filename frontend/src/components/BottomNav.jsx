import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function BottomNav({ onCartOpen }) {
  const { totalItems } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleProfileClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className="bottom-nav">
      <Link 
        to="/" 
        className={`bottom-nav-item ${location.pathname === '/' ? 'active' : ''}`}
      >
        <i className="fas fa-house"></i>
        <span>Home</span>
      </Link>

      <button 
        type="button" 
        className="bottom-nav-item" 
        onClick={onCartOpen}
      >
        <div style={{ position: 'relative' }}>
          <i className="fas fa-bag-shopping"></i>
          {totalItems > 0 && (
            <span className="bottom-nav-badge">{totalItems}</span>
          )}
        </div>
        <span>Cart</span>
      </button>

      <Link 
        to="/profile" 
        onClick={handleProfileClick}
        className={`bottom-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
      >
        {isAuthenticated && user?.profilePhoto ? (
          <img 
            src={user.profilePhoto} 
            alt="Profile" 
            style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', marginBottom: 2 }} 
          />
        ) : (
          <i className="fas fa-circle-user"></i>
        )}
        <span>Profile</span>
      </Link>
    </nav>
  );
}
