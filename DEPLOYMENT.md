# Deployment Guide

This guide provides step-by-step instructions for deploying the Educational Content Sharing Platform to production.

## Prerequisites

- MongoDB Atlas account (free tier)
- Vercel account (for frontend)
- Render account (for backend)
- GitHub account

## Backend Deployment (Render)

### 1. Prepare MongoDB Atlas

1. Create a free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (free tier)
3. Create a database user with read/write permissions
4. Whitelist IP addresses (0.0.0.0/0 for Render)
5. Get your connection string (format: `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>`)

### 2. Push Backend to GitHub

1. Initialize git repository in the backend directory:
```bash
cd backend
git init
git add .
git commit -m "Initial commit"
```

2. Create a new repository on GitHub
3. Push to GitHub:
```bash
git remote add origin https://github.com/yourusername/edu-content-backend.git
git branch -M main
git push -u origin main
```

### 3. Deploy to Render

1. Create a Render account at https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure build settings:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add environment variables:
   - `PORT`: 5000
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Generate a secure random string (use: `openssl rand -base64 32`)
   - `JWT_EXPIRE`: 7d
   - `NODE_ENV`: production
6. Click "Deploy Web Service"
7. Wait for deployment to complete
8. Copy your backend URL (e.g., `https://edu-content-backend.onrender.com`)

## Frontend Deployment (Vercel)

### 1. Push Frontend to GitHub

1. Initialize git repository in the frontend directory:
```bash
cd frontend
git init
git add .
git commit -m "Initial commit"
```

2. Create a new repository on GitHub
3. Push to GitHub:
```bash
git remote add origin https://github.com/yourusername/edu-content-frontend.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel

1. Create a Vercel account at https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
5. Add environment variable:
   - `NEXT_PUBLIC_API_URL`: Your backend URL with `/api` suffix (e.g., `https://edu-content-backend.onrender.com/api`)
6. Click "Deploy"
7. Wait for deployment to complete
8. Copy your frontend URL

## Post-Deployment Configuration

### 1. Create Admin User

After deployment, you'll need to create an admin user:

1. Register a new account on your deployed frontend
2. Access MongoDB Atlas directly or use MongoDB Compass
3. Find the user in the `users` collection
4. Update the `role` field to `"admin"`

Or use MongoDB Compass:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### 2. Test the Application

1. Visit your frontend URL
2. Test registration and login
3. Test resource upload
4. Login as admin and test moderation
5. Test search and filter functionality
6. Test download and sharing features

## Monitoring and Maintenance

### Backend Monitoring (Render)

- View logs in Render dashboard
- Monitor CPU and memory usage
- Set up alerts for errors

### Frontend Monitoring (Vercel)

- View deployment logs in Vercel dashboard
- Monitor build times
- Set up analytics

### Database Monitoring (MongoDB Atlas)

- Monitor database performance
- Check storage usage
- Review slow queries

## Security Considerations

### Production Checklist

- [ ] Change JWT_SECRET to a strong random string
- [ ] Enable HTTPS (automatic on Vercel and Render)
- [ ] Set up rate limiting (already implemented)
- [ ] Enable CORS for your frontend domain only
- [ ] Regular security updates for dependencies
- [ ] Monitor for suspicious activity
- [ ] Regular backups of MongoDB data

### Environment Variables

Never commit `.env` files to GitHub. Always use environment variable management in your hosting platform.

## Scaling

### When to Scale

- High traffic (>1000 concurrent users)
- Large file uploads (>10MB)
- Complex search queries
- Many concurrent uploads

### Scaling Options

1. **Backend**: Upgrade Render plan for more CPU/RAM
2. **Database**: Upgrade MongoDB Atlas tier
3. **Frontend**: Vercel automatically scales
4. **CDN**: Use Cloudflare for static assets
5. **File Storage**: Consider AWS S3 or Cloudinary for large files

## Troubleshooting

### Common Issues

**Backend won't start**
- Check MongoDB connection string
- Verify environment variables are set
- Check Render logs for errors

**Frontend can't connect to backend**
- Verify NEXT_PUBLIC_API_URL is correct
- Check CORS configuration
- Ensure backend is running

**File uploads fail**
- Check file size limits
- Verify file type validation
- Check backend logs

**Authentication fails**
- Verify JWT_SECRET matches
- Check token expiration
- Verify user exists in database

## Backup Strategy

### MongoDB Backup

1. Enable automated backups in MongoDB Atlas
2. Regular exports using mongodump
3. Store backups in secure location

### Code Backup

1. Regular commits to GitHub
2. Tag releases
3. Maintain changelog

## Cost Estimation

### Free Tier Limits

- **MongoDB Atlas Free**: 512MB storage
- **Render Free**: 750 hours/month, limited RAM
- **Vercel Free**: 100GB bandwidth/month

### Estimated Costs (Growth)

- **MongoDB**: $9/month (basic tier)
- **Render**: $7/month (starter)
- **Vercel**: $20/month (pro)
- **Total**: ~$36/month for small production

## Support

For deployment issues:
- Check platform documentation (Render, Vercel, MongoDB Atlas)
- Review GitHub Issues
- Contact development team

---

**Note**: This deployment guide assumes you have basic knowledge of Git, Node.js, and cloud platforms. Adjust steps based on your specific requirements and expertise.
