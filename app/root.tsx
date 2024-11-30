import { useEffect } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigate,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import { json, type LoaderFunction, redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

import "./tailwind.css";

interface LoaderData {
  user: Awaited<ReturnType<typeof authenticator.isAuthenticated>>;
}

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  const url = new URL(request.url);

  // 如果用户未登录且不是公开页面，重定向到登录页
  if (
    !user &&
    !url.pathname.startsWith("/login") &&
    !url.pathname.startsWith("/signup") &&
    url.pathname !== "/" && // 允许访问首页
    !url.pathname.startsWith("/forgot-password") // 允许访问忘记密码页面
  ) {
    throw redirect(`/login?redirectTo=${url.pathname}`);
  }

  return json(
    { user },
    {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    }
  );
};

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "logout") {
        localStorage.clear();
        sessionStorage.clear();
        navigate("/login", { replace: true });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [navigate]);

  return <Outlet />;
}
