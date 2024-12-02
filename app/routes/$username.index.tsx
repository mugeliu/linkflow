import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { prisma } from "~/services/db.server";
import { UserLayout } from "~/components/layouts/user-layout";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Bookmark,
  Clock,
  Star,
  FolderHeart,
  Tag,
  TrendingUp,
  Activity,
} from "lucide-react";

interface LoaderData {
  pageUser: {
    id: string;
    name: string;
    avatar: string | null;
    createdAt: string;
    _count: {
      bookmarks: number;
      collections: number;
      starredBookmarks: number;
      tags: number;
    };
  };
  isOwner: boolean;
  stats: {
    weeklyNew: number;
    monthlyVisits: number;
    topCollections: Array<{
      id: string;
      name: string;
      count: number;
    }>;
    recentActivity: Array<{
      type: string;
      title: string;
      timestamp: string;
    }>;
  };
}

export const loader: LoaderFunction = async ({ request, params }) => {
  const username = params.username;
  if (username === "bookmarks") {
    throw new Response("Not Found", { status: 404 });
  }

  const currentUser = await authenticator.isAuthenticated(request);

  const pageUser = await prisma.user.findUnique({
    where: { name: username },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      emailVerified: true,
      role: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          bookmarks: true,
          collections: true,
          starredBookmarks: true,
          tags: true,
        },
      },
    },
  });

  if (!pageUser) {
    throw new Response("User Not Found", { status: 404 });
  }

  // 获取统计数据
  const weeklyNew = await prisma.bookmark.count({
    where: {
      userId: pageUser.id,
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  // 获取热门收藏夹
  const topCollections = await prisma.collection.findMany({
    where: { userId: pageUser.id },
    select: {
      id: true,
      name: true,
      _count: {
        select: { bookmarks: true },
      },
    },
    orderBy: {
      bookmarks: { _count: "desc" },
    },
    take: 5,
  });

  return json({
    pageUser: {
      ...pageUser,
      createdAt: pageUser.createdAt.toISOString(),
    },
    isOwner: currentUser?.id === pageUser.id,
    stats: {
      weeklyNew,
      monthlyVisits: 0, // TODO: 实现访问统计
      topCollections: topCollections.map((c) => ({
        id: c.id,
        name: c.name,
        count: c._count.bookmarks,
      })),
      recentActivity: [], // TODO: 实现活动记录
    },
  });
};

export default function UserProfile() {
  const { pageUser, isOwner, stats } = useLoaderData<LoaderData>();

  return (
    <UserLayout user={pageUser}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 统计卡片组 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard
            title="书签总数"
            value={pageUser._count.bookmarks}
            icon={Bookmark}
            trend={
              stats.weeklyNew > 0 ? `本周新增 ${stats.weeklyNew}` : undefined
            }
          />
          <StatCard
            title="收藏夹"
            value={pageUser._count.collections}
            icon={FolderHeart}
          />
          <StatCard title="标签数" value={pageUser._count.tags} icon={Tag} />
          <StatCard
            title="已收藏"
            value={pageUser._count.starredBookmarks}
            icon={Star}
          />
        </div>

        {/* 内容区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 热门收藏夹 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                热门收藏夹
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topCollections.map((collection) => (
                <div
                  key={collection.id}
                  className="flex items-center justify-between py-2"
                >
                  <span className="text-sm">{collection.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {collection.count} 个书签
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 最近活动 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5" />
                最近活动
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground text-center py-8">
                暂无活动记录
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </UserLayout>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  trend?: string;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          <Icon className="h-4 w-4" />
          <span className="text-sm">{title}</span>
        </div>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className="text-xs text-muted-foreground mt-1">{trend}</div>
        )}
      </CardContent>
    </Card>
  );
}
