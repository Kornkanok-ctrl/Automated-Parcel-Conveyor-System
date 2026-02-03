const { authJwt } = require('../middleware');
const packagesController = require('../controllers/packages.controller');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Package routes
  app.get('/api/packages', packagesController.getPackages);
  app.get('/api/packages/track/:trackingNumber', packagesController.getPackageByTracking);
  app.post('/api/packages', packagesController.createPackage);
  app.put('/api/packages/:id/status', packagesController.updatePackageStatus);
};