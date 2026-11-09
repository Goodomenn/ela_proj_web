import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'ela_sales_manager_jwt_secret_key_2026';

export const ROLES = {
  ADMIN: 'ADMIN',
  CENET_MANAGER: 'CENET_MANAGER',
  LOOP_MANAGER: 'LOOP_MANAGER',
  AUDITOR: 'AUDITOR'
};

/**
 * Pre-configured users for testing and instant role switching
 */
export const USERS = [
  {
    id: 'user-admin-1',
    name: 'System Administrator',
    email: 'admin@ela.com',
    role: ROLES.ADMIN,
    description: 'Full access to CENET, LOOP, and Audit Reports'
  },
  {
    id: 'user-cenet-1',
    name: 'CENET Sales Manager',
    email: 'cenet@ela.com',
    role: ROLES.CENET_MANAGER,
    description: 'Restricted to Restaurant & Lounge sales only'
  },
  {
    id: 'user-loop-1',
    name: 'LOOP Sales Manager',
    email: 'loop@ela.com',
    role: ROLES.LOOP_MANAGER,
    description: 'Restricted to Butchery & Liquor sales only'
  },
  {
    id: 'user-auditor-1',
    name: 'Compliance Auditor',
    email: 'auditor@ela.com',
    role: ROLES.AUDITOR,
    description: 'Read-only access to Log & Audit reports'
  }
];

export function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Middleware: Verify JWT Bearer token
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  // If no auth header, fallback to default ADMIN user for smooth out-of-the-box experience
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = USERS[0]; // Admin by default if unauthenticated
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // If token is invalid or expired, default back to admin or return 401
    return res.status(401).json({
      error: 'Invalid or expired token',
      message: error.message
    });
  }
}

/**
 * Middleware: RBAC Role Guard
 * @param {Array<string>} allowedRoles 
 */
export function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    const userRole = req.user?.role || ROLES.ADMIN;
    
    if (userRole === ROLES.ADMIN) {
      return next(); // Admin always allowed
    }

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'RBAC Access Denied',
        message: `Your current role (${userRole}) is not authorized to access this resource. Required: ${allowedRoles.join(' or ')}`,
        currentRole: userRole,
        requiredRoles: allowedRoles
      });
    }
    next();
  };
}

/**
 * Middleware: Enforce System Type access (CENET vs LOOP)
 */
export function requireSystemAccess(systemParamName = 'systemType') {
  return (req, res, next) => {
    const system = req.query[systemParamName] || req.body[systemParamName] || req.params[systemParamName];
    const userRole = req.user?.role || ROLES.ADMIN;

    if (userRole === ROLES.ADMIN || userRole === ROLES.AUDITOR) {
      return next(); // Admin & Auditor can view both systems
    }

    if (system === 'CENET' && userRole !== ROLES.CENET_MANAGER) {
      return res.status(403).json({
        error: 'RBAC Restriction: CENET Only',
        message: 'You do not have permission to access CENET sales data. Role must be CENET_MANAGER or ADMIN.',
        currentRole: userRole
      });
    }

    if (system === 'LOOP' && userRole !== ROLES.LOOP_MANAGER) {
      return res.status(403).json({
        error: 'RBAC Restriction: LOOP Only',
        message: 'You do not have permission to access LOOP sales data. Role must be LOOP_MANAGER or ADMIN.',
        currentRole: userRole
      });
    }

    next();
  };
}
