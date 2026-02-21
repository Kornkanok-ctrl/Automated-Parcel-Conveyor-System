const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Mock notification service
const sendLineNotification = async (parcel) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`📱 LINE notification sent to ${parcel.phoneNumber} for room ${parcel.roomNumber}`);
      resolve(true);
    }, 1500);
  });
};

const generateTrackingNumber = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `PKG${timestamp}${random}`;
};

async function doCreateParcel(req, res) {
  try {
    const { 
      roomNumber, 
      deliveryCompany, 
    } = req.body;
    
    // Validation
    if (!roomNumber || !deliveryCompany) {
      return res.status(400).json({
        success: false,
        message: 'Room number and delivery company are required'
      });
    }

    // Find receiver by room number
    const receiverData = await prisma.receiver.findFirst({
      where: {
        roomNumber: roomNumber
      }
    });

    if (!receiverData) {
      return res.status(404).json({
        success: false,
        message: `Receiver not found for room number ${roomNumber}`
      });
    }

    // Generate tracking number
    const trackingNumber = generateTrackingNumber();

    // Create transport record
    const transportData = await prisma.transport.create({
      data: {
        transport_name: deliveryCompany,
        status: 'pending',
      }
    });

    // Create transport number record
    const transportNumberData = await prisma.transportNumber.create({
      data: {
        id_transport: transportData.id,
        id_receiver: receiverData.id,
        trackingNumber: trackingNumber,
      },
      include: {
        transport: true,
        receiver: true
      }
    });

    // Send LINE notification (simulate)
    const newParcel = {
      trackingNumber,
      roomNumber,
      phoneNumber: receiverData.phone,
      recipientName: receiverData.fullname,
      deliveryCompany,
      status: 'pending'
    };

    try {
      await sendLineNotification(newParcel);
      
      // Update status to notified
      await prisma.transport.update({
        where: { id: transportData.id },
        data: { status: 'notified' }
      });
      
      newParcel.status = 'notified';
      
    } catch (notificationError) {
      console.error("Notification error:", notificationError);
    }

    res.status(201).json({
      success: true,
      message: 'Parcel created successfully',
      parcel: {
        id: transportNumberData.id,
        trackingNumber: transportNumberData.trackingNumber,
        roomNumber: transportNumberData.receiver.roomNumber,
        recipientName: transportNumberData.receiver.fullname,
        phoneNumber: transportNumberData.receiver.phone,
        deliveryCompany: transportNumberData.transport.transport_name,
        status: transportNumberData.transport.status,
        createdAt: transportNumberData.createdAt,
        updatedAt: transportNumberData.updatedAt
      }
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
    
    const where = {};
    
    // Filter by status
    if (status && status !== 'all') {
      where.transport = {
        status: status
      };
    }
    
    // Filter by room number
    if (roomNumber) {
      where.receiver = {
        roomNumber: roomNumber
      };
    }
    
    // Filter by delivery company
    if (deliveryCompany) {
      where.transport = {
        ...where.transport,
        transport_name: {
          contains: deliveryCompany,
          mode: 'insensitive'
        }
      };
    }
    
    // Search functionality
    if (search) {
      where.OR = [
        { trackingNumber: { contains: search, mode: 'insensitive' } },
        { receiver: { fullname: { contains: search, mode: 'insensitive' } } },
        { receiver: { roomNumber: { contains: search, mode: 'insensitive' } } },
        { transport: { transport_name: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    // Get total count
    const totalCount = await prisma.transportNumber.count({ where });
    
    // Get paginated data
    const transportNumbers = await prisma.transportNumber.findMany({
      where,
      include: {
        transport: true,
        receiver: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit)
    });
    
    // Transform data
    const parcels = transportNumbers.map(tn => ({
      id: tn.id,
      trackingNumber: tn.trackingNumber,
      roomNumber: tn.receiver.roomNumber,
      recipientName: tn.receiver.fullname,
      phoneNumber: tn.receiver.phone,
      deliveryCompany: tn.transport.transport_name,
      status: tn.transport.status,
      createdAt: tn.createdAt,
      updatedAt: tn.updatedAt
    }));
    
    // Get statistics
    const allTransports = await prisma.transport.findMany();
    const stats = {
      total: allTransports.length,
      pending: allTransports.filter(t => t.status === 'pending').length,
      notified: allTransports.filter(t => t.status === 'notified').length,
      collected: allTransports.filter(t => t.status === 'collected').length,
      returned: allTransports.filter(t => t.status === 'returned').length
    };
    
    res.status(200).json({
      success: true,
      parcels,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
      stats
    });
    
    console.log(`Parcels retrieved. Count: ${parcels.length}, Page: ${page}/${Math.ceil(totalCount / limit)}, Filters: ${JSON.stringify(req.query)}`);
    console.log('Current stats:', stats);
    console.log('Parcels:', parcels);
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
    
    const transportNumber = await prisma.transportNumber.findFirst({
      where: { trackingNumber },
      include: {
        transport: true,
        receiver: true
      }
    });
    
    if (!transportNumber) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }
    
    const parcel = {
      id: transportNumber.id,
      trackingNumber: transportNumber.trackingNumber,
      roomNumber: transportNumber.receiver.roomNumber,
      recipientName: transportNumber.receiver.fullname,
      phoneNumber: transportNumber.receiver.phone,
      deliveryCompany: transportNumber.transport.transport_name,
      status: transportNumber.transport.status,
      createdAt: transportNumber.createdAt,
      updatedAt: transportNumber.updatedAt
    };
    
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
    
    const transportNumber = await prisma.transportNumber.findUnique({
      where: { id: id }, // Remove parseInt() - keep as string
      include: { transport: true, receiver: true }
    });
    
    if (!transportNumber) {
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
    
    // Update transport status
    await prisma.transport.update({
      where: { id: transportNumber.id_transport },
      data: { status }
    });
    
    // Get updated data
    const updatedTransportNumber = await prisma.transportNumber.findUnique({
      where: { id: id }, // Remove parseInt() - keep as string
      include: {
        transport: true,
        receiver: true
      }
    });
    
    const parcel = {
      id: updatedTransportNumber.id,
      trackingNumber: updatedTransportNumber.trackingNumber,
      roomNumber: updatedTransportNumber.receiver.roomNumber,
      recipientName: updatedTransportNumber.receiver.fullname,
      phoneNumber: updatedTransportNumber.receiver.phone,
      deliveryCompany: updatedTransportNumber.transport.transport_name,
      status: updatedTransportNumber.transport.status,
      createdAt: updatedTransportNumber.createdAt,
      updatedAt: updatedTransportNumber.updatedAt
    };
    
    res.status(200).json({
      success: true,
      message: 'Parcel status updated successfully',
      parcel
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
    
    const transportNumber = await prisma.transportNumber.findUnique({
      where: { id: id }, // Remove parseInt() - keep as string
      include: {
        transport: true,
        receiver: true
      }
    });
    
    if (!transportNumber) {
      return res.status(404).json({
        success: false,
        message: 'Parcel not found'
      });
    }
    
    // Delete transport number and transport record
    await prisma.transportNumber.delete({
      where: { id: id } // Remove parseInt() - keep as string
    });
    
    await prisma.transport.delete({
      where: { id: transportNumber.id_transport }
    });
    
    const deletedParcel = {
      id: transportNumber.id,
      trackingNumber: transportNumber.trackingNumber,
      roomNumber: transportNumber.receiver.roomNumber,
      recipientName: transportNumber.receiver.fullname,
      phoneNumber: transportNumber.receiver.phone,
      deliveryCompany: transportNumber.transport.transport_name,
      status: transportNumber.transport.status
    };
    
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
  createParcel: doCreateParcel,
  getParcels: doGetParcels,
  getParcelByTracking: doGetParcelByTracking,
  updateParcelStatus: doUpdateParcelStatus,
  deleteParcel: doDeleteParcel
};

module.exports = parcelsController;