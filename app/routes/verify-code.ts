import { json, type ActionFunction } from "@remix-run/node";
import { authService } from "~/services/auth.server";

export const action: ActionFunction = async ({ request }) => {
  try {
    const { email, code, type = "EMAIL_VERIFICATION" } = await request.json();
    console.log("Verifying code:", { email, code, type });
    const isValid = await authService.verifyEmailCode(email, code);
    console.log("Verification result:", isValid);
    return json({ success: isValid });
  } catch (error) {
    console.error("Verification error:", error);
    return json({ success: false, error: "验证失败" });
  }
};
