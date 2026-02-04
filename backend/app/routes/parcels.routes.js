const parcelsController = require('../controllers/parcels.controller');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Public routes (for users to send parcels)
  app.post('/api/parcels', parcelsController.createParcel);
  app.get('/api/parcels/track/:trackingNumber', parcelsController.getParcelByTracking);

  // Admin routes (for parcel management)
  app.get('/api/parcels', parcelsController.getParcels);
  app.put('/api/parcels/:id/status', parcelsController.updateParcelStatus);
  app.delete('/api/parcels/:id', parcelsController.deleteParcel);
};