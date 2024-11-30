import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  // 清理现有数据
  await prisma.user.deleteMany();

  // 创建管理员账号
  const adminPassword = await bcrypt.hash("123456", 10);
  await prisma.user.create({
    data: {
      email: "admin@mfcp.fun",
      name: "admin",
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
      emailVerified: true,
    },
  });

  console.log(`Database has been seeded. 🌱`);
  console.log(`Admin account created:`);
  console.log(`Email: admin@mfcp.fun`);
  console.log(`Password: 123456`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
