import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticator } from "~/services/auth.server";
import { prisma } from "~/services/db.server";
import { UserLayout } from "~/components/layouts/user-layout";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  Zap,
  Tags,
  Lightbulb,
  LayoutGrid,
  List,
  Clock,
  Star,
  Share2,
  FolderHeart,
  Tag,
  Bookmark,
} from "lucide-react";
import { CommandMenu } from "~/components/command-menu";
import { ViewToggle } from "~/components/view-toggle";
import { BookmarkGrid } from "~/components/bookmark-grid";
import { useState } from "react";
import { ImportDialog } from "~/components/bookmark/import-dialog";

interface LoaderData {
  pageUser: {
    id: string;
    email: string;
    name: string;
    avatar: string | null;
    emailVerified: boolean;
    role: string;
    status: string;
    _count: {
      bookmarks: number;
      collections: number;
      starredBookmarks: number;
      tags: number;
    };
  };
  isOwner: boolean;
  recentBookmarks: Array<{
    id: string;
    title: string;
    url: string;
    icon?: string | null;
    description?: string | null;
    createdAt: string;
    collection?: {
      id: string;
      name: string;
      color?: string | null;
    } | null;
    tags: Array<{
      id: string;
      name: string;
      color?: string | null;
    }>;
  }>;
  stats: {
    weeklyNew: number;
    monthlyVisits: number;
    topCollections: Array<{
      id: string;
      name: string;
      count: number;
    }>;
  };
  frequentTags: Array<{
    id: string;
    name: string;
    count: number;
  }>;
}

// AI 功能定义
const aiFeatures = [
  {
    title: "智能分类建议",
    icon: Zap,
    description: "AI 自动为书签推荐合适的分类",
  },
  {
    title: "标签优化",
    icon: Tags,
    description: "优化标签系统，提高检索效率",
  },
  {
    title: "相关推荐",
    icon: Lightbulb,
    description: "基于您的兴趣推荐相关书签",
  },
] as const;

// 统计数据定义
const getStats = (pageUser: LoaderData["pageUser"], weeklyNew: number) => [
  {
    label: "总书签数",
    value: pageUser._count.bookmarks,
    icon: Bookmark,
  },
  {
    label: "本周新增",
    value: `+${weeklyNew}`,
    icon: Clock,
    highlight: true,
  },
  {
    label: "收藏夹",
    value: pageUser._count.collections,
    icon: FolderHeart,
  },
  {
    label: "标签数",
    value: pageUser._count.tags,
    icon: Tag,
  },
];

export const loader: LoaderFunction = async ({ request, params }) => {
  const currentUser = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });

  const username = params.username;
  if (!username) {
    throw new Response("Not Found", { status: 404 });
  }

  const pageUser = await prisma.user.findUnique({
    where: { name: username },
    select: {
      id: true,
      email: true,
      name: true,
      avatar: true,
      emailVerified: true,
      role: true,
      status: true,
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

  // 获取最近的书签，包含更多信息
  const recentBookmarks = await prisma.bookmark.findMany({
    where: { userId: pageUser.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      collection: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      },
    },
  });

  // 添加统计数据查询
  const weeklyNew = await prisma.bookmark.count({
    where: {
      userId: pageUser.id,
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  // 获取常用标签
  const frequentTags = await prisma.tag.findMany({
    where: { userId: pageUser.id },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          bookmarks: true,
        },
      },
    },
    orderBy: {
      bookmarks: {
        _count: "desc",
      },
    },
    take: 10,
  });

  // 获取热门收藏夹
  const topCollections = await prisma.collection.findMany({
    where: { userId: pageUser.id },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          bookmarks: true,
        },
      },
    },
    orderBy: {
      bookmarks: {
        _count: "desc",
      },
    },
    take: 5,
  });

  return json({
    pageUser,
    isOwner: currentUser.id === pageUser.id,
    recentBookmarks: recentBookmarks.map((bookmark) => ({
      ...bookmark,
      createdAt: bookmark.createdAt.toISOString(),
      tags: bookmark.tags.map(({ tag }) => tag),
    })),
    stats: {
      weeklyNew,
      monthlyVisits: 0, // TODO: 实现访问统计
      topCollections: topCollections.map((c) => ({
        id: c.id,
        name: c.name,
        count: c._count.bookmarks,
      })),
    },
    frequentTags: frequentTags.map((t) => ({
      id: t.id,
      name: t.name,
      count: t._count.bookmarks,
    })),
  });
};

export default function UserProfile() {
  const { pageUser, isOwner, recentBookmarks, stats } =
    useLoaderData<LoaderData>();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <UserLayout user={pageUser}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 顶部操作区 */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">
            {isOwner ? "我的书签" : `${pageUser.name} 的书签`}
          </h1>
          <div className="flex items-center gap-4">
            <CommandMenu />
            {isOwner && <ImportDialog />}
          </div>
        </div>

        {/* 主要内容区域 - 左右布局 */}
        <div className="grid grid-cols-[1fr_280px] gap-6">
          {/* 左侧：书签展示区域 */}
          <div>
            {/* 视图切换和筛选 */}
            <div className="flex items-center justify-between mb-4">
              <ViewToggle defaultView="grid" onViewChange={setViewMode} />
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                筛选
              </Button>
            </div>

            {/* 书签网格/列表 */}
            <BookmarkGrid bookmarks={recentBookmarks} viewMode={viewMode} />
          </div>

          {/* 右侧：统计和AI助手 */}
          <div>
            {/* 添加一个与视图切换按钮等高的空白区域 */}
            <div className="h-[40px] mb-4" />

            {/* 右侧内容区域 - 添加背景色和圆角，营造分隔效果 */}
            <div className="bg-muted/30 rounded-xl p-4 space-y-4">
              {/* 统计卡片组 */}
              <div className="grid grid-cols-2 gap-3">
                {/* 书签总数 */}
                <Card className="bg-gradient-to-br from-blue-500/5 via-blue-500/10 to-blue-500/5 border-blue-500/10">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      {/* 图标 - 缩小尺寸 */}
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4 text-blue-500"
                        >
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      {/* 文字内容 - 右对齐 */}
                      <div className="flex-1 text-right">
                        <div className="text-xl font-bold text-blue-500">
                          {pageUser._count.bookmarks}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          书签总数
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 本周新增 */}
                <Card className="bg-gradient-to-br from-green-500/5 via-green-500/10 to-green-500/5 border-green-500/10">
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      {/* 图标 - 缩小尺寸 */}
                      <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="w-4 h-4 text-green-500"
                        >
                          <path d="M12 20v-8m0 0V4m0 8h8m-8 0H4" />
                        </svg>
                      </div>
                      {/* 文字内容 - 右对齐 */}
                      <div className="flex-1 text-right">
                        <div className="text-xl font-bold text-green-500">
                          +{stats.weeklyNew}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          本周新增
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI助手 */}
              {isOwner && (
                <Card className="overflow-hidden border-violet-500/20">
                  <CardHeader className="bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-violet-500/10 pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <div className="p-1.5 rounded-lg bg-violet-500/10">
                        <Sparkles className="h-4 w-4 text-violet-500" />
                      </div>
                      AI 智能助手
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      {aiFeatures.map((feature) => (
                        <Button
                          key={feature.title}
                          variant="ghost"
                          className="w-full h-auto py-2 px-3 flex items-center gap-3 hover:bg-violet-500/5 justify-start"
                        >
                          <div className="p-1.5 rounded-md bg-violet-500/10 shrink-0">
                            <feature.icon className="h-3.5 w-3.5 text-violet-500" />
                          </div>
                          <div className="flex flex-col items-start gap-0.5">
                            <span className="text-sm font-medium">
                              {feature.title}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {feature.description}
                            </span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
