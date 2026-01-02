const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

function authenticateOptional(req, res, next) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== 'string') {
    return next();
  }

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    // Temporary debug log
    console.log('[auth] req.user.role =', req.user && req.user.role);

    return next();
  } catch (err) {
    console.warn('[auth] Invalid token:', err.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== 'string') {
    return res.status(401).json({ success: false, message: 'Missing Authorization header' });
  }

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ success: false, message: 'Invalid Authorization header' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    // Temporary debug log
    console.log('[auth] req.user.role =', req.user && req.user.role);

    return next();
  } catch (err) {
    console.warn('[auth] Invalid token:', err.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

module.exports = {
  authenticateOptional,
  requireAuth,
  JWT_SECRET
};
