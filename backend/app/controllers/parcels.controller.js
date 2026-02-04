// Mock parcels storage with sample data
let parcelsStorage = [
  {
    id: 1,
    trackingNumber: "PKG001234ABC",
    roomNumber: "101",
    recipientName: "สมชาย ใจดี",
    phoneNumber: "0851234567",
    senderPhone: "0891234567",
    senderName: "บริษัท ABC จำกัด",
    deliveryCompany: "Kerry Express",
    status: "pending",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    notifications: []
  },
  {
    id: 2,
    trackingNumber: "PKG001234DEF",
    roomNumber: "205",
    recipientName: "สุภาพร สวยงาม",
    phoneNumber: "0862345678",
    senderPhone: "0892345678",
    senderName: "Shopee",
    deliveryCompany: "Flash Express",
    status: "notified",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    notifications: [
      {
        type: 'line',
        sentAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        success: true,
        message: 'แจ้งเตือนไปยัง 0862345678 เรียบร้อยแล้ว'
      }
    ]
  },
  {
    id: 3,
    trackingNumber: "PKG001234GHI",
    roomNumber: "310",
    recipientName: "วิรุณ กล้าหาญ",
    phoneNumber: "0873456789",
    senderPhone: null,
    senderName: null,
    deliveryCompany: "J&T Express",
    status: "collected",
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    notifications: [
      {
        type: 'line',
        sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        success: true,
        message: 'แจ้งเตือนไปยัง 0873456789 เรียบร้อยแล้ว'
      }
    ]
  },
  {
    id: 4,
    trackingNumber: "PKG001234JKL",
    roomNumber: "408",
    recipientName: "มานิต นักเรียน",
    phoneNumber: "0884567890",
    senderPhone: "0894567890",
    senderName: "Lazada",
    deliveryCompany: "Thailand Post",
    status: "returned",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    notifications: [
      {
        type: 'line',
        sentAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        success: false,
        message: 'ไม่สามารถส่งการแจ้งเตือนได้',
        error: 'Invalid phone number'
      }
    ]
  },
  {
    id: 5,
    trackingNumber: "PKG001234MNO",
    roomNumber: "502",
    recipientName: "จิราพร วิจิตร",
    phoneNumber: "0895678901",
    senderPhone: "0885678901",
    senderName: "Central Online",
    deliveryCompany: "DHL",
    status: "pending",
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    notifications: []
  },
  {
    id: 6,
    trackingNumber: "PKG001234PQR",
    roomNumber: "603",
    recipientName: "ปรีชา เฉลียวฉลาด",
    phoneNumber: "0906789012",
    senderPhone: null,
    senderName: null,
    deliveryCompany: "Ninja Van",
    status: "notified",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    updatedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    notifications: [
      {
        type: 'line',
        sentAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        success: true,
        message: 'แจ้งเตือนไปยัง 0906789012 เรียบร้อยแล้ว'
      }
    ]
  },
  {
    id: 7,
    trackingNumber: "PKG001234STU",
    roomNumber: "701",
    recipientName: "อรพินท์ มีสุข",
    phoneNumber: "0917890123",
    senderPhone: "0897890123",
    senderName: "Tesco Lotus",
    deliveryCompany: "Kerry Express",
    status: "collected",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    notifications: [
      {
        type: 'line',
        sentAt: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
        success: true,
        message: 'แจ้งเตือนไปยัง 0917890123 เรียบร้อยแล้ว'
      }
    ]
  },
  {
    id: 8,
    trackingNumber: "PKG001234VWX",
    roomNumber: "804",
    recipientName: "ธนกร ใฝ่เรียน",
    phoneNumber: "0928901234",
    senderPhone: "0898901234",
    senderName: "Big C",
    deliveryCompany: "Flash Express",
    status: "pending",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    notifications: []
  }
];

let parcelIdCounter = 9; // Next ID to use

// Mock notification service
const sendLineNotification = async (parcel) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`📱 LINE notification sent to ${parcel.phoneNumber} for room ${parcel.roomNumber}`);
      resolve(true);
    }, 1500); // Simulate network delay
  });
};

const generateTrackingNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `PKG${timestamp}${random}`;
};

// Export function to get parcels storage (for admin stats)
const getParcelsStorage = () => {
  return [...parcelsStorage]; // Return copy to prevent direct manipulation
};

async function doCreateParcel(req, res) {
  try {
    const { 
      roomNumber, 
      recipientName, 
      phoneNumber, 
      deliveryCompany, 
      senderPhone,
      senderName 
    } = req.body;
    
    // Validation
    if (!roomNumber || !recipientName || !phoneNumber || !deliveryCompany) {
      return res.status(400).json({
        success: false,
        message: 'Room number, recipient name, phone number, and delivery company are required'
      });
    }

    // Validate phone number (should be 10 digits)
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Phone number must be 10 digits'
      });
    }

    // Create new parcel
    const newParcel = {
      id: parcelIdCounter++,
      trackingNumber: generateTrackingNumber(),
      roomNumber,
      recipientName,
      phoneNumber: cleanPhone,
      senderPhone: senderPhone || null,
      senderName: senderName || null,
      deliveryCompany,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notifications: []
    };

    // Add to storage
    parcelsStorage.push(newParcel);

    // Send LINE notification (simulate)
    try {
      await sendLineNotification(newParcel);
      
      // Update status to notified
      newParcel.status = 'notified';
      newParcel.updatedAt = new Date().toISOString();
      newParcel.notifications.push({
        type: 'line',
        sentAt: new Date().toISOString(),
        success: true,
        message: `แจ้งเตือนไปยัง ${phoneNumber} เรียบร้อยแล้ว`
      });
      
    } catch (notificationError) {
      console.error("Notification error:", notificationError);
      newParcel.notifications.push({
        type: 'line',
        sentAt: new Date().toISOString(),
        success: false,
        message: 'ไม่สามารถส่งการแจ้งเตือนได้',
        error: notificationError.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Parcel created successfully',
      parcel: newParcel
    });

  } catch (error) {
    console.error("Create parcel error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function doGetParcels(req, res) {
  try {
    const { 
      status, 
      roomNumber, 
      deliveryCompany, 
      page = 1, 
      limit = 10,
      search 
    } = req.query;
    
    let filteredParcels = [...parcelsStorage];
    
    // Filter by status
    if (status && status !== 'all') {
      filteredParcels = filteredParcels.filter(p => p.status === status);
    }
    
    // Filter by room number
    if (roomNumber) {
      filteredParcels = filteredParcels.filter(p => p.roomNumber === roomNumber);
    }
    
    // Filter by delivery company
    if (deliveryCompany) {
      filteredParcels = filteredParcels.filter(p => 
        p.deliveryCompany.toLowerCase().includes(deliveryCompany.toLowerCase())
      );
    }
    
    // Search functionality
    if (search) {
      filteredParcels = filteredParcels.filter(p =>
        p.trackingNumber.toLowerCase().includes(search.toLowerCase()) ||
        p.recipientName.toLowerCase().includes(search.toLowerCase()) ||
        p.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
        p.deliveryCompany.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Sort by creation date (newest first)
    filteredParcels.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedParcels = filteredParcels.slice(startIndex, endIndex);
    
    // Statistics
    const stats = {
      total: parcelsStorage.length,
      pending: parcelsStorage.filter(p => p.status === 'pending').length,
      notified: parcelsStorage.filter(p => p.status === 'notified').length,
      collected: parcelsStorage.filter(p => p.status === 'collected').length,
      returned: parcelsStorage.filter(p => p.status === 'returned').length
    };
    
    res.status(200).json({
      success: true,
      parcels: paginatedParcels,
      totalCount: filteredParcels.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(filteredParcels.length / limit),
      stats
    });
    
  } catch (error) {
    console.error("Get parcels error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function doGetParcelByTracking(req, res) {
  try {
    const { trackingNumber } = req.params;
    
    const parcel = parcelsStorage.find(p => p.trackingNumber === trackingNumber);
    
    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }
    
    res.status(200).json({
      success: true,
      parcel
    });
    
  } catch (error) {
    console.error("Get parcel by tracking error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function doUpdateParcelStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const parcelIndex = parcelsStorage.findIndex(p => p.id === parseInt(id));
    
    if (parcelIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }
    
    const validStatuses = ['pending', 'notified', 'collected', 'returned'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
      });
    }
    
    // Update parcel
    parcelsStorage[parcelIndex].status = status;
    parcelsStorage[parcelIndex].updatedAt = new Date().toISOString();
    
    if (notes) {
      if (!parcelsStorage[parcelIndex].notes) {
        parcelsStorage[parcelIndex].notes = [];
      }
      parcelsStorage[parcelIndex].notes.push({
        message: notes,
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Parcel status updated successfully',
      parcel: parcelsStorage[parcelIndex]
    });
    
  } catch (error) {
    console.error("Update parcel status error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function doDeleteParcel(req, res) {
  try {
    const { id } = req.params;
    
    const parcelIndex = parcelsStorage.findIndex(p => p.id === parseInt(id));
    
    if (parcelIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }
    
    const deletedParcel = parcelsStorage.splice(parcelIndex, 1)[0];
    
    res.status(200).json({
      success: true,
      message: 'Parcel deleted successfully',
      parcel: deletedParcel
    });
    
  } catch (error) {
    console.error("Delete parcel error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

const parcelsController = {
  // Create new parcel
  createParcel: (req, res) => {
    try {
      doCreateParcel(req, res);
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Get all parcels with filtering and pagination
  getParcels: (req, res) => {
    try {
      doGetParcels(req, res);
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Get parcel by tracking number
  getParcelByTracking: (req, res) => {
    try {
      doGetParcelByTracking(req, res);
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Update parcel status
  updateParcelStatus: (req, res) => {
    try {
      doUpdateParcelStatus(req, res);
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Delete parcel (admin only)
  deleteParcel: (req, res) => {
    try {
      doDeleteParcel(req, res);
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  },

  // Export storage for other controllers
  getParcelsStorage
};

module.exports = parcelsController;