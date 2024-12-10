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
    name: string;
    // ... 其他用户字段
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
  const username = params.username;
  const currentUser = await authenticator.isAuthenticated(request);

  // 获取用户数据
  const pageUser = await prisma.user.findUnique({
    where: { name: username },
    select: {
      id: true,
      name: true,
      // ... 其他需要的字段
    },
  });

  if (!pageUser) {
    throw new Response("用户不存在", { status: 404 });
  }

  // 获取用户的书签数据
  const recentBookmarks = await prisma.bookmark.findMany({
    where: {
      userId: pageUser.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      url: true,
      icon: true,
      description: true,
      createdAt: true,
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

  return json<LoaderData>({
    pageUser,
    isOwner: currentUser?.id === pageUser.id,
    recentBookmarks: recentBookmarks.map((bookmark) => ({
      ...bookmark,
      createdAt: bookmark.createdAt.toISOString(),
      tags: bookmark.tags.map(({ tag }) => tag),
    })),
  });
};

export default function BookmarksRoute() {
  const { pageUser, isOwner, recentBookmarks, stats } =
    useLoaderData<LoaderData>();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 bg-white border-b border-border/40 px-8 py-5 backdrop-blur-sm bg-white/80 supports-[backdrop-filter]:bg-white/60">
        <div className="flex items-center justify-between max-w-[2000px] mx-auto">
          <div className="flex items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              {isOwner ? "我的书签" : `${pageUser.name} 的书签`}
            </h1>
            <CommandMenu />
          </div>
          {isOwner && <ImportDialog />}
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="h-full px-8 py-6">
          <div className="grid grid-cols-[minmax(0,1fr)_300px] gap-8 max-w-[2000px] mx-auto">
            <section className="min-w-0 space-y-6">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                <ViewToggle defaultView="grid" onViewChange={setViewMode} />
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-background"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  筛选
                </Button>
              </div>

              <div className="relative min-h-[200px]">
                <BookmarkGrid bookmarks={recentBookmarks} viewMode={viewMode} />
              </div>
            </section>

            {isOwner && (
              <aside className="space-y-6">
                <div className="sticky top-6">
                  <Card className="overflow-hidden border-violet-500/20 shadow-sm">
                    <CardHeader className="bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-violet-500/10 pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="p-1.5 rounded-lg bg-violet-500/10">
                          <Sparkles className="h-4 w-4 text-violet-500" />
                        </div>
                        AI 智能助手
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-2.5">
                        {aiFeatures.map((feature) => (
                          <Button
                            key={feature.title}
                            variant="ghost"
                            className="w-full h-auto py-2.5 px-3 flex items-center gap-3 hover:bg-violet-500/5 justify-start"
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
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
