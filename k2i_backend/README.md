# K2I – Knowledge2Intelligence Full-Stack Platform

Complete setup guide for the K2I website with authentication, user dashboard, and admin panel.

---

## 📁 Project Structure

```
k2i_project/
├── k2i_frontend/          ← React + Vite frontend (your existing code + additions)
└── k2i_backend/           ← Node.js + Express API
```

---

## 🚀 Backend Setup

### 1. Navigate to backend
```bash
cd k2i_backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure `.env` (already set with your values)
```env
PORT=7000
MONGODB_URI=mongodb+srv://sathishms1589_db_user:lll@cluster0.i5llbvl.mongodb.net/?appName=Cluster0
JWT_SECRET=30ec2a5eb80d13e275d7aae7a3e51b88
JWT_EXPIRES_IN=7d
ADMIN_SECRET_KEY=MSr@11234567890
NODE_ENV=production
BCRYPT_SALT_ROUNDS=12
ADMIN_EMAIL=sathish@gmail.com         ← UPDATE with real email
ADMIN_PASSWORD=MSr@15810@111
FRONTEND_URL=https://your-frontend.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-gmail@gmail.com       ← UPDATE
EMAIL_PASS=your-gmail-app-password    ← UPDATE (App Password, not normal pw)
MAX_ADMINS=4
```

### 4. Gmail App Password (for Forgot Password emails)
1. Enable 2FA on your Google account
2. Go to: Google Account → Security → App Passwords
3. Create an App Password for "Mail"
4. Paste that 16-char password into `EMAIL_PASS`

### 5. Start backend
```bash
npm start          # production
npm run dev        # development (with nodemon)
```

The server starts at **http://localhost:7000**

On first run, the default admin is created automatically:
- Email: `sathish@gmail.com`
- Password: `MSr@15810@111`

---

## 🎨 Frontend Setup

### 1. Navigate to frontend
```bash
cd k2i_frontend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure `.env`
```env
VITE_API_URL=http://localhost:7000/api
```
For production, change to your deployed backend URL.

### 4. Start frontend
```bash
npm run dev        # http://localhost:5173
npm run build      # production build
```

---

## 🔐 API Endpoints

### Auth (`/api/auth`)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/signup` | Register new user |
| POST | `/login` | Login |
| POST | `/forgot-password` | Send reset email |
| POST | `/reset-password/:token` | Reset password |
| GET | `/me` | Get current user (auth required) |
| POST | `/logout` | Logout |

### User (`/api/user`) — requires JWT
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/profile` | Get profile |
| PUT | `/profile` | Update profile |
| POST | `/profile/photo` | Upload profile photo |
| PUT | `/change-password` | Change password |
| GET | `/content` | Browse all content |
| GET | `/content/:id` | Get single content |

### Admin (`/api/admin`) — requires JWT + admin role
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/dashboard-stats` | Overview stats |
| GET | `/users` | List all users |
| PATCH | `/users/:id/toggle-status` | Activate/deactivate user |
| DELETE | `/users/:id` | Delete user |
| PATCH | `/users/:id/role` | Change user role |
| GET | `/content` | All content (incl. drafts) |
| POST | `/content` | Upload new content |
| PUT | `/content/:id` | Edit content |
| DELETE | `/content/:id` | Delete content |
| POST | `/create-admin` | Create new admin (requires ADMIN_SECRET_KEY) |

---

## 🛡️ Security Features

- **JWT Authentication** – 7-day tokens stored in localStorage
- **bcrypt** – 12 salt rounds for password hashing
- **Rate Limiting** – 10 auth attempts/15min; 3 reset requests/hour
- **Account Lockout** – Locked for 15 minutes after 5 failed logins
- **Input Validation** – express-validator on all inputs
- **Helmet** – Security headers
- **CORS** – Restricted to allowed frontend origins
- **Password Rules** – Min 8 chars, uppercase + number
- **Admin Cap** – Maximum 4 admins enforced in DB
- **Admin Guard** – Cannot delete/deactivate yourself or last admin

---

## 🌐 Frontend Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Home page |
| `/projects` | Public | Projects page |
| `/learning` | Public | Learning hub |
| `/about` | Public | About page |
| `/contact` | Public | Contact/Discussions |
| `/login` | Public only | Login page |
| `/signup` | Public only | Signup page |
| `/forgot-password` | Public only | Forgot password |
| `/reset-password/:token` | Public | Reset password |
| `/dashboard` | Auth required | User profile dashboard |
| `/admin` | Admin only | Admin control panel |

---

## 🚢 Deployment

### Backend (Railway / Render / VPS)
1. Push `k2i_backend/` to a repo
2. Set all env vars in the platform's dashboard
3. Set start command: `node server.js`

### Frontend (Vercel / Netlify)
1. Push `k2i_frontend/` to a repo
2. Set `VITE_API_URL=https://your-backend-url/api`
3. Deploy with build command: `npm run build`
4. Update backend `.env` → `FRONTEND_URL=https://your-frontend.vercel.app`

---

## 📝 Notes

- Uploaded files are stored in `k2i_backend/uploads/` (videos, docs, profile photos)
- For production, replace local file storage with AWS S3 or Cloudinary
- The admin panel is hidden — only admins can see it in the navbar
- User dashboard shows: name, email, phone, bio, join date, last login — NO progress/streaks
