import { Router } from 'express';
import multer from 'multer';
import { FileParserService } from '../services/fileParserService.js';
import { salesService } from '../services/salesService.js';
import { verifyToken, ROLES } from '../middleware/auth.js';

const router = Router();
router.use(verifyToken);

// Use memory storage for uploaded documents
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB limit
});

/**
 * POST /api/import/api
 * Automated direct API daily sync
 */
router.post('/api', async (req, res) => {
  try {
    const { systemType } = req.body;
    const userRole = req.user?.role || ROLES.ADMIN;

    // RBAC Checks
    if (userRole === ROLES.AUDITOR) {
      return res.status(403).json({ error: 'RBAC: Auditors cannot initiate data imports' });
    }
    if (systemType === 'CENET' && userRole === ROLES.LOOP_MANAGER) {
      return res.status(403).json({ error: 'RBAC: LOOP Manager cannot import CENET sales' });
    }
    if (systemType === 'LOOP' && userRole === ROLES.CENET_MANAGER) {
      return res.status(403).json({ error: 'RBAC: CENET Manager cannot import LOOP sales' });
    }

    const parsedData = FileParserService.simulateApiFetch(systemType);
    const now = new Date();
    const isLate = salesService.constructor.checkIsLate(new Date(parsedData.recordDate), now);

    res.json({
      success: true,
      data: {
        ...parsedData,
        systemType,
        isLate,
        submissionDate: now.toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to simulate API fetch', details: error.message });
  }
});

/**
 * POST /api/import/file
 * Upload and parse Excel, CSV, or PDF documents
 */
router.post('/file', upload.single('file'), async (req, res) => {
  try {
    const userRole = req.user?.role || ROLES.ADMIN;
    const systemType = req.body.systemType === 'LOOP' ? 'LOOP' : 'CENET';

    // RBAC Checks
    if (userRole === ROLES.AUDITOR) {
      return res.status(403).json({ error: 'RBAC: Auditors cannot import files' });
    }
    if (systemType === 'CENET' && userRole === ROLES.LOOP_MANAGER) {
      return res.status(403).json({ error: 'RBAC: LOOP Manager cannot import CENET files' });
    }
    if (systemType === 'LOOP' && userRole === ROLES.CENET_MANAGER) {
      return res.status(403).json({ error: 'RBAC: CENET Manager cannot import LOOP files' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const originalName = req.file.originalname.toLowerCase();
    const buffer = req.file.buffer;

    let parsed = null;
    if (originalName.endsWith('.csv')) {
      parsed = FileParserService.parseCsvBuffer(buffer, systemType);
    } else if (originalName.endsWith('.pdf')) {
      parsed = await FileParserService.parsePdfBuffer(buffer, systemType);
    } else if (originalName.endsWith('.xlsx') || originalName.endsWith('.xls')) {
      parsed = FileParserService.parseExcelBuffer(buffer, systemType);
    } else {
      return res.status(400).json({
        error: 'Unsupported file format',
        message: 'Please upload an Excel (.xlsx/.xls), CSV (.csv), or PDF (.pdf) file.'
      });
    }

    const now = new Date();
    const isLate = salesService.constructor.checkIsLate(new Date(parsed.recordDate), now);

    res.json({
      success: true,
      message: `File parsed successfully as ${parsed.formatType}`,
      data: {
        ...parsed,
        systemType,
        isLate,
        submissionDate: now.toISOString(),
        fileName: req.file.originalname
      }
    });
  } catch (error) {
    console.error('File import parse error:', error);
    res.status(500).json({ error: 'Failed to parse uploaded document', details: error.message });
  }
});

export default router;
