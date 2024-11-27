import { createCookieSessionStorage } from "@remix-run/node";

// 使用环境变量中的密钥，如果不存在则使用默认值
const sessionSecret = process.env.SESSION_SECRET || "your-secret-key-change-me";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
});

export const { getSession, commitSession, destroySession } = sessionStorage;
