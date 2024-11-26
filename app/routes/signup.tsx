import { useState } from "react";
import { json, type ActionFunction, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { motion } from "framer-motion";
import { validateEmail, checkPasswordStrength } from "~/utils/validation";
import { authService } from "~/services/auth.server";
import { createUserSession } from "~/services/session.server";

// 在组件外部添加 socialButtons 定义
const socialButtons = [
  {
    name: "GitHub",
    icon: "/icons/github.svg",
    bgColor: "hover:bg-[#24292e]",
    url: "/auth/github", // 添加实际的认证 URL
  },
  {
    name: "Google",
    icon: "/icons/google.svg",
    bgColor: "hover:bg-[#4285f4]",
    url: "/auth/google",
  },
  {
    name: "LinuxDo",
    icon: "/icons/linuxdo.svg",
    bgColor: "hover:bg-[#0088cc]",
    url: "/auth/linuxdo",
  },
];

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const name = formData.get("name")?.toString();
  const verifyCode = formData.get("emailVerifyCode")?.toString();

  if (!email || !password || !name || !verifyCode) {
    return json({ error: "请填写所有必填字段" }, { status: 400 });
  }

  try {
    // 验证邮箱验证码
    const isValidCode = await authService.verifyEmailCode(email, verifyCode);
    if (!isValidCode) {
      return json({ error: "验证码无效或已过期" }, { status: 400 });
    }

    // 创建用户
    const user = await authService.createUser({
      email,
      password,
      name,
    });

    // 创建会话并重定向到用户主页
    return createUserSession(user.id, `/${name}`);
  } catch (error: unknown) {
    console.error("Signup error:", error);

    // 处理特定的错误类型
    if (error instanceof Error) {
      // 处理邮箱已注册的错误
      if (error.message === "Email already registered") {
        return json({ error: "该邮箱已被注册" }, { status: 400 });
      }

      // 处理用户名已存在的错误
      if (
        error.message.includes(
          "Unique constraint failed on the fields: (`name`)"
        )
      ) {
        return json({ error: "该用户名已被使用" }, { status: 400 });
      }
    }

    // 处理其他未知错误
    return json({ error: "注册失败，请稍后重试" }, { status: 500 });
  }
};

// 修改 loader 函数，处理验证码发送
export const loader = async ({ request }: { request: Request }) => {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");

  if (email) {
    try {
      const code = await authService.generateAndSendVerificationCode(email);
      await authService.createVerificationForEmail(email, code);
      return json({ success: true });
    } catch (error) {
      console.error("Send verification code error:", error);
      // 开发环境下不返回错误，让流程继续
      return json({ success: true });
    }
  }

  return json({});
};

export default function Signup() {
  const submit = useSubmit();
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [emailVerifyCode, setEmailVerifyCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [verifyCodeError, setVerifyCodeError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
  });
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isCodeVerified, setIsCodeVerified] = useState(false);

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
              type: "EMAIL_VERIFICATION",
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

  // 添加清除验证码的函数
  const clearVerifyCode = () => {
    setEmailVerifyCode("");
    setIsCodeVerified(false);
    setVerifyCodeError("");
    // 聚焦第一个输入框
    const firstInput = document.querySelector(
      'input[name="verifyCode0"]'
    ) as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  };

  // 修改验证码删除处理
  const handleVerifyCodeKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (!emailVerifyCode[index]) {
        // 当前输入框为空，删除前一个输入框的内容
        if (index > 0) {
          const newCode = emailVerifyCode.split("");
          newCode[index - 1] = "";
          setEmailVerifyCode(newCode.join(""));
          // 重置验证状态
          setIsCodeVerified(false);
          setVerifyCodeError("");
          const prevInput = document.querySelector(
            `input[name="verifyCode${index - 1}"]`
          ) as HTMLInputElement;
          if (prevInput) {
            prevInput.focus();
          }
        }
      } else {
        // 当前输入框有内容，清空当前输入框
        const newCode = emailVerifyCode.split("");
        newCode[index] = "";
        setEmailVerifyCode(newCode.join(""));
        // 重置验证状态
        setIsCodeVerified(false);
        setVerifyCodeError("");
      }
    }
  };

  // 发送验证码时重置状态
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
      await fetch(`/signup?email=${email}`);
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
      // 重置所有验证相关的状态
      setVerifyCodeError("");
      setIsCodeVerified(false);
      setEmailVerifyCode("");
    } catch (error) {
      setVerifyCodeError("发送验证码失败，请稍后重试");
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { score, message } = checkPasswordStrength(e.target.value);
    setPasswordStrength({ score, message });
  };

  const validateForm = () => {
    const errors = {
      name: "",
      email: "",
      password: "",
    };

    const name = (document.getElementById("name") as HTMLInputElement).value;
    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement)
      .value;

    if (!name) {
      errors.name = "请输入用户名";
    } else if (name.length < 2) {
      errors.name = "用户名至少需要2个字符";
    }

    if (!email) {
      errors.email = "请输入邮箱地址";
    } else if (!validateEmail(email)) {
      errors.email = "请输入有效的邮箱地址";
    }

    if (!password) {
      errors.password = "请输入密码";
    } else if (password.length < 8) {
      errors.password = "密码至少需要8个字符";
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

  // 添加加载状态组件
  const LoadingSpinner = () => (
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
  );

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

        {/* 注册表单 */}
        <div className="relative">
          {/* 背景光晕效果 */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 rounded-2xl blur opacity-20"></div>

          <div className="relative bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              创建账号
            </h2>

            <Form method="post" className="space-y-6" onSubmit={handleSubmit}>
              {actionData?.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                  {actionData.error}
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300"
                >
                  用户名
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
                  placeholder="您的用户名"
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
                )}
              </div>

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
                      onKeyDown={(e) => handleVerifyCodeKeyDown(index, e)}
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

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300"
                >
                  密码
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    onChange={(e) => handlePasswordChange(e)}
                    className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
                    placeholder="至少8个字符"
                  />
                  {passwordStrength.message && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <div className={`h-2 flex gap-1`}>
                        {[...Array(4)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-6 h-full rounded-full transition-colors ${
                              i < passwordStrength.score
                                ? passwordStrength.score <= 1
                                  ? "bg-red-500"
                                  : passwordStrength.score === 2
                                  ? "bg-yellow-500"
                                  : passwordStrength.score === 3
                                  ? "bg-green-500"
                                  : "bg-blue-500"
                                : "bg-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                      <span
                        className={`text-sm ${
                          passwordStrength.score <= 1
                            ? "text-red-500"
                            : passwordStrength.score === 2
                            ? "text-yellow-500"
                            : passwordStrength.score === 3
                            ? "text-green-500"
                            : "text-blue-500"
                        }`}
                      >
                        {passwordStrength.message}
                      </span>
                    </div>
                  )}
                </div>
                {formErrors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                  我同意
                  <Link
                    to="/terms"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    服务条款
                  </Link>{" "}
                  和{" "}
                  <Link
                    to="/privacy"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    隐私政策
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={!agreeToTerms || isSubmitting}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl font-medium transition-all hover:from-blue-600 hover:to-violet-600 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner />
                    <span>注册中...</span>
                  </>
                ) : (
                  "创建账号"
                )}
              </button>
            </Form>

            <div className="mt-6 text-center">
              <span className="text-gray-400">已有账号？</span>
              <Link
                to="/login"
                className="ml-2 text-blue-400 hover:text-blue-300"
              >
                立即登录
              </Link>
            </div>
          </div>
        </div>

        {/* 社交登录 */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-gray-400">
                或��用以下方式注册
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            {socialButtons.map((button, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => (window.location.href = button.url)}
                className={`flex items-center justify-center px-4 py-3 bg-gray-800/50 ${button.bgColor} rounded-xl border border-gray-700/50 transition-all duration-300 group`}
              >
                <img
                  src={button.icon}
                  alt={button.name}
                  className="w-5 h-5 group-hover:scale-110 transition-transform"
                />
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
