import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient;

// 避免开发环境下创建多个连接
declare global {
  var __db__: PrismaClient | undefined;
}

// 在生产环境创建新的 PrismaClient 实例
// 在开发环境重用已存在的连接
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.__db__) {
    global.__db__ = new PrismaClient({
      log: ["query", "error", "warn"],
    });
  }
  prisma = global.__db__;
}

export { prisma };
