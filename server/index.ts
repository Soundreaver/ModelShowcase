import express from 'express';
import cors from 'cors';
import multer from 'multer';
import AWS from 'aws-sdk';
import 'dotenv/config';
import { registerRoutes } from './routes.js';

const app = express();
const port = process.env.PORT || 3001;

// CORS configuration for production
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.includes('localhost')) return callback(null, true);
    
    // Allow all Vercel deployments
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    
    // Allow your custom domain if you have one
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    
    // Reject other origins
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());

// Cloudflare R2 setup for direct uploads (keeping your existing functionality)
const s3 = new AWS.S3({
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  region: 'auto',
  signatureVersion: 'v4',
  s3ForcePathStyle: false,
});

const upload = multer({ storage: multer.memoryStorage() });

// Direct R2 upload endpoint (legacy support)
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const fileName = `${Date.now()}-${req.file.originalname}`;

  const params = {
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: fileName,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
  };

  try {
    await s3.upload(params).promise();
    const fileUrl = new URL(fileName, process.env.R2_PUBLIC_URL).toString();
    res.json({ filePath: fileUrl });
  } catch (error) {
    console.error('Error uploading to R2:', error);
    res.status(500).send('Error uploading file.');
  }
});

// Register the advanced routes
registerRoutes(app).then((httpServer) => {
  httpServer.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}).catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
