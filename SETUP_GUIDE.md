# Quick Setup Guide

This guide will help you get the Educational Content Sharing Platform running locally in under 10 minutes.

## Prerequisites

- Node.js (v16 or higher) - [Download here](https://nodejs.org/)
- MongoDB (local or Atlas account) - [Download here](https://www.mongodb.com/try/download/community)
- Git - [Download here](https://git-scm.com/downloads)
- Code editor (VS Code recommended) - [Download here](https://code.visualstudio.com/)

## Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/educational-content-sharing-platform.git
cd educational-content-sharing-platform
```

## Step 2: Backend Setup

### 2.1 Install Dependencies

```bash
cd backend
npm install
```

### 2.2 Configure Environment

```bash
# Copy example environment file
cp .env.example .env
```

Edit `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/edu-content-platform
JWT_SECRET=change_this_to_a_secure_random_string
JWT_EXPIRE=7d
NODE_ENV=development
```

### 2.3 Start MongoDB

**Option A: Local MongoDB**
```bash
# On Windows
mongod

# On macOS/Linux
sudo mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 2.4 Start Backend Server

```bash
npm run dev
```

Backend should be running at http://localhost:5000

## Step 3: Frontend Setup

### 3.1 Install Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### 3.2 Configure Environment

```bash
# Copy example environment file
cp .env.local.example .env.local
```

Edit `.env.local` file:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3.3 Start Frontend Server

```bash
npm run dev
```

Frontend should be running at http://localhost:3000

## Step 4: Test the Application

### 4.1 Access the Application

Open your browser and go to: http://localhost:3000

### 4.2 Create First User

1. Click "Register"
2. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Check privacy consent
3. Click "Create account"

### 4.3 Create Admin User

After registration, you need to promote yourself to admin:

**Using MongoDB Compass:**
1. Open MongoDB Compass
2. Connect to your database
3. Go to `users` collection
4. Find your user by email
5. Edit the document and change `role` to `"admin"`

**Using MongoDB Shell:**
```bash
mongo
use edu-content-platform
db.users.updateOne(
  { email: "test@example.com" },
  { $set: { role: "admin" } }
)
exit
```

### 4.4 Test Features

1. **Upload Resource**
   - Login as admin
   - Go to "Upload"
   - Fill in metadata
   - Upload a PDF file
   - Submit

2. **Moderate Content**
   - Go to "Admin Dashboard"
   - Approve the pending resource

3. **Browse Resources**
   - Go to "Resources"
   - Search and filter
   - Download approved resource

## Troubleshooting

### Backend won't start

**Problem**: `MONGODB_URI connection error`

**Solution**:
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB is accessible

### Frontend can't connect to backend

**Problem**: API requests failing

**Solution**:
- Ensure backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors

### File upload fails

**Problem**: Upload error

**Solution**:
- Check file size (max 10MB)
- Verify file type (PDF, DOC, DOCX, PPT, PPTX)
- Check backend logs for errors

### Registration fails

**Problem**: User already exists

**Solution**:
- Use a different email
- Or delete existing user from database

## Next Steps

After successful setup:

1. **Explore Features**
   - Upload more resources
   - Test search and filters
   - Try ratings and comments
   - Test admin dashboard

2. **Customize**
   - Update colors in Tailwind config
   - Modify subjects and grade levels
   - Add custom licenses

3. **Deploy**
   - Follow DEPLOYMENT.md for production setup
   - Deploy to Vercel (frontend) and Render (backend)

## Useful Commands

### Backend
```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm start            # Start production server
```

### Frontend
```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
```

## Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review the main README.md
3. Check GitHub Issues
4. Contact the development team

## Security Notes

- Change `JWT_SECRET` in production
- Use strong passwords
- Don't commit `.env` files
- Enable HTTPS in production

---

**Setup complete!** 🎉 You're now ready to use the Educational Content Sharing Platform.
