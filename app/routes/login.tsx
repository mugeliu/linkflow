import { useState } from "react";
import { json, type ActionFunction, redirect } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useNavigation,
  useSearchParams,
} from "@remix-run/react";
import { motion } from "framer-motion";
import { validateEmail } from "~/utils/validation";
import { authenticator } from "~/services/auth.server";
import { AuthorizationError } from "remix-auth";

// 定义社交登录按钮
const socialButtons = [
  {
    name: "GitHub",
    icon: "/icons/github.svg",
    bgColor: "hover:bg-[#24292e]",
    url: "/auth/github",
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

// 加载状态组件 - 移到组件外部
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

export const action: ActionFunction = async ({ request }) => {
  try {
    const user = await authenticator.authenticate("user-pass", request, {
      throwOnError: true,
      context: { request },
    });

    return redirect(`/${user.name}`);
  } catch (error) {
    // 不记录预期的错误
    if (!(error instanceof AuthorizationError)) {
      console.error("Login error:", error);
    }

    // 返回用户友好的错误信息
    if (error instanceof AuthorizationError) {
      return json({ error: error.message }, { status: 400 });
    }

    return json({ error: "登录失败，请稍后重试" }, { status: 500 });
  }
};

export default function Login() {
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
  });
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  // 使用 useSearchParams 替代 window.location
  const [searchParams] = useSearchParams();
  const isNewlyRegistered = searchParams.get("registered") === "true";
  const isPasswordReset = searchParams.get("reset") === "true";

  const validateForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = {
      email: "",
      password: "",
    };

    const email = (document.getElementById("email") as HTMLInputElement).value;
    const password = (document.getElementById("password") as HTMLInputElement)
      .value;

    if (!email) {
      errors.email = "请输入邮箱地址";
    } else if (!validateEmail(email)) {
      errors.email = "请输入有效的邮箱地址";
    }

    if (!password) {
      errors.password = "请输入密码";
    }

    setFormErrors(errors);

    // 如果没有错误，手动提交表单
    if (!Object.values(errors).some((error) => error)) {
      (e.target as HTMLFormElement).submit();
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-gray-900 to-gray-900 text-white flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo 部分添加动画效果 */}
        <motion.div className="text-center mb-8" whileHover={{ scale: 1.05 }}>
          <Link to="/" className="inline-block text-3xl font-bold">
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
              LinkFlow
            </span>
          </Link>
        </motion.div>

        {/* 登录表单卡片样式优化 */}
        <div className="relative">
          {/* 背景光晕效果 */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 rounded-2xl blur opacity-20"></div>

          <div className="relative bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              登录账号
            </h2>

            {isNewlyRegistered && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
                注册成功！请使用您的邮箱和密码登录。
              </div>
            )}

            {isPasswordReset && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
                密码重置成功！请使用新密码登录。
              </div>
            )}

            <Form
              method="post"
              className="space-y-6"
              onSubmit={validateForm}
              replace
            >
              {actionData?.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                  {actionData.error}
                </div>
              )}

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
                  placeholder="your@email.com"
                />
                {formErrors.email && (
                  <p className="text-sm text-red-500 mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300"
                >
                  密码
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
                  placeholder="您的密码"
                />
                {formErrors.password && (
                  <p className="text-sm text-red-500 mt-1">
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="remember"
                    className="w-4 h-4 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 text-sm text-gray-300"
                  >
                    记住我
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-400 hover:text-blue-300"
                >
                  忘记密码？
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl font-medium transition-all hover:from-blue-600 hover:to-violet-600 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner />
                    <span>登录中...</span>
                  </>
                ) : (
                  "登录"
                )}
              </button>
            </Form>

            <div className="mt-6 text-center">
              <span className="text-gray-400">还没有账号？</span>
              <Link
                to="/signup"
                className="ml-2 text-blue-400 hover:text-blue-300"
              >
                立即注册
              </Link>
            </div>
          </div>
        </div>

        {/* 社交登录部分样式优化 */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gradient-to-b from-gray-900 to-transparent text-gray-400">
                或使用以下方式登录
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
