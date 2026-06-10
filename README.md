# Educational Content Sharing Platform - Sierra Leone

A legal and ethical platform for sharing open educational resources in Sierra Leone. Built with React (Next.js), Node.js (Express), and MongoDB.

## 🎯 Project Overview

This platform enables educators and students in Sierra Leone to share and access educational resources including:
- PDFs and notes
- Past papers
- Tutorials
- Educational materials

All content is moderated and licensed under open licenses (Creative Commons, OER) to ensure legal and ethical sharing.

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (React)
- **Styling**: TailwindCSS
- **State Management**: React Context API
- **Forms**: React Hook Form
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Atlas)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **File Upload**: Multer
- **Security**: Helmet, Rate Limiting, CORS

## 🚀 Features

### Core Features
1. **User Authentication**
   - Registration with privacy consent
   - Secure login with JWT tokens
   - Password hashing with bcrypt

2. **Resource Upload**
   - Upload PDFs, DOC, DOCX, PPT, PPTX files
   - Metadata: subject, grade level, author, license type
   - File size limit: 10MB

3. **Content Moderation**
   - Admin dashboard for approval/rejection
   - Audit trail for compliance
   - User management

4. **Search & Filter**
   - Search by keyword, subject, grade level
   - Filter by license type
   - Sort by rating, downloads, date

5. **Download & Sharing**
   - Download resources in original format
   - Share via WhatsApp/email integration
   - Track download counts

6. **Privacy & Legal Compliance**
   - Privacy policy page
   - Data minimization (only essential info)
   - Encrypted passwords
   - Content moderation

### Innovative Features
- **Ratings & Comments**: Community feedback system
- **Download Tracking**: Monitor resource popularity
- **Audit Trail**: Full compliance tracking
- **Role-Based Access**: Admin and user roles

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas account)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure `.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/edu-content-platform
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

5. Start the backend server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.local.example .env.local
```

4. Configure `.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

5. Start the frontend development server:
```bash
npm run dev
```

## 🌐 Usage

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### User Workflow
1. **Register**: Create an account with privacy consent
2. **Login**: Sign in with email and password
3. **Browse**: Search and filter educational resources
4. **Download**: Access approved resources
5. **Upload**: Contribute your own educational materials
6. **Rate**: Provide feedback on resources

### Admin Workflow
1. **Login** as admin user
2. **Access Dashboard**: View statistics and pending resources
3. **Moderate**: Approve or reject uploaded resources
4. **Manage Users**: Promote users to admin role
5. **Monitor**: Track resource downloads and ratings

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting to prevent brute-force attacks
- Helmet middleware for security headers
- CORS configuration
- Input validation with express-validator
- File type validation
- File size limits

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Why MIT License?
- Permissive and simple to understand
- Allows maximum freedom for use and modification
- Compatible with other open-source licenses
- Aligns with our mission of open educational resource sharing
- Low barrier for community adoption and contribution

## 📚 Content Licensing

Educational content shared on the platform uses various open licenses:
- **Creative Commons BY**: Attribution required
- **Creative Commons BY-SA**: Attribution and share-alike required
- **Creative Commons BY-NC**: Attribution required, non-commercial use only
- **OER**: Open Educational Resources licenses
- **Public Domain**: No restrictions on use

## 👥 Team Roles

- **Lead Developer**: System design and implementation
- **Legal Analyst**: Privacy policy, license justification
- **Documentation Lead**: GitHub repository, README, screenshots
- **Presenter**: Slides and live demo

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 Documentation

- [Privacy Policy](/privacy) - Full privacy policy details
- [License Information](/license) - MIT license and content licensing
- [API Documentation](#api-endpoints) - Available API endpoints

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Resources
- `POST /api/resources/upload` - Upload resource (authenticated)
- `GET /api/resources` - Get all approved resources
- `GET /api/resources/:id` - Get single resource
- `GET /api/resources/:id/download` - Download resource
- `POST /api/resources/:id/rating` - Add rating/comment (authenticated)

### Admin
- `GET /api/admin/stats` - Get dashboard statistics (admin)
- `GET /api/admin/resources/pending` - Get pending resources (admin)
- `PUT /api/admin/resources/:id/approve` - Approve resource (admin)
- `PUT /api/admin/resources/:id/reject` - Reject resource (admin)
- `GET /api/admin/users` - Get all users (admin)
- `PUT /api/admin/users/:id/promote` - Promote user to admin (admin)

### Search
- `GET /api/search` - Search resources with filters
- `GET /api/search/filters` - Get available filter options

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Backend (Render)
1. Connect GitHub repository to Render
2. Configure environment variables
3. Set up MongoDB Atlas connection
4. Deploy automatically on push

## 📞 Support

For questions or issues, please open an issue on GitHub or contact the development team.

## 🙏 Acknowledgments

- Built for educational access in Sierra Leone
- Open educational resources community
- Creative Commons licensing
- Sierra Leone educational initiatives

---

**EduShare Sierra Leone** - Empowering education through open resource sharing.
