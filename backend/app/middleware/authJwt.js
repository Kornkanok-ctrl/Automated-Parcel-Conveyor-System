const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');

const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"];

  if (!token) {
    return res.status(403).json({
      success: false,
      message: "No token provided!"
    });
  }

  // Mock verification for development
  if (token.startsWith('token-') || token.startsWith('mock-token-')) {
    req.userId = 1;
    req.userRole = 'admin';
    next();
    return;
  }

  jwt.verify(token, config.secret, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized!"
      });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.userUsername = decoded.username;
    req.userEmail = decoded.email;
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: "Require Admin Role!"
    });
  }
  next();
};

const isOperator = (req, res, next) => {
  if (req.userRole !== 'operator' && req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      message: "Require Operator Role!"
    });
  }
  next();
};

const isViewer = (req, res, next) => {
  if (!['viewer', 'operator', 'admin'].includes(req.userRole)) {
    return res.status(403).json({
      success: false,
      message: "Require Viewer Role or higher!"
    });
  }
  next();
};

const authJwt = {
  verifyToken,
  isAdmin,
  isOperator,
  isViewer
};

module.exports = authJwt;