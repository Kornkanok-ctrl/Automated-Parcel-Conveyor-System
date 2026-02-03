const dashboardController = {
  // Dashboard main info
  getDashboard: async (req, res) => {
    try {
      res.json({
        message: 'Dashboard API is working',
        availableEndpoints: [
          'GET /api/dashboard/overview',
          'GET /api/dashboard/status',
          'GET /api/dashboard/activities',
          'GET /api/dashboard/metrics'
        ]
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to get dashboard info',
        message: error.message 
      });
    }
  },

  // Dashboard overview data
  getOverview: async (req, res) => {
    try {
      // Mock data for now
      const overviewData = {
        totalPackages: 1250,
        packagesInTransit: 85,
        packagesDelivered: 1165,
        packagesFailed: 12,
        activeStations: 8,
        inactiveStations: 2,
        maintenanceStations: 1,
        systemStatus: 'operational',
        throughputToday: 324,
        averageProcessingTime: '2.5 minutes'
      };

      res.json(overviewData);
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to get dashboard overview',
        message: error.message 
      });
    }
  },

  // Real-time system status
  getStatus: async (req, res) => {
    try {
      const statusData = {
        systemHealth: 'good',
        conveyorSpeed: 1.2, // m/s
        temperature: 24.5 + (Math.random() * 10 - 5), // Celsius with variation
        humidity: 45 + (Math.random() * 20 - 10), // % with variation
        powerConsumption: 85.3 + (Math.random() * 10 - 5), // kW with variation
        lastUpdate: new Date().toISOString()
      };

      res.json(statusData);
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to get system status',
        message: error.message 
      });
    }
  },

  // Recent activities
  getActivities: async (req, res) => {
    try {
      const activitiesData = [
        {
          id: 1,
          type: 'package_received',
          message: 'Package PKG001 received at Station A',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString()
        },
        {
          id: 2,
          type: 'station_maintenance',
          message: 'Station C scheduled for maintenance',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString()
        },
        {
          id: 3,
          type: 'package_delivered',
          message: 'Package PKG002 delivered successfully',
          timestamp: new Date(Date.now() - 30 * 60000).toISOString()
        },
        {
          id: 4,
          type: 'package_processing',
          message: 'Package PKG004 in sorting process',
          timestamp: new Date(Date.now() - 45 * 60000).toISOString()
        },
        {
          id: 5,
          type: 'system_alert',
          message: 'Temperature threshold exceeded at Station B',
          timestamp: new Date(Date.now() - 60 * 60000).toISOString()
        }
      ];

      res.json(activitiesData);
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to get activities',
        message: error.message 
      });
    }
  },

  // Performance metrics
  getMetrics: async (req, res) => {
    try {
      const { period = '24h' } = req.query;
      
      // Mock data based on period
      const generateMetrics = () => {
        const hours = period === '24h' ? 24 : period === '7d' ? 168 : 720;
        const data = [];
        
        for (let i = 0; i < hours; i += period === '24h' ? 1 : period === '7d' ? 24 : 168) {
          data.push({
            timestamp: new Date(Date.now() - i * 60 * 60 * 1000).toISOString(),
            packagesProcessed: Math.floor(Math.random() * 50) + 10,
            systemEfficiency: Math.floor(Math.random() * 20) + 80,
            errorRate: Math.random() * 5
          });
        }
        
        return data.reverse();
      };
      
      const metricsData = {
        period,
        data: generateMetrics()
      };

      res.json(metricsData);
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to get metrics',
        message: error.message 
      });
    }
  }
};

module.exports = dashboardController;