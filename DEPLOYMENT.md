# SmartGrocer AI - Deployment Guide

## 1. Environment Setup

Create a `.env` file in the root directory (based on `.env.example`).

### Required Variables
| Variable | Description |
| :--- | :--- |
| `NODE_ENV` | Set to `production` for live deployment. |
| `MONGO_URI` | Connection string for MongoDB Atlas. |
| `JWT_SECRET` | Strong, random string for signing tokens. |
| `API_KEY` | Google Gemini API Key. |
| `CLIENT_URL` | URL of the frontend (e.g., https://my-grocery-app.vercel.app) to restrict CORS. |

## 2. Backend Deployment (Node.js/Express)

**Recommended Hosts:** Render, Heroku, or Railway.

1. **Install Dependencies**:
   ```bash
   npm install
   # Security packages required:
   npm install helmet express-rate-limit express-mongo-sanitize
   ```

2. **Build TypeScript**:
   ```bash
   npm run build # Using tsc
   ```

3. **Start Command**:
   ```bash
   node dist/backend/server.js
   ```

## 3. Frontend Deployment (React)

**Recommended Hosts:** Vercel or Netlify.

1. **Build**:
   The build command depends on your framework (Vite/Next.js/CRA).
   ```bash
   npm run build
   ```

2. **Environment**:
   Ensure the frontend knows the Backend API URL.
   If using Vite, add `VITE_API_URL` to your Vercel project settings.

## 4. Security Checklist

- [ ] **HTTPS**: Ensure all traffic is over HTTPS (handled automatically by Vercel/Render).
- [ ] **Database Access**: Whitelist only your backend server IP in MongoDB Atlas.
- [ ] **Secrets**: Never commit `.env` to GitHub.
- [ ] **Rate Limiting**: Enabled in `server.ts` to prevent abuse.
- [ ] **Data Sanitization**: `express-mongo-sanitize` is enabled to prevent NoSQL injection.
