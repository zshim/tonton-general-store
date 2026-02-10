# SmartGrocer AI - System Architecture

## 1. High-Level Architecture
The application follows a standard **MERN Stack** (MongoDB, Express, React, Node.js) architecture with a decoupled frontend and backend.

### Frontend (Client)
- **Framework**: React (Create React App / Vite) or Next.js
- **Styling**: Tailwind CSS
- **State Management**: React Context API (for User, Cart, Auth)
- **AI Integration**: Google Gemini API (Direct client-side or proxied via backend)

### Backend (Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Atlas)
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Firebase Cloud Messaging (FCM) for push notifications

---

## 2. Folder Structure

### Root
```
/
├── client/                 # Frontend React App
│   ├── src/
│   │   ├── components/     # Reusable UI components (Layout, Cards)
│   │   ├── pages/          # Route pages (Login, Dashboard, Shop)
│   │   ├── context/        # Global State (AppContext)
│   │   ├── services/       # API calls & Gemini integration
│   │   ├── types/          # TypeScript interfaces
│   │   └── App.tsx         # Main entry
├── server/                 # Backend Node App
│   ├── config/             # DB connection, Env vars
│   ├── controllers/        # Route logic
│   ├── models/             # Mongoose Schemas (User, Product, etc.)
│   ├── routes/             # API Endpoints
│   ├── middleware/         # Auth, Error handling
│   └── app.js              # Server entry
```

---

## 3. Role-Based Access Control (RBAC)

| Feature | Shop Manager | Customer |
| :--- | :---: | :---: |
| **Auth** | Login/Logout | Login/Logout |
| **Product Inventory** | Create, Read, Update, Delete | Read Only |
| **Orders** | View All, Update Status | View Own History |
| **Shopping Cart** | N/A | Add/Remove Items, Checkout |
| **Dues Management** | View All User Dues, Send Reminders | View Own Dues, Pay Dues |
| **Analytics** | Full Access (Sales, Rev, AI Insights) | N/A |
| **Notifications** | Send Custom Alerts | Receive Alerts |

---

## 4. Key Workflows

### A. Order Placement
1. Customer adds items to Cart.
2. Checkout initiates `POST /api/orders`.
3. Server:
   - Calculates totals.
   - Creates `Order` document.
   - Creates `Transaction` (Debit) for the total amount.
   - If `amountPaid > 0`, creates `Transaction` (Credit).
   - Updates User's `pendingDues` = `total - amountPaid`.
   - Sends FCM notification to Manager.

### B. Dues Payment
1. Customer views Pending Dues on Dashboard.
2. Selects "Pay Dues".
3. Server:
   - Creates `Transaction` (Credit).
   - Updates User's `pendingDues`.
   - If dues are cleared, sends "Thank You" notification.

### C. AI Smart Chef
1. Frontend sends cart items/history to Gemini API.
2. Gemini returns recipe suggestions.
3. Displayed to user to encourage further purchases.
