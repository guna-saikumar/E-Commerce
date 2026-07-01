const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/cart — Fetch populated user cart
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Format cart array to the flat format the frontend expects
    const formattedCart = user.cart
      .map(item => {
        if (!item.product) return null; // Ignore if product was deleted
        return {
          _id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          imageUrl: item.product.imageUrl,
          stock: item.product.stock,
          quantity: item.quantity,
        };
      })
      .filter(Boolean);

    res.json(formattedCart);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// PUT /api/cart — Sync/overwrite user cart
router.put('/', protect, async (req, res) => {
  const { cartItems } = req.body; // array of { product: productId, quantity }

  if (!Array.isArray(cartItems)) {
    return res.status(400).json({ message: 'cartItems must be an array.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Overwrite the cart
    user.cart = cartItems.map(item => ({
      product: item.product,
      quantity: item.quantity,
    }));

    await user.save();

    // Re-fetch and populate product details to send back updated formatted cart
    const updatedUser = await User.findById(user._id).populate('cart.product');
    const formattedCart = updatedUser.cart
      .map(item => {
        if (!item.product) return null;
        return {
          _id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          imageUrl: item.product.imageUrl,
          stock: item.product.stock,
          quantity: item.quantity,
        };
      })
      .filter(Boolean);

    res.json({ message: 'Cart updated successfully.', cart: formattedCart });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

const GuestCart = require('../models/GuestCart');

router.get('/guest/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const cart = await GuestCart.findOne({ sessionId }).populate('items.product');

    if (!cart) {
      return res.json([]);
    }

    const formattedCart = cart.items
      .map(item => {
        if (!item.product) return null;
        return {
          _id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          imageUrl: item.product.imageUrl,
          stock: item.product.stock,
          quantity: item.quantity,
        };
      })
      .filter(Boolean);

    res.json(formattedCart);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

router.put('/guest/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const { cartItems } = req.body;

  if (!Array.isArray(cartItems)) {
    return res.status(400).json({ message: 'cartItems must be an array.' });
  }

  try {
    let cart = await GuestCart.findOne({ sessionId });
    const items = cartItems.map(item => ({
      product: item.product,
      quantity: item.quantity,
    }));

    if (!cart) {
      cart = new GuestCart({ sessionId, items });
    } else {
      cart.items = items;
    }

    await cart.save();

    const updatedCart = await GuestCart.findOne({ sessionId }).populate('items.product');
    const formattedCart = updatedCart.items
      .map(item => {
        if (!item.product) return null;
        return {
          _id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          imageUrl: item.product.imageUrl,
          stock: item.product.stock,
          quantity: item.quantity,
        };
      })
      .filter(Boolean);

    res.json({ message: 'Guest cart updated successfully.', cart: formattedCart });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
