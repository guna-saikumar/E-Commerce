# ShopVault — Premium Online Store & Admin Dashboard

ShopVault is a modern, full-stack e-commerce web application built using the MERN stack (MongoDB, Express, React, Node.js). It offers a secure, persistent shopping experience for customers and a full-featured responsive control panel for store administrators.

---

## 🚀 Key Features

* **Secure Authentication**: Full registration and login flows backed by JSON Web Tokens (JWT) and secure cookie management.
* **Database-Backed Guest Carts**: Persistent shopping carts for guest shoppers mapped by session IDs directly to MongoDB, automatically merging with their account cart upon logging in.
* **Custom Alert Modal System**: Global glassmorphism alert system replacing native browser prompt dialogs for a cohesive UI/UX.
* **Dynamic Product Catalog**: Real-time inventory grid with search autocomplete, price filters, and category navigation.
* **Responsive Admin Dashboard**: Full admin portal to manage inventory (add, edit, delete products) with responsive metrics cards (Total Products, In Stock, Out of Stock, Avg. Price) wrapping dynamically on mobile devices.
* **Optimized Mobile Header**: Space-saving navbar on mobile screens that displays the storefront logo, small ADMIN badge, and action icons.

---

## 🛠️ Tech Stack

### Frontend
* **Core**: React.js (Vite), React Router
* **State Management**: Context API (`AuthContext`, `CartContext`, `AlertContext`)
* **Styling**: Vanilla CSS, FontAwesome 6 icons
* **Favicon**: Store SVG vector path (`/favicon.svg`) link

### Backend
* **Core**: Node.js, Express.js
* **Database**: MongoDB & Mongoose ODM
* **Security**: JWT Authentication, bcrypt password hashing
* **Static Assets**: Local static image file resolution under `/uploads`

---

## 📂 Project Structure

```text
E-Commerce/
├── backend/
│   ├── models/       # Mongoose Schemas (User, Product, GuestCart)
│   ├── routes/       # Express route handlers (Auth, Products, Cart)
│   ├── uploads/      # Uploaded product and category static images
│   ├── seed.js       # Database seeding script
│   └── server.js     # Express server entry point
├── frontend/
│   ├── public/       # Public folder (includes favicon.svg)
│   ├── src/
│   │   ├── components/  # Reusable UI components (Navbar, CartSidebar, Alert)
│   │   ├── context/     # Global state providers (Auth, Cart, Alerts)
│   │   ├── pages/       # Screen views (Home, Login, AdminPanel, Profile)
│   │   ├── App.jsx      # Router & provider layout wrapper
│   │   └── index.css    # Core stylesheet & responsive media queries
└── .gitignore        # Root gitignore excluding dependencies, builds & env files
```

---

## 💻 Setup & Installation

### Prerequisites
* [Node.js](https://nodejs.org) (v16 or higher)
* [MongoDB](https://www.mongodb.com) (Local community server or Atlas cluster URI)

### 1. Clone & Install Dependencies
Install dependencies in both directories:
```bash
# Install backend packages
cd backend
npm install

# Install frontend packages
cd ../frontend
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` folder:
```ini
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
```

### 3. Seed the Database
Populate MongoDB with default electronics, clothing, books, and sports products:
```bash
cd backend
node seed.js
```

### 4. Run the Application
Start the servers in separate terminals:

**Backend Server (port 5001)**:
```bash
cd backend
npm run dev
```

**Frontend Client (port 5173)**:
```bash
cd frontend
npm run dev
```

Open your browser to `http://localhost:5173` to explore ShopVault!
