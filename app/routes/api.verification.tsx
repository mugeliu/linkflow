import { json, type ActionFunctionArgs } from "@remix-run/node";
import {
  verificationService,
  type VerificationType,
} from "~/services/verification.server";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const action = formData.get("action");

    // 根据 action 区分是发送还是验证
    switch (action) {
      case "send": {
        const email = formData.get("email");
        const type = formData.get("type");
        const userId = formData.get("userId");

        if (!email || typeof email !== "string") {
          return json({ error: "邮箱地址不能为空" }, { status: 400 });
        }

        if (
          !type ||
          !["EMAIL_VERIFICATION", "PASSWORD_RESET"].includes(type as string)
        ) {
          return json({ error: "无效的验证类型" }, { status: 400 });
        }

        const result = await verificationService.sendVerificationCode({
          email,
          type: type as VerificationType,
          userId: userId as string,
        });

        return json(result);
      }

      case "verify": {
        const email = formData.get("email");
        const code = formData.get("code");
        const type = formData.get("type");

        if (!email || typeof email !== "string") {
          return json({ error: "邮箱地址不能为空" }, { status: 400 });
        }

        if (!code || typeof code !== "string") {
          return json({ error: "验证码不能为空" }, { status: 400 });
        }

        if (
          !type ||
          !["EMAIL_VERIFICATION", "PASSWORD_RESET"].includes(type as string)
        ) {
          return json({ error: "无效的验证类型" }, { status: 400 });
        }

        const result = await verificationService.verifyCode({
          email,
          code,
          type: type as VerificationType,
        });

        return json(result);
      }

      default:
        return json({ error: "无效的操作" }, { status: 400 });
    }
  } catch (error) {
    console.error("Verification error:", error);
    return json(
      { error: error instanceof Error ? error.message : "操作失败" },
      { status: 400 }
    );
  }
}
