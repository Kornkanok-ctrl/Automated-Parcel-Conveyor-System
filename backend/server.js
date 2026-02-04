const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'x-admin-token'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  
  // Log headers for admin routes
  if (req.path.includes('/admin')) {
    console.log('Admin request headers:', {
      'x-admin-token': req.headers['x-admin-token'] ? 'present' : 'missing',
      'content-type': req.headers['content-type']
    });
  }
  
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Automated Parcel Conveyor System API',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/recipients',
      '/api/delivery-companies',
      '/api/parcels',
      '/api/admin/login',
      '/api/admin/stats'
    ]
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Automated Parcel Conveyor System API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    status: 'healthy'
  });
});

// Routes
require('./app/routes/recipients.routes')(app);
require('./app/routes/parcels.routes')(app);
require('./app/routes/admin.routes')(app);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Parcel Conveyor System API running on port ${PORT}`);
  console.log(`📦 Recipients: http://localhost:${PORT}/api/recipients`);
  console.log(`🚚 Delivery Companies: http://localhost:${PORT}/api/delivery-companies`);
  console.log(`📮 Parcels: http://localhost:${PORT}/api/parcels`);
  console.log(`👤 Admin Login: http://localhost:${PORT}/api/admin/login`);
  console.log(`📊 Admin Stats: http://localhost:${PORT}/api/admin/stats`);
  console.log(`✅ Health Check: http://localhost:${PORT}/api/health`);
});

module.exports = app;