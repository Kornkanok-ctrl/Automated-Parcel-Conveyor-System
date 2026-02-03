const { authJwt } = require('../middleware');
const conveyorController = require('../controllers/conveyor.controller');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Conveyor station routes
  app.get('/api/conveyor/stations', conveyorController.getStations);
  app.get('/api/conveyor/stations/:id', conveyorController.getStationById);
  app.put('/api/conveyor/stations/:id/status', conveyorController.updateStationStatus);

  // System layout and control
  app.get('/api/conveyor/layout', conveyorController.getLayout);
  app.post('/api/conveyor/control/:action', conveyorController.systemControl);
};