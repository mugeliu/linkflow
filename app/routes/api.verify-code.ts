import { json, type ActionFunction } from "@remix-run/node";
import { authService } from "~/services/auth.server";
import type { VerificationType } from "~/services/auth.server";

interface VerifyCodePayload {
  email: string;
  code: string;
  type: VerificationType;
}

export const action: ActionFunction = async ({ request }) => {
  try {
    const { email, code, type } = (await request.json()) as VerifyCodePayload;
    console.log("Verifying code:", { email, code, type });

    // 传入验证码类型
    const isValid = await authService.verifyEmailCode(email, code, type);
    console.log("Verification result:", isValid);
    return json({ success: isValid });
  } catch (error) {
    console.error("Verification error:", error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : "验证失败",
    });
  }
};
