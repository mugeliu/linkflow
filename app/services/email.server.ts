// 邮件发送参数接口
interface SendEmailParams {
  to: string;
  subject: string;
  content: string;
  from?: string;
  replyTo?: string;
}

export class EmailService {
  private readonly defaultFrom = "LinkFlow <no-reply@linkflow.com>";

  // 发送邮件的通用方法
  async sendEmail({ to, subject, content, from, replyTo }: SendEmailParams) {
    if (process.env.NODE_ENV === "production") {
      // TODO: 实现实际的邮件发送逻辑
      // 可以使用 nodemailer、AWS SES、SendGrid 等服务
      // 示例代码：
      /*
      const transporter = nodemailer.createTransport({
        // 邮件服务配置
      });

      await transporter.sendMail({
        from: from || this.defaultFrom,
        to,
        subject,
        html: content,
        replyTo,
      });
      */
      throw new Error("Production email sending not implemented");
    } else {
      // 开发环境下打印到控制台
      console.log(`
        =================== 开发环境邮件 ===================
        发送至: ${to}
        主题: ${subject}
        发件人: ${from || this.defaultFrom}
        ${replyTo ? `回复至: ${replyTo}\n` : ""}
        内容:
        ${content}
        =================================================
      `);
    }
  }

  // 发送验证码邮件
  async sendVerificationCode(
    email: string,
    code: string,
    type: "验证邮箱" | "重置密码"
  ) {
    const template = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>LinkFlow ${type}验证码</h2>
        <p>您好！</p>
        <p>您的验证码是：</p>
        <div style="
          font-size: 24px;
          font-weight: bold;
          color: #4F46E5;
          padding: 16px;
          background: #EEF2FF;
          border-radius: 8px;
          text-align: center;
          letter-spacing: 4px;
          margin: 24px 0;
        ">
          ${code}
        </div>
        <p>验证码 10 分钟内有效，请勿泄露给他人。</p>
        <p>如果这不是您的操作，请忽略此邮件。</p>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #E5E7EB;" />
        <p style="color: #6B7280; font-size: 14px;">
          此邮件由系统自动发送，请勿回复。
        </p>
      </div>
    `;

    await this.sendEmail({
      to: email,
      subject: `LinkFlow ${type}验证码`,
      content: template,
    });
  }
}

// 导出单例实例
export const emailService = new EmailService();

// 导出通用发送邮件方法
export const sendEmail = (params: SendEmailParams) =>
  emailService.sendEmail(params);
