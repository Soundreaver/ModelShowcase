# Model Showcase - Deployment Guide

This project consists of a React frontend deployed on Vercel and an Express backend deployed on Render.

## Architecture

- **Frontend (client/)**: React + Vite + TypeScript, deployed on Vercel
- **Backend (server/)**: Express + TypeScript, deployed on Render
- **Data Storage**: In-memory storage (temporary, resets on server restart)
- **File Storage**: Cloudflare R2 (with local fallback)

## Frontend Deployment (Vercel)

### Prerequisites
1. Fork/clone this repository
2. Create a Vercel account

### Steps
1. Connect your GitHub repository to Vercel
2. Configure the build settings:
   - **Build Command**: `cd client && npm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `cd client && npm install`
3. Set environment variables:
   - `VITE_API_URL`: Your backend URL (e.g., `https://your-app.onrender.com`)
4. Deploy

### Environment Variables (Frontend)
```
VITE_API_URL=https://your-backend-url.onrender.com
```

## Backend Deployment (Render)

### Prerequisites
1. Create a Render account

### Steps
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the build settings:
   - **Build Command**: `cd server && npm install && npm run build`
   - **Start Command**: `cd server && npm start`
4. Set environment variables (see below)

### Environment Variables (Backend)
```
# Server Configuration
PORT=10000
NODE_ENV=production

# Cloudflare R2 Storage
R2_ACCOUNT_ID=your_cloudflare_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_r2_bucket_name
R2_PUBLIC_URL=https://your-r2-public-url.com/

# Optional: Google Cloud Storage (legacy support)
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
PRIVATE_OBJECT_DIR=/your-bucket/uploads
PUBLIC_OBJECT_SEARCH_PATHS=/your-bucket/public
```

**Note**: This project uses in-memory storage for models and images. Data will be temporary and reset when the server restarts. For production use, you may want to implement persistent database storage.

## Local Development

### Setup
1. Install dependencies: `npm install`
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Build the client: `npm run build`
4. Start development server: `npm run dev`

### Separate Development
To run frontend and backend separately:

#### Frontend
```bash
cd client
npm install
npm run dev
```

#### Backend
```bash
cd server
npm install
npm run dev
```

## File Upload System

The application includes multiple file storage options:
- **Cloudflare R2**: Primary cloud storage solution (recommended for production)
- **Local Storage**: Files stored in `server/uploads/` (fallback/development)
- **Google Cloud Storage**: Optional legacy support

The system uses Cloudflare R2 when configured, with local storage as fallback.

## Data Storage

The application currently uses **in-memory storage** for storing model and image metadata:
- Model and image information is stored temporarily in JavaScript Maps
- Data persists only while the server is running
- Server restarts will clear all stored data
- File uploads to Cloudflare R2 are permanent, but metadata is temporary

**Important**: For production use, consider implementing persistent database storage to maintain model/image records across server restarts.

## Project Structure

```
ModelShowcase/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── dist/              # Build output
├── server/                 # Backend (Express)
│   ├── index.ts
│   ├── routes.ts
│   ├── localStorage.ts    # File storage fallback
│   ├── package.json
│   └── dist/              # Build output
├── shared/                 # Shared types/schemas
├── vercel.json            # Vercel configuration
└── DEPLOYMENT.md          # This file
```

## Security Notes

1. Always use HTTPS in production
2. Set strong session secrets
3. Configure CORS appropriately
4. Use environment variables for sensitive data
5. Enable proper authentication before deploying

## Troubleshooting

### Common Issues
1. **Build failures**: Check that all dependencies are properly listed in package.json
2. **CORS errors**: Ensure backend URL is correctly set in frontend environment variables
3. **File upload issues**: Check that uploads directory has proper permissions
4. **Data loss**: Remember that model/image metadata is stored in memory and resets on server restarts

### Logs
- **Vercel**: Check function logs in Vercel dashboard
- **Render**: Check application logs in Render dashboard

## Quick Deploy Commands

### Frontend (Vercel)
```bash
cd client
npm run build
```

### Backend (Render)
```bash
cd server
npm run build
npm start
```

## Environment Variables Template

Create a `.env` file in the root directory:

```env
# Backend Environment Variables  
PORT=5000
NODE_ENV=development

# Cloudflare R2 Storage (Primary)
R2_ACCOUNT_ID=your_cloudflare_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_r2_bucket_name
R2_PUBLIC_URL=https://your-r2-public-url.com/

# Optional: Google Cloud Storage (Legacy)
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_APPLICATION_CREDENTIALS=
PRIVATE_OBJECT_DIR=
PUBLIC_OBJECT_SEARCH_PATHS=

# Frontend Environment Variables (for development)
VITE_API_URL=http://localhost:5000
```

## Step-by-Step Deployment Instructions

### 🎯 Pre-Deployment Checklist
- [ ] Ensure all code is committed and pushed to GitHub
- [ ] Set up Cloudflare R2 bucket and obtain API credentials
- [ ] Have your GitHub repository ready
- [ ] Understand that data storage is temporary (in-memory)

### 🚀 1. Backend Deployment (Deploy First)

#### 1.1 Create Render Account
1. Go to [render.com](https://render.com) and sign up
2. Connect your GitHub account

#### 1.2 Deploy Backend
1. Click "New +" → "Web Service"
2. Connect your `ModelShowcase` repository
3. Configure settings:
   - **Name**: `model-showcase-backend` (or your preference)
   - **Environment**: `Node`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Build Command**: `cd server && npm ci && npm run build`
   - **Start Command**: `cd server && npm start`

#### 1.3 Set Backend Environment Variables
In Render dashboard, add these environment variables:

```env
# Required - Server Configuration
PORT=10000
NODE_ENV=production

# Required - Cloudflare R2 Storage
R2_ACCOUNT_ID=your_cloudflare_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=your_r2_bucket_name
R2_PUBLIC_URL=https://your-r2-public-url.com/
```

#### 1.4 Deploy and Test
1. Click "Deploy" 
2. Wait for deployment to complete
3. Copy your backend URL (e.g., `https://your-app.onrender.com`)
4. Test the backend by visiting your backend URL

### 🌐 2. Frontend Deployment (Deploy Second)

#### 2.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com) and sign up
2. Connect your GitHub account

#### 2.2 Deploy Frontend
1. Click "Add New..." → "Project"
2. Import your `ModelShowcase` repository
3. Vercel should auto-detect the configuration from `vercel.json`
4. If not, configure:
   - **Framework Preset**: Vite
   - **Build Command**: `cd client && npm ci && npm run build`
   - **Output Directory**: `client/dist`
   - **Install Command**: `cd client && npm ci`

#### 2.3 Set Frontend Environment Variables
In Vercel dashboard, add these environment variables:

```env
VITE_API_URL=https://your-backend-app.onrender.com
BACKEND_URL=https://your-backend-app.onrender.com
```

#### 2.4 Deploy and Test
1. Click "Deploy"
2. Wait for deployment to complete
3. Visit your frontend URL to test the application

### � 3. Cloudflare R2 Setup

#### 4.1 Create Cloudflare Account
1. Go to [cloudflare.com](https://cloudflare.com) and sign up
2. Navigate to R2 Object Storage

#### 4.2 Create R2 Bucket
1. Create a new bucket (e.g., `model-showcase-uploads`)
2. Configure public access if needed
3. Note your account ID and bucket name

#### 4.3 Generate API Tokens
1. Go to "Manage R2 API tokens"
2. Create token with R2:Object Storage:Edit permissions
3. Save the Access Key ID and Secret Access Key

### 🧪 5. Testing Deployment

#### 5.1 Test File Upload
1. Visit your frontend URL
2. Try uploading a 3D model file
3. Verify it appears in your R2 bucket
4. Check that the file URL is accessible

#### 5.2 Test API Endpoints
1. Open browser dev tools
2. Check Network tab for API calls
3. Ensure frontend can communicate with backend

### 🔧 6. Common Deployment Issues & Solutions

#### Frontend Issues
- **Build fails**: Check that all dependencies are in `client/package.json`
- **Blank page**: Check browser console for errors, verify API URL
- **API calls fail**: Verify CORS configuration and environment variables

#### Backend Issues
- **Deploy fails**: Check build logs, ensure all dependencies in `server/package.json`
- **File upload fails**: Check R2 credentials and bucket permissions
- **Data loss**: Remember that model/image metadata is stored in memory and resets on server restarts

#### R2 Storage Issues
- **Files not uploading**: Verify R2 credentials and bucket exists
- **Files not accessible**: Check bucket public access settings
- **Wrong file URLs**: Verify R2_PUBLIC_URL format

### 🔒 7. Security Recommendations

#### Production Security Checklist
- [ ] Use strong, unique SESSION_SECRET (generate with crypto.randomBytes)
- [ ] Enable HTTPS only (both Vercel and Render do this automatically)
- [ ] Configure proper CORS origins (not wildcard in production)
- [ ] Implement rate limiting on API endpoints
- [ ] Validate file uploads (size, type restrictions)
- [ ] Use environment variables for all secrets
- [ ] Configure R2 bucket permissions appropriately

### 📊 8. Monitoring & Logs

#### Vercel Logs
- Access logs in Vercel dashboard under Functions tab
- Monitor build logs and runtime logs

#### Render Logs
- Access logs in Render dashboard under Logs tab
- Monitor application startup and runtime logs

### 🚀 9. Performance Optimization

#### Frontend Optimization
- Enable Vercel's edge caching
- Optimize images and 3D models before upload
- Implement lazy loading for components

#### Backend Optimization
- Implement caching for frequently accessed data
- Monitor and optimize API response times
- Consider implementing persistent storage if data persistence is needed

#### Storage Optimization
- Implement file compression for uploads
- Set appropriate cache headers for R2 objects
- Consider CDN for global file delivery

The project is now ready for deployment to Vercel (frontend) and Render (backend)!
