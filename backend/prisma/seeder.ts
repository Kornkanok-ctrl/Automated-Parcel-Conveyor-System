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

}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
