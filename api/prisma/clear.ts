/**
 * prisma/clear.ts
 * Usage: npx tsx prisma/clear.ts
 *
 * Deletes ALL rows from every table in the database.
 * Order respects foreign-key constraints (children first, then parents).
 */
import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/lib/generated/prisma/client";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("🗑️  Clearing database...");

    // Delete children first
    await prisma.gameParticipant.deleteMany();
    console.log("  ✅ GameParticipant");

    await prisma.game.deleteMany();
    console.log("  ✅ Game");

    await prisma.refreshToken.deleteMany();
    console.log("  ✅ RefreshToken");

    await prisma.user.deleteMany();
    console.log("  ✅ User");

    console.log("🎉 All data deleted. Database is now empty.");
}

main()
    .catch((e) => {
        console.error("❌ Error clearing database:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
