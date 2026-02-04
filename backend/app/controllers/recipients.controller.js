// Mock recipients data ตาม frontend
const MOCK_RECIPIENTS = [
  { id: "room-101", roomNumber: "101", name: "นายสมชาย ใจดี", phone: "0812345678" },
  { id: "room-102", roomNumber: "102", name: "นางสาวมานี สวยงาม", phone: "0823456789" },
  { id: "room-103", roomNumber: "103", name: "นายพิชาย กล้าหาญ", phone: "0834567890" },
  { id: "room-104", roomNumber: "104", name: "นางสาวสุดา น่ารัก", phone: "0845678901" },
  { id: "room-105", roomNumber: "105", name: "นายวิทย์ ฉลาด", phone: "0856789012" },
  { id: "room-201", roomNumber: "201", name: "นายสมศักดิ์ มั่งคั่ง", phone: "0867890123" },
  { id: "room-202", roomNumber: "202", name: "นางสาวประไพ อ่อนโยน", phone: "0878901234" },
  { id: "room-203", roomNumber: "203", name: "นายเจริญ รุ่งเรือง", phone: "0889012345" },
  { id: "room-204", roomNumber: "204", name: "นางสาวเพ็ญ สง่างาม", phone: "0890123456" },
  { id: "room-205", roomNumber: "205", name: "นายธนา ซื่อสัตย์", phone: "0901234567" }
];

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
    
    let recipients = [...MOCK_RECIPIENTS];
    
    // Filter by floor if specified
    if (floor) {
      recipients = recipients.filter(recipient => 
        recipient.roomNumber.startsWith(floor)
      );
    }
    
    // Group by floor
    const recipientsByFloor = recipients.reduce((acc, recipient) => {
      const floorNumber = recipient.roomNumber.charAt(0);
      if (!acc[floorNumber]) {
        acc[floorNumber] = [];
      }
      acc[floorNumber].push(recipient);
      return acc;
    }, {});
    
    res.status(200).json({
      success: true,
      recipients,
      recipientsByFloor,
      totalCount: recipients.length
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
    
    const recipient = MOCK_RECIPIENTS.find(r => r.roomNumber === roomNumber);
    
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: 'Recipient not found'
      });
    }
    
    res.status(200).json({
      success: true,
      recipient
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
  // Get all recipients
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

  // Get recipient by room number
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

  // Get delivery companies
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