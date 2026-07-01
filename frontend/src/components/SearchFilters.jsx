const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A–Z' },
];

export default function SearchFilters({ filters, onChange, onClear }) {
  const handleChange = (field, value) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="filters-bar">
      {/* Search */}
      <div className="filter-group" style={{ flex: 3, minWidth: 220 }}>
        <label htmlFor="search-input">
          <i className="fas fa-magnifying-glass" style={{ marginRight: 6 }}></i>
          Search products
        </label>
        <div className="search-wrapper">
          <i className="fas fa-magnifying-glass"></i>
          <input
            id="search-input"
            type="text"
            className="search-input"
            placeholder="iPhone, sneakers, yoga mat..."
            value={filters.search}
            onChange={(e) => handleChange('search', e.target.value)}
          />
        </div>
      </div>

      {/* Price range */}
      <div className="filter-group">
        <label>
          <i className="fas fa-indian-rupee-sign" style={{ marginRight: 6 }}></i>
          Price range
        </label>
        <div className="price-inputs">
          <input
            type="number"
            placeholder="Min"
            min="0"
            value={filters.minPrice}
            onChange={(e) => handleChange('minPrice', e.target.value)}
            onWheel={(e) => e.target.blur()}
          />
          <span>—</span>
          <input
            type="number"
            placeholder="Max"
            min="0"
            value={filters.maxPrice}
            onChange={(e) => handleChange('maxPrice', e.target.value)}
            onWheel={(e) => e.target.blur()}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="filters-divider" style={{
        width: 1,
        alignSelf: 'stretch',
        background: 'var(--clr-border)',
        margin: '0 8px',
        flexShrink: 0,
      }} />

      {/* Sort and Clear Wrapper */}
      <div className="sort-clear-container">
        {/* Sort */}
        <div className="filter-group">
          <label htmlFor="sort-select">
            <i className="fas fa-arrow-up-wide-short" style={{ marginRight: 6 }}></i>
            Sort by
          </label>
          <select
            id="sort-select"
            className="select-input"
            value={filters.sort}
            onChange={(e) => handleChange('sort', e.target.value)}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Clear */}
        <button className="btn-clear-filter" onClick={onClear} title="Clear all filters">
          <i className="fas fa-xmark"></i>
          Clear
        </button>
      </div>
    </div>
  );
}
