import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { uploadBuffer } from '../utils/cloudinary.js';

export const getProducts = async (req, res) => {
  try {
    const { category, page = 1, limit = 12 } = req.query;
    const query = {};
    if (category) query.category = category;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('vendor', 'name')
      .limit(parseInt(limit))
      .skip(skip);
    const total = await Product.countDocuments(query);
    res.json({ success: true, products, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTopSellingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    const top = await Order.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.product', totalSold: { $sum: '$items.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      { $project: { product: '$product', totalSold: 1 } },
    ]);

    const products = top.map((t) => ({ ...t.product, totalSold: t.totalSold }));
    res.json({ success: true, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('vendor', 'name email');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body, vendor: req.user.id };
    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, req.file.mimetype, 'products');
      productData.images = [{ url: result.secure_url, alt: req.body.name || '' }];
    }
    const product = await Product.create(productData);
    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (req.user.role !== 'admin' && product.vendor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this product' });
    }
    const updateData = { ...req.body };
    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, req.file.mimetype, 'products');
      // push new image
      updateData.$push = { images: { url: result.secure_url, alt: req.body.name || '' } };
      // findByIdAndUpdate doesn't accept $push inside updateData directly when using the object form,
      // so we'll perform a manual update below if $push exists
      await Product.findByIdAndUpdate(req.params.id, { $push: { images: { url: result.secure_url, alt: req.body.name || '' } }, $set: req.body }, { new: true });
      product = await Product.findById(req.params.id);
    } else {
      product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (req.user.role !== 'admin' && product.vendor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
    }
    await product.deleteOne();
    res.json({ success: true, message: 'Product removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
