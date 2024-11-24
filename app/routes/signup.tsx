import { useState } from "react";
import { json, type ActionFunction } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { motion } from "framer-motion";

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
  const email = formData.get("email");
  const password = formData.get("password");
  const name = formData.get("name");

  // TODO: 实现实际的注册逻辑
  try {
    // 这里添加实际的注册逻辑
    return json({ success: true });
  } catch (error) {
    return json({ error: "注册失败，请稍后重试" }, { status: 400 });
  }
};

export default function Signup() {
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

  const sendVerifyCode = async () => {
    const email = (document.getElementById("email") as HTMLInputElement).value;
    if (!email) {
      // 显示邮箱为空的错误提示
      setVerifyCodeError("请输入邮箱地址");
      return;
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setVerifyCodeError("请输入有效的邮箱地址");
      return;
    }

    try {
      // TODO: 调用发送验证码 API
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
      setVerifyCodeError(""); // 清除错误提示
    } catch (error) {
      setVerifyCodeError("发送验证码失败，请稍后重试");
    }
  };

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    let message = "";

    if (password.length >= 8) score++;
    if (password.match(/[A-Z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^A-Za-z0-9]/)) score++;

    switch (score) {
      case 0:
      case 1:
        message = "弱";
        break;
      case 2:
        message = "中";
        break;
      case 3:
        message = "强";
        break;
      case 4:
        message = "非常强";
        break;
    }

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

    if (name.length < 2) {
      errors.name = "用户名至少需要2个字符";
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = "请输入有效的邮箱地址";
    }

    if (password.length < 8) {
      errors.password = "密码至少需要8个字符";
    }

    setFormErrors(errors);
    return !Object.values(errors).some((error) => error);
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

            <Form
              method="post"
              className="space-y-6"
              onSubmit={(e) => {
                if (!validateForm()) {
                  e.preventDefault();
                }
              }}
            >
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
                      maxLength={1}
                      value={emailVerifyCode[index] || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.match(/^[0-9]$/)) {
                          const newCode = emailVerifyCode.split("");
                          newCode[index] = value;
                          setEmailVerifyCode(newCode.join(""));
                          if (value && e.target.nextElementSibling) {
                            (
                              e.target.nextElementSibling as HTMLInputElement
                            ).focus();
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Backspace" &&
                          !emailVerifyCode[index] &&
                          e.target.previousElementSibling
                        ) {
                          (
                            e.target.previousElementSibling as HTMLInputElement
                          ).focus();
                        }
                      }}
                      className="w-12 h-12 text-center bg-gray-700/30 border border-gray-600/50 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-xl"
                    />
                  ))}
                </div>
                {verifyCodeError && (
                  <p className="text-sm text-red-500 mt-1">{verifyCodeError}</p>
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
                    onChange={(e) => checkPasswordStrength(e.target.value)}
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
                或使用以下方式注册
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
