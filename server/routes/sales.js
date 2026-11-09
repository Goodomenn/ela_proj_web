import { Router } from 'express';
import { salesService } from '../services/salesService.js';
import { verifyToken, ROLES } from '../middleware/auth.js';

const router = Router();

// Apply token verification to all sales routes
router.use(verifyToken);

/**
 * GET /api/sales
 * Query params: systemType ('CENET' | 'LOOP'), filter ('ALL' | 'LATE')
 */
router.get('/', async (req, res) => {
  try {
    const { systemType, filter } = req.query;
    const userRole = req.user?.role || ROLES.ADMIN;

    // RBAC: Check system access permission
    if (systemType === 'CENET' && userRole === ROLES.LOOP_MANAGER) {
      return res.status(403).json({
        error: 'RBAC Access Denied',
        message: 'LOOP Managers are strictly restricted from accessing CENET sales.',
        currentRole: userRole
      });
    }

    if (systemType === 'LOOP' && userRole === ROLES.CENET_MANAGER) {
      return res.status(403).json({
        error: 'RBAC Access Denied',
        message: 'CENET Managers are strictly restricted from accessing LOOP sales.',
        currentRole: userRole
      });
    }

    let entries = [];
    if (systemType) {
      entries = await salesService.getEntriesBySystem(systemType);
    } else {
      entries = await salesService.getAllEntries();
    }

    // Apply additional filters (e.g. LATE only)
    if (filter === 'LATE') {
      entries = entries.filter(e => e.isLate);
    }

    // For managers viewing general audit logs, filter out other systems if restricted
    if (!systemType) {
      if (userRole === ROLES.CENET_MANAGER) {
        entries = entries.filter(e => e.systemType === 'CENET');
      } else if (userRole === ROLES.LOOP_MANAGER) {
        entries = entries.filter(e => e.systemType === 'LOOP');
      }
    }

    res.json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    res.status(500).json({ error: 'Failed to fetch sales entries', details: error.message });
  }
});

/**
 * POST /api/sales
 * Create a new sales entry
 */
router.post('/', async (req, res) => {
  try {
    const userRole = req.user?.role || ROLES.ADMIN;
    const { systemType, recordDate, submissionDate, field1Amount, field2Amount, totalSales, importSource, delayReason } = req.body;

    // RBAC: Auditors cannot create or modify sales entries (Read-only)
    if (userRole === ROLES.AUDITOR) {
      return res.status(403).json({
        error: 'RBAC Access Denied',
        message: 'Auditors have read-only access and cannot submit or modify sales data.',
        currentRole: userRole
      });
    }

    // RBAC: System boundary enforcement
    if (systemType === 'CENET' && userRole === ROLES.LOOP_MANAGER) {
      return res.status(403).json({
        error: 'RBAC Access Denied',
        message: 'LOOP Managers cannot submit CENET (Restaurant & Lounge) sales records.',
        currentRole: userRole
      });
    }

    if (systemType === 'LOOP' && userRole === ROLES.CENET_MANAGER) {
      return res.status(403).json({
        error: 'RBAC Access Denied',
        message: 'CENET Managers cannot submit LOOP (Butchery & Liquor) sales records.',
        currentRole: userRole
      });
    }

    // Validate dates and amounts
    if (!recordDate) {
      return res.status(400).json({ error: 'recordDate is required' });
    }

    const docDate = new Date(recordDate);
    const submitDate = submissionDate ? new Date(submissionDate) : new Date();
    const isLate = salesService.constructor.checkIsLate(docDate, submitDate);

    // Business Rule: Late submission requires mandatory explanation
    if (isLate && (!delayReason || delayReason.trim().length === 0)) {
      return res.status(400).json({
        error: 'Mandatory Delay Reason Required',
        message: 'Record date is more than 1 day older than submission date. A detailed delay reason must be provided.',
        isLate: true
      });
    }

    const savedEntry = await salesService.saveEntry({
      systemType: systemType === 'LOOP' ? 'LOOP' : 'CENET',
      recordDate: docDate.toISOString(),
      submissionDate: submitDate.toISOString(),
      field1Amount: parseFloat(field1Amount) || 0.0,
      field2Amount: parseFloat(field2Amount) || 0.0,
      totalSales: parseFloat(totalSales) || (parseFloat(field1Amount || 0) + parseFloat(field2Amount || 0)),
      importSource: importSource || 'Manual',
      delayReason: delayReason || ''
    });

    res.status(201).json({
      success: true,
      message: 'Sales record saved successfully to Firestore and in-memory store',
      data: savedEntry
    });
  } catch (error) {
    console.error('Error saving sales entry:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/sales/stats
 * Get KPI dashboard statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await salesService.getStats();
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to compute stats', details: error.message });
  }
});

export default router;
