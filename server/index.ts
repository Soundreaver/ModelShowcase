import express from 'express';
import cors from 'cors';
import multer from 'multer';
import AWS from 'aws-sdk';
import 'dotenv/config';

const app = express();
const port = 3001;

app.use(cors());

const s3 = new AWS.S3({
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  region: 'auto',
  signatureVersion: 'v4',
  s3ForcePathStyle: false,
});

const upload = multer({ storage: multer.memoryStorage() });

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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
