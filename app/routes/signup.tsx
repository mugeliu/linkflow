import { useState } from "react";
import { json, redirect, type ActionFunction } from "@remix-run/node";
import { Form, Link, useActionData, useNavigation } from "@remix-run/react";
import { motion } from "framer-motion";
import { validateEmail } from "~/utils/validation";
import { authenticator } from "~/services/auth.server";
import { registerUser } from "~/services/auth.server";

// 添加 LoadingSpinner 组件
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

// 更新输入字段配置，添加确认密码字段
const inputFields = [
  {
    id: "email",
    label: "邮箱地址",
    type: "email",
    placeholder: "your@email.com",
  },
  {
    id: "name",
    label: "用户名",
    type: "text",
    placeholder: "请输入用户名",
  },
  {
    id: "password",
    label: "密码",
    type: "password",
    placeholder: "请设置密码（至少6位）",
  },
  {
    id: "confirmPassword",
    label: "确认密码",
    type: "password",
    placeholder: "请再次输入密码",
  },
] as const;

export const action: ActionFunction = async ({ request }) => {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    // 验证表单数据
    if (!email || !password || !confirmPassword || !name) {
      throw new Error("请填写所有必填字段");
    }

    if (!validateEmail(email)) {
      throw new Error("请输入有效的邮箱地址");
    }

    if (password.length < 6) {
      throw new Error("密码长度至少为6位");
    }

    if (password !== confirmPassword) {
      throw new Error("两次输入的密码不一致");
    }

    if (name.length < 2) {
      throw new Error("用户名至少需要2个字符");
    }

    // 注册用户
    const user = await registerUser({
      email,
      password,
      name,
    });

    // 创建新的登录表单数据
    const loginFormData = new FormData();
    loginFormData.append("email", email);
    loginFormData.append("password", password);

    // 创建新的请求对象用于登录
    const loginRequest = new Request(request.url, {
      method: "POST",
      body: loginFormData,
      headers: request.headers,
    });

    // 使用新的请求对象进行登录
    return await authenticator.authenticate("user-pass", loginRequest, {
      successRedirect: `/${user.name}`,
      failureRedirect: "/login",
    });
  } catch (error) {
    if (error instanceof Error) {
      return json({ error: error.message }, { status: 400 });
    }
    return json({ error: "注册失败，请稍后重试" }, { status: 500 });
  }
};

export default function Signup() {
  const [formErrors, setFormErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const validateForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors = {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    };

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const name = formData.get("name") as string;

    if (!email) {
      errors.email = "请输入邮箱地址";
    } else if (!validateEmail(email)) {
      errors.email = "请输入有效的邮箱地址";
    }

    if (!password) {
      errors.password = "请输入密码";
    } else if (password.length < 6) {
      errors.password = "密码长度至少为6位";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "请确认密码";
    } else if (confirmPassword !== password) {
      errors.confirmPassword = "两次输入的密码不一致";
    }

    if (!name) {
      errors.name = "请输入用户名";
    } else if (name.length < 2) {
      errors.name = "用户名至少需要2个字符";
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
              创建账号
            </h2>

            <Form method="post" className="space-y-6" onSubmit={validateForm}>
              {actionData?.error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                  {actionData.error}
                </div>
              )}

              {inputFields.map(({ id, label, type, placeholder }) => (
                <div key={id} className="space-y-2">
                  <label
                    htmlFor={id}
                    className="block text-sm font-medium text-gray-300"
                  >
                    {label}
                  </label>
                  <input
                    type={type}
                    id={id}
                    name={id}
                    className="w-full px-4 py-3 bg-gray-700/30 border border-gray-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
                    placeholder={placeholder}
                  />
                  {formErrors[id as keyof typeof formErrors] && (
                    <p className="text-sm text-red-500 mt-1">
                      {formErrors[id as keyof typeof formErrors]}
                    </p>
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl font-medium transition-all hover:from-blue-600 hover:to-violet-600 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner />
                    <span>注册中...</span>
                  </>
                ) : (
                  "注册"
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
      </motion.div>
    </div>
  );
}
