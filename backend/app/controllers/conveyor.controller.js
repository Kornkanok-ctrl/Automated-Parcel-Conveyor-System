const conveyorController = {
  // Get all stations
  getStations: async (req, res) => {
    try {
      const stations = [
        {
          id: 1,
          name: 'Station A - Intake',
          type: 'intake',
          status: 'active',
          currentPackage: 'PKG003',
          throughput: 45,
          position: { x: 100, y: 200 },
          lastMaintenance: '2024-01-15',
          nextMaintenance: '2024-02-15'
        },
        {
          id: 2,
          name: 'Station B - Sorting',
          type: 'sorting',
          status: 'active',
          currentPackage: 'PKG001',
          throughput: 60,
          position: { x: 300, y: 200 },
          lastMaintenance: '2024-01-20',
          nextMaintenance: '2024-02-20'
        },
        {
          id: 3,
          name: 'Station C - Quality Check',
          type: 'quality_check',
          status: 'maintenance',
          currentPackage: null,
          throughput: 0,
          position: { x: 500, y: 200 },
          lastMaintenance: '2024-02-01',
          nextMaintenance: '2024-03-01'
        },
        {
          id: 4,
          name: 'Station D - Loading',
          type: 'loading',
          status: 'active',
          currentPackage: null,
          throughput: 40,
          position: { x: 700, y: 200 },
          lastMaintenance: '2024-01-10',
          nextMaintenance: '2024-02-10'
        },
        {
          id: 5,
          name: 'Station E - Exit',
          type: 'exit',
          status: 'active',
          currentPackage: null,
          throughput: 50,
          position: { x: 900, y: 200 },
          lastMaintenance: '2024-01-25',
          nextMaintenance: '2024-02-25'
        }
      ];

      res.json({
        stations,
        summary: {
          total: stations.length,
          active: stations.filter(s => s.status === 'active').length,
          inactive: stations.filter(s => s.status === 'inactive').length,
          maintenance: stations.filter(s => s.status === 'maintenance').length
        }
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to get stations',
        message: error.message 
      });
    }
  },

  // Get station details
  getStationById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const station = {
        id: parseInt(id),
        name: `Station ${id} - Processing`,
        type: 'sorting',
        status: 'active',
        currentPackage: 'PKG001',
        throughput: 60,
        position: { x: 300, y: 200 },
        lastMaintenance: '2024-01-20',
        nextMaintenance: '2024-02-20',
        recentActivity: [
          {
            timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
            action: 'package_processed',
            details: 'Package PKG001 processed successfully'
          },
          {
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            action: 'status_change',
            details: 'Station status changed to active'
          }
        ]
      };
      
      res.json(station);
    } catch (error) {
      res.status(500).json({ 
        error: 'Station not found',
        message: error.message 
      });
    }
  },

  // Update station status
  updateStationStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      res.json({
        success: true,
        message: `Station ${id} status updated to ${status}`,
        stationId: parseInt(id),
        status
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to update station status',
        message: error.message 
      });
    }
  },

  // Get conveyor system layout
  getLayout: async (req, res) => {
    try {
      const layoutData = {
        stations: [
          { id: 1, name: 'Station A - Intake', type: 'intake', position: { x: 100, y: 200 }, status: 'active', currentPackage: 'PKG003' },
          { id: 2, name: 'Station B - Sorting', type: 'sorting', position: { x: 300, y: 200 }, status: 'active', currentPackage: 'PKG001' },
          { id: 3, name: 'Station C - Quality Check', type: 'quality_check', position: { x: 500, y: 200 }, status: 'maintenance', currentPackage: null },
          { id: 4, name: 'Station D - Loading', type: 'loading', position: { x: 700, y: 200 }, status: 'active', currentPackage: null },
          { id: 5, name: 'Station E - Exit', type: 'exit', position: { x: 900, y: 200 }, status: 'active', currentPackage: null }
        ],
        connections: [
          { from: 1, to: 2, type: 'belt' },
          { from: 2, to: 3, type: 'belt' },
          { from: 3, to: 4, type: 'belt' },
          { from: 4, to: 5, type: 'belt' }
        ]
      };
      
      res.json(layoutData);
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to get layout',
        message: error.message 
      });
    }
  },

  // System controls
  systemControl: async (req, res) => {
    try {
      const { action } = req.params;
      const validActions = ['start', 'stop', 'pause', 'emergency_stop'];
      
      if (!validActions.includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
      }
      
      res.json({
        success: true,
        message: `Conveyor system ${action} command executed`,
        timestamp: new Date().toISOString(),
        action
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to execute system control',
        message: error.message 
      });
    }
  }
};

module.exports = conveyorController;