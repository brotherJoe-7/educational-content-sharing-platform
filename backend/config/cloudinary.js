const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure storage for file uploads with mixed resource types
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    // Determine resource type based on MIME type
    const isImage = file.mimetype.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';
    
    const baseName = file.originalname.split('.').slice(0, -1).join('.');
    const safeBaseName = baseName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');

    return {
      folder: 'edu-content-platform',
      resource_type: resourceType,
      allowed_formats: isImage ? ['jpg', 'jpeg', 'png'] : ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'],
      public_id: `${Date.now()}-${Math.round(Math.random() * 1E9)}-${safeBaseName}`
    };
  }
});

module.exports = {
  cloudinary,
  storage
};
