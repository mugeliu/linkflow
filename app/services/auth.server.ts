import { Authenticator } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "~/services/session.server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { emailService } from "./email.server";

const prisma = new PrismaClient();

// 定义用户类型
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  emailVerified: boolean;
  role: string;
}

// 定义认证错误
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

// 创建认证器实例
export const authenticator = new Authenticator<User>(sessionStorage, {
  throwOnError: true,
});

// 配置表单登录策略
authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email");
    const password = form.get("password");

    // 验证表单数据
    if (typeof email !== "string" || typeof password !== "string") {
      throw new AuthError("请输入邮箱和密码");
    }

    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          avatar: true,
          emailVerified: true,
          role: true,
        },
      });

      if (!user || !(await bcrypt.compare(password, user.password))) {
        throw new AuthError("邮箱或密码错误");
      }

      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError("登录失败，请稍后重试");
    }
  }),
  "user-pass"
);

// 辅助函数：获取当前用户
export async function getCurrentUser(request: Request) {
  const user = await authenticator.isAuthenticated(request);
  return user;
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

  if (user.role !== "admin") {
    throw new Response("Forbidden", { status: 403 });
  }

  return user;
}

// 生成验证码
function generateVerificationCode(): string {
  return Math.random().toString().slice(2, 8);
}

// 发送验证码
export async function sendVerificationCode(userId: string): Promise<void> {
  const code = generateVerificationCode();

  // 存储验证码到数据库
  await prisma.verification.create({
    data: {
      userId,
      code,
      type: "EMAIL",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    },
  });

  // 获取用户邮箱
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user) throw new Error("User not found");

  await emailService.sendVerificationCode(user.email, code);
}

// 验证邮箱验证码
export async function verifyEmailCode(
  userId: string,
  code: string
): Promise<boolean> {
  // 查找并验证验证码
  const verification = await prisma.verification.findFirst({
    where: {
      userId,
      code,
      type: "EMAIL",
      expiresAt: { gt: new Date() },
    },
  });

  if (!verification) return false;

  // 验证成功，更新用户状态并删除验证码
  await Promise.all([
    prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    }),
    prisma.verification.delete({
      where: { id: verification.id },
    }),
  ]);

  return true;
}
