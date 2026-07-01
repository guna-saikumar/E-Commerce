import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Profile() {
  const { isAuthenticated, user, logout, updateUser } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Initialise fields when user loads or toggles editing
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setProfilePhoto(user.profilePhoto || '');
    }
  }, [user, isEditing]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePhotoUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Photo size too large (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhoto(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setProfilePhoto('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.put(
        '/api/auth/profile',
        { fullName, email, profilePhoto },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      
      // Update local storage and AuthContext state
      updateUser(res.data.user);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="profile-card">
        <button 
          type="button" 
          className="profile-close-btn"
          onClick={() => navigate('/')}
          aria-label="Close profile"
        >
          <i className="fas fa-xmark"></i>
        </button>
        <form onSubmit={handleSave}>
          <div className="profile-card__header">
            <div className="profile-avatar" style={{ position: 'relative' }}>
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" />
              ) : (
                <i className="fas fa-user-astronaut"></i>
              )}
            </div>

            {isEditing && (
              <div className="profile-photo-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handlePhotoUploadClick}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <i className="fas fa-camera"></i>
                  {profilePhoto ? 'Change' : 'Upload'}
                </button>
                {profilePhoto && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={handleRemovePhoto}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <i className="fas fa-trash-can"></i>
                    Remove
                  </button>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </div>
            )}

            {!isEditing && <h2>{user.fullName || user.email}</h2>}
            {!isEditing && (
              <p className="profile-role">
                <i className="fas fa-shield-halved" style={{ marginRight: 6 }}></i>
                {user.role === 'admin' ? 'Store Administrator' : 'Verified Customer'}
              </p>
            )}
          </div>

          {error && (
            <div className="error-msg" style={{ marginBottom: 20 }}>
              <i className="fas fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          <div className="profile-details">

            {isEditing ? (
              <>
                <div className="form-group" style={{ margin: '8px 0' }}>
                  <label htmlFor="edit-fullname" style={{ fontSize: '0.75rem', color: 'var(--clr-muted)' }}>Full Name</label>
                  <input
                    id="edit-fullname"
                    type="text"
                    className="form-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: '8px 0' }}>
                  <label htmlFor="edit-email" style={{ fontSize: '0.75rem', color: 'var(--clr-muted)' }}>Email Address</label>
                  <input
                    id="edit-email"
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="profile-detail-item">
                  <span className="label">Full Name</span>
                  <span className="value">{user.fullName || 'Not set'}</span>
                </div>

                <div className="profile-detail-item">
                  <span className="label">Email</span>
                  <span className="value">{user.email || 'Not set'}</span>
                </div>
              </>
            )}

            {!isEditing && (
              <div className="profile-detail-item">
                <span className="label">Account Role</span>
                <span className="value" style={{ textTransform: 'capitalize' }}>
                  {user.role}
                </span>
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="profile-stats-grid" style={{ marginBottom: 24 }}>
              <div className="stat-box">
                <span className="stat-num">12</span>
                <span className="stat-label">Orders</span>
              </div>
              <div className="stat-box">
                <span className="stat-num">{totalItems}</span>
                <span className="stat-label">Cart Items</span>
              </div>
            </div>
          )}

          <div className="profile-actions" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {isEditing ? (
              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setIsEditing(false)}
                  style={{ flex: 1, justifyContent: 'center' }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-floppy-disk"></i>
                      Save Details
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              >
                <i className="fas fa-user-pen"></i>
                Edit Profile Details
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-danger"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              disabled={loading}
            >
              <i className="fas fa-right-from-bracket"></i>
              Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
