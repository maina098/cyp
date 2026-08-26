"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const adapter = new adapter_pg_1.PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new client_1.PrismaClient({ adapter });
async function main() {
    try {
        const updated = await prisma.user.update({
            where: { email: 'dullacyp@gmail.com' },
            data: { role: 'ADMIN', failedAttempts: 0, lockedUntil: null },
        });
        console.log('Admin user updated:', updated);
    }
    catch (error) {
        console.error('Error updating admin user:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=fix-admin.js.map