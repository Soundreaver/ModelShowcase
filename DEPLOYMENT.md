# Model Showcase - Deployment Guide

This project consists of a React frontend deployed on Vercel and an Express backend deployed on Render.

## Architecture

- **Frontend (client/)**: React + Vite + TypeScript, deployed on Vercel
- **Backend (server/)**: Express + TypeScript, deployed on Render
- **Database**: Neon PostgreSQL (serverless)
- **File Storage**: Local storage (with Google Cloud Storage option)

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
2. Set up a Neon database (or any PostgreSQL database)

### Steps
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure the build settings:
   - **Build Command**: `cd server && npm install && npm run build`
   - **Start Command**: `cd server && npm start`
4. Set environment variables (see below)

### Environment Variables (Backend)
```
# Database
DATABASE_URL=your_neon_database_url

# Session
SESSION_SECRET=your_session_secret_key

# Server
PORT=10000
NODE_ENV=production

# Optional: Google Cloud Storage (if you want cloud file storage)
GOOGLE_CLOUD_PROJECT_ID=your_project_id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
PRIVATE_OBJECT_DIR=/your-bucket/uploads
PUBLIC_OBJECT_SEARCH_PATHS=/your-bucket/public
```

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

The application includes a fallback file storage system:
- **Local Storage**: Files stored in `server/uploads/` (default)
- **Google Cloud Storage**: Optional cloud storage (requires configuration)

The system automatically uses local storage if Google Cloud Storage isn't configured.

## Database Schema

The application uses Drizzle ORM with PostgreSQL. Run migrations:
```bash
npm run db:push
```

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
4. **Database connection**: Verify DATABASE_URL is correct and database is accessible

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
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-super-secret-session-key-here
PORT=5000
NODE_ENV=development

# Optional: Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_APPLICATION_CREDENTIALS=
PRIVATE_OBJECT_DIR=
PUBLIC_OBJECT_SEARCH_PATHS=

# Frontend Environment Variables (for development)
VITE_API_URL=http://localhost:5000
```

The project is now ready for deployment to Vercel (frontend) and Render (backend)!
