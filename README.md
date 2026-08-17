# 🛡️ Production-Grade Full-Stack Authentication & Stripe Payment System

A complete, beginner-friendly, production-grade application featuring **JWT + HTTP-Only Cookies Authentication**, **Google & GitHub OAuth 2.0**, and a **Stripe + Cash / Pay Later Payment Integration**.

---

## 📂 1. Complete Project Folder Structure

```text
authentication_system/
│
├── server/                           # Backend Express API & Payment Engine
│   ├── config/
│   │   ├── db.js                     # Mongoose MongoDB connection
│   │   ├── passport.js               # Google & GitHub OAuth setup
│   │   └── stripe.js                 # Stripe SDK initialization helper
│   ├── controllers/
│   │   ├── authController.js         # Register, Login, Logout, getMe, OAuth
│   │   └── paymentController.js      # Stripe Checkout, Cash payment, Webhook, History
│   ├── middleware/
│   │   ├── authMiddleware.js         # JWT HTTP-Only cookie verification guard
│   │   └── errorMiddleware.js        # Global Express error handler
│   ├── models/
│   │   ├── User.js                   # Mongoose User model with pre-save bcrypt hook
│   │   ├── Payment.js                # Mongoose Payment model
│   │   └── Order.js                  # Mongoose Order model
│   ├── routes/
│   │   ├── authRoutes.js             # Auth REST routes
│   │   └── paymentRoutes.js          # Payment REST routes
│   ├── utils/
│   │   └── generateToken.js          # JWT signing & cookie helper
│   ├── .env                          # Local environment variables (ignored by git)
│   ├── .env.example                  # Environment configuration template
│   ├── package.json                  # Express, Mongoose, Bcrypt, Stripe dependencies
│   └── server.js                     # Express app server entry point
│
├── client/                           # Frontend React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Top navigation header with links & avatar
│   │   │   ├── OAuthButtons.jsx      # Google & GitHub OAuth buttons
│   │   │   ├── PaymentCard.jsx       # Selectable Card vs Cash payment option UI
│   │   │   └── ProtectedRoute.jsx    # Client-side route guard
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global authentication state manager
│   │   ├── pages/
│   │   │   ├── Login.jsx             # Split-screen responsive login page
│   │   │   ├── Register.jsx          # User registration page with validation
│   │   │   ├── Home.jsx              # Protected user dashboard
│   │   │   ├── Payment.jsx           # Checkout page (Card / Cash selection)
│   │   │   ├── PaymentSuccess.jsx    # Payment success & receipt page
│   │   │   ├── PaymentCancel.jsx     # Payment cancellation fallback page
│   │   │   └── PaymentHistory.jsx    # User payment history dashboard
│   │   ├── services/
│   │   │   ├── api.js                # Axios instance with withCredentials: true
│   │   │   └── paymentService.js     # Payment API service calls
│   │   ├── App.jsx                   # React Router layout & routing
│   │   ├── main.jsx                  # React DOM entry point
│   │   └── index.css                 # Tailwind CSS directives
│   ├── .env                          # Client environment variables
│   ├── package.json                  # Frontend dependencies
│   ├── tailwind.config.js            # Tailwind configuration
│   └── vite.config.js                # Vite build config
│
└── README.md                         # Complete tutorial & master guide
```

---

## ⚡ 2. Quick Setup & Run Instructions

### **STEP 1 — Install Backend Dependencies**
```bash
cd server
npm install
```

### **STEP 2 — Configure Environment Variables**

#### Backend `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/auth_system_db
JWT_SECRET=super_secret_jwt_key_antigravity_2026_change_in_production
CLIENT_URL=http://localhost:5173

# OAuth Keys (Optional for local test)
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# Stripe Keys (Obtain from Stripe Dashboard Test Mode)
STRIPE_SECRET_KEY=sk_test_51P...
STRIPE_PUBLISHABLE_KEY=pk_test_51P...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Frontend `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51P...
```

### **STEP 3 — Install Frontend Dependencies**
```bash
cd client
npm install
```

### **STEP 4 — Start Backend & Frontend**
* **Terminal 1 (Backend):** `cd server && npm run dev` (Runs on `http://localhost:5000`)
* **Terminal 2 (Frontend):** `cd client && npm run dev` (Runs on `http://localhost:5173`)

---

## 💳 3. Stripe Dashboard Setup Guide (Test Mode)

### Step 1: Create a Free Stripe Account
1. Open **[Stripe Dashboard](https://dashboard.stripe.com/)** and sign up.
2. Ensure **Test Mode** toggle at the top right is turned **ON** (`Viewing test data`).

### Step 2: Obtain API Keys
1. In Stripe Dashboard, navigate to **Developers** → **API keys**.
2. Copy the **Publishable key** (`pk_test_...`) and place it in `client/.env` (`VITE_STRIPE_PUBLISHABLE_KEY`).
3. Click **Reveal secret key** (`sk_test_...`) and copy it into `server/.env` (`STRIPE_SECRET_KEY`).

### Step 3: Publishable Key vs Secret Key
* 🔑 **Publishable Key (`pk_test_...`)**: Safe for frontend exposure. Used by browser clients to initialize Stripe elements or checkout.
* 🔒 **Secret Key (`sk_test_...`)**: MUST NEVER be exposed to frontend code or GitHub. Used strictly on the backend to sign transactions, create sessions, and issue refunds.

---

## 💳 4. Official Stripe Test Card Information

Use these official Stripe test cards during development (Test Mode = No real money charged):

| Card Type | Card Number | Expiry | CVC | Expected Result |
| :--- | :--- | :--- | :--- | :--- |
| **Successful Payment** | `4242 4242 4242 4242` | Any future date | Any 3 digits | **Success (`paid`)** |
| **Declined Card** | `4000 0002 0000 0002` | Any future date | Any 3 digits | **Declined (`failed`)** |
| **3D Secure Prompt** | `4000 0027 6000 3184` | Any future date | Any 3 digits | **3DS Prompt** |

---

## 🔌 5. Complete REST API Specifications

### Authentication Routes (`/api/auth`)
* `POST /api/auth/register` - Register user & attach HTTP-only JWT cookie
* `POST /api/auth/login` - Authenticate user & attach HTTP-only JWT cookie
* `POST /api/auth/logout` - Clear HTTP-only JWT cookie
* `GET  /api/auth/me` - Return logged-in user profile

### Payment Routes (`/api/payments`)
* `POST /api/payments/create-checkout-session` (Protected) - Creates Stripe Checkout session for ₹999 Premium Plan & returns Stripe URL.
* `POST /api/payments/cash` (Protected) - Records Cash / Pay Later order with status `pending`.
* `POST /api/payments/webhook` (Public, Raw Body) - Stripe Webhook listener verifying cryptographic signatures and marking status to `paid`.
* `GET  /api/payments/history` (Protected) - Retrieves logged-in user's payment history list.
* `GET  /api/payments/:id` (Protected) - Retrieves payment and order details for specific ID or `session_id`.
* `POST /api/payments/:id/confirm-cash` (Protected) - Admin/manual trigger to update cash payment status to `paid`.

---

## 🔒 6. Security Features Built In

1. **Server-Side Price Calculation**: Amount (₹999) is resolved directly from server catalog; client-submitted prices are rejected.
2. **Zero Sensitive Card Storage**: Card numbers, CVVs, and expiry dates are processed entirely on PCI-compliant Stripe servers.
3. **Stripe Webhook Signature Verification**: Webhook endpoint verifies `stripe-signature` header via `stripe.webhooks.constructEvent`.
4. **Isolated User History**: Query filter `{ user: req.user._id }` prevents users from viewing other users' payments.
5. **Idempotent Order Handling**: Payment records store unique `stripeSessionId` and prevent duplicate double-charges.

---

&copy; 2026 Production Full-Stack Authentication & Stripe Payment System.
