import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createId } from "@paralleldrive/cuid2";
import { emailService } from "./email.server";

const prisma = new PrismaClient();

export interface SignupData {
  email: string;
  password: string;
  name?: string | null;
}

export const UserRole = {
  ADMIN: "ADMIN",
  USER: "USER",
} as const;

export const VerificationType = {
  EMAIL_VERIFICATION: "EMAIL_VERIFICATION",
  PASSWORD_RESET: "PASSWORD_RESET",
} as const;

export type VerificationType =
  (typeof VerificationType)[keyof typeof VerificationType];

export class AuthService {
  // 创建新用户
  async createUser({ email, password, name }: SignupData) {
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      // 查找临时用户
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        // 如果是临时用户（密码为空），则更新用户信息
        if (!existingUser.password) {
          return prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name,
              password: hashedPassword,
              role: "USER",
            },
          });
        }
        // 如果不是临时用户，说明邮箱已被注册
        throw new Error("Email already registered");
      }

      // 如果用户不存在，创建新用户
      return prisma.user.create({
        data: {
          id: createId(),
          email: email.toLowerCase(),
          password: hashedPassword,
          name,
          role: "USER",
        },
      });
    } catch (error) {
      console.error("Create user error:", error);
      throw error;
    }
  }

  // 创建邮箱验证码
  async createEmailVerification(userId: string) {
    const code = Math.random().toString().slice(2, 8);
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30分钟后过期

    return prisma.verification.create({
      data: {
        id: createId(),
        code,
        userId,
        type: VerificationType.EMAIL_VERIFICATION,
        expiresAt,
      },
    });
  }

  // 验证邮箱验证码
  async verifyEmail(userId: string, code: string) {
    const verification = await prisma.verification.findFirst({
      where: {
        userId,
        code,
        type: VerificationType.EMAIL_VERIFICATION,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!verification) {
      return false;
    }

    await prisma.$transaction([
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

  // 创建会话
  async createSession(userId: string) {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30天后过期

    return prisma.session.create({
      data: {
        id: createId(),
        userId,
        expiresAt,
      },
    });
  }

  // 验证用户凭据
  async verifyCredentials(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return null;
    }

    return user;
  }

  // 生成验证码
  async generateAndSendVerificationCode(email: string) {
    const code = Math.random().toString().slice(2, 8);

    // 开发环境下只打印验证码
    if (process.env.NODE_ENV !== "production") {
      console.log(`
        =================== 验证码 ===================
        邮箱: ${email}
        验证码: ${code}
        ============================================
      `);
    }
    // TODO: 生产环境下实现邮件发送

    // 存储验证码
    await this.createVerificationForEmail(email, code);

    return code;
  }

  // 验证邮箱验证码
  async verifyEmailCode(
    email: string,
    code: string,
    type: VerificationType = "EMAIL_VERIFICATION"
  ) {
    try {
      console.log("Verifying code:", { email, code, type });

      const verification = await prisma.verification.findFirst({
        where: {
          user: {
            email: email.toLowerCase(),
          },
          code,
          type,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      console.log("Verification result:", verification);
      return !!verification;
    } catch (error) {
      console.error("Verify email code error:", error);
      return false;
    }
  }

  // 验证邮箱是否已存在
  async isEmailExists(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return !!user;
  }

  // 为邮箱创建验证码记录
  async createVerificationForEmail(
    email: string,
    code: string,
    type: VerificationType = "EMAIL_VERIFICATION"
  ) {
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30分钟后过期

    try {
      // 检查是否存在未过期的验证码
      const existingVerification = await prisma.verification.findFirst({
        where: {
          user: {
            email: email.toLowerCase(),
          },
          type,
          expiresAt: {
            gt: new Date(),
          },
        },
        include: {
          user: true,
        },
      });

      if (existingVerification) {
        // 如果存在未过期的验证码，更新它
        return prisma.verification.update({
          where: { id: existingVerification.id },
          data: {
            code,
            expiresAt,
          },
        });
      }

      // 检查是否存在已注册的用户
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      // 如果用户不存在，创建临时用户
      const user =
        existingUser ||
        (await prisma.user.create({
          data: {
            id: createId(),
            email: email.toLowerCase(),
            name: `temp_${createId()}`,
            password: "",
            role: "USER",
          },
        }));

      // 创建验证码
      return prisma.verification.create({
        data: {
          id: createId(),
          code,
          userId: user.id,
          type,
          expiresAt,
        },
      });
    } catch (error) {
      console.error("Create verification error:", error);
      throw error;
    }
  }

  // 检查用户名是否已存在
  async isNameExists(name: string) {
    const user = await prisma.user.findUnique({
      where: { name },
    });
    return !!user;
  }

  // 重置密码
  async resetPassword(email: string, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // 更新密码
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    // 删除所有相关的验证码
    await prisma.verification.deleteMany({
      where: {
        userId: user.id,
        type: "EMAIL_VERIFICATION",
      },
    });

    return true;
  }
}

// 导出单例实例
export const authService = new AuthService();
