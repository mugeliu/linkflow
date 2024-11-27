import { useState } from "react";
import { json, redirect, type ActionFunction } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { motion } from "framer-motion";
import { validateEmail } from "~/utils/validation";
import { AuthorizationError } from "remix-auth";
import {
  generateAndSendVerificationCode,
  createVerificationForEmail,
  resetPassword,
  verifyEmailCode,
} from "~/services/auth.server";

// 简化为两个步骤
enum ResetStep {
  EMAIL = "email",
  RESET = "reset",
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const step = formData.get("step") as ResetStep;
  const email = formData.get("email") as string;

  try {
    switch (step) {
      case ResetStep.EMAIL: {
        if (!email || !validateEmail(email)) {
          throw new AuthorizationError("请输入有效的邮箱地址");
        }

        // 生成并发送验证码
        const code = await generateAndSendVerificationCode(email);
        await createVerificationForEmail(email, code, "PASSWORD_RESET");

        return json({ success: true, email });
      }

      case ResetStep.RESET: {
        const code = formData.get("code") as string;
        const password = formData.get("password") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (!code || code.length !== 6) {
          throw new AuthorizationError("请输入6位验证码");
        }

        if (!password || password.length < 6) {
          throw new AuthorizationError("密码长度至少为6位");
        }

        if (password !== confirmPassword) {
          throw new AuthorizationError("两次输入的密码不一致");
        }

        try {
          await resetPassword(email, code, password);
          return redirect("/login?reset=true");
        } catch (error) {
          if (error instanceof AuthorizationError) {
            return json({ error: error.message }, { status: 400 });
          }
          return json({ error: "重置密码失败，请稍后重试" }, { status: 500 });
        }
      }

      default:
        return json({ error: "无效的操作" }, { status: 400 });
    }
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return json({ error: error.message }, { status: 400 });
    }
    console.error("Password reset error:", error);
    return json({ error: "操作失败，请稍后重试" }, { status: 500 });
  }
};

export default function ForgotPassword() {
  const [step, setStep] = useState<ResetStep>(ResetStep.EMAIL);
  const [email, setEmail] = useState("");
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // 处理表单提交成功
  if (actionData?.success) {
    if (step === ResetStep.EMAIL) {
      setStep(ResetStep.RESET);
      setEmail(actionData.email);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-gray-900 to-gray-900 text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <motion.div className="text-center mb-8" whileHover={{ scale: 1.05 }}>
          <Link to="/" className="inline-block text-3xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
              LinkFlow
            </span>
          </Link>
        </motion.div>

        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 rounded-2xl blur opacity-20" />

          <div className="relative bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              重置密码
            </h2>

            {actionData?.error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                {actionData.error}
              </div>
            )}

            <Form method="post" className="space-y-6">
              <input type="hidden" name="step" value={step} />
              {email && <input type="hidden" name="email" value={email} />}

              {step === ResetStep.EMAIL ? (
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300"
                  >
                    邮箱地址
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
                    placeholder="请输入您的邮箱地址"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label
                      htmlFor="code"
                      className="block text-sm font-medium text-gray-300"
                    >
                      验证码
                    </label>
                    <input
                      type="text"
                      id="code"
                      name="code"
                      required
                      maxLength={6}
                      className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
                      placeholder="请输入6位验证码"
                    />
                    <p className="text-sm text-gray-400">
                      验证码已发送至：{email}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-300"
                    >
                      新密码
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      required
                      className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
                      placeholder="请设置新密码（至少6位）"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-300"
                    >
                      确认密码
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      required
                      className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
                      placeholder="请再次输入新密码"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl font-medium transition-all hover:from-blue-600 hover:to-violet-600 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>处理中...</span>
                  </>
                ) : step === ResetStep.EMAIL ? (
                  "发送验证码"
                ) : (
                  "重置密码"
                )}
              </button>
            </Form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                返回登录
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
