import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Bookmark, FolderHeart, Star, Tag } from "lucide-react";
import type { LoaderData as ParentLoaderData } from "./$username";

interface LoaderData {
  stats: {
    bookmarks: {
      total: number;
      weeklyNew: number;
    };
    collections: {
      total: number;
      public: number;
    };
    tags: {
      total: number;
    };
    stars: {
      received: number;
    };
  };
}

// 使用示例数据
const MOCK_STATS = {
  bookmarks: {
    total: 128,
    weeklyNew: 12,
  },
  collections: {
    total: 24,
    public: 18,
  },
  tags: {
    total: 56,
  },
  stars: {
    received: 89,
  },
};

export const loader: LoaderFunction = async ({ params }) => {
  // 暂时返回示例数据
  return json<LoaderData>({
    stats: MOCK_STATS,
  });
};

export default function UserProfileRoute() {
  const { stats } = useLoaderData<LoaderData>();
  const { user } = useLoaderData<ParentLoaderData>();
  const { isOwner } = useOutletContext<{ isOwner: boolean }>();

  return (
    <div className="h-full">
      {/* 顶部区域 */}
      <header className="p-6 bg-white border-b">
        <div>
          <h1 className="text-2xl font-bold">
            {isOwner ? "我的概览" : `${user.name} 的主页`}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            查看统计数据和最近活动
          </p>
        </div>
      </header>

      {/* 主要内容区域 */}
      <div className="p-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">书签总数</CardTitle>
              <Bookmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.bookmarks.total}</div>
              {stats.bookmarks.weeklyNew > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  本周新增 {stats.bookmarks.weeklyNew}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">收藏夹</CardTitle>
              <FolderHeart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.collections.total}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.collections.public} 个公开
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">标签</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.tags.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">被收藏</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.stars.received}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
