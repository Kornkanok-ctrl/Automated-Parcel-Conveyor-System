const recipientsController = require('../controllers/recipients.controller');

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Get all recipients (with optional floor filter)
  app.get('/api/recipients', recipientsController.getRecipients);

  // Get recipient by room number
  app.get('/api/recipients/room/:roomNumber', recipientsController.getRecipientByRoom);

  // Get delivery companies
  app.get('/api/delivery-companies', recipientsController.getDeliveryCompanies);
};