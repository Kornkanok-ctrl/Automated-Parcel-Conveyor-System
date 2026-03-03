import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Start seeding...");
    // =========================
    // Admin
    // =========================
    const admin = await prisma.admin.create({
        data: {
            name: "admin",
            hash: "admin123",
        },
    });
    const receiver1 = await prisma.receiver.create({
        data: {
            fullname: "นายต่อตระกูล แซ่เล้า",
            phone: "0812341234",
            roomNumber: "101",
            token_line: "tor1234",
        }
    })
    const receiver2 = await prisma.receiver.create({
        data: {
            fullname: "นายธนภัทร สุขกรี",
            phone: "0812345678",
            roomNumber: "102",
            token_line: "tor1234",
        }
    })
    const receiver3 = await prisma.receiver.create({
        data: {
            fullname: "นางสาวกรกนก วงศ์เศรษฐโชติ",
            phone: "0812340123",
            roomNumber: "103",
            token_line: "tor1234",
        }
    })
     await prisma.receiver.create({
        data: {
            fullname: "นายชโยดม สุขสวัสดิ์",
            phone: "0623456789",
            roomNumber: "201"
        }
    })
     await prisma.receiver.create({
        data: {
            fullname: "นายนันทวุฒิ ศรีสุข",
            phone: "0643210987",
            roomNumber: "202"
        }
    })
     await prisma.receiver.create({
        data: {
            fullname: "นางสาวอรทัย ทองคำ",
            phone: "0821234567",
            roomNumber: "203"
        }
    })
     await prisma.receiver.create({
        data: {
            fullname: "นางสาวสุทธิดา รุ่งเรือง",
            phone: "0854321098",
            roomNumber: "301"
        }
    })
     await prisma.receiver.create({
        data: {
            fullname: "นายกิตติพงษ์ นาคำ",
            phone: "0923456789",
            roomNumber: "302"
        }
    })
     await prisma.receiver.create({
        data: {
            fullname: "นางสาวพรนภา ทองดี",
            phone: "0878901234",
            roomNumber: "303"
        }
    })

}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
