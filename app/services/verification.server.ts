import { prisma } from "~/services/db.server";
import { sendEmail } from "~/services/email.server";

// 验证码类型
export type VerificationType = "EMAIL_VERIFICATION" | "PASSWORD_RESET";

// 发送验证码参数
export interface SendVerificationParams {
  email: string;
  type: VerificationType;
  userId?: string;
}

// 验证码验证参数
export interface VerifyCodeParams {
  email: string;
  code: string;
  type: VerificationType;
}

// 发送验证码返回类型
export interface SendVerificationResult {
  success: boolean;
  error?: string;
}

// 验证验证码返回类型
export interface VerifyCodeResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    emailVerified: boolean;
    role: string;
    status: string;
  };
}

export class VerificationService {
  private readonly maxAttempts = 3;
  private readonly expirationMinutes = 10;
  private readonly codeCooldownMinutes = 1;

  // 发送验证码
  async sendVerificationCode({
    email,
    type,
    userId,
  }: SendVerificationParams): Promise<SendVerificationResult> {
    try {
      // 检查频率限制
      await this.checkRateLimit(email);

      // 生成6位数字验证码
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // 删除旧的验证码
      await prisma.verification.deleteMany({
        where: {
          user: { email },
          type,
        },
      });

      // 存储新验证码
      const verification = await prisma.verification.create({
        data: {
          code,
          type,
          expiresAt: new Date(Date.now() + this.expirationMinutes * 60 * 1000),
          userId: userId || (await this.getUserIdByEmail(email)),
        },
      });

      // 发送验证码邮件
      await this.sendVerificationEmail(email, code, type);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "发送验证码失败",
      };
    }
  }

  // 验证验证码
  async verifyCode({
    email,
    code,
    type,
  }: VerifyCodeParams): Promise<VerifyCodeResult> {
    const verification = await prisma.verification.findFirst({
      where: {
        user: { email },
        code,
        type,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!verification) {
      throw new Error("验证码错误或已过期");
    }

    // 验证成功后删除验证码
    await prisma.verification.delete({
      where: { id: verification.id },
    });

    // 如果是邮箱验证，更新用户的邮箱验证状态
    if (type === "EMAIL_VERIFICATION") {
      await prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerified: true },
      });
    }

    return { success: true, user: verification.user };
  }

  // 私有方法：检查频率限制
  private async checkRateLimit(email: string) {
    const recentVerification = await prisma.verification.findFirst({
      where: {
        user: { email },
        createdAt: {
          gt: new Date(Date.now() - this.codeCooldownMinutes * 60 * 1000),
        },
      },
    });

    if (recentVerification) {
      throw new Error(`请等待 ${this.codeCooldownMinutes} 分钟后再试`);
    }
  }

  // 私有方法：根据邮箱获取用户ID
  private async getUserIdByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      throw new Error("用户不存在");
    }

    return user.id;
  }

  // 私有方法：发送验证码邮件
  private async sendVerificationEmail(
    email: string,
    code: string,
    type: VerificationType
  ) {
    const subject = type === "EMAIL_VERIFICATION" ? "邮箱验证" : "重置密码";
    const content = `您的验证码是：${code}，${this.expirationMinutes}分钟内有效。`;

    await sendEmail({
      to: email,
      subject,
      content,
    });
  }
}

// 导出单例实例
export const verificationService = new VerificationService();
