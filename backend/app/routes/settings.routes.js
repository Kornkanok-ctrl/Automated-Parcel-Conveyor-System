const { authJwt } = require('../middleware');
const settingsController = require('../controllers/settings.controller');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // System settings routes
  app.get('/api/settings', settingsController.getSettings);
  app.put('/api/settings', settingsController.updateSettings);

  // User preferences routes
  app.get('/api/settings/user/:userId', settingsController.getUserPreferences);
  app.put('/api/settings/user/:userId', settingsController.updateUserPreferences);
};