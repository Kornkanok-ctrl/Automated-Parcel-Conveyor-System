import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Start seeding...");
    // =========================
    // Admin
    // =========================
    const admin = await prisma.Admin.create({
        data: {
            name:"admin",
            hash: "admin123",
        },
    });
}

main()
    .catch((e) => {
        console.error("❌ Seed error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
