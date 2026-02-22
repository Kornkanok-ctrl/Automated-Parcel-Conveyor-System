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

// Admin method for getting recipients with search
async function doGetRecipientsForAdmin(req, res) {
  try {
    const { search, roomNumber } = req.query;

    const whereClause = {};

    if (search) {
      whereClause.OR = [
        { fullname: { contains: search } },
        { phone: { contains: search } },
        { roomNumber: { contains: search } }
      ];
    }

    if (roomNumber) {
      whereClause.roomNumber = roomNumber;
    }

    const recipients = await prisma.receiver.findMany({
      where: whereClause,
      orderBy: { roomNumber: 'asc' }
    });

    res.status(200).json({
      success: true,
      recipients: recipients.map(recipient => ({
        id: recipient.id,
        fullname: recipient.fullname,
        phone: recipient.phone,
        roomNumber: recipient.roomNumber,
        createdAt: recipient.createdAt,
        updatedAt: recipient.updatedAt
      }))
    });

  } catch (error) {
    console.error("Get recipients for admin error:", error);
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

async function doUpdateRecipient(req, res) {
  try {
    const { id } = req.params;
    const { fullname, phone } = req.body;

    // Validation
    if (!fullname || !phone) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกชื่อและเบอร์โทรให้ครบถ้วน'
      });
    }

    // Check if recipient exists
    const existingRecipient = await prisma.receiver.findUnique({
      where: { id: id }
    });

    if (!existingRecipient) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลผู้รับ'
      });
    }

    // Check if phone number is already used by another recipient
    const phoneCheck = await prisma.receiver.findFirst({
      where: {
        phone: phone,
        id: { not: id }
      }
    });

    if (phoneCheck) {
      return res.status(400).json({
        success: false,
        message: 'เบอร์โทรนี้ถูกใช้งานแล้วในห้องอื่น'
      });
    }

    // Update recipient
    const updatedRecipient = await prisma.receiver.update({
      where: { id: id },
      data: {
        fullname: fullname.trim(),
        phone: phone.trim()
      }
    });

    res.status(200).json({
      success: true,
      message: 'อัพเดตข้อมูลผู้รับสำเร็จ',
      recipient: {
        id: updatedRecipient.id,
        fullname: updatedRecipient.fullname,
        phone: updatedRecipient.phone,
        roomNumber: updatedRecipient.roomNumber,
        createdAt: updatedRecipient.createdAt,
        updatedAt: updatedRecipient.updatedAt
      }
    });

  } catch (error) {
    console.error("Update recipient error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

async function doDeleteRecipient(req, res) {
  try {
    const { id } = req.params;

    // Check if recipient exists
    const existingRecipient = await prisma.receiver.findUnique({
      where: { id: id }
    });

    if (!existingRecipient) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบข้อมูลผู้รับ'
      });
    }

    // Check if recipient has active parcels
    const activeTransports = await prisma.transportNumber.findMany({
      where: { 
        id_receiver: id,
        transport: {
          status: { in: ['pending', 'notified'] }
        }
      }
    });

    if (activeTransports.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถลบผู้รับที่มีพัสดุรอดำเนินการ'
      });
    }

    await prisma.receiver.delete({
      where: { id: id }
    });

    res.status(200).json({
      success: true,
      message: 'ลบข้อมูลผู้รับสำเร็จ'
    });

  } catch (error) {
    console.error("Delete recipient error:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

const recipientsController = {
  getRecipients: doGetRecipients,
  getRecipientsForAdmin: doGetRecipientsForAdmin,
  getRecipientByRoom: doGetRecipientByRoom,
  getDeliveryCompanies: doGetDeliveryCompanies,
  updateRecipient: doUpdateRecipient,
  deleteRecipient: doDeleteRecipient
};

module.exports = recipientsController;