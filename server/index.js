import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import salesRoutes from './routes/sales.js';
import importRoutes from './routes/import.js';
import { firebaseConfig } from './config/firebase.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/import', importRoutes);

// Health check and configuration status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Daily Sales & Import Manager (Web Edition)',
    database: {
      provider: 'Google Cloud Firestore',
      projectId: firebaseConfig.projectId,
      collection: 'sales_entries',
      connectedToMobileApp: true
    },
    timestamp: new Date().toISOString()
  });
});

// Serve web frontend from server/public or dist
const publicPath = path.join(__dirname, 'public');
const clientDistPath = path.join(__dirname, '../dist');
app.use(express.static(publicPath));
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) return next();
  res.sendFile(path.join(publicPath, 'index.html'), err => {
    if (err) {
      res.sendFile(path.join(clientDistPath, 'index.html'), err2 => {
        if (err2) {
          res.status(404).send('Web app interface not found');
        }
      });
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 Sales & Import Backend Server running on port ${PORT}`);
  console.log(`🔥 Connected to Firestore Project: ${firebaseConfig.projectId}`);
  console.log(`📊 Sharing database with Flutter phone app (proj_ela)`);
  console.log(`🛡️  RBAC Enabled: ADMIN, CENET_MANAGER, LOOP_MANAGER, AUDITOR`);
  console.log(`=======================================================`);
});
