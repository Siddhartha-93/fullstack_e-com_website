import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Popover } from "@heroui/react";
import { Description, Label, ListBox, Select } from "@heroui/react";
import SiteHeader from "../components/layout/Header.jsx";
import SiteFooter from "../components/layout/Footer.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import {
  createProduct,
  deleteProduct,
  fetchCategories,
  fetchProducts,
  fetchUsers,
  updateProduct,
  fetchOrders,
  updateOrderStatus,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchOrderById,
} from "../api/adminApi.js";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  comparePrice: "",
  stock: "",
  category: "",
  imageFile: null,
  imagePreview: "",
};

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeViewOrderId, setActiveViewOrderId] = useState(null);
  const [orderView, setOrderView] = useState(null);
  const [orderViewLoading, setOrderViewLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [productForm, setProductForm] = useState(emptyForm);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    slug: "",
    description: "",
    imageFile: null,
    imagePreview: "",
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [refreshToggle, setRefreshToggle] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [orderPaymentFilter, setOrderPaymentFilter] = useState("all");
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/admin/login");
      return;
    }

    if (!isAdmin) {
      return;
    }

    loadAdminData();
  }, [isAuthenticated, isAdmin, navigate, refreshToggle]);

  const loadAdminData = async () => {
    setError("");
    setLoading(true);
    try {
      const [productRes, categoryRes, userRes, orderRes] = await Promise.all([
        fetchProducts({ limit: 100 }),
        fetchCategories(),
        fetchUsers(),
        fetchOrders(),
      ]);
      setProducts(productRes.data.products ?? []);
      setCategories(categoryRes.data.categories ?? []);
      setUsers(userRes.data.users ?? []);
      setOrders(orderRes.data.orders ?? []);

      
      
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Unable to load admin data",
      );
    } finally {
      setLoading(false);
    }
  };
  const resetForm = () => {
    setProductForm(emptyForm);
    setEditingProduct(null);
  };

  const handleInput = (field) => (event) => {
    setProductForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleProductFile = (event) => {
    const file = event.target.files?.[0] || null;
    
    // Validate file
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 2 * 1024 * 1024; // 2MB
      
      if (!validTypes.includes(file.type)) {
        setError('Invalid file type. Please upload JPG, PNG, GIF, or WebP image.');
        event.target.value = '';
        return;
      }
      
      if (file.size > maxSize) {
        setError('File size exceeds 2MB limit. Please choose a smaller image.');
        event.target.value = '';
        return;
      }
      
      setError('');
      setProductForm((current) => ({ 
        ...current, 
        imageFile: file, 
        imagePreview: URL.createObjectURL(file) 
      }));
    }
  };

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    
    if (!productForm.name || !productForm.description || !productForm.category || Number.isNaN(Number(productForm.price))) {
      setError("Please complete product name, description, category, and price.");
      return;
    }
    
    if (!editingProduct && !productForm.imageFile) {
      setError("Please upload a product image.");
      return;
    }

    const payload = {
      name: productForm.name,
      description: productForm.description,
      price: Number(productForm.price),
      comparePrice: productForm.comparePrice
        ? Number(productForm.comparePrice)
        : null,
      stock: Number(productForm.stock),
      category: productForm.category,
    }; 

    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (productForm.imageFile) {
        const fd = new FormData();
        Object.keys(payload).forEach((k) => {
          if (payload[k] !== null && payload[k] !== undefined) fd.append(k, payload[k]);
        });
        fd.append('image', productForm.imageFile);
        if (editingProduct) {
          await updateProduct(editingProduct._id, fd);
        } else {
          await createProduct(fd);
        }
      } else {
        if (editingProduct) {
          await updateProduct(editingProduct._id, payload);
        } else {
          await createProduct(payload);
        }
      }
      setMessage(editingProduct ? "Product updated successfully." : "Product saved successfully.");
      resetForm();
      setRefreshToggle((value) => value + 1);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err.message || "Failed to save product.";
      setError(errorMsg);
      console.error("Product save error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      comparePrice: product.comparePrice ?? "",
      stock: product.stock ?? "",
      category: product.category?._id || product.category || "",
      imageFile: null,
      imagePreview: product.images?.[0]?.url || "",
    });
    setActiveTab("products");
  };

  const handleDeleteProduct = async (product) => {
    const confirmed = window.confirm(`Delete product "${product.name}"?`);
    if (!confirmed) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await deleteProduct(product._id);
      setMessage("Product deleted successfully.");
      setRefreshToggle((value) => value + 1);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to delete product.",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", slug: "", description: "", imageFile: null, imagePreview: "" });
    setEditingCategory(null);
  };

  const handleCategoryInput = (field) => (event) => {
    setCategoryForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const handleCategoryFile = (event) => {
    const file = event.target.files?.[0] || null;
    
    // Validate file
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 2 * 1024 * 1024; // 2MB
      
      if (!validTypes.includes(file.type)) {
        setError('Invalid file type. Please upload JPG, PNG, GIF, or WebP image.');
        event.target.value = '';
        return;
      }
      
      if (file.size > maxSize) {
        setError('File size exceeds 5MB limit. Please choose a smaller image.');
        event.target.value = '';
        return;
      }
      
      setError('');
      setCategoryForm((current) => ({ 
        ...current, 
        imageFile: file, 
        imagePreview: URL.createObjectURL(file) 
      }));
    }
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    if (!categoryForm.name || !categoryForm.slug || !categoryForm.description) {
      setError("Category name and slug are required.");
      return;
    }
    
    if (!editingCategory && !categoryForm.imageFile) {
      setError("Please upload a category image.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const payload = {
      name: categoryForm.name,
      slug: categoryForm.slug,
      description: categoryForm.description,
    };

    try {
      if (categoryForm.imageFile) {
        const fd = new FormData();
        Object.keys(payload).forEach((k) => {
          if (payload[k] !== null && payload[k] !== undefined) fd.append(k, payload[k]);
        });
        fd.append('image', categoryForm.imageFile);
        if (editingCategory) {
          await updateCategory(editingCategory._id, fd);
        } else {
          await createCategory(fd);
        }
      } else {
        if (editingCategory) {
          await updateCategory(editingCategory._id, payload);
        } else {
          await createCategory(payload);
        }
      }
      setMessage(editingCategory ? "Category updated successfully." : "Category saved successfully.");
      resetCategoryForm();
      setRefreshToggle((value) => value + 1);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err.message || "Failed to save category.";
      setError(errorMsg);
      console.error("Category save error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name || "",
      slug: category.slug || "",
      description: category.description || "",
      imageFile: null,
      imagePreview: category.images?.[0]?.url || "",
    });
    setActiveTab("categories");
  };

  const handleDeleteCategory = async (category) => {
    const confirmed = window.confirm(`Delete category "${category.name}"?`);
    if (!confirmed) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await deleteCategory(category._id);
      setMessage("Category deleted successfully.");
      setRefreshToggle((value) => value + 1);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to delete category.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await updateOrderStatus(orderId, newStatus);
      setMessage("Order status updated successfully.");
      setRefreshToggle((value) => value + 1);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to update order status.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrderStatus = async (orderId) => {
    setOrderViewLoading(true);
    setActiveViewOrderId(orderId);
    setOrderView(null);
    setError("");
    setMessage("");
    try {
      const response = await fetchOrderById(orderId);
      setOrderView(response.data.order || response.data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load order details.",
      );
    } finally {
      setOrderViewLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  useEffect(() => {
    setSearchQuery("");
    setOrderStatusFilter("all");
    setOrderPaymentFilter("all");
  }, [activeTab]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return products;
    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.name?.toLowerCase().includes(query) ||
        product.vendor?.name?.toLowerCase().includes(query),
    );
  }, [products, searchQuery]);

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter(
      (category) =>
        category.name?.toLowerCase().includes(query) ||
        category.slug?.toLowerCase().includes(query) ||
        category.description?.toLowerCase().includes(query),
    );
  }, [categories, searchQuery]);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order._id?.toLowerCase().includes(query) ||
        order.user?.name?.toLowerCase().includes(query) ||
        order.status?.toLowerCase().includes(query) ||
        order.paymentStatus?.toLowerCase().includes(query) ||
        order.items?.some((item) => item.name?.toLowerCase().includes(query));

      const matchesOrderStatus =
        orderStatusFilter === "all" || order.status === orderStatusFilter;
      const matchesPaymentStatus =
        orderPaymentFilter === "all" ||
        order.paymentStatus === orderPaymentFilter;

      return matchesSearch && matchesOrderStatus && matchesPaymentStatus;
    });
  }, [orders, searchQuery, orderStatusFilter, orderPaymentFilter]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter(
      (userRecord) =>
        userRecord.name?.toLowerCase().includes(query) ||
        userRecord.email?.toLowerCase().includes(query) ||
        userRecord.phone?.toLowerCase().includes(query) ||
        userRecord.role?.toLowerCase().includes(query),
    );
  }, [users, searchQuery]);

  const activeProducts = filteredProducts;
  const isInitialLoad =
    loading &&
    !products.length &&
    !categories.length &&
    !users.length &&
    !orders.length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <SiteHeader />
        <main className="mx-auto w-full max-w-7xl px-4 py-20 text-center">
          <div className="inline-block rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
            <p className="text-lg font-semibold text-slate-900">
              Admin access required
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Redirecting to admin login...
            </p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <SiteHeader />
        <main className="mx-auto w-full max-w-7xl px-4 py-20 text-center">
          <div className="inline-block rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
            <p className="text-lg font-semibold text-slate-900">
              Access denied
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Only admin users can view this page.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              If you believe this is an error, sign in with an admin account.
            </p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (isInitialLoad) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <SiteHeader />
        <main className="mx-auto w-full max-w-7xl px-4 py-20 text-center">
          <div className="inline-block rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
            <p className="text-lg font-semibold text-slate-900">
              Loading admin dashboard
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Fetching products, categories, users, and orders...
            </p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Admin panel
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
                Manage products and users
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Use this page to fetch products, categories, and users from the
                backend API. Create, update, or remove products from the admin
                panel.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeTab === "products" ? "primary" : "secondary"}
                onPress={() => setActiveTab("products")}
              >
                Products
              </Button>
              <Button
                variant={activeTab === "categories" ? "primary" : "secondary"}
                onPress={() => setActiveTab("categories")}
              >
                Categories
              </Button>
              <Button
                variant={activeTab === "orders" ? "primary" : "secondary"}
                onPress={() => setActiveTab("orders")}
              >
                Orders
              </Button>
              <Button
                variant={activeTab === "users" ? "primary" : "secondary"}
                onPress={() => setActiveTab("users")}
              >
                Users
              </Button>
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="adminSearch" className="sr-only">
              Search admin data
            </label>
            <input
              id="adminSearch"
              type="search"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={`Search ${activeTab}`}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white"
            />
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {message}
          </div>
        )}

        {activeTab === "products" ? (
          <section className="grid gap-8 lg:grid-cols-[minmax(320px,420px)_1fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingProduct ? "Edit product" : "Add product"}
              </h2>
              <form className="mt-6 space-y-4" onSubmit={handleProductSubmit}>
                <FormRow label="Name">
                  <input
                    value={productForm.name}
                    onChange={handleInput("name")}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white"
                    placeholder="Product title"
                  />
                </FormRow>
                <FormRow label="Description">
                  <textarea
                    value={productForm.description}
                    onChange={handleInput("description")}
                    rows={4}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white"
                    placeholder="Short product description"
                  />
                </FormRow>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormRow label="Price">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={productForm.price}
                      onChange={handleInput("price")}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white"
                      placeholder="0.00"
                    />
                  </FormRow>
                  <FormRow label="Compare price">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={productForm.comparePrice}
                      onChange={handleInput("comparePrice")}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white"
                      placeholder="Optional"
                    />
                  </FormRow>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormRow label="Stock">
                    <input
                      type="number"
                      min="0"
                      value={productForm.stock}
                      onChange={handleInput("stock")}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white"
                      placeholder="Inventory count"
                    />
                  </FormRow>
                  <FormRow label="Category">
                    <select
                      value={productForm.category}
                      onChange={handleInput("category")}
                      className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white"
                    >
                      <option value="">Choose category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </FormRow>
                </div>
                <FormRow label="Image">
                  <div className="flex items-center gap-3">
                    {productForm.imagePreview ? (
                      <img src={productForm.imagePreview} alt="preview" className="h-16 w-16 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500">No image</div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProductFile}
                        disabled={loading}
                        className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none disabled:opacity-50"
                      />
                      <p className="mt-1 text-xs text-slate-500">JPG, PNG, GIF, or WebP (max 5MB)</p>
                    </div>
                  </div>
                </FormRow>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? "Saving..." : editingProduct ? "Update product" : "Create product"}
                  </Button>
                  {editingProduct && (
                    <Button
                      type="button"
                      variant="secondary"
                      onPress={resetForm}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Products
                    </h2>
                    <p className="text-sm text-slate-500">
                      {activeProducts.length} products loaded
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onPress={() => setRefreshToggle((value) => value + 1)}
                  >
                    Refresh
                  </Button>
                </div>
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead>
                      <tr className="text-left text-slate-600">
                        <th className="py-3 pr-4">Image</th>
                        <th className="py-3 pr-4">Name</th>
                        <th className="py-3 pr-4">Category</th>
                        <th className="py-3 pr-4">Price</th>
                        <th className="py-3 pr-4">Stock</th>
                        <th className="py-3 pr-4">Vendor</th>
                        <th className="py-3 py-3 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {activeProducts.map((product) => (
                        <tr key={product._id}>
                          <td className="whitespace-nowrap py-4 pr-4 font-medium text-slate-900">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="h-16 w-16 object-cover"
                              />
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-slate-200">
                                <span className="text-lg">?</span>
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap py-4 pr-4 font-medium text-slate-900">
                            {product.name}
                          </td>
                          <td className="py-4 pr-4 text-slate-600">
                            {product.category?.name || "Unassigned"}
                          </td>
                          <td className="py-4 pr-4 text-slate-600">
                            ₹{product.price.toFixed(2)}
                          </td>
                          <td className="py-4 pr-4">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${product.stock > 10 ? "bg-emerald-100 text-emerald-800" : product.stock > 0 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                            >
                              {product.stock} units
                            </span>
                          </td>
                          <td className="py-4 pr-4 text-slate-600">
                            {product.vendor?.name || "Unknown"}
                          </td>
                          <td className="py-4 pr-4">
                            <div className="flex gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onPress={() => handleEditProduct(product)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onPress={() => handleDeleteProduct(product)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {activeProducts.length === 0 && (
                        <tr>
                          <td
                            colSpan="6"
                            className="py-6 text-center text-slate-500"
                          >
                            No products available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        ) : activeTab === "categories" ? (
          <section className="grid gap-8 lg:grid-cols-[minmax(320px,420px)_1fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">
                {editingCategory ? "Edit category" : "Add category"}
              </h2>
              <form className="mt-6 space-y-4" onSubmit={handleCategorySubmit}>
                <FormRow label="Name">
                  <input
                    value={categoryForm.name}
                    onChange={handleCategoryInput("name")}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white"
                    placeholder="Category name"
                  />
                </FormRow>
                <FormRow label="Slug">
                  <input
                    value={categoryForm.slug}
                    onChange={handleCategoryInput("slug")}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white"
                    placeholder="url-slug"
                  />
                </FormRow>
                <FormRow label="Image">
                  <div className="flex items-center gap-3">
                    {categoryForm.imagePreview ? (
                      <img src={categoryForm.imagePreview} alt="preview" className="h-16 w-16 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500">No image</div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCategoryFile}
                        disabled={loading}
                        className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none disabled:opacity-50"
                      />
                      <p className="mt-1 text-xs text-slate-500">JPG, PNG, GIF, or WebP (max 5MB)</p>
                    </div>
                  </div>
                </FormRow>
                <FormRow label="Description">
                  <textarea
                    value={categoryForm.description}
                    onChange={handleCategoryInput("description")}
                    rows={3}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white"
                    placeholder="Optional description"
                  />
                </FormRow>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? "Saving..." : editingCategory ? "Update category" : "Create category"}
                  </Button>
                  {editingCategory && (
                    <Button
                      type="button"
                      variant="secondary"
                      onPress={resetCategoryForm}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </div>

            <div className="space-y-4">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      Categories
                    </h2>
                    <p className="text-sm text-slate-500">
                      {filteredCategories.length} categories
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    onPress={() => setRefreshToggle((value) => value + 1)}
                  >
                    Refresh
                  </Button>
                </div>
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead>
                      <tr className="text-left text-slate-600">
                        <th className="py-3 pr-4">Image</th>
                        <th className="py-3 pr-4">Name</th>
                        <th className="py-3 pr-4">Slug</th>
                        <th className="py-3 pr-4">Description</th>
                        <th className="py-3 pr-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredCategories.map((category) => (
                        <tr key={category._id}>
                          <td className="whitespace-nowrap py-4 pr-4 font-medium text-slate-900">
                            {category.images && category.images.length > 0 ? (
                              <img
                                src={category.images[0].url}
                                alt={category.name}
                                className="h-16 w-16 object-cover"
                              />
                            ) : (
                              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-slate-200">
                                <span className="text-lg">?</span>
                              </div>
                            )}
                          </td>
                          <td className="whitespace-nowrap py-4 pr-4 font-medium text-slate-900">
                            {category.name}
                          </td>
                          <td className="py-4 pr-4 text-slate-600">
                            {category.slug}
                          </td>
                          <td className="py-4 pr-4 text-slate-600">
                            {category.description || "—"}
                          </td>
                          <td className="py-4 pr-4">
                            <div className="flex gap-2">
                              <Button
                                variant="secondary"
                                size="sm"
                                onPress={() => handleEditCategory(category)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onPress={() => handleDeleteCategory(category)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredCategories.length === 0 && (
                        <tr>
                          <td
                            colSpan="4"
                            className="py-6 text-center text-slate-500"
                          >
                            No categories available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        ) : activeTab === "orders" ? (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Orders</h2>
                <p className="text-sm text-slate-500">
                  {filteredOrders.length} orders in total
                </p>
              </div>
              <Button
                variant="secondary"
                onPress={() => setRefreshToggle((value) => value + 1)}
              >
                Refresh
              </Button>
            </div>
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Order status
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white"
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>

             
              {/* -----drop down for payment status---- */}

              <label className="block text-sm font-medium text-slate-700">
                Payment status
                <select
                  value={orderPaymentFilter}
                  onChange={(e) => setOrderPaymentFilter(e.target.value)}
                  className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:bg-white"
                >
                  <option value="all">All payment</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </label>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-slate-600">
                    <th className="py-3 pr-4">Order ID</th>
                    <th className="py-3 pr-4">Customer</th>
                    <th className="py-3 pr-4">Items</th>
                    <th className="py-3 pr-4">Total</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Payment</th>
                    <th className="py-3 pr-4">Created</th>
                    <th className="py-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="whitespace-nowrap py-4 pr-4 font-mono text-xs text-slate-900">
                        {order._id.substring(0, 8)}
                      </td>
                      <td className="py-4 pr-4 text-slate-600">
                        {order.user?.name || "Unknown"}
                      </td>
                      <td className="py-4 pr-4 text-slate-600">
                        {order.items?.length || 0} items
                      </td>
                      <td className="py-4 pr-4 font-medium text-slate-900">
                        ₹{order.total?.toFixed(2)}
                      </td>
                      <td className="py-4 pr-4">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleUpdateOrderStatus(order._id, e.target.value)
                          }
                          className={`rounded-lg border px-2 py-1 text-xs font-semibold outline-none ${
                            order.status === "pending"
                              ? "border-yellow-300 bg-yellow-50 text-yellow-800"
                              : order.status === "processing"
                                ? "border-blue-300 bg-blue-50 text-blue-800"
                                : order.status === "shipped"
                                  ? "border-purple-300 bg-purple-50 text-purple-800"
                                  : order.status === "delivered"
                                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                                    : "border-red-300 bg-red-50 text-red-800"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-4 pr-4 text-slate-600">
                        {order.paymentStatus}
                      </td>
                      <td className="py-4 pr-4 text-slate-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 pr-4">
                        <Popover>
                          <Button
                            variant="secondary"
                            size="sm"
                            onPress={() => handleViewOrderStatus(order._id)}
                          >
                            View
                          </Button>
                          <Popover.Content
                            className="max-w-96"
                            placement="left"
                          >
                            <Popover.Dialog className="space-y-4 p-4">
                              <Popover.Heading>Order details</Popover.Heading>
                              {orderViewLoading &&
                              activeViewOrderId === order._id ? (
                                <p className="text-sm text-slate-500">
                                  Loading order details...
                                </p>
                              ) : orderView?._id === order._id ? (
                                <div className="space-y-4">
                                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                                    <div className="flex items-center justify-between gap-3">
                                      <p className="text-sm font-semibold text-slate-900">
                                        Payment status
                                      </p>
                                      <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                          orderView.paymentStatus === "paid"
                                            ? "bg-emerald-100 text-emerald-800"
                                            : orderView.paymentStatus ===
                                                "pending"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : "bg-red-100 text-red-800"
                                        }`}
                                      >
                                        {orderView.paymentStatus || "unknown"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                                    <p className="text-sm font-semibold text-slate-900">
                                      Shipping address
                                    </p>
                                    <div className="mt-2 space-y-1 text-sm text-slate-600">
                                      <p>
                                        {orderView.shippingAddress?.name ||
                                          "No recipient name"}
                                      </p>
                                      <p>
                                        {orderView.shippingAddress?.street ||
                                          "No street address"}
                                      </p>
                                      <p>
                                        {orderView.shippingAddress?.city || ""}
                                        {orderView.shippingAddress?.city &&
                                        orderView.shippingAddress?.state
                                          ? ", "
                                          : ""}
                                        {orderView.shippingAddress?.state || ""}
                                        {orderView.shippingAddress?.zip
                                          ? ` ${orderView.shippingAddress.zip}`
                                          : ""}
                                      </p>
                                      <p>
                                        {orderView.shippingAddress?.country ||
                                          ""}
                                      </p>
                                      {orderView.shippingAddress?.phone && (
                                        <p>
                                          Phone:{" "}
                                          {orderView.shippingAddress.phone}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                                    <p className="text-sm font-semibold text-slate-900">
                                      Items
                                    </p>
                                    <div className="mt-3 space-y-3">
                                      {orderView.items?.length ? (
                                        orderView.items.map((item, index) => (
                                          <div
                                            key={
                                              item._id ||
                                              item.product?._id ||
                                              index
                                            }
                                            className="flex items-center gap-3 rounded-3xl border border-slate-200 bg-white p-3"
                                          >
                                            {item.product?.images?.[0]?.url ? (
                                              <img
                                                src={item.product.images[0].url}
                                                alt={
                                                  item.name ||
                                                  item.product?.name
                                                }
                                                className="h-12 w-12 rounded-lg object-cover"
                                              />
                                            ) : (
                                              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500">
                                                No image
                                              </div>
                                            )}
                                            <div className="min-w-0">
                                              <p className="truncate text-sm font-semibold text-slate-900">
                                                {item.name ||
                                                  item.product?.name ||
                                                  "Item"}
                                              </p>
                                              <p className="text-xs text-slate-500">
                                                {item.quantity} × ₹
                                                {item.price?.toFixed(2) ??
                                                  "0.00"}
                                              </p>
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <p className="text-sm text-slate-500">
                                          No items found for this order.
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-slate-500">
                                  Click View to load order details.
                                </p>
                              )}
                            </Popover.Dialog>
                          </Popover.Content>
                        </Popover>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td
                        colSpan="7"
                        className="py-6 text-center text-slate-500"
                      >
                        No orders available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Users</h2>
                <p className="text-sm text-slate-500">
                  {filteredUsers.length} users in the database
                </p>
              </div>
              <Button
                variant="secondary"
                onPress={() => setRefreshToggle((value) => value + 1)}
              >
                Refresh
              </Button>
            </div>
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="text-left text-slate-600">
                    <th className="py-3 pr-4">Name</th>
                    <th className="py-3 pr-4">Email</th>
                    <th className="py-3 pr-4">Phone</th>
                    <th className="py-3 pr-4">Role</th>
                    <th className="py-3 pr-4">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredUsers.map((user) => (
                    <tr key={user._id}>
                      <td className="whitespace-nowrap py-4 pr-4 font-medium text-slate-900">
                        {user.name}
                      </td>
                      <td className="py-4 pr-4 text-slate-600">
                        {user.email || "—"}
                      </td>
                      <td className="py-4 pr-4 text-slate-600">{user.phone}</td>
                      <td className="py-4 pr-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === "admin" ? "bg-purple-100 text-purple-800" : user.role === "vendor" ? "bg-blue-100 text-blue-800" : "bg-slate-100 text-slate-800"}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-slate-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="py-6 text-center text-slate-500"
                      >
                        No user records available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function FormRow({ label, children }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  );
}
