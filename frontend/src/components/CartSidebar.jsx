import { useCart } from '../context/CartContext';
import { resolveImg } from '../pages/Home';
import { useAlert } from '../context/AlertContext';

const PLACEHOLDER = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400';

export default function CartSidebar({ onClose }) {
  const { cart, removeItem, updateQty, totalPrice } = useCart();
  const { showAlert } = useAlert();

  return (
    <>
      <div className="cart-overlay" onClick={onClose} />
      <aside className="cart-sidebar" role="dialog" aria-label="Shopping cart">
        <div className="cart-header">
          <h2>
            <i className="fas fa-bag-shopping"></i>
            Your Cart
          </h2>
          <button className="btn-close-cart" onClick={onClose} aria-label="Close cart">
            <i className="fas fa-xmark"></i>
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty">
            <i className="fas fa-bag-shopping"></i>
            <h3>Your cart is empty</h3>
            <p>Browse our products and add something you love!</p>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.map(item => (
                <CartItem
                  key={item._id}
                  item={item}
                  onRemove={removeItem}
                  onQtyChange={updateQty}
                />
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-total-row">
                <span className="cart-total-label">
                  <i className="fas fa-receipt" style={{ marginRight: 6 }}></i>
                  Total
                </span>
                <span className="cart-total-amount">₹{totalPrice.toFixed(2)}</span>
              </div>
              <button
                className="btn-checkout"
                onClick={() => showAlert('Checkout coming soon! 🎉', 'Coming Soon', 'success')}
              >
                <i className="fas fa-lock"></i>
                Checkout Securely
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

function CartItem({ item, onRemove, onQtyChange }) {
  return (
    <div className="cart-item">
      <img
        className="cart-item__img"
        src={resolveImg(item.imageUrl) || PLACEHOLDER}
        alt={item.name}
        onError={(e) => { e.target.src = PLACEHOLDER; }}
      />
      <div className="cart-item__info">
        <div className="cart-item__name">{item.name}</div>
        <div className="cart-item__price">₹{(item.price * item.quantity).toFixed(2)}</div>
        <div className="cart-item__controls">
          <button
            className="qty-btn"
            onClick={() => onQtyChange(item._id, item.quantity - 1)}
            aria-label="Decrease quantity"
          >
            <i className="fas fa-minus"></i>
          </button>
          <span className="qty-value">{item.quantity}</span>
          <button
            className="qty-btn"
            onClick={() => onQtyChange(item._id, item.quantity + 1)}
            aria-label="Increase quantity"
          >
            <i className="fas fa-plus"></i>
          </button>
          <button
            className="btn-remove-item"
            onClick={() => onRemove(item._id)}
            aria-label="Remove item"
          >
            <i className="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
