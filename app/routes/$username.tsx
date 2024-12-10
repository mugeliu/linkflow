import {
  Outlet,
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
  useNavigation,
} from "@remix-run/react";
import { json, type LoaderFunction, redirect } from "@remix-run/node";
import { UserLayout } from "~/components/layouts/user-layout";
import { prisma } from "~/services/db.server";
import { authenticator } from "~/services/auth.server";
import { Loader2 } from "lucide-react";

// 用户状态枚举
const USER_STATUS = {
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;

// 用户角色枚举
const USER_ROLE = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export interface LoaderData {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    avatar: string | null;
    role: (typeof USER_ROLE)[keyof typeof USER_ROLE];
    status: (typeof USER_STATUS)[keyof typeof USER_STATUS];
    createdAt: string;
    updatedAt: string;
    _count?: {
      bookmarks?: number;
      collections?: number;
      tags?: number;
      starredBookmarks?: number;
    };
  };
  isOwner: boolean;
}

// 添加类型守卫函数
function isValidUserRole(
  role: string
): role is (typeof USER_ROLE)[keyof typeof USER_ROLE] {
  return Object.values(USER_ROLE).includes(role as any);
}

function isValidUserStatus(
  status: string
): status is (typeof USER_STATUS)[keyof typeof USER_STATUS] {
  return Object.values(USER_STATUS).includes(status as any);
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const username = params.username;

  // 获取页面用户数据
  const pageUser = await prisma.user.findUnique({
    where: { name: username },
    select: {
      id: true,
      name: true,
      email: true,
      emailVerified: true,
      avatar: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          bookmarks: true,
          collections: true,
          tags: true,
          starredBookmarks: true,
        },
      },
    },
  });

  if (!pageUser) {
    throw new Response("用户不存在", { status: 404 });
  }

  // 验证角色和状态
  if (!isValidUserRole(pageUser.role)) {
    throw new Error(`无效的用户角色: ${pageUser.role}`);
  }

  if (!isValidUserStatus(pageUser.status)) {
    throw new Error(`无效的用户状态: ${pageUser.status}`);
  }

  // 检查用户状态
  if (pageUser.status === USER_STATUS.SUSPENDED) {
    throw new Response("用户已被禁用", { status: 403 });
  }

  // 获取当前登录用户
  const currentUser = await authenticator.isAuthenticated(request);
  const isOwner = currentUser?.id === pageUser.id;

  // 如果不是本人且未登录，重定向到登录页面
  if (!isOwner && !currentUser) {
    const searchParams = new URLSearchParams([["redirectTo", request.url]]);
    return redirect(`/login?${searchParams.toString()}`);
  }

  return json<LoaderData>({
    user: {
      ...pageUser,
      role: pageUser.role as (typeof USER_ROLE)[keyof typeof USER_ROLE],
      status: pageUser.status as (typeof USER_STATUS)[keyof typeof USER_STATUS],
      createdAt: pageUser.createdAt.toISOString(),
      updatedAt: pageUser.updatedAt.toISOString(),
    },
    isOwner,
  });
};

export default function UserRoute() {
  const { user, isOwner } = useLoaderData<LoaderData>();
  const navigation = useNavigation();
  const isLoading = navigation.state === "loading";

  return (
    <>
      {/* 全局加载状态 */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* 用户布局 */}
      <UserLayout user={user}>
        {/* 子路由容器 */}
        <div className="relative flex-1 w-full">
          <Outlet context={{ isOwner }} />
        </div>
      </UserLayout>
    </>
  );
}

// 错误页面组件
interface ErrorPageProps {
  title: string;
  message: string;
  details?: React.ReactNode;
}

function ErrorPage({ title, message, details }: ErrorPageProps) {
  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-4xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{message}</p>
          {details && (
            <div className="mt-4 text-sm text-muted-foreground">{details}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    const errorDetails = {
      404: {
        title: "用户不存在",
        message: "请检查链接是否正确，或者稍后再试",
      },
      403: {
        title: "访问受限",
        message: error.data || "您没有权限访问此页面",
        details: (
          <>
            这可能是因为：
            <ul className="list-disc list-inside mt-2">
              <li>该用户已将账号设为私密</li>
              <li>您需要登录后才能访问</li>
              <li>该账号已被禁用</li>
            </ul>
          </>
        ),
      },
    }[error.status] || {
      title: "出错了",
      message: "发生了一些错误，请稍后再试",
    };

    return <ErrorPage {...errorDetails} />;
  }

  return (
    <ErrorPage
      title="服务器错误"
      message="抱歉，服务器出现了一些问题，请稍后再试"
    />
  );
}
