import Category from '../models/Category.js';
import { uploadBuffer } from '../utils/cloudinary.js';

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('parent', 'name slug');
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const categoryData = { ...req.body };
    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, req.file.mimetype, 'categories');
      categoryData.images = [{ url: result.secure_url, alt: req.body.name || '' }];
    }
    const category = await Category.create(categoryData);
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, req.file.mimetype, 'categories');
      updateData.images = [{ url: result.secure_url, alt: req.body.name || '' }];
    }
    const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
