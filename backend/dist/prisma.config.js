"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const config_1 = require("prisma/config");
const database_url_1 = require("./src/database-url");
const databaseUrl = (0, database_url_1.normalizeDatabaseUrl)(process.env.DATABASE_URL);
if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing. Set it in backend/.env before running Prisma commands.");
}
const protocol = new URL(databaseUrl).protocol;
if (!protocol.startsWith("postgres")) {
    throw new Error(`DATABASE_URL must use a PostgreSQL connection string. Received: ${databaseUrl}`);
}
exports.default = (0, config_1.defineConfig)({
    schema: "prisma/schema.prisma",
    migrations: {
        path: "prisma/migrations",
        seed: "npx ts-node ./prisma/seed.ts",
    },
    datasource: {
        url: databaseUrl,
    },
});
//# sourceMappingURL=prisma.config.js.map