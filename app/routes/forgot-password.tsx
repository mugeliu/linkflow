import { useState } from "react";
import { json, type ActionFunction } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { motion } from "framer-motion";
import { validateEmail } from "~/utils/validation";
import { authService } from "~/services/auth.server";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const verifyCode = formData.get("emailVerifyCode")?.toString();
  const newPassword = formData.get("newPassword")?.toString();

  // 如果是重置密码请求
  if (!email || !verifyCode || !newPassword) {
    return json({ error: "请填写所有必填字段" }, { status: 400 });
  }

  try {
    // 验证邮箱验证码
    const isValidCode = await authService.verifyEmailCode(email, verifyCode);
    if (!isValidCode) {
      return json({ error: "验证码无效或已过期" }, { status: 400 });
    }

    // 重置密码
    await authService.resetPassword(email, newPassword);
    return json({ success: true, message: "密码重置成功，请重新登录" });
  } catch (error) {
    console.error("Reset password error:", error);
    return json({ error: "密码重置失败，请稍后重试" }, { status: 500 });
  }
};

export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");

  if (email) {
    try {
      const code = await authService.generateAndSendVerificationCode(email);
      await authService.createVerificationForEmail(
        email,
        code,
        "PASSWORD_RESET"
      );
      return json({ success: true });
    } catch (error) {
      console.error("Send verification code error:", error);
      return json({ success: true }); // 开发环境下继续流程
    }
  }

  return json({});
};

export default function ForgotPassword() {
  const [emailVerifyCode, setEmailVerifyCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [verifyCodeError, setVerifyCodeError] = useState("");
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [formErrors, setFormErrors] = useState({
    email: "",
    newPassword: "",
  });
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // 发送验证码
  const sendVerifyCode = async () => {
    const email = (document.getElementById("email") as HTMLInputElement).value;
    if (!email) {
      setVerifyCodeError("请输入邮箱地址");
      return;
    }

    if (!validateEmail(email)) {
      setVerifyCodeError("请输入有效的邮箱地址");
      return;
    }

    try {
      await fetch(`/forgot-password?email=${email}`);
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setVerifyCodeError("");
    } catch (error) {
      setVerifyCodeError("发送验证码失败，请稍后重试");
    }
  };

  // 验证码输入处理
  const handleVerifyCodeChange = async (index: number, value: string) => {
    if (value.match(/^[0-9]$/)) {
      const newCode = emailVerifyCode.split("");
      newCode[index] = value;
      const updatedCode = newCode.join("");
      setEmailVerifyCode(updatedCode);

      if (updatedCode.length === 6) {
        const email = (document.getElementById("email") as HTMLInputElement)
          .value;
        try {
          const response = await fetch("/api/verify-code", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              code: updatedCode,
              type: "PASSWORD_RESET",
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          if (data.success) {
            setIsCodeVerified(true);
            setVerifyCodeError("");
          } else {
            setVerifyCodeError("验证码错误，请重新输入");
            setIsCodeVerified(false);
            setEmailVerifyCode("");
            const firstInput = document.querySelector(
              'input[name="verifyCode0"]'
            ) as HTMLInputElement;
            if (firstInput) {
              firstInput.focus();
            }
          }
        } catch (error) {
          console.error("Verification error:", error);
          setVerifyCodeError("验证失败，请重试");
          setIsCodeVerified(false);
          setEmailVerifyCode("");
        }
      }

      // 自动聚焦下一个输入框
      if (value && index < 5) {
        const nextInput = document.querySelector(
          `input[name="verifyCode${index + 1}"]`
        ) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  const validateForm = () => {
    const errors = {
      email: "",
      newPassword: "",
    };

    const email = (document.getElementById("email") as HTMLInputElement).value;
    const newPassword = (
      document.getElementById("newPassword") as HTMLInputElement
    ).value;

    if (!email) {
      errors.email = "请输入邮箱地址";
    } else if (!validateEmail(email)) {
      errors.email = "请输入有效的邮箱地址";
    }

    if (!newPassword) {
      errors.newPassword = "请输入新密码";
    } else if (newPassword.length < 8) {
      errors.newPassword = "密码至少需要8个字符";
    }

    setFormErrors(errors);
    return !Object.values(errors).some((error) => error);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!validateForm()) {
      e.preventDefault();
      return;
    }

    if (!isCodeVerified) {
      setVerifyCodeError("请先验证邮箱验证码");
      e.preventDefault();
      return;
    }

    // 添加验证码到表单
    const verifyCodeInput = document.createElement("input");
    verifyCodeInput.type = "hidden";
    verifyCodeInput.name = "emailVerifyCode";
    verifyCodeInput.value = emailVerifyCode;
    e.currentTarget.appendChild(verifyCodeInput);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-gray-900 to-gray-900 text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div className="text-center mb-8" whileHover={{ scale: 1.05 }}>
          <Link to="/" className="inline-block text-3xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
              LinkFlow
            </span>
          </Link>
        </motion.div>

        {/* 重置密码表单 */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 rounded-2xl blur opacity-20"></div>

          <div className="relative bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              重置密码
            </h2>

            <Form method="post" className="space-y-6" onSubmit={handleSubmit}>
              {actionData?.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                  {actionData.error}
                </div>
              )}

              {actionData?.success && (
                <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-500 text-sm">
                  {actionData.message}
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-300"
                >
                  邮箱地址
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="flex-1 px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
                    placeholder="your@email.com"
                  />
                  <button
                    type="button"
                    onClick={sendVerifyCode}
                    disabled={countdown > 0}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 rounded-xl transition-colors whitespace-nowrap"
                  >
                    {countdown > 0 ? `${countdown}s` : "发送验证码"}
                  </button>
                </div>
                {formErrors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* 验证码输入框 */}
              <div className="space-y-2">
                <label
                  htmlFor="verifyCode"
                  className="block text-sm font-medium text-gray-300"
                >
                  验证码
                </label>
                <div className="flex gap-2">
                  {[...Array(6)].map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      name={`verifyCode${index}`}
                      maxLength={1}
                      value={emailVerifyCode[index] || ""}
                      onChange={(e) =>
                        handleVerifyCodeChange(index, e.target.value)
                      }
                      className={`w-12 h-12 text-center ${
                        isCodeVerified
                          ? "border-green-500 ring-2 ring-green-500/50"
                          : "border-gray-600/50"
                      } bg-gray-700/30 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-xl`}
                    />
                  ))}
                </div>
                {verifyCodeError && (
                  <p className="text-sm text-red-500 mt-1">{verifyCodeError}</p>
                )}
                {isCodeVerified && (
                  <p className="text-sm text-green-500 mt-1">✓ 验证码正确</p>
                )}
              </div>

              {/* 新密码输入框 */}
              <div className="space-y-2">
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-300"
                >
                  新密码
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  required
                  className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
                  placeholder="请输入新密码"
                />
                {formErrors.newPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {formErrors.newPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isCodeVerified}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl font-medium transition-all hover:from-blue-600 hover:to-violet-600 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "重置中..." : "重置密码"}
              </button>
            </Form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-blue-400 hover:text-blue-300">
                返回登录
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
