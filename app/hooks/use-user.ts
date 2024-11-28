import { useMatches } from "@remix-run/react";
import type { User } from "~/services/auth.server";

// 定义 root loader 数据类型
interface RootLoaderData {
  user: User | null;
}

export function useUser() {
  const matches = useMatches();
  const rootLoader = matches[0]?.data as RootLoaderData | undefined;
  return rootLoader?.user;
}
