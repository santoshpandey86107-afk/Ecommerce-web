# ShopWave

A full-stack ecommerce storefront with a React frontend and an Express backend.

## Project structure

- frontend: Vite + React storefront
- backend: Express API for products, auth, and orders

## Run locally

### 1. Install dependencies

```bash
npm install
```

### 2. Start both apps

```bash
npm run dev
```

This will run:
- frontend at http://localhost:3000/
- backend at http://localhost:5000/

## Backend API

- GET /api/health
- GET /api/products
- GET /api/products/categories
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- POST /api/orders
- GET /api/orders/my
- GET /api/payment/config

## Deployment

- Frontend: deploy the frontend folder to Vercel or Netlify
- Backend: deploy the backend folder to Render or Railway
- Set the frontend API base URL to your deployed backend URL

### Vercel frontend deployment

1. In Vercel, import this repository.
2. Set the root directory to `frontend`.
3. Use the build command `npm run build` and output directory `dist`.
4. Make sure `frontend/vercel.json` is included in your repo.

### Backend deployment

The backend is an Express API and is best deployed separately. Use services like Render, Railway, or a VPS. Then update `VITE_API_URL` in your frontend deployment to point to the backend URL.
