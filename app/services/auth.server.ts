import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "~/services/session.server";
import { prisma } from "~/services/db.server";
import bcrypt from "bcryptjs";
import type { User as PrismaUser } from "@prisma/client";

// 定义我们的用户类型
export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  emailVerified: boolean;
  isAdmin: boolean;
  status: string;
}

// 创建认证器实例
export const authenticator = new Authenticator<User>(sessionStorage);

// 将 Prisma 用户类型转换为我们的用户类型
function convertToUser(prismaUser: PrismaUser): User {
  return {
    id: prismaUser.id,
    email: prismaUser.email,
    name: prismaUser.name,
    avatar: prismaUser.avatar,
    emailVerified: prismaUser.emailVerified,
    isAdmin: prismaUser.role === "ADMIN",
    status: prismaUser.status,
  };
}

// 配置表单登录策略
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email");
    const password = form.get("password");

    if (typeof email !== "string" || typeof password !== "string") {
      throw new Error("请输入邮箱和密码");
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new Error("用户不存在");
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error("密码错误");
    }

    if (user.status !== "ACTIVE") {
      throw new Error("账号已被禁用");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      emailVerified: user.emailVerified,
      isAdmin: user.role === "ADMIN",
      status: user.status,
    };
  }),
  "user-pass"
);

// 辅助函数：获取当前用户
export async function getCurrentUser(request: Request) {
  return await authenticator.isAuthenticated(request);
}

// 辅助函数：要求用户登录
export async function requireUser(request: Request) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  return user;
}

// 辅助函数：要求管理员权限
export async function requireAdmin(request: Request) {
  const user = await requireUser(request);

  if (!user.isAdmin) {
    throw new Response("Forbidden", { status: 403 });
  }

  return user;
}

// 辅助函数：注册新用户
export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
}) {
  // 检查邮箱是否已存在
  const existingUserByEmail = await prisma.user.findUnique({
    where: { email: data.email.toLowerCase() },
  });

  if (existingUserByEmail) {
    throw new Error("该邮箱已被注册");
  }

  // 检查用户名是否已存在
  const existingUserByName = await prisma.user.findUnique({
    where: { name: data.name },
  });

  if (existingUserByName) {
    throw new Error("该用户名已被使用");
  }

  // 创建新用户
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      name: data.name,
      password: hashedPassword,
      role: "USER",
      emailVerified: false,
    },
  });

  return convertToUser(user);
}
