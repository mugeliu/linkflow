import { useState } from "react";
import {
  json,
  type ActionFunction,
  type LoaderFunction,
  redirect,
} from "@remix-run/node";
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
import { getSession, sessionStorage } from "~/services/session.server";

// 定义 action 的返回数据类型
interface ActionData {
  error?: string;
}

// 加载状态组件
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

// 处理已登录用户的重定向
export const loader: LoaderFunction = async ({ request }) => {
  // 检查用户是否已登录
  const user = await authenticator.isAuthenticated(request);

  // 如果已登录，重定向到用户主页
  if (user) {
    return redirect(`/${user.name}`);
  }

  return null;
};

// 处理登录表单提交
export const action: ActionFunction = async ({ request }) => {
  try {
    // 1. 获取重定向地址
    const formData = await request.clone().formData();
    const redirectTo = formData.get("redirectTo")?.toString();

    // 2. 获取会话
    const session = await getSession(request);

    // 3. 进行认证
    const user = await authenticator.authenticate("user-pass", request);

    // 4. 设置用户信息到会话
    session.set(authenticator.sessionKey, user);

    // 5. 返回重定向响应
    return redirect(redirectTo || `/${user.name}`, {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
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
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "";

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
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 rounded-2xl blur opacity-20"></div>
          <div className="relative bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-gray-700/50">
            <h2 className="text-2xl font-bold mb-6 text-center">登录账号</h2>

            <Form
              method="post"
              className="space-y-6"
              onSubmit={validateForm}
              replace
            >
              <input type="hidden" name="redirectTo" value={redirectTo} />

              {actionData?.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                  {actionData.error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  邮箱地址
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formErrors.email && (
                  <p className="text-sm text-red-500">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium">
                  密码
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {formErrors.password && (
                  <p className="text-sm text-red-500">{formErrors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl font-medium disabled:opacity-50"
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

            <div className="mt-6 text-center space-y-2">
              <div>
                <span className="text-gray-400">还没有账号？</span>
                <Link
                  to="/signup"
                  className="ml-2 text-blue-400 hover:text-blue-300"
                >
                  立即注册
                </Link>
              </div>
              <div>
                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-400 hover:text-blue-300"
                >
                  忘记密码？
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
