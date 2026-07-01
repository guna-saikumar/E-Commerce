import { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find(i => i._id === action.payload._id);
      if (existing) {
        return state.map(i =>
          i._id === action.payload._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...state, { ...action.payload, quantity: 1 }];
    }
    case 'REMOVE_ITEM':
      return state.filter(i => i._id !== action.payload);
    case 'UPDATE_QTY': {
      const { id, qty } = action.payload;
      if (qty < 1) return state.filter(i => i._id !== id);
      return state.map(i => i._id === id ? { ...i, quantity: qty } : i);
    }
    case 'CLEAR':
      return [];
    case 'HYDRATE':
      return action.payload;
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, dispatch] = useReducer(cartReducer, []);
  const isHydrating = useRef(false);

  const getOrCreateSessionId = () => {
    let sid = localStorage.getItem('shopvault_guest_session_id');
    if (!sid) {
      sid = 'guest_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('shopvault_guest_session_id', sid);
    }
    return sid;
  };

  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        isHydrating.current = true;
        try {
          const res = await axios.get('/api/cart', {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          const dbCart = res.data;

          const guestSid = localStorage.getItem('shopvault_guest_session_id');
          let guestCart = [];
          if (guestSid) {
            try {
              const gRes = await axios.get(`/api/cart/guest/${guestSid}`);
              guestCart = gRes.data;
            } catch (err) {
              console.error(err);
            }
          }

          if (guestCart.length > 0) {
            const mergedMap = new Map();
            dbCart.forEach(item => mergedMap.set(item._id, item));
            
            guestCart.forEach(item => {
              if (mergedMap.has(item._id)) {
                const existing = mergedMap.get(item._id);
                mergedMap.set(item._id, {
                  ...existing,
                  quantity: existing.quantity + item.quantity
                });
              } else {
                mergedMap.set(item._id, item);
              }
            });

            const mergedCart = Array.from(mergedMap.values());
            const syncPayload = mergedCart.map(item => ({
              product: item._id,
              quantity: item.quantity
            }));
            
            await axios.put('/api/cart', { cartItems: syncPayload }, {
              headers: { Authorization: `Bearer ${user.token}` }
            });

            if (guestSid) {
              try {
                await axios.put(`/api/cart/guest/${guestSid}`, { cartItems: [] });
              } catch (err) {}
              localStorage.removeItem('shopvault_guest_session_id');
            }
            
            dispatch({ type: 'HYDRATE', payload: mergedCart });
          } else {
            dispatch({ type: 'HYDRATE', payload: dbCart });
          }
        } catch (err) {
          dispatch({ type: 'CLEAR' });
        } finally {
          isHydrating.current = false;
        }
      } else {
        isHydrating.current = true;
        try {
          const guestSid = getOrCreateSessionId();
          const res = await axios.get(`/api/cart/guest/${guestSid}`);
          dispatch({ type: 'HYDRATE', payload: res.data });
        } catch (err) {
          dispatch({ type: 'CLEAR' });
        } finally {
          isHydrating.current = false;
        }
      }
    };

    loadCart();
  }, [user]);

  useEffect(() => {
    if (isHydrating.current) return;

    if (user) {
      const syncTimeout = setTimeout(async () => {
        try {
          const syncPayload = cart.map(item => ({
            product: item._id,
            quantity: item.quantity
          }));
          await axios.put('/api/cart', { cartItems: syncPayload }, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
        } catch (err) {}
      }, 500);

      return () => clearTimeout(syncTimeout);
    } else {
      const guestSid = getOrCreateSessionId();
      const syncTimeout = setTimeout(async () => {
        try {
          const syncPayload = cart.map(item => ({
            product: item._id,
            quantity: item.quantity
          }));
          await axios.put(`/api/cart/guest/${guestSid}`, { cartItems: syncPayload });
        } catch (err) {}
      }, 500);

      return () => clearTimeout(syncTimeout);
    }
  }, [cart, user]);

  const addItem = (product) => dispatch({ type: 'ADD_ITEM', payload: product });
  const removeItem = (id) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const updateQty = (id, qty) => dispatch({ type: 'UPDATE_QTY', payload: { id, qty } });
  const clearCart = () => dispatch({ type: 'CLEAR' });

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQty, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
