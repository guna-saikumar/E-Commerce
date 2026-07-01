import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import SearchFilters from '../components/SearchFilters';
import ProductCard from '../components/ProductCard';

// Import local category images via Vite asset pipeline
import imgElectronics from '../assets/Electronics.jpg';
import imgClothing from '../assets/clothing.avif';
import imgBooks from '../assets/books.jpg';
import imgHome from '../assets/home.jpg';
import imgSports from '../assets/sports.jpg';
import imgBeauty from '../assets/beauty.avif';

const DEFAULT_FILTERS = {
  search: '',
  category: 'All',
  minPrice: '',
  maxPrice: '',
  sort: 'newest',
};

const CATEGORY_IMAGES = {
  'Electronics': imgElectronics,
  'Clothing': imgClothing,
  'Books': imgBooks,
  'Home': imgHome,
  'Sports': imgSports,
  'Beauty': imgBeauty,
};

// Resolve product image URL — /uploads/ paths go through Vite proxy to backend
export function resolveImg(imageUrl) {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('/uploads/')) {
    const backendUrl = import.meta.env.VITE_API_URL || '';
    return `${backendUrl.replace(/\/$/, '')}${imageUrl}`;
  }
  return imageUrl;
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/products/categories');
        setCategories(res.data);
      } catch (err) {
        setCategories(['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty']);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async (currentFilters) => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (currentFilters.search) params.search = currentFilters.search;
      if (currentFilters.category !== 'All') params.category = currentFilters.category;
      if (currentFilters.minPrice) params.minPrice = currentFilters.minPrice;
      if (currentFilters.maxPrice) params.maxPrice = currentFilters.maxPrice;
      if (currentFilters.sort) params.sort = currentFilters.sort;

      const res = await axios.get('/api/products', { params });
      setProducts(res.data);
    } catch (err) {
      setError('Could not connect to the server. Please make sure the backend is running.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced fetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(filters), 350);
    return () => clearTimeout(timer);
  }, [filters, fetchProducts]);

  const handleFilterChange = (newFilters) => setFilters(newFilters);
  const handleClear = () => setFilters(DEFAULT_FILTERS);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1>
            Discover Products<br />
            <span className="highlight">You'll Actually Love</span>
          </h1>
          <p>Curated selection across Electronics, Clothing, Books, Home &amp; more.</p>
        </div>
      </section>

      <div className="container">
        <SearchFilters
          filters={filters}
          onChange={handleFilterChange}
          onClear={handleClear}
        />

        {/* Categories Circle Row */}
        <div className="categories-row">
          {categories.map((catName) => {
            const image = CATEGORY_IMAGES[catName] || imgElectronics;
            return (
              <button
                key={catName}
                className={`category-circle-card ${filters.category === catName ? 'active' : ''}`}
                onClick={() => {
                  const nextCategory = filters.category === catName ? 'All' : catName;
                  handleFilterChange({ ...filters, category: nextCategory });
                }}
                aria-label={`Filter by ${catName}`}
              >
                <div className="category-circle-img-wrap">
                  <img src={image} alt={catName} loading="lazy" />
                </div>
                <span className="category-circle-name">{catName}</span>
              </button>
            );
          })}
        </div>

        {!loading && !error && (
          <p className="results-count">
            Showing <strong>{products.length}</strong> product{products.length !== 1 ? 's' : ''}
            {filters.search && <> for &quot;<strong>{filters.search}</strong>&quot;</>}
            {filters.category !== 'All' && <> in <strong>{filters.category}</strong></>}
          </p>
        )}

        {loading ? (
          <div className="loading-wrap">
            <div className="spinner"></div>
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <i className="fas fa-plug-circle-exclamation"></i>
            <h3>Backend not reachable</h3>
            <p>{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-box-open"></i>
            <h3>No products found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
