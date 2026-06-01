// =============================================================================
// Prisma Client Singleton
// =============================================================================
// WHY do we need this file?
//
// In development, Next.js uses "hot reloading" — every time you save a file,
// it re-runs your code. Without this singleton pattern, each reload would
// create a NEW database connection. After a few saves, you'd have dozens of
// open connections and PostgreSQL would refuse new ones.
//
// This pattern:
// 1. Creates one PrismaClient instance
// 2. Stores it on the global object (survives hot reloads)
// 3. Reuses it across all API routes and server components
//
// In production, this isn't needed (no hot reload), but it doesn't hurt.
// =============================================================================

import { PrismaClient } from "@prisma/client";

// Extend the global type to include our prisma instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Reuse existing instance or create a new one
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]  // Log all queries in dev (helps debugging)
        : ["error"],                   // Only errors in production
  });

// In development, save the instance to survive hot reloads
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
