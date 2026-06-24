# KPA Market - Backend

MERN stack role-based e-commerce API.

## Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in values:
   ```bash
   copy .env.example .env
   ```
   or use PowerShell:
   ```powershell
   cp .env.example .env
   ```

3. Ensure MongoDB is running locally or update `MONGODB_URI` in `.env`.

4. Start the server in development mode:
   ```bash
   npm run dev
   ```

5. Open the API at the configured port (default `http://localhost:5000`).

## Environment Variables

Copy `.env.example` and set:

- `PORT` - server port
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `NODE_ENV` - environment mode

## API Endpoints

| Endpoint | Method | Auth | Role |
|----------|--------|------|------|
| `/api/health` | GET | - | - |
| `/api/auth/register` | POST | - | - |
| `/api/auth/login` | POST | - | - |
| `/api/auth/me` | GET | ✓ | - |
| `/api/users` | GET | ✓ | admin |
| `/api/users/:id` | GET | ✓ | admin |
| `/api/users/profile` | PUT | ✓ | - |
| `/api/products` | GET | - | - |
| `/api/products/:id` | GET | - | - |
| `/api/products` | POST | ✓ | admin, vendor |
| `/api/products/:id` | PUT | ✓ | admin, vendor |
| `/api/products/:id` | DELETE | ✓ | admin, vendor |
| `/api/orders` | GET | ✓ | admin |
| `/api/orders/my-orders` | GET | ✓ | customer |
| `/api/orders` | POST | ✓ | customer |
| `/api/orders/:id` | GET | ✓ | - |
| `/api/orders/:id/status` | PUT | ✓ | admin |
| `/api/cart` | GET | ✓ | customer |
| `/api/cart` | POST | ✓ | customer |
| `/api/cart/:itemId` | PUT | ✓ | customer |
| `/api/cart/:itemId` | DELETE | ✓ | customer |
| `/api/categories` | GET | - | - |
| `/api/categories` | POST | ✓ | admin |
| `/api/categories/:id` | PUT | ✓ | admin |
| `/api/categories/:id` | DELETE | ✓ | admin |

## Roles

- **customer** - Browse products, manage cart, create orders, view own orders
- **vendor** - Create and manage own products
- **admin** - Full access to users, products, orders, categories

## Admin Panel Features

The admin panel provides comprehensive management tools:

### Products Management
- Create, read, update, delete products
- Manage inventory and stock levels
- Assign products to categories
- Upload product images

### Categories Management
- Create, read, update, delete categories
- Organize product categories with slugs
- Add category descriptions

### Orders Management
- View all customer orders
- Update order status (pending, processing, shipped, delivered, cancelled)
- Track order items and totals
- Monitor customer information

### Users Management
- View all registered users
- Filter users by role (customer, admin, vendor)
- Track user registration dates

## Notes

- `register` and `login` return a JWT token that must be sent in `Authorization: Bearer <token>` for protected routes.
- `/api/orders/:id` can be accessed by authenticated users, but customers can only view their own orders.
- Product update/delete routes allow admins and the product vendor, while the cart routes require the `customer` role.
