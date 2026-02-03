const { authJwt } = require('../middleware');
const dashboardController = require('../controllers/dashboard.controller');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Dashboard main route
  app.get('/api/dashboard', dashboardController.getDashboard);

  // Dashboard overview
  app.get('/api/dashboard/overview', dashboardController.getOverview);

  // Real-time system status
  app.get('/api/dashboard/status', dashboardController.getStatus);

  // Recent activities
  app.get('/api/dashboard/activities', dashboardController.getActivities);

  // Performance metrics
  app.get('/api/dashboard/metrics', dashboardController.getMetrics);
};