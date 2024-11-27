import { Authenticator, AuthorizationError } from "remix-auth";
import { FormStrategy } from "remix-auth-form";
import { sessionStorage } from "~/services/session.server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { createId } from "@paralleldrive/cuid2";

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

// 创建认证器实例
export const authenticator = new Authenticator<User>(sessionStorage, {
  sessionKey: "userId",
  sessionErrorKey: "error",
});

// 注册新用户
export async function registerUser(data: {
  email: string;
  password: string;
  name: string;
}) {
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email.toLowerCase() }, { name: data.name }],
      },
    });

    if (existingUser?.email === data.email.toLowerCase()) {
      throw new AuthorizationError("该邮箱已被注册");
    }

    if (existingUser?.name === data.name) {
      throw new AuthorizationError("该用户名已被使用");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        id: createId(),
        email: data.email.toLowerCase(),
        password: hashedPassword,
        name: data.name,
        role: "USER",
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        emailVerified: true,
        role: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

// 自定义错误类型
export class LoginError extends AuthorizationError {
  constructor(message: string) {
    super(message);
    this.name = "LoginError";
  }
}

// 配置表单登录策略
authenticator.use(
  new FormStrategy(async ({ form }) => {
    try {
      const email = form.get("email");
      const password = form.get("password");

      if (
        !email ||
        !password ||
        typeof email !== "string" ||
        typeof password !== "string"
      ) {
        throw new LoginError("请填写所有必填字段");
      }

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

      if (!user) {
        throw new LoginError("邮箱或密码错误");
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new LoginError("邮箱或密码错误");
      }

      // 返回不包含密码的用户信息
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      // 只记录非预期的错误
      if (!(error instanceof LoginError)) {
        console.error("Authentication error:", error);
      }
      throw error;
    }
  }),
  "user-pass"
);

// 验证码相关功能
export async function generateAndSendVerificationCode(email: string) {
  const code = Math.random().toString().slice(2, 8);
  console.log(`
    =================== 验证码邮件 ===================
    发送至: ${email}
    验证码: ${code}
    =================================================
  `);
  return code;
}

export async function createVerificationForEmail(
  email: string,
  code: string,
  type: string = "EMAIL_VERIFICATION"
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

export async function verifyEmailCode(
  email: string,
  code: string,
  type: string = "EMAIL_VERIFICATION"
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

// 辅助函数
export async function requireUser(request: Request) {
  const user = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  return user;
}

export async function getUser(request: Request) {
  return await authenticator.isAuthenticated(request);
}

// 自定义错误类型
export class VerificationError extends AuthorizationError {
  constructor(message: string) {
    super(message);
    this.name = "VerificationError";
  }
}

// 重置密码
export async function resetPassword(
  email: string,
  code: string,
  newPassword: string
) {
  try {
    // 先验证验证码
    const verification = await prisma.verification.findFirst({
      where: {
        user: {
          email: email.toLowerCase(),
        },
        code,
        type: "PASSWORD_RESET",
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!verification) {
      throw new VerificationError("验证码无效或已过期");
    }

    // 查找用户
    const user = verification.user;

    // 更新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // 删除已使用的验证码
    await prisma.verification.deleteMany({
      where: {
        userId: user.id,
        type: "PASSWORD_RESET",
      },
    });

    return user;
  } catch (error) {
    if (error instanceof VerificationError) {
      throw error;
    }
    // 其他错误转换为通用错误
    throw new AuthorizationError("重置密码失败，请稍后重试");
  }
}
