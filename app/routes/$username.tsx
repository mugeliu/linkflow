import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getUserId } from "~/services/session.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface LoaderData {
  isOwner: boolean;
  user: {
    name: string;
    email: string;
    avatar?: string | null;
    emailVerified: boolean;
    createdAt: string;
  };
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await getUserId(request);
  const username = params.username;

  if (!username) {
    throw new Response("Not Found", { status: 404 });
  }

  // 获取页面所属用户信息
  const pageUser = await prisma.user.findUnique({
    where: { name: username },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      emailVerified: true,
      createdAt: true,
    },
  });

  if (!pageUser) {
    throw new Response("User Not Found", { status: 404 });
  }

  // 判断是否是用户自己的主页
  const isOwner = userId === pageUser.id;

  return json<LoaderData>({
    isOwner,
    user: {
      ...pageUser,
      createdAt: pageUser.createdAt.toISOString(),
    },
  });
};

export default function UserProfile() {
  const { isOwner, user } = useLoaderData<LoaderData>();

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-gray-900 to-gray-900 text-white">
      {/* 顶部导航栏 */}
      <nav className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <a href="/" className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
                  LinkFlow
                </span>
              </a>
            </div>
            {isOwner && (
              <div className="flex items-center space-x-4">
                <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">
                  编辑资料
                </button>
                <form action="/logout" method="post">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                  >
                    退出登录
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 用户信息 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-gray-700/50">
          <div className="flex items-start space-x-6">
            {/* 头像 */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 border-4 border-gray-600">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-400">
                    {user.name[0].toUpperCase()}
                  </div>
                )}
              </div>
              {isOwner && user.emailVerified && (
                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* 用户信息 */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              {isOwner && <p className="text-gray-400 mt-1">{user.email}</p>}
              <p className="text-gray-400 mt-1">
                加入时间：
                {new Date(user.createdAt).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {isOwner && !user.emailVerified && (
                <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                  <p className="text-yellow-500 text-sm">
                    您的邮箱尚未验证，某些功能可能受限。
                    <button className="ml-2 underline hover:text-yellow-400">
                      立即验证
                    </button>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 用户统计信息 */}
          <div className="grid grid-cols-3 gap-6 mt-8">
            <div className="bg-gray-700/30 rounded-xl p-6 text-center">
              <h3 className="text-lg font-medium text-gray-300">文章</h3>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <div className="bg-gray-700/30 rounded-xl p-6 text-center">
              <h3 className="text-lg font-medium text-gray-300">关注者</h3>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <div className="bg-gray-700/30 rounded-xl p-6 text-center">
              <h3 className="text-lg font-medium text-gray-300">关注中</h3>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
          </div>
        </div>

        {/* 用户动态/文章列表 */}
        <div className="mt-8 bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-gray-700/50">
          <h2 className="text-xl font-bold mb-6">最近动态</h2>
          <div className="text-center text-gray-400 py-8">暂无动态</div>
        </div>
      </div>
    </div>
  );
}
