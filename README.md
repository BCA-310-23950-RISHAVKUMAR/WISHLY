# Wishly - Men's E-Commerce Website

Wishly is a full-stack men-only fashion e-commerce project built with:

- React + Vite (frontend)
- Node.js + Express (backend)
- MongoDB + Mongoose (database)

Design theme is premium **black + purple**, with a fast shopping flow suitable for a college project demo.

## Features

- Men-only premium product catalog
- Search, filter, and sort products
- Product details with size/quantity selection
- Cart with localStorage persistence
- User registration and login (JWT auth)
- Checkout with shipping details
- Online payment-ready flow (Razorpay + Stripe, demo mode by default)
- Order creation and "My Orders" page
- Admin panel for products and orders
- Admin product image upload (local file upload + URL option)
- About, Contact, FAQ, and Privacy pages
- Skeleton loading states and enhanced motion UI
- MongoDB seed script with demo products

## Project Structure

```text
wishly-fullstack/
  client/    # React app
  server/    # Express API
```

## Setup

1. Install dependencies

```bash
npm install
npm --prefix server install
npm --prefix client install
```

2. Configure environment files

- Copy `server/.env.example` to `server/.env`
- Copy `client/.env.example` to `client/.env`

3. Start MongoDB locally (default URI used in env):

```text
mongodb://127.0.0.1:27017/wishly
```

4. Seed product data

```bash
npm run seed
```

5. Run frontend + backend together

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Admin dashboard: `http://localhost:5173/admin`

## One-Click Start (Windows)

Double-click:

```text
start-wishly.bat
```

It will:

- create missing `.env` files
- install missing dependencies
- seed database on first run
- start frontend + backend together

## Demo Admin Account

Seed creates:

- Email: `rishavkumar181815@gmail.com`
- Password: `Rishav@15`

## Payment Configuration (Optional Live Mode)

By default, checkout uses demo payment confirmation so the project works immediately.

To enable live gateway sessions, set these in `server/.env`:

```env
STRIPE_SECRET_KEY=your_stripe_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

## Notes

- This project is inspired by premium fashion storefront patterns but uses original branding/content for **Wishly**.
- Optimized for speed with compressed API responses, cached product endpoints, and lightweight client state.
