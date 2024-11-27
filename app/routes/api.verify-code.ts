import { json, type ActionFunction } from "@remix-run/node";
import { verifyEmailCode } from "~/services/auth.server";
import { AuthorizationError } from "remix-auth";

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const code = formData.get("code") as string;
    const type = (formData.get("type") as string) || "EMAIL_VERIFICATION";

    if (!email || !code) {
      throw new AuthorizationError("请提供邮箱和验证码");
    }

    const isValid = await verifyEmailCode(email, code, type);

    if (!isValid) {
      throw new AuthorizationError("验证码无效或已过期");
    }

    return json({ success: true });
  } catch (error) {
    console.error("Verify code error:", error);
    if (error instanceof AuthorizationError) {
      return json({ error: error.message }, { status: 400 });
    }
    return json({ error: "验证失败" }, { status: 500 });
  }
};
