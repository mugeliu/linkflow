import { createCookieSessionStorage, redirect } from "@remix-run/node";

// 会话存储配置
const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET || "default-secret"], // 在生产环境中必须设置
    secure: process.env.NODE_ENV === "production",
  },
});

// 获取会话用户ID
export async function getUserId(request: Request) {
  const session = await getSession(request);
  const userId = session.get("userId");
  return userId;
}

// 创建用户会话
export async function createUserSession(userId: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  session.set("userId", userId);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

// 获取会话
export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie");
  return sessionStorage.getSession(cookie);
}

// 销毁会话
export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
