import { PrismaClient as PrismaPostgres } from '../../prisma/generated/postgres_client';
import { PrismaClient as PrismaMongo } from '../../prisma/generated/mongo_client';

const globalForPrisma = global;

// Initialize Postgres Client (for Users)
export const pg = globalForPrisma.pg || new PrismaPostgres();

// Initialize Mongo Client (for Content)
export const mongo = globalForPrisma.mongo || new PrismaMongo();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pg = pg;
  globalForPrisma.mongo = mongo;
}