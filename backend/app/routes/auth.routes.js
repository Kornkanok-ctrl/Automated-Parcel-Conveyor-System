const { authJwt } = require('../middleware');
const authController = require('../controllers/auth.controller');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Public routes
  app.post('/api/auth/signin', authController.signin);
  app.post('/api/auth/login', authController.signin); // Alias for signin
  app.post('/api/auth/logout', authController.logout);
  app.post('/api/auth/check-token', authController.checkToken);

  // Protected routes
  app.get('/api/auth/me', [authJwt.verifyToken], authController.getCurrentUser);
  app.post('/api/auth/change-password', [authJwt.verifyToken], authController.changePassword);

  // Admin only routes
  app.get('/api/auth/users', [authJwt.verifyToken, authJwt.isAdmin], authController.getUsers);
  app.post('/api/auth/users', [authJwt.verifyToken, authJwt.isAdmin], authController.createUser);
  app.put('/api/auth/users/:id/status', [authJwt.verifyToken, authJwt.isAdmin], authController.updateUserStatus);
};