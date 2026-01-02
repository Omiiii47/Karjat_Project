function requireRole(allowedRoles) {
  const normalizedAllowed = (allowedRoles || []).map(r => String(r).toUpperCase());

  return function roleMiddleware(req, res, next) {
    const role = req.user && req.user.role;
    const roleUpper = String(role || '').toUpperCase();

    // Temporary debug log
    console.log('[roles] req.user.role =', role);

    if (!roleUpper) {
      return res.status(403).json({ success: false, message: 'Forbidden: role missing' });
    }

    if (!normalizedAllowed.includes(roleUpper)) {
      return res.status(403).json({ success: false, message: `Forbidden: role ${roleUpper} not allowed` });
    }

    return next();
  };
}

module.exports = {
  requireRole
};
