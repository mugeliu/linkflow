import { json, type ActionFunction } from "@remix-run/node";
import { requireUser } from "~/services/auth.server";
import { sendVerificationCode } from "~/services/auth.server";

export const action: ActionFunction = async ({ request }) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const userId = formData.get("userId");

    if (!userId) {
      throw new Error("请提供用户ID");
    }

    // 发送验证码
    await sendVerificationCode(userId.toString());

    return json({ success: true });
  } catch (error) {
    console.error("Send code error:", error);
    return json(
      { error: error instanceof Error ? error.message : "发送验证码失败" },
      { status: 500 }
    );
  }
};
