const packagesController = {
  // Get all packages
  getPackages: async (req, res) => {
    try {
      const { status, search, page = 1, limit = 10 } = req.query;
      
      // Mock packages data
      let packages = [
        {
          id: 1,
          trackingNumber: 'PKG001',
          senderName: 'John Doe',
          recipientName: 'Jane Smith',
          weight: 2.5,
          dimensions: { length: 30, width: 20, height: 15 },
          status: 'in_transit',
          current_station_id: 2,
          priority: 'high',
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          estimated_delivery: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 2,
          trackingNumber: 'PKG002',
          senderName: 'Alice Johnson',
          recipientName: 'Bob Wilson',
          weight: 1.8,
          dimensions: { length: 25, width: 18, height: 12 },
          status: 'delivered',
          current_station_id: 5,
          priority: 'normal',
          created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          delivered_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 3,
          trackingNumber: 'PKG003',
          senderName: 'Carol Brown',
          recipientName: 'David Lee',
          weight: 3.2,
          dimensions: { length: 35, width: 25, height: 20 },
          status: 'processing',
          current_station_id: 1,
          priority: 'low',
          created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          estimated_delivery: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
        }
      ];
      
      // Filter by status
      if (status && status !== 'all') {
        packages = packages.filter(pkg => pkg.status === status);
      }
      
      // Search functionality
      if (search) {
        packages = packages.filter(pkg => 
          pkg.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
          pkg.senderName.toLowerCase().includes(search.toLowerCase()) ||
          pkg.recipientName.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedPackages = packages.slice(startIndex, endIndex);
      
      res.json({
        packages: paginatedPackages,
        totalCount: packages.length,
        currentPage: parseInt(page),
        totalPages: Math.ceil(packages.length / limit)
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to get packages',
        message: error.message 
      });
    }
  },

  // Get package by tracking number
  getPackageByTracking: async (req, res) => {
    try {
      const { trackingNumber } = req.params;
      
      // Mock package data
      const packageData = {
        id: 1,
        trackingNumber: trackingNumber,
        senderName: 'John Doe',
        recipientName: 'Jane Smith',
        weight: 2.5,
        dimensions: { length: 30, width: 20, height: 15 },
        status: 'in_transit',
        current_station_id: 2,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        estimated_delivery: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        history: [
          {
            status: 'received',
            station: 'Station A',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            message: 'Package received and registered'
          },
          {
            status: 'processing',
            station: 'Station A',
            timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
            message: 'Package sorted and labeled'
          },
          {
            status: 'in_transit',
            station: 'Station B',
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            message: 'Package moved to conveyor system'
          }
        ]
      };
      
      res.json(packageData);
    } catch (error) {
      res.status(500).json({ 
        error: 'Package not found',
        message: error.message 
      });
    }
  },

  // Create new package
  createPackage: async (req, res) => {
    try {
      const { senderName, recipientName, weight, dimensions } = req.body;
      
      if (!senderName || !recipientName || !weight) {
        return res.status(400).json({
          error: 'Sender name, recipient name, and weight are required'
        });
      }
      
      const newPackage = {
        id: Date.now(),
        trackingNumber: `PKG${String(Date.now()).slice(-6)}`,
        senderName,
        recipientName,
        weight: parseFloat(weight),
        dimensions,
        status: 'received',
        current_station_id: 1,
        priority: 'normal',
        created_at: new Date().toISOString(),
        estimated_delivery: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
      };
      
      res.status(201).json({
        success: true,
        message: 'Package created successfully',
        package: newPackage
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to create package',
        message: error.message 
      });
    }
  },

  // Update package status
  updatePackageStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, station } = req.body;
      
      res.json({
        success: true,
        message: 'Package status updated successfully',
        packageId: parseInt(id),
        status,
        station
      });
    } catch (error) {
      res.status(500).json({ 
        error: 'Failed to update package status',
        message: error.message 
      });
    }
  }
};

module.exports = packagesController;