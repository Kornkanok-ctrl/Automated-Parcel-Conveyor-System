const adminController = require('../controllers/admin.controller');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, x-admin-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Admin authentication routes
  app.post('/api/admin/login', adminController.login);
  app.post('/api/admin/logout', adminController.logout);

  // Admin dashboard routes (protected)
  app.get('/api/admin/stats', adminController.checkAuth, adminController.getStats);
  
  // Debug route (remove in production)
  app.get('/api/admin/debug/sessions', adminController.getSessions);
};