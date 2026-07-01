const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes require JWT + admin role
router.use(protect, adminOnly);

// Multer storage — save files to backend/uploads/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /\.(jpg|jpeg|png|gif|webp|avif)$/i;
  if (allowed.test(path.extname(file.originalname))) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, jpeg, png, gif, webp, avif)'));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/admin/products — list all products for admin
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// POST /api/admin/products — create product (multipart/form-data)
router.post('/products', upload.single('image'), async (req, res) => {
  const { name, description, price, category, stock } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ message: 'Name, price, and category are required.' });
  }

  // imageUrl = uploaded file path OR existing URL passed as text
  const imageUrl = req.file
    ? `/uploads/${req.file.filename}`
    : (req.body.imageUrl || '');

  try {
    const product = new Product({ name, description, price, category, imageUrl, stock });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// PUT /api/admin/products/:id — update product (multipart/form-data)
router.put('/products/:id', upload.single('image'), async (req, res) => {
  try {
    const updates = { ...req.body };

    if (req.file) {
      updates.imageUrl = `/uploads/${req.file.filename}`;
      // Delete old image if it was a local upload
      const existing = await Product.findById(req.params.id);
      if (existing && existing.imageUrl && existing.imageUrl.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', existing.imageUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// DELETE /api/admin/products/:id — delete product + remove uploaded image
router.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    // Clean up uploaded file if stored locally
    if (product.imageUrl && product.imageUrl.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '..', product.imageUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
