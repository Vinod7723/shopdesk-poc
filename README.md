# React E-Commerce Management Platform


## Overview

A React E-Commerce Management Platform built with React 18, TypeScript, and Node.js.
Supports two user roles — Employee and Customer — each with their own dedicated portal,
JWT-based authentication, real-time stock management, and a 63-test suite.


---


## Architecture


                        +---------------------------+
                        |       React Frontend       |
                        |                           |
                        |  +--------+  +---------+  |
                        |  |  Auth  |  |  Cart / |  |
                        |  | Layer  |  |  Order  |  |
                        |  | (JWT)  |  | Context |  |
                        |  +--------+  +---------+  |
                        |                           |
                        |  +---------------------+  |
                        |  |   Product Mgmt      |  |
                        |  |   (CRUD + Stock)    |  |
                        |  +---------------------+  |
                        |                           |
                        |    Axios HTTP Client       |
                        +-------------+-------------+
                                      |
                                  REST API
                                      |
                        +-------------+-------------+
                        |    Node.js / Express       |
                        |                           |
                        |   Auth   Products  Users  |
                        |         Orders            |
                        |                           |
                        |        db.json            |
                        +---------------------------+


---


## Application Flow


    Customer Flow
    -------------
    Register --> Login --> Browse Shop --> View Product
        --> Add to Cart --> Checkout --> Order Confirmation --> Order History


    Employee Flow
    -------------
    Login (with Employee ID) --> Product Dashboard
        --> Add / Edit / Delete Products --> Manage Stock


---


## Key Features


    Authentication & Security
    -------------------------
    - Dual role system: Employee and Customer portals with separate JWT tokens
    - Per-tab session isolation using sessionStorage (new tabs always start fresh)
    - Role-based route guards that redirect unauthorized users
    - Conflict detection when switching roles within the same tab


    Employee Portal
    ---------------
    - Product dashboard with full CRUD operations
    - Paginated table (15 products per page) with search and category filter
    - Stock badges: In Stock / Low Stock (5 or less) / Out of Stock
    - Product image upload from computer (base64) or paste a URL


    Customer Portal
    ---------------
    - Shop page with product grid, search, category filter, 12 per page
    - Product detail view with stock status and Add to Cart
    - Cart with quantity controls capped at available stock
    - Checkout with shipping address form and order confirmation
    - Order history with expandable order cards
    - Profile page with user details and role badge


---


## Tech Stack


    Layer                   Technology
    ----------------------  --------------------------------
    Frontend Framework      React 18 + TypeScript
    Build Tool              Vite 5
    Styling                 Tailwind CSS 3
    Routing                 React Router v6
    Forms                   React Hook Form
    HTTP Client             Axios with interceptors
    State Management        React Context API
    Testing                 Vitest + React Testing Library
    Backend                 Node.js + Express
    Data Storage            JSON file store (db.json)


---


## Project Structure


    shopdesk-poc/
    |
    +-- frontend/                        React + TypeScript application
    |   |
    |   +-- src/
    |   |   |
    |   |   +-- components/
    |   |   |   +-- Navbar.tsx               Employee navigation bar
    |   |   |   +-- CustomerNavbar.tsx       Customer navigation with cart badge
    |   |   |   +-- ProtectedRoute.tsx       Role-based route guard
    |   |   |
    |   |   +-- context/
    |   |   |   +-- AuthContext.tsx          JWT auth, role management, session isolation
    |   |   |   +-- CartContext.tsx          Cart state with sessionStorage persistence
    |   |   |
    |   |   +-- pages/
    |   |   |   +-- Login.tsx               Dual-tab login (Customer / Employee)
    |   |   |   +-- Signup.tsx              User registration
    |   |   |   +-- ProductList.tsx         Employee product dashboard
    |   |   |   +-- AddProduct.tsx          Create product with image upload
    |   |   |   +-- EditProduct.tsx         Edit product with image upload
    |   |   |   +-- ProductDetail.tsx       Employee product detail view
    |   |   |   +-- Shop.tsx                Customer product grid
    |   |   |   +-- ShopProductDetail.tsx   Customer product detail
    |   |   |   +-- Cart.tsx                Shopping cart
    |   |   |   +-- Checkout.tsx            Order placement
    |   |   |   +-- OrderHistory.tsx        Past orders
    |   |   |   +-- Profile.tsx             User profile
    |   |   |   +-- ChangePassword.tsx      Password management
    |   |   |
    |   |   +-- services/
    |   |   |   +-- api.ts                  Axios instance with JWT interceptors
    |   |   |
    |   |   +-- test/
    |   |   |   +-- Login.test.tsx
    |   |   |   +-- AuthContext.test.tsx
    |   |   |   +-- CartContext.test.tsx
    |   |   |   +-- ProtectedRoute.test.tsx
    |   |   |   +-- Cart.test.tsx
    |   |   |   +-- OrderHistory.test.tsx
    |   |   |
    |   |   +-- types/
    |   |       +-- index.ts                TypeScript interfaces
    |   |
    |   +-- index.html
    |   +-- vite.config.ts
    |   +-- tailwind.config.js
    |   +-- package.json
    |
    +-- backend/                         Node.js + Express API
        +-- server.js                    Express REST API
        +-- db.json                      Product and user data store
        +-- package.json


---


## Test Coverage


    Test File                   Tests   What is Covered
    --------------------------  ------  ------------------------------------------
    Login.test.tsx              14      Tab switching, form validation, API mocking
    AuthContext.test.tsx        11      Session restore, conflict detection, logout
    CartContext.test.tsx        11      Add / remove / update / clear, totals
    ProtectedRoute.test.tsx      7      Auth guards, role-based redirects
    Cart.test.tsx               10      Stock limit UI, remove item, order summary
    OrderHistory.test.tsx       10      Empty state, expand / collapse, shipping
    --------------------------  ------  ------------------------------------------
    Total                       63


---


## API Endpoints


    Authentication
    --------------
    POST   /auth/login           Customer login - returns JWT and role
    POST   /auth/employee-login  Employee login with Employee ID
    POST   /users                Register new user

    Products
    --------
    GET    /products             List all products
    GET    /products/:id         Get single product
    POST   /products             Create product (Employee only)
    PUT    /products/:id         Update product and stock (Employee only)
    DELETE /products/:id         Delete product (Employee only)

    Users
    -----
    GET    /users/me             Get logged-in user profile


---


## Getting Started


    Prerequisites
    -------------
    - Node.js 18 or higher
    - npm


    1. Clone the Repository
    -----------------------
    git clone https://github.com/Vinod7723/shopdesk-poc.git
    cd shopdesk-poc


    2. Start the Backend
    --------------------
    cd backend
    npm install
    node server.js
    API running at http://localhost:3001


    3. Start the Frontend
    ---------------------
    cd frontend
    npm install
    npm run dev
    App running at http://localhost:5173


    4. Run Tests
    ------------
    cd frontend
    npm test
    63 tests across 6 test files


---


## Design Decisions


    Why role-scoped localStorage keys?
    -----------------------------------
    Using emp_token and cust_token as separate keys ensures an employee and customer
    can be logged in simultaneously across different tabs without either session being
    wiped when the other logs out.


    Why sessionStorage for active role?
    ------------------------------------
    sessionStorage is tab-specific and survives page reloads but not new tab opens.
    This gives per-tab isolation — each tab independently tracks which role it is using.


    Why base64 for uploaded images?
    --------------------------------
    Storing images as base64 data URLs eliminates the need for a file storage server
    in this POC, while also bypassing browser hotlink-blocking restrictions that
    break external image URLs.


---


## Author

Vinod Reddy Billipalli
GitHub: https://github.com/Vinod7723
