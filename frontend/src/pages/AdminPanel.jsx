import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { resolveImg } from './Home';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty'];
const PLACEHOLDER_IMG = '/uploads/Electronics.jpg';


// Small Toast notification component
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`toast ${type}`}>
      <i className={`fas ${type === 'success' ? 'fa-circle-check' : 'fa-circle-xmark'}`}></i>
      {message}
    </div>
  );
}

function ProductModal({ product, onSave, onClose, loading }) {
  const { showAlert } = useAlert();
  const [form, setForm] = useState(product ? {
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    stock: product.stock,
  } : { name: '', description: '', price: '', category: 'Electronics', stock: '' });

  // imageFile = new File selected by user; previewUrl = local object URL for preview
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(
    product?.imageUrl ? resolveImg(product.imageUrl) : ''
  );
  const [dragOver, setDragOver] = useState(false);

  const isEdit = Boolean(product);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, price: Number(form.price), stock: Number(form.stock) }, imageFile);
  };

  const applyFile = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { 
      showAlert('File too large (max 10 MB)', 'Upload Error', 'error'); 
      return; 
    }
    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => applyFile(e.target.files[0]);

  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    applyFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="modal-overlay">
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2>
            <i className={`fas ${isEdit ? 'fa-pen-to-square' : 'fa-plus-circle'}`}></i>
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button className="btn-close-cart" onClick={onClose}>
            <i className="fas fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-grid">
            <div className="form-group full">
              <label htmlFor="modal-name">Product Name *</label>
              <input
                id="modal-name"
                type="text"
                className="form-input"
                placeholder="e.g. Sony WH-1000XM5"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="modal-price">Price (₹) *</label>
              <input
                id="modal-price"
                type="number"
                step="0.01"
                min="0"
                className="form-input"
                placeholder="49.99"
                value={form.price}
                onChange={(e) => handleChange('price', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="modal-stock">Stock Count *</label>
              <input
                id="modal-stock"
                type="number"
                min="0"
                className="form-input"
                placeholder="100"
                value={form.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                required
              />
            </div>

            <div className="form-group full">
              <label htmlFor="modal-category">Category *</label>
              <select
                id="modal-category"
                className="select-input"
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group full image-upload-container">
              <label>Product Image {!isEdit && '*'}</label>
              {previewUrl ? (
                <div className="image-upload-preview">
                  <img src={previewUrl} alt="Preview" />
                  <button
                    type="button"
                    className="image-upload-remove"
                    onClick={() => { setPreviewUrl(''); setImageFile(null); }}
                    title="Remove image"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ) : (
                <div
                  className={`image-upload-box ${dragOver ? 'drag-over' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('image-file-input').click()}
                >
                  <i className="fas fa-cloud-arrow-up upload-icon"></i>
                  <p><strong>Click to upload</strong> or drag &amp; drop</p>
                  <p style={{ fontSize: '0.7rem' }}>JPG, JPEG, PNG, WEBP, AVIF up to 10 MB</p>
                  <input
                    id="image-file-input"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/avif"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>

            <div className="form-group full">
              <label htmlFor="modal-description">Description</label>
              <textarea
                id="modal-description"
                className="form-input"
                placeholder="Write a short product description..."
                rows={3}
                style={{ resize: 'vertical' }}
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" id="btn-save-product" disabled={loading}>
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }}></div>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-floppy-disk"></i>
                  {isEdit ? 'Save Changes' : 'Create Product'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminProfileModal({ admin, onSave, onClose }) {
  const [fullName, setFullName] = useState(admin?.fullName || '');
  const [email, setEmail] = useState(admin?.email || '');
  const [profilePhoto, setProfilePhoto] = useState(admin?.profilePhoto || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const fileInputRef = useRef(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password && password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setUpdating(true);
    try {
      const payload = { fullName, email, profilePhoto };
      if (password) payload.password = password;

      const res = await axios.put('/api/auth/profile', payload, {
        headers: { Authorization: `Bearer ${admin.token}` },
      });

      onSave(res.data.user);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 440 }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="fas fa-user-shield" style={{ color: 'var(--clr-primary)' }}></i>
            Admin Profile Settings
          </h2>
          <button className="btn-close-cart" onClick={onClose} aria-label="Close" type="button" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <i className="fas fa-xmark"></i>
          </button>
        </div>

        {error && (
          <div className="error-msg" style={{ marginBottom: 16 }}>
            <i className="fas fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Avatar Upload */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20, gap: 10 }}>
            <div className="profile-avatar" style={{ margin: 0, width: 80, height: 80 }}>
              {profilePhoto ? (
                <img src={profilePhoto} alt="Admin Profile" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                <i className="fas fa-user-astronaut"></i>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handlePhotoUploadClick}
                style={{ padding: '6px 12px', fontSize: '0.75rem' }}
              >
                <i className="fas fa-camera"></i>
                {profilePhoto ? 'Change' : 'Upload'}
              </button>
              {profilePhoto && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleRemovePhoto}
                  style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                >
                  <i className="fas fa-trash-can"></i>
                  Remove
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label htmlFor="admin-fullname">Full Name</label>
            <input
              id="admin-fullname"
              type="text"
              className="form-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label htmlFor="admin-email">Email Address</label>
            <input
              id="admin-email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label htmlFor="admin-new-password">New Password (Optional)</label>
            <input
              id="admin-new-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <div className="form-group" style={{ marginBottom: 20 }}>
            <label htmlFor="admin-confirm-password">Confirm Password</label>
            <input
              id="admin-confirm-password"
              type="password"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
              style={{ flex: 1, justifyContent: 'center' }}
              disabled={updating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1, justifyContent: 'center' }}
              disabled={updating}
            >
              {updating ? (
                <>
                  <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2, marginRight: 6 }}></div>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-floppy-disk"></i>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const { admin, logout, updateUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState(null); // null | 'add' | product object
  const [toast, setToast] = useState(null);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const authHeader = { Authorization: `Bearer ${admin?.token}` };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/products', { headers: authHeader });
      setProducts(res.data);
    } catch (err) {
      showToast('Failed to load products.', 'error');
    } finally {
      setLoading(false);
    }
  }, [admin?.token]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSave = async (fields, imageFile) => {
    setSaving(true);
    const isEdit = typeof modal === 'object' && modal !== null;
    try {
      // Build multipart/form-data
      const fd = new FormData();
      Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);

      const headers = { ...authHeader, 'Content-Type': 'multipart/form-data' };

      if (isEdit) {
        await axios.put(`/api/admin/products/${modal._id}`, fd, { headers });
        showToast('Product updated successfully!');
      } else {
        await axios.post('/api/admin/products', fd, { headers });
        showToast('Product created successfully!');
      }
      setModal(null);
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save product.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const initiateDelete = (product) => {
    setDeleteConfirmProduct(product);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmProduct) return;
    try {
      await axios.delete(`/api/admin/products/${deleteConfirmProduct._id}`, { headers: authHeader });
      showToast('Product deleted.');
      setProducts(prev => prev.filter(p => p._id !== deleteConfirmProduct._id));
    } catch (err) {
      showToast('Failed to delete product.', 'error');
    } finally {
      setDeleteConfirmProduct(null);
    }
  };

  return (
    <div className="admin-layout">
      {/* Admin Header */}
      <header className="navbar admin-navbar-header">
        <div className="container navbar__inner">
          <div className="navbar__logo admin-navbar-logo" style={{ cursor: 'default' }}>
            <i className="fas fa-store"></i>
            <span>ShopVault</span>
            <span className="admin-badge admin-navbar-badge" style={{ marginLeft: 8 }}>Admin</span>
          </div>
          <div className="admin-navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              type="button"
              className="admin-profile-trigger-btn"
              onClick={() => setShowProfileModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--clr-text)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                transition: 'all var(--transition)',
                outline: 'none',
              }}
              title="Profile Settings"
            >
              {admin?.profilePhoto ? (
                <img 
                  src={admin.profilePhoto} 
                  alt="Admin" 
                  style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--clr-primary)' }}
                />
              ) : (
                <i className="fas fa-circle-user" style={{ color: 'var(--clr-primary)', fontSize: '1.2rem' }}></i>
              )}
              <span className="admin-navbar-profile-name" style={{ fontWeight: 600 }}>{admin?.fullName || admin?.email}</span>
            </button>
            <button className="btn btn-danger admin-navbar-logout-btn" style={{ padding: '8px 14px' }} onClick={logout}>
              <i className="fas fa-right-from-bracket"></i>
              <span className="admin-navbar-logout-text">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats row */}
      <div className="admin-stats-row">
        <div className="admin-stats-container">
          {[
            { icon: 'fa-box', label: 'Total Products', value: products.length },
            { icon: 'fa-circle-check', label: 'In Stock', value: products.filter(p => p.stock > 0).length },
            { icon: 'fa-triangle-exclamation', label: 'Out of Stock', value: products.filter(p => p.stock === 0).length },
            { icon: 'fa-indian-rupee-sign', label: 'Avg. Price', value: products.length ? `₹${(products.reduce((s, p) => s + p.price, 0) / products.length).toFixed(2)}` : '₹0' },
          ].map(stat => (
            <div key={stat.label} className="admin-stat-card">
              <div className="admin-stat-icon-wrap">
                <i className={`fas ${stat.icon}`}></i>
              </div>
              <div className="admin-stat-info">
                <div className="admin-stat-value">{stat.value}</div>
                <div className="admin-stat-label">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <main className="admin-main">
        <div className="admin-toolbar">
          <h2>
            Products <span>— Manage your inventory</span>
          </h2>
          <button
            className="btn btn-primary"
            id="btn-add-product"
            onClick={() => setModal('add')}
          >
            <i className="fas fa-plus"></i>
            Add Product
          </button>
        </div>

        {loading ? (
          <div className="loading-wrap">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product._id}>
                    <td>
                      <img
                        className="table-img"
                        src={resolveImg(product.imageUrl) || PLACEHOLDER_IMG}
                        alt={product.name}
                        onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                      />
                    </td>
                    <td className="product-name">{product.name}</td>
                    <td>
                      <span className="badge" style={{
                        background: 'rgba(108,99,255,0.15)',
                        color: 'var(--clr-primary)',
                      }}>
                        {product.category}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>₹{product.price.toFixed(2)}</td>
                    <td className={product.stock === 0 ? 'stock-low' : 'stock-ok'}>
                      <i className={`fas ${product.stock === 0 ? 'fa-triangle-exclamation' : 'fa-circle-check'}`} style={{ marginRight: 6 }}></i>
                      {product.stock}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => setModal(product)}
                          title="Edit product"
                        >
                          <i className="fas fa-pen"></i>
                          Edit
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          onClick={() => initiateDelete(product)}
                          title="Delete product"
                        >
                          <i className="fas fa-trash"></i>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal */}
      {modal !== null && (
        <ProductModal
          product={modal === 'add' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
          loading={saving}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmProduct && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400, textAlign: 'center', padding: 32 }}>
            <div style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(255, 107, 107, 0.1)',
              color: 'var(--clr-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              margin: '0 auto 20px',
            }}>
              <i className="fas fa-triangle-exclamation"></i>
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: 12, fontWeight: 700, color: 'var(--clr-white)' }}>Delete Product?</h3>
            <p style={{ color: 'var(--clr-muted)', fontSize: '0.9rem', marginBottom: 24, lineHeight: 1.5 }}>
              Are you sure you want to delete <strong>{deleteConfirmProduct.name}</strong>? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                type="button"
                className="btn btn-ghost" 
                style={{ flex: 1, justifyContent: 'center' }} 
                onClick={() => setDeleteConfirmProduct(null)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn btn-danger" 
                style={{ flex: 1, justifyContent: 'center' }} 
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Profile Modal */}
      {showProfileModal && (
        <AdminProfileModal
          admin={admin}
          onSave={updateUser}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
