# File Uploader Integration Guide - KPA Market

## Overview
The file uploader is fully integrated between the frontend admin page and backend with Multer + Cloudinary for seamless image uploads for both products and categories.

---

## ✅ Integration Status

### Frontend Setup (React)
- **Location**: `front-end/src/pages/AdminPage.jsx`
- **API Client**: `front-end/src/api/adminApi.js`
- **Features**:
  - FormData-based file uploads
  - Client-side file validation (type & size)
  - Image preview functionality
  - Error handling and feedback
  - Loading states during upload

### Backend Setup (Node.js/Express)
- **Multer Configuration**: `backend/src/middleware/upload.js`
  - Memory storage (no disk writes)
  - 5MB file size limit
  - Single file uploads

- **Cloudinary Integration**: `backend/src/utils/cloudinary.js`
  - Buffer-based uploads
  - Automatic folder organization
  - Secure URL generation

- **Routes**:
  - Products: `POST /api/products` and `PUT /api/products/:id`
  - Categories: `POST /api/categories` and `PUT /api/categories/:id`
  - All routes have `upload.single('image')` middleware

---

## 📋 Field Names & Expected Data

### Product Upload
**API Endpoint**: `POST /api/products` or `PUT /api/products/:id`

**FormData Fields**:
```javascript
FormData {
  name: "Product Name",
  description: "Product description",
  price: 999.99,
  comparePrice: 1299.99,           // Optional
  stock: 50,
  category: "categoryObjectId",
  image: File                       // Required for create, optional for update
}
```

**Image Storage**:
```javascript
// Backend stores in Product model as array
images: [
  {
    url: "https://cloudinary.com/...",
    alt: "Product Name"
  }
]
```

### Category Upload
**API Endpoint**: `POST /api/categories` or `PUT /api/categories/:id`

**FormData Fields**:
```javascript
FormData {
  name: "Category Name",
  slug: "category-slug",
  description: "Category description",  // Optional
  image: File                            // Required for create, optional for update
}
```

**Image Storage**:
```javascript
// Backend stores in Category model as array
images: [
  {
    url: "https://cloudinary.com/...",
    alt: "Category Name"
  }
]
```

---

## 🔒 File Validation

### Frontend Validation (Client-side)
- **Accepted Types**: JPG, PNG, GIF, WebP
- **Max Size**: 5MB
- **Error Messages**: Displayed in UI for user feedback

### Backend Validation (Server-side)
- **Multer Limits**: 5MB file size
- **MIME Type**: Handled by Cloudinary
- **Required Fields**: Validated via express-validator

---

## 📤 Upload Process Flow

### Step 1: File Selection
```javascript
// User selects file from input
handleProductFile(event) -> validates file -> sets preview
```

### Step 2: Validation
```javascript
// Check file type and size
if (!validTypes.includes(file.type)) -> error
if (file.size > 5MB) -> error
```

### Step 3: Form Submission
```javascript
// Create FormData with all fields + file
const fd = new FormData()
fd.append('name', productForm.name)
fd.append('image', productForm.imageFile)
```

### Step 4: API Request
```javascript
// axios sends with multipart/form-data headers
api.post('/products', fd, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
```

### Step 5: Backend Processing
```javascript
// Multer extracts file -> Cloudinary uploads -> URL stored in DB
if (req.file) {
  const result = await uploadBuffer(req.file.buffer, ...)
  productData.images = [{ url: result.secure_url, ... }]
}
```

---

## 🛠️ Recent Improvements

### 1. Fixed Axios FormData Headers
**File**: `front-end/src/api/adminApi.js`

**Change**: Added explicit `Content-Type: multipart/form-data` header
```javascript
// Before
const config = data instanceof FormData ? {} : undefined

// After
const config = data instanceof FormData ? 
  { headers: { 'Content-Type': 'multipart/form-data' } } : {}
```

### 2. Standardized Image Model Structure
**Files**: 
- `backend/src/models/Category.js`
- `backend/src/controllers/categoryController.js`

**Change**: Changed from single object to array format for consistency
```javascript
// Before (Category)
images: { url: String, alt: String }

// After (Category)
images: [{ url: String, alt: String }]
```

### 3. Enhanced Frontend Validation
**File**: `front-end/src/pages/AdminPage.jsx`

**Changes**:
- File type validation (JPG, PNG, GIF, WebP only)
- File size validation (5MB max)
- User-friendly error messages
- File input disabled during upload

### 4. Improved Error Handling
**Changes**:
- Better error messages in console
- Required image on create (optional on update)
- Loading state feedback ("Saving..." button text)
- Disabled form inputs during upload

---

## 📊 Environment Variables Required

### Backend (.env)
```env
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
```

---

## 🧪 Testing the Upload

### Product Creation
1. Go to Admin Panel → Products tab
2. Fill in product details
3. Upload an image (JPG/PNG/GIF/WebP, max 5MB)
4. Click "Create product"
5. Verify image appears in product table

### Product Update
1. Click "Edit" on a product
2. Optionally upload a new image
3. Update other details
4. Click "Update product"
5. New image added to product

### Category Creation
1. Go to Admin Panel → Categories tab
2. Fill in category details
3. Upload an image
4. Click "Create category"
5. Verify image appears in categories table

---

## 🐛 Troubleshooting

### Issue: "File size exceeds 5MB limit"
- **Cause**: Uploaded file is too large
- **Solution**: Compress or resize the image to < 5MB

### Issue: "Invalid file type"
- **Cause**: File is not JPG, PNG, GIF, or WebP
- **Solution**: Convert the image to a supported format

### Issue: Upload hangs or no response
- **Cause**: Network issue or backend not running
- **Solution**:
  1. Check backend is running (`npm run dev`)
  2. Check browser console for errors
  3. Verify Cloudinary URL is set

### Issue: Image URL not loading
- **Cause**: Cloudinary credentials misconfigured
- **Solution**:
  1. Verify `CLOUDINARY_URL` in `.env`
  2. Check Cloudinary dashboard for uploads
  3. Restart backend server

---

## 📁 File Locations Reference

```
backend/
├── middleware/upload.js                  # Multer config
├── utils/cloudinary.js                   # Cloudinary utility
├── models/Product.js                     # Product schema
├── models/Category.js                    # Category schema
├── controllers/productController.js      # Product handlers
├── controllers/categoryController.js     # Category handlers
└── routes/
    ├── productRoutes.js                  # Product endpoints
    └── categoryRoutes.js                 # Category endpoints

front-end/
├── src/pages/AdminPage.jsx              # Admin UI
├── src/api/adminApi.js                  # API functions
└── src/api/axiosClient.js               # Axios config
```

---

## ✨ Best Practices

1. **Always validate files on both frontend and backend**
2. **Keep Multer limits reasonable (5MB is good default)**
3. **Use Cloudinary folders for organization** (products, categories)
4. **Store only URL + alt text** in database
5. **Show preview before upload** for better UX
6. **Provide clear error messages** to users
7. **Disable form during upload** to prevent duplicate submissions

---

## 🔄 Next Steps (Optional Enhancements)

1. **Progress Bar**: Show upload progress with Axios onUploadProgress
2. **Drag & Drop**: Allow drag-and-drop file uploads
3. **Batch Uploads**: Upload multiple images at once
4. **Image Cropping**: Allow users to crop images before upload
5. **Thumbnail Generation**: Auto-generate thumbnails for gallery
6. **CDN Optimization**: Use Cloudinary transformations for responsive images

---

**Last Updated**: June 2026
**Status**: ✅ Production Ready
