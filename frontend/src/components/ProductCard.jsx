import { useCart } from '../context/CartContext';
import { resolveImg } from '../pages/Home';

const PLACEHOLDER = '/uploads/Electronics.jpg';

/* Generate a stable pseudo-random rating from a product id */
function seedRating(id = '') {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) & 0xffffffff;
  }
  return (3.2 + ((Math.abs(hash) % 180) / 100)).toFixed(1);
}

/* Generate a pseudo-random review count (50–850) */
function seedReviews(id = '') {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 53 + id.charCodeAt(i)) & 0xffffffff;
  }
  return 50 + (Math.abs(hash) % 800);
}

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div className="star-rating">
      {Array.from({ length: full }).map((_, i) => <i key={`f${i}`} className="fas fa-star" />)}
      {half && <i className="fas fa-star-half-alt" />}
      {Array.from({ length: empty }).map((_, i) => <i key={`e${i}`} className="far fa-star" />)}
    </div>
  );
}

export default function ProductCard({ product }) {
  const { addItem, updateQty, cart } = useCart();
  const inCart = cart.find(i => i._id === product._id);
  const isOutOfStock = product.stock === 0;

  const rating = parseFloat(seedRating(product._id));
  const reviewCount = seedReviews(product._id);

  const handleAdd = () => {
    if (!isOutOfStock) addItem(product);
  };

  const handleIncrease = (e) => {
    e.stopPropagation();
    if (inCart && inCart.quantity < product.stock) {
      updateQty(product._id, inCart.quantity + 1);
    }
  };

  const handleDecrease = (e) => {
    e.stopPropagation();
    if (!inCart) return;
    if (inCart.quantity <= 1) updateQty(product._id, 0); // removes from cart
    else updateQty(product._id, inCart.quantity - 1);
  };

  return (
    <div className="product-card">
      <div className="product-card__img-wrap">
        <img
          src={resolveImg(product.imageUrl) || PLACEHOLDER}
          alt={product.name}
          onError={(e) => { e.target.src = PLACEHOLDER; }}
          loading="lazy"
        />
        <span className="product-card__category-badge">{product.category}</span>
        {isOutOfStock && (
          <div className="out-of-stock-overlay">
            <span>Out of Stock</span>
          </div>
        )}
      </div>

      <div className="product-card__body">
        <h3 className="product-card__name">{product.name}</h3>

        {/* Star Rating */}
        <div className="product-card__rating">
          <StarRating rating={rating} />
          <span className="rating-value">{rating}</span>
          <span className="rating-count">({reviewCount.toLocaleString()})</span>
        </div>

        <p className="product-card__desc">{product.description}</p>

        <div className="product-card__footer">
          <div>
            <div className="product-card__price">
              <sub>₹</sub>{product.price.toFixed(2)}
            </div>
            {!isOutOfStock && (
              <div className="product-card__stock">
                <i className="fas fa-circle-check" style={{ fontSize: '0.65rem' }}></i>
                {product.stock} in stock
              </div>
            )}
          </div>
        </div>

        {/* Cart Action — Add button OR quantity stepper */}
        {isOutOfStock ? (
          <button className="btn-add-cart" disabled>
            <i className="fas fa-ban" />
            Out of Stock
          </button>
        ) : inCart ? (
          <div className="qty-stepper">
            <button
              className="qty-stepper__btn"
              onClick={handleDecrease}
              title={inCart.quantity === 1 ? 'Remove from cart' : 'Decrease quantity'}
            >
              <i className={`fas ${inCart.quantity === 1 ? 'fa-trash' : 'fa-minus'}`} />
            </button>

            <span className="qty-stepper__count">{inCart.quantity}</span>

            <button
              className="qty-stepper__btn"
              onClick={handleIncrease}
              disabled={inCart.quantity >= product.stock}
              title="Increase quantity"
            >
              <i className="fas fa-plus" />
            </button>
          </div>
        ) : (
          <button className="btn-add-cart" onClick={handleAdd}>
            <i className="fas fa-cart-plus" />
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
