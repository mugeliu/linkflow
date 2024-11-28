import { json, type ActionFunction } from "@remix-run/node";
import { requireUser } from "~/services/auth.server";
import { verifyEmailCode } from "~/services/auth.server";

export const action: ActionFunction = async ({ request }) => {
  try {
    const user = await requireUser(request);
    const formData = await request.formData();
    const code = formData.get("code");

    if (typeof code !== "string") {
      return json({ error: "请输入验证码" }, { status: 400 });
    }

    const isValid = await verifyEmailCode(user.id, code);

    if (!isValid) {
      return json({ error: "验证码错误或已过期" }, { status: 400 });
    }

    return json({ success: true });
  } catch (error) {
    console.error("Verify email error:", error);
    return json(
      { error: error instanceof Error ? error.message : "验证失败" },
      { status: 500 }
    );
  }
};
