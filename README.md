# Open Content Sierra Leone

A legal, open educational resource sharing platform built for educators and students across Sierra Leone.

---

## Overview

Open Content Sierra Leone is a full-stack web platform that enables educators to upload and share educational materials — including past papers, notes, tutorials, and presentations — while ensuring all content is moderated, legally licensed, and freely accessible.

---

## Architecture

| Layer | Location | Description |
|-------|----------|-------------|
| Frontend | `/frontend` | React/Next.js browser application — what users see and interact with |
| Backend | `/backend` | Node.js/Express API server — handles data, auth, and file management |

The frontend and backend are separate processes that communicate over HTTP REST. They can be deployed independently.

The **Admin Dashboard** (`/frontend/pages/admin.js`) is a frontend page, but it only works by calling protected **admin API routes** in the backend. It is not a backend — it is a secure frontend UI.

---

## Tech Stack

### Frontend (`/frontend`)
- Next.js 14 (React)
- Vanilla CSS with inline style injection (SSR-safe)
- React Context API for auth state
- React Hook Form for validation
- Lucide React for icons
- React Hot Toast for notifications

### Backend (`/backend`)
- Node.js + Express.js
- MongoDB Atlas (cloud database)
- Cloudinary (file storage for PDFs, documents, images)
- JWT (JSON Web Tokens) for authentication
- bcrypt for password hashing
- Helmet + express-rate-limit for security
- Multer for file upload handling
- Winston for server logging

---

## Project Structure

```
Educational Content Sharing Platform/
├── backend/
│   ├── config/
│   │   └── cloudinary.js        # Cloudinary SDK config and Multer storage adapter
│   ├── middleware/
│   │   └── auth.js              # JWT protect + role-based authorize middleware
│   ├── models/
│   │   ├── User.js              # User schema (name, email, role, password hash)
│   │   └── Resource.js          # Resource schema (title, file, status, auditTrail, ratings)
│   ├── routes/
│   │   ├── auth.js              # Register, Login, Get current user
│   │   ├── resources.js         # Upload, list, download, rate resources
│   │   ├── admin.js             # Admin-only moderation and user management routes
│   │   ├── search.js            # Full-text search with filters
│   │   └── stats.js             # Public statistics for the landing page
│   ├── utils/
│   │   └── logger.js            # Winston logger (info, warn, error)
│   ├── createAdmin.js           # One-time script to create the admin account
│   ├── server.js                # Main Express entry point
│   └── .env                     # Secret environment variables (never commit this file)
│
├── frontend/
│   ├── context/
│   │   └── AuthContext.js       # React context: login, logout, current user state
│   ├── pages/
│   │   ├── index.js             # Landing page with search hero and platform stats
│   │   ├── login.js             # Login form
│   │   ├── register.js          # Registration form
│   │   ├── resources.js         # Resource browser with search and filters
│   │   ├── upload.js            # Resource upload form (authenticated)
│   │   ├── admin.js             # Admin dashboard: stats, moderation, users, analytics
│   │   ├── privacy.js           # Privacy policy
│   │   └── terms.js             # Terms of use
│   ├── styles/
│   │   └── globals.css
│   ├── .env.local               # Frontend environment variables
│   └── package.json
│
└── README.md
```

---

## Environment Variables

### Backend (`backend/.env`)

```
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/educontent?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRE=7d
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

For production, change to your live backend URL:

```
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
```

---

## Service Setup Guides

### MongoDB Atlas

MongoDB Atlas is the cloud database service used by the platform. The free tier is sufficient.

1. Go to [https://cloud.mongodb.com](https://cloud.mongodb.com) and create a free account.
2. Click **New Project**, give it a name (e.g. `OpenContentSL`), and click **Create Project**.
3. Click **Build a Database**, select the **Free** (M0) tier, choose a region close to you (e.g. AWS - Ireland), and click **Create**.
4. Create a **database user**:
   - Go to **Database Access** in the left menu.
   - Click **Add New Database User**.
   - Choose **Password** authentication.
   - Set a username and a strong password — save these, you will need them.
   - Set **Database User Privileges** to **Read and write to any database**.
   - Click **Add User**.
5. Allow network access:
   - Go to **Network Access** in the left menu.
   - Click **Add IP Address**.
   - For development, click **Allow Access from Anywhere** (0.0.0.0/0). For production, add only your server's IP.
   - Click **Confirm**.
6. Get your connection string:
   - Go to **Database** in the left menu.
   - Click **Connect** on your cluster.
   - Choose **Connect your application**.
   - Copy the connection string. It looks like:
     `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`
   - Replace `<username>` and `<password>` with what you set in step 4.
   - Append the database name: `.../educontent?retryWrites=true&w=majority`
7. Paste the full URI as `MONGODB_URI` in your `backend/.env` file.

---

### Cloudinary

Cloudinary stores all uploaded files (PDFs, DOCX, PPT, images). The free tier provides 25GB storage.

1. Go to [https://cloudinary.com](https://cloudinary.com) and create a free account.
2. After logging in, go to your **Dashboard**.
3. You will see your **Cloud Name**, **API Key**, and **API Secret** displayed directly on the dashboard.
4. Copy these three values into your `backend/.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
5. In your Cloudinary dashboard, go to **Settings > Upload**.
6. Scroll to **Upload presets** and ensure unsigned uploads are disabled for security (the backend signs all uploads using your API secret).
7. No further configuration is needed — the backend's `config/cloudinary.js` handles folder organization and resource type detection automatically.

---

## Local Development Setup

### Prerequisites
- Node.js v16 or higher
- npm
- A MongoDB Atlas cluster (see above)
- A Cloudinary account (see above)

### Step 1 — Backend

```bash
cd backend
npm install
```

Create `backend/.env` with all required values (see Environment Variables section), then:

```bash
npm run dev
```

The server starts on `http://localhost:5000`. You can verify it is running by visiting `http://localhost:5000` — you will see a JSON status response.

### Step 2 — Create Admin Account

With the backend running, open a second terminal in the `backend` folder:

```bash
node createAdmin.js
```

Default credentials created:
- **Email**: `admin@educonnectsl.org`
- **Password**: `AdminPassword2026!`

Change these after your first login.

### Step 3 — Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

---

## API Reference

The full interactive API reference is available at `http://localhost:5000/docs` when the backend is running.

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | None | Register a new user |
| POST | `/api/auth/login` | None | Login and receive JWT |
| GET | `/api/auth/me` | Required | Get the current user profile |

### Resources

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/resources` | None | Get all approved resources (paginated) |
| GET | `/api/resources/:id` | None | Get a single resource |
| POST | `/api/resources/upload` | Required | Upload a new resource (multipart form) |
| GET | `/api/resources/:id/download` | None | Increment download count, get download URL |
| GET | `/api/resources/:id/download/proxy` | None | Stream file directly from Cloudinary |
| POST | `/api/resources/:id/rating` | Required | Submit a rating (1-5) and optional comment |

### Admin (requires admin role JWT)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics and growth analytics |
| GET | `/api/admin/resources/pending` | All resources awaiting review |
| GET | `/api/admin/resources/all` | All resources with optional status filter |
| PUT | `/api/admin/resources/:id/approve` | Approve a pending resource |
| PUT | `/api/admin/resources/:id/reject` | Reject with a required reason |
| POST | `/api/admin/resources/:id/reupload` | Replace a resource's file |
| GET | `/api/admin/users` | List all registered users |
| PUT | `/api/admin/users/:id/promote` | Grant admin role to a user |
| DELETE | `/api/admin/users/:id` | Permanently delete a user account |

### Search & Stats

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/search?q=&subject=&gradeLevel=` | Full-text search with filters |
| GET | `/api/search/filters` | All available filter options |
| GET | `/api/stats` | Public platform statistics |

---

## Feature Testing Reference

| Feature | How to test |
|---------|------------|
| Read resource | Click **Read** on any resource card — opens the Cloudinary file URL in a new tab |
| Download resource | Click **Download** on any resource card — the backend increments the counter and streams the file |
| Rate resource | Click the star icon on any resource card — select 1-5 stars and submit (requires login) |
| Upload resource | Log in, go to `/upload`, complete the form and attach a file (PDF, DOCX, PPT, etc.) |
| Admin approve | Log in as admin, go to `/admin`, click Pending Reviews, click Approve |
| Admin reject | Same as above, click Reject and provide a reason |
| Delete user | Admin dashboard, Users tab, click the delete button on any non-admin user |
| Search | Use the search bar on the home page or resources page |
| Activity Logs | Admin dashboard, Logs tab — displays chronological list of all platform actions |

---

## Enhanced Activity Logging

The platform automatically tracks and securely logs all significant user activities across the system, visible only to administrators in the **Activity Logs** dashboard tab. This includes:

### Captured Events:
- **Authentication**: `user_registered`, `user_login`, `user_login_failed`, `user_login_suspended`, `user_logout`
- **Content Engagement**: `resource_viewed`, `resource_downloaded`, `resource_rated`
- **Content Moderation**: `resource_uploaded`, `resource_approved`, `resource_rejected`, `deleted_resource`, `file_replaced`
- **User Management**: `user_promoted`, `user_suspended`, `user_activated`, `user_deleted`

### Logged Data Points:
- Timestamp of the action
- The specific action performed
- Target resource or user affected
- The identity of the user who performed the action (Name, Email, Role)
- **Security Data**: IP Address and User Agent of the request

---

## Deployment

### Step 1 — Set Up MongoDB Atlas (Production)

Follow the MongoDB Atlas setup guide above. When adding network access for production, add your Render backend server's outbound IP address instead of allowing all IPs.

### Step 2 — Set Up Cloudinary (Production)

The same Cloudinary account used in development works for production. No additional configuration is needed.

### Step 3 — Deploy the Backend to Render

1. Push your full repository to GitHub.
2. Go to [https://render.com](https://render.com) and sign in.
3. Click **New** > **Web Service**.
4. Connect your GitHub account and select the repository.
5. Configure the service:
   - **Name**: `opencontentsl-backend` (or any name)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Add environment variables (click **Environment** tab):
   - `PORT` = `5000`
   - `MONGODB_URI` = your full Atlas connection string
   - `JWT_SECRET` = a long random secret string
   - `JWT_EXPIRE` = `7d`
   - `NODE_ENV` = `production`
   - `CLOUDINARY_CLOUD_NAME` = your cloud name
   - `CLOUDINARY_API_KEY` = your API key
   - `CLOUDINARY_API_SECRET` = your API secret
7. Click **Create Web Service**. Render will build and deploy automatically.
8. Copy your backend URL (e.g. `https://opencontentsl-backend.onrender.com`).

### Step 4 — Deploy the Frontend to Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **New Project** and import your repository.
3. Configure the project:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Next.js`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = `https://opencontentsl-backend.onrender.com/api`
5. Click **Deploy**.
6. Once deployed, copy your Vercel frontend URL.

### Step 5 — Allow Frontend Origin in Backend CORS

Open `backend/server.js` and add your Vercel URL to the `allowedOrigins` array:

```js
const allowedOrigins = [
  "https://your-project.vercel.app",   // add this
  "http://localhost:3000",
  ...
];
```

Commit and push — Render will auto-redeploy.

### Step 6 — Create Admin on Production

After both services are live, run the admin creation script pointed at your production database. Update your local `backend/.env` temporarily to use the production `MONGODB_URI`, then:

```bash
node createAdmin.js
```

Then revert your local `.env` back to your development URI.

---

## Security

- Passwords hashed with bcrypt (salt rounds 12)
- JWT tokens expire after 7 days
- Admin routes verify both valid token and admin role
- Rate limiting: 200 req/15 min in production
- Helmet sets secure HTTP response headers
- CORS restricted to approved frontend origins
- File uploads validated for MIME type and capped at 10MB
- All MongoDB query inputs sanitized

---

## Content Licensing

| License | Description |
|---------|-------------|
| Creative Commons BY | Attribution required |
| Creative Commons BY-SA | Attribution and share-alike required |
| Creative Commons BY-NC | Non-commercial use only |
| OER | Open Educational Resources standard |
| Public Domain | No restrictions |

---

## Team Roles

| Role | Responsibilities |
|------|-----------------|
| Lead Developer | System design, backend API, frontend implementation |
| Legal Analyst | Privacy policy, license compliance |
| Documentation Lead | README, API docs, repository management |
| Presenter | Demo slides, live demonstration |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit changes: `git commit -m "Add: your change description"`
4. Push: `git push origin feature/your-feature-name`
5. Open a Pull Request for review

---

## License

MIT License — see LICENSE file for details.

---

**Open Content Sierra Leone** — Empowering education through open resource sharing.
