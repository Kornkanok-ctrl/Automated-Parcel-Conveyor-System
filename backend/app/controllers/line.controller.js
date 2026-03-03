const line = require("@line/bot-sdk");
const { unlockLocker } = require("../services/locker.service");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};

const client = new line.Client(lineConfig);

// =============================
// Internal Handler Functions
// =============================

async function doHandleWebhook(req, res) {
  try {
    const events = req.body.events;

    for (const event of events) {
      // ===== รับข้อความ =====
      if (event.type === "message" && event.message.type === "text") {
        const userId = event.source.userId;
        const text = event.message.text.trim();
        const phone = text;
        const recipient = await prisma.receiver.findFirst({
          where: { phone: phone },
        });
        if (recipient) {
          await prisma.receiver.update({
            where: { id: recipient.id },
            data: { token_line: userId },
          });
          await client.replyMessage(event.replyToken, {
            type: "text",
            text: "เชื่อมบัญชีสำเร็จ ",
          });
        } else {
          await client.replyMessage(event.replyToken, {
            type: "text",
            text: "ไม่พบเบอร์ติดต่อ",
          });
        }
      }

      // ===== รับ postback =====
      if (event.type === "postback") {
        const data = event.postback.data;
        const params = new URLSearchParams(data);
        const locker = params.get("locker");
        const trackingID = params.get("trackingID");
        const trackingNumber = params.get("trackingNumber");

        const tracking = await prisma.transport.findUnique({
          where: { id: trackingID },
          select: { status: true },
        });

        if (!tracking) {
          return client.replyMessage(event.replyToken, {
            type: "text",
            text: "ไม่พบข้อมูลพัสดุ",
          });
        }
        //กรณีปลดล็อก
        if (data.includes("action=unlock")) {
          if (tracking.status !== "notified") {
            return client.replyMessage(event.replyToken, {
              type: "text",
              text: `Tracking: ${trackingNumber}\nพัสดุถูกนำออกไปแล้ว`,
            });
          }

          await unlockLocker(locker);

          await client.replyMessage(event.replyToken, {
            type: "flex",
            altText: "ยืนยันการรับพัสดุ",
            contents: {
              type: "bubble",
              body: {
                type: "box",
                layout: "vertical",
                spacing: "md",
                contents: [
                  {
                    type: "text",
                    text: `ล็อกเกอร์ ${locker} เปิดแล้ว`,
                    weight: "bold",
                    size: "lg",
                  },
                  {
                    type: "text",
                    text: `Tracking: ${trackingNumber}`,
                    size: "sm",
                    color: "#666666",
                  },
                ],
              },
              footer: {
                type: "box",
                layout: "vertical",
                spacing: "sm",
                contents: [
                  {
                    type: "button",
                    style: "primary",
                    color: "#27AE60",
                    action: {
                      type: "postback",
                      label: "✅ ยืนยันการรับพัสดุ",
                      data: `action=confirm_pickup&trackingID=${trackingID}&trackingNumber=${trackingNumber}`,
                    },
                  },
                  {
                    type: "button",
                    style: "secondary",
                    action: {
                      type: "postback",
                      label: "❗ แจ้งปัญหา",
                      data: `action=confirm_error&trackingID=${trackingID}&trackingNumber=${trackingNumber}`,
                    },
                  },
                ],
              },
            },
          });
          return;
        }
        // กรณียืนยันรับพัสดุ
        if (data.includes("action=confirm_pickup")) {
          if (tracking.status !== "notified") {
            return client.replyMessage(event.replyToken, {
              type: "text",
              text: "พัสดุถูกยืนยันไปแล้ว",
            });
          }
          if (tracking.status === "returned") {
            return client.replyMessage(event.replyToken, {
              type: "text",
              text: "พัสดุถูกยกเลิกไปแล้ว",
            });
          }

          await prisma.transport.update({
            where: { id: trackingID },
            data: { status: "collected" },
          });

          await client.replyMessage(event.replyToken, {
            type: "text",
            text: `ยืนยันรับพัสดุเรียบร้อย\nTracking: ${trackingNumber}`,
          });

          return;
        }
        // กรณียกเลิกรับพัสดุ
        if (data.includes("action=confirm_error")) {
          if (tracking.status !== "notified") {
            return client.replyMessage(event.replyToken, {
              type: "text",
              text: "พัสดุถูกยกเลิกเรียบร้อยแล้ว",
            });
          }
          if (tracking.status === "collected") {
            return client.replyMessage(event.replyToken, {
              type: "text",
              text: "พัสดุถูกรับไปแล้ว",
            });
          }

          await prisma.transport.update({
            where: { id: trackingID },
            data: { status: "returned" },
          });

          await client.replyMessage(event.replyToken, {
            type: "text",
            text: `ยืนยันยกเลิกพัสดุเรียบร้อย\nTracking: ${trackingNumber} \nโปรดนำพัสดุส่งมอบแก่เจ้าหน้าที่`,
          });

          return;
        }
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("LINE webhook error:", error);
    res.status(500).end();
  }
}

// =============================
// Public Controller Object
// =============================

const lineController = {
  // Webhook handler
  webhook: (req, res) => {
    try {
      doHandleWebhook(req, res);
    } catch (error) {
      console.error("LINE Controller Error:", error);
      res.status(500).end();
    }
  },

  // Helper: ส่งข้อความหา user โดยตรง (pushMessage)
  pushMessage: async (userId, message) => {
    try {
      await client.pushMessage(userId, message);
    } catch (error) {
      console.error("Push message error:", error);
    }
  },
};

module.exports = lineController;
