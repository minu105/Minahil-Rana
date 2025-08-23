const Product = require("../models/Product");

// Get all products
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      collection,
      origin,
      caffeineLevel,
      minPrice,
      maxPrice,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const filter = { isActive: true };

    if (category) filter.category = category;
    if (collection) filter.collection = collection;
    if (origin) filter.origin = new RegExp(origin, "i");
    if (caffeineLevel) filter.caffeineLevel = caffeineLevel;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const sort = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    const products = await Product.find(filter).sort(sort).skip(skip).limit(Number(limit));
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / Number(limit));

    res.status(200).json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalProducts: total,
          hasNextPage: Number(page) < totalPages,
          hasPrevPage: Number(page) > 1,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch products", error: error.message });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: { product } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch product", error: error.message });
  }
};

// Create new product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, origin, stock } = req.body;
    const image = req.file ? req.file.path : null; // Cloudinary URL

    if (!image) {
      return res.status(400).json({ success: false, message: "Product image is required" });
    }

    const product = await Product.create({ name, description, price, image, category, origin, stock });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const existingProduct = await Product.findById(req.params.id);

    if (!existingProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let updateData = { ...req.body };

    if (req.file) {
      updateData.image = req.file.path; // Cloudinary URL
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      previousData: existingProduct,
      data: { product },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update product", error: error.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete product", error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
