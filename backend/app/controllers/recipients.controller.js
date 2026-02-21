const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const DELIVERY_COMPANIES = [
  { id: "kerry", name: "Kerry Express", color: "#FF6B35" },
  { id: "flash", name: "Flash Express", color: "#FF1744" },
  { id: "j&t", name: "J&T Express", color: "#E53935" },
  { id: "thailand-post", name: "ไปรษณีย์ไทย", color: "#1976D2" },
  { id: "ninja-van", name: "Ninja Van", color: "#6A1B9A" },
  { id: "dhl", name: "DHL", color: "#FFD600" },
  { id: "fedex", name: "FedEx", color: "#4527A0" },
  { id: "ups", name: "UPS", color: "#8D6E63" }
];

async function doGetRecipients(req, res) {
  try {
    const { floor } = req.query;

    // ดึงข้อมูล receiver ทั้งหมด
    let recipients = await prisma.receiver.findMany({
      orderBy: { roomNumber: 'asc' }
    });

    // แปลงชื่อ field ให้ตรงกับ frontend
    recipients = recipients.map(r => ({
      id: r.id,
      roomNumber: r.roomNumber,
      name: r.fullname,
      phone: r.phone
    }));

    // Filter by floor if specified
    let filteredRecipients = recipients;
    if (floor) {
      filteredRecipients = recipients.filter(recipient =>
        recipient.roomNumber.startsWith(floor)
      );
    }

    // Group by floor
    const recipientsByFloor = filteredRecipients.reduce((acc, recipient) => {
      const floorNumber = recipient.roomNumber.charAt(0);
      if (!acc[floorNumber]) {
        acc[floorNumber] = [];
      }
      acc[floorNumber].push(recipient);
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      recipients: filteredRecipients,
      recipientsByFloor,
      totalCount: filteredRecipients.length
    });

  } catch (error) {
    console.error("Get recipients error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function doGetRecipientByRoom(req, res) {
  try {
    const { roomNumber } = req.params;

    const recipient = await prisma.receiver.findFirst({
      where: { roomNumber }
    });

    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    res.status(200).json({
      success: true,
      recipient: {
        id: recipient.id,
        roomNumber: recipient.roomNumber,
        name: recipient.fullname,
        phone: recipient.phone
      }
    });

  } catch (error) {
    console.error("Get recipient by room error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function doGetDeliveryCompanies(req, res) {
  try {
    res.status(200).json({
      success: true,
      deliveryCompanies: DELIVERY_COMPANIES,
      totalCount: DELIVERY_COMPANIES.length
    });

  } catch (error) {
    console.error("Get delivery companies error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

const recipientsController = {
  getRecipients: (req, res) => {
    try {
      doGetRecipients(req, res);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  getRecipientByRoom: (req, res) => {
    try {
      doGetRecipientByRoom(req, res);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  getDeliveryCompanies: (req, res) => {
    try {
      doGetDeliveryCompanies(req, res);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = recipientsController;