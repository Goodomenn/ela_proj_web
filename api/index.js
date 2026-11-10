import express from 'express';
import cors from 'cors';
import authRoutes from '../server/routes/auth.js';
import salesRoutes from '../server/routes/sales.js';
import importRoutes from '../server/routes/import.js';
import { firebaseConfig } from '../server/config/firebase.js';

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
const handleHealth = (req, res) => {
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
};

app.get('/api/health', handleHealth);
app.get('/health', handleHealth);

// Mount routes on both /api/* and /* for maximum compatibility on Vercel
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/sales', salesRoutes);
app.use('/sales', salesRoutes);

app.use('/api/import', importRoutes);
app.use('/import', importRoutes);

export default app;
