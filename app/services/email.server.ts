export class EmailService {
  async sendVerificationCode(email: string, code: string) {
    if (process.env.NODE_ENV === "production") {
      // TODO: 实现实际的邮件发送逻辑
      throw new Error("Production email sending not implemented");
    } else {
      // 开发环境下打印到控制台
      console.log(`
        =================== 验证码邮件 ===================
        发送至: ${email}
        验证码: ${code}
        =================================================
      `);
    }
  }
}

export const emailService = new EmailService();
