import { Router } from 'express';
import { USERS, ROLES, generateToken, verifyToken } from '../middleware/auth.js';

const router = Router();

/**
 * List available users and roles
 */
router.get('/users', (req, res) => {
  res.json({
    users: USERS,
    roles: Object.values(ROLES)
  });
});

/**
 * Login endpoint
 */
router.post('/login', (req, res) => {
  const { email, role, userId } = req.body;
  
  let targetUser = null;
  if (userId) {
    targetUser = USERS.find(u => u.id === userId);
  } else if (email) {
    targetUser = USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
  } else if (role) {
    targetUser = USERS.find(u => u.role === role);
  } else {
    targetUser = USERS[0]; // Default to Admin
  }

  if (!targetUser) {
    return res.status(404).json({ error: 'User / role not found' });
  }

  const token = generateToken(targetUser);

  res.json({
    message: 'Authentication successful',
    token,
    user: targetUser
  });
});

/**
 * Get current authenticated user
 */
router.get('/me', verifyToken, (req, res) => {
  res.json({
    user: req.user
  });
});

export default router;
