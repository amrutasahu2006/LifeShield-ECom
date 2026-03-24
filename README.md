# 🛡️ LIFESHIELD – Preparedness Made Simple
### Full-Stack Emergency & Safety Products E-Commerce Platform
**React + Vite | Node.js + Express | MongoDB | JWT Auth**

---

## 📁 FOLDER STRUCTURE

```
lifeshield/
├── backend/                        # Node.js + Express API Server
│   ├── config/
│   │   └── db.js                   # MongoDB connection setup
│   ├── controllers/
│   │   ├── authController.js       # Register / Login logic
│   │   ├── productController.js    # CRUD for products
│   │   ├── cartController.js       # Cart operations
│   │   └── orderController.js      # Order creation & management
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT protect + adminOnly guards
│   ├── models/
│   │   ├── User.js                 # Mongoose User schema
│   │   ├── Product.js              # Mongoose Product schema
│   │   ├── Cart.js                 # Mongoose Cart schema
│   │   └── Order.js                # Mongoose Order schema
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth
│   │   ├── productRoutes.js        # /api/products
│   │   ├── cartRoutes.js           # /api/cart
│   │   ├── orderRoutes.js          # /api/orders
│   │   └── adminRoutes.js          # /api/admin
│   ├── .env.example
│   ├── package.json
│   ├── seed.js                     # Sample data seeder
│   └── server.js                   # Express entry point
│
└── frontend/                       # React + Vite Application
    ├── public/
    │   └── shield.svg              # Favicon
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx          # Sticky nav with live cart badge
    │   │   ├── Footer.jsx          # Footer with links & emergency numbers
    │   │   └── ProductCard.jsx     # Reusable product card component
    │   ├── context/
    │   │   ├── AuthContext.jsx     # Global authentication state
    │   │   └── CartContext.jsx     # Global cart state
    │   ├── pages/
    │   │   ├── HomePage.jsx        # Landing page with hero + featured products
    │   │   ├── ProductsPage.jsx    # Browse with category filter & search
    │   │   ├── ProductDetailPage.jsx # Individual product view with qty selector
    │   │   ├── LoginPage.jsx       # User login form
    │   │   ├── RegisterPage.jsx    # User registration form
    │   │   ├── CartPage.jsx        # Shopping cart management
    │   │   ├── CheckoutPage.jsx    # 3-step checkout (Address → Payment → Review)
    │   │   ├── OrderSuccessPage.jsx # Order confirmation
    │   │   ├── OrdersPage.jsx      # Order history with status badges
    │   │   └── AdminPage.jsx       # Admin dashboard (products + orders)
    │   ├── utils/
    │   │   └── api.js              # Axios instance + all API calls
    │   ├── App.jsx                 # Routes + Context providers
    │   ├── main.jsx                # React DOM entry point (Vite)
    │   └── index.css
    ├── index.html                  # Vite HTML entry (root file, not in /public)
    ├── vite.config.js              # Vite config with dev proxy to backend
    └── package.json
```

---

## ✨ FEATURES

- JWT authentication with role-based access (`user` and `admin`)
- Product catalog with search, filters, pagination, and featured products
- Cart and checkout flow with stock-aware validation
- Order processing with payment verification support
- Subscription-based revenue model with Razorpay premium plan activation
- Commission-based revenue model with per-order platform fee tracking
- Admin panel for product CRUD, order status updates, and alert monitoring
- ERP capabilities for inventory tracking, automatic stock deduction, and low-stock visibility
- ERP order lifecycle tracking with admin-controlled status progression
- ERP sales and revenue analytics with dashboard-level insights

---

## ⚙️ STEP-BY-STEP SETUP GUIDE

### Prerequisites
- **Node.js v18+** – https://nodejs.org
- **MongoDB** – local install OR free cloud at https://mongodb.com/atlas
- **npm** – comes with Node.js

---

### STEP 1: Download & Open the Project

Extract the `lifeshield` folder to your machine.

---

### STEP 2: Setup the Backend

```bash
cd lifeshield/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/lifeshield
JWT_SECRET=lifeshield_super_secret_key_2024
JWT_EXPIRE=7d
NODE_ENV=development
```

> Using **MongoDB Atlas**? Replace MONGO_URI with your Atlas connection string.

---

### STEP 3: Seed the Database

```bash
# From backend/ folder
npm run seed
```

This creates **15 sample products** and two demo accounts:

| Role  | Email                  | Password    |
|-------|------------------------|-------------|
| Admin | admin@lifeshield.com   | admin123    |
| User  | john@example.com       | password123 |

---

### STEP 4: Start the Backend

```bash
npm run dev       # Development (nodemon auto-restart)
# OR
npm start         # Production
```

✅ API running at **http://localhost:5000**

---

### STEP 5: Setup & Start the Frontend

Open a **new terminal**:

```bash
cd lifeshield/frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

✅ App opens at **http://localhost:3000**

> **How the proxy works:** `vite.config.js` proxies all `/api` requests to `http://localhost:5000`, so you don't need separate CORS configuration in development.

---

### STEP 6: Build for Production

```bash
cd frontend
npm run build      # Outputs to frontend/dist/
npm run preview    # Preview the production build locally
```

---

## 🌐 API ROUTES EXPLANATION

### Auth — `/api/auth`
| Method | Endpoint    | Auth? | Description                  |
|--------|-------------|-------|------------------------------|
| POST   | /register   | No    | Create account, returns JWT  |
| POST   | /login      | No    | Login, returns JWT token     |
| GET    | /profile    | ✅ Yes | Get logged-in user profile   |
| PUT    | /profile    | ✅ Yes | Update name, address, password|

### Products — `/api/products`
| Method | Endpoint    | Auth? | Description                          |
|--------|-------------|-------|--------------------------------------|
| GET    | /           | No    | List all (filter: `?category=&search=&page=&limit=`) |
| GET    | /featured   | No    | Get featured products (homepage)     |
| GET    | /:id        | No    | Get single product by ID             |

### Cart — `/api/cart`
| Method | Endpoint       | Auth? | Description              |
|--------|----------------|-------|--------------------------|
| GET    | /              | ✅ Yes | Get user's cart          |
| POST   | /add           | ✅ Yes | Add item `{productId, quantity}` |
| PUT    | /item/:itemId  | ✅ Yes | Update item quantity     |
| DELETE | /item/:itemId  | ✅ Yes | Remove item from cart    |
| DELETE | /clear         | ✅ Yes | Clear entire cart        |

### Orders — `/api/orders`
| Method | Endpoint     | Auth? | Description                   |
|--------|--------------|-------|-------------------------------|
| POST   | /            | ✅ Yes | Create order (clears cart)    |
| GET    | /myorders    | ✅ Yes | Get all orders for this user  |
| GET    | /:id         | ✅ Yes | Get specific order details    |

### Subscription — `/api/subscription`
| Method | Endpoint     | Auth? | Description                                  |
|--------|--------------|-------|----------------------------------------------|
| POST   | /activate    | ✅ Yes | Activate monthly/yearly premium subscription |

### Admin — `/api/admin` *(Admin JWT required)*
| Method | Endpoint              | Description             |
|--------|-----------------------|-------------------------|
| POST   | /products             | Create new product      |
| PUT    | /products/:id         | Update product          |
| DELETE | /products/:id         | Delete product          |
| GET    | /stats                | Get sales & revenue analytics dashboard stats |
| GET    | /low-stock            | Get products at/below low-stock threshold |
| GET    | /orders               | Get all orders          |
| PUT    | /orders/:id/status    | Update order status     |
| GET    | /users                | List all registered users|

---

## 📦 ERP Features – Inventory Management

- Inventory fields are part of the product model:
    - `stock` tracks live available units for each SKU.
    - `lowStockThreshold` defines when a product should be considered low stock (default: `5`).
- Stock tracking logic is enforced during checkout:
    - Before order creation, the backend validates quantity against current DB stock for each cart item.
    - If any product is unavailable, order creation is blocked with `Product out of stock`.
- Automatic stock deduction on order:
    - On successful order placement, stock is reduced for each purchased product using transactional/atomic updates.
    - Cart clearing and order persistence happen in the same order workflow to keep state consistent.
- Low stock alert system:
    - When `stock <= lowStockThreshold`, backend logs a low-stock warning and writes an inventory alert entry.
    - Admin users can query low-stock products via `GET /api/admin/low-stock`.

---

## 📦 ERP Features – Order Management

- Order lifecycle tracking is implemented on each order with status workflow:
    - `pending` → `processing` → `shipped` → `delivered`
- New orders are automatically initialized as `pending`.
- Admin control over order status:
    - Admins can update order status from the dashboard.
    - Backend validates status updates against allowed lifecycle states.
    - Route: `PUT /api/admin/orders/:id/status` (protected with `protect` + `adminOnly`).
- User visibility of order progress:
    - Users can see color-coded order status badges in their order history.
    - Status changes are reflected after admin updates.
- Lifecycle stage timestamps are tracked for operational visibility:
    - `processedAt`, `shippedAt`, `deliveredAt`.

---

## 📦 ERP Features – Sales & Revenue Analytics

- Admin analytics API provides sales intelligence for dashboard reporting.
- Core tracking metrics:
    - `totalOrders`: number of orders processed.
    - `totalRevenue`: cumulative revenue from order totals.
- Advanced analytics included:
    - Monthly revenue aggregation for trend visibility.
    - Top-selling products by quantity and revenue contribution.
- Business decision-making value:
    - Helps identify growth periods, monitor sales momentum, and prioritize high-performing products.
    - Supports smarter planning for campaigns, inventory allocation, and operational targets.

---

## Revenue Model – Subscription System

- LifeShield introduces a premium subscription layer to create recurring revenue while enhancing user value.
- Available plans:
    - Monthly Plan: Rs. 199
    - Yearly Plan: Rs. 999
- Activation workflow:
    - User selects a plan from the Subscription page.
    - Frontend reuses the existing Razorpay create-order and verify APIs.
    - After successful verification, backend activates the selected subscription plan at `POST /api/subscription/activate`.
- Subscription benefits:
    - Premium access indicator (Premium User badge in navigation).
    - 10% automatic discount during checkout for active subscribers.
- Pricing impact in order flow:
    - On order creation, if a user has an active subscription, final payable amount is reduced by 10% before payment validation and order persistence.
    - Expired subscriptions are automatically deactivated during authenticated requests to prevent invalid discount usage.

---

## Revenue Model – Commission-Based System

- LifeShield applies a commission-driven platform fee model for every successful order.
- Commission percentage: 10% of the final order amount.
- Revenue generation flow:
    - Order total is finalized first (including applicable checkout pricing rules).
    - Platform fee is calculated from this final amount and stored on the order as `platformFee`.
- Where it is applied:
    - Backend: order processing logic computes and persists platform fee per order.
    - Frontend: checkout summary and order success page display the Service Fee (included).
    - Admin analytics: dashboard reports total platform revenue by summing all order platform fees.

---

## 🔐 SECURITY FEATURES

- **bcryptjs** – passwords hashed with 12 salt rounds
- **JWT** – 7-day expiring tokens sent in `Authorization: Bearer` header
- **Protected Routes** – middleware guards on all user and admin endpoints
- **Role-based Access** – `adminOnly` middleware prevents regular users from admin routes
- **Input Validation** – `express-validator` on registration and login
- **Stock Check** – cart add validates stock availability before adding

---

## 📦 SAMPLE PRODUCT DATA (15 Products)

| Category                     | Products                                           |
|------------------------------|----------------------------------------------------|
| First Aid Kits               | 326-Piece Kit, Travel Kit, Trauma & Bleeding Kit  |
| Fire Safety Equipment        | ABC Extinguisher, Smoke+CO Detector, Escape Ladder, Fire Blanket |
| Disaster Preparedness Kits   | 72-Hour Kit (4-person), Bug-Out Bag, Water Filter, Hand-Crank Radio |
| Personal Safety Devices      | 130dB Alarm Keychain, Pepper Spray Kit, GPS Beacon, Reflective Vest |

---

## 🎨 FRONTEND PAGES

| Page              | Route             | Description                                    |
|-------------------|-------------------|------------------------------------------------|
| Home              | `/`               | Hero banner, category cards, featured products |
| Products          | `/products`       | Filter by category, search, paginated grid     |
| Product Detail    | `/products/:id`   | Image, description, price, stock, add to cart  |
| Login             | `/login`          | Email/password with demo credentials shown     |
| Register          | `/register`       | Name, email, password with validation          |
| Cart              | `/cart`           | Item list, qty controls, order summary         |
| Checkout          | `/checkout`       | 3-step: Address → Payment (demo) → Review      |
| Order Success     | `/order-success`  | Confirmation with order ID and total           |
| My Orders         | `/orders`         | Order history with status color badges         |
| Admin Dashboard   | `/admin`          | Product CRUD table + live order status updates |

---

## 🔧 TECH STACK

| Layer      | Technology                     |
|------------|--------------------------------|
| Frontend   | React 18 + Vite 5              |
| Routing    | React Router DOM v6            |
| HTTP       | Axios with JWT interceptors    |
| Backend    | Node.js + Express.js           |
| Database   | MongoDB + Mongoose ODM         |
| Auth       | JWT (jsonwebtoken) + bcryptjs  |
| Validation | express-validator              |
| Dev Proxy  | Vite dev server proxy          |

---

*LIFESHIELD – Preparedness Made Simple | Academic Project 2024*
