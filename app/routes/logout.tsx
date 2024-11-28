import { type ActionFunction, redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export const action: ActionFunction = async ({ request }) => {
  await authenticator.logout(request, { redirectTo: "/login" });
};

// 如果直接访问 /logout 路径，重定向到登录页面
export const loader = () => redirect("/login");
