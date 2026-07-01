import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onCartOpen }) {
  const { totalItems } = useCart();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('click', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__logo">
          <i className="fas fa-store"></i>
          <span>ShopVault</span>
        </Link>

        <div className="navbar__actions">
          {isAuthenticated ? (
            <div className="nav-profile-container">
              {isAdmin && (
                <Link to="/admin" className="nav-link">
                  <i className="fas fa-gauge-high"></i>
                  Dashboard
                </Link>
              )}
              
              <div className="nav-profile-menu-wrap" ref={dropdownRef} style={{ position: 'relative' }}>
                <button 
                  type="button"
                  className="nav-profile-trigger"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                >
                  {user?.profilePhoto ? (
                    <img 
                      src={user.profilePhoto} 
                      alt="Profile" 
                      className="nav-profile-img"
                    />
                  ) : (
                    <i className="fas fa-circle-user nav-profile-icon"></i>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="nav-dropdown" style={{ top: 'calc(100% + 8px)', right: 0 }}>
                    <div className="nav-dropdown-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span className="nav-dropdown-name" style={{ flex: 1, minWidth: 0 }}>
                          {user?.fullName || 'ShopVault User'}
                        </span>
                        <span className="admin-badge" style={{ flexShrink: 0 }}>
                          {user?.role}
                        </span>
                      </div>
                      <span className="nav-dropdown-email">{user?.email}</span>
                    </div>
                    <div className="nav-dropdown-divider"></div>
                    
                    <Link 
                      to="/profile" 
                      className="nav-dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <i className="fas fa-user-gear"></i>
                      View Profile
                    </Link>

                    <button 
                      type="button"
                      className="nav-dropdown-item text-danger"
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                    >
                      <i className="fas fa-right-from-bracket"></i>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Link to="/login" className="nav-link">
              <i className="fas fa-right-to-bracket"></i>
              Login
            </Link>
          )}

          <button className="cart-btn" onClick={onCartOpen}>
            <i className="fas fa-bag-shopping"></i>
            Cart
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}
