const authMiddleware = (req, res, next) => {
  // Siempre autorizar las peticiones como el usuario administrador
  req.user = { id: '1', role: 'ADMIN' };
  next();
};

module.exports = authMiddleware;
