import { useState } from "react";
import { Link, useLocation } from "@remix-run/react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "~/components/ui/sidebar";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Bookmark,
  FolderHeart,
  Home,
  LogOut,
  Plus,
  Search,
  Settings,
  Star,
  Tag,
  ChevronDown,
  ChevronRight,
  Clock,
  Share2,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  Library,
} from "lucide-react";
import { cn } from "~/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { LucideIcon } from "lucide-react";

interface UserLayoutProps {
  children: React.ReactNode;
  user: {
    name: string;
    email: string;
    avatar?: string | null;
  };
}

// 定义导航菜单
const navigationMenu = [
  {
    title: "概览",
    icon: Home,
    href: (username: string) => `/${username}`,
  },
  {
    title: "最近",
    icon: Clock,
    href: (username: string) => `/${username}/recent`,
  },
  {
    title: "我的书签",
    icon: Bookmark,
    href: (username: string) => `/${username}/bookmarks`,
  },
];

const libraryMenu = [
  {
    title: "收藏夹",
    icon: FolderHeart,
    href: (username: string) => `/${username}/collections`,
  },
  {
    title: "标签",
    icon: Tag,
    href: (username: string) => `/${username}/tags`,
  },
  {
    title: "已收藏",
    icon: Star,
    href: (username: string) => `/${username}/starred`,
  },
  {
    title: "已分享",
    icon: Share2,
    href: (username: string) => `/${username}/shared`,
  },
];

// 定义菜单项类型
type UserMenuItem =
  | {
      type: "item";
      title: string;
      description: string;
      icon: LucideIcon;
      href: (username: string) => string;
    }
  | {
      type: "item";
      title: string;
      description: string;
      icon: LucideIcon;
      action: "logout";
      variant?: "destructive";
    }
  | {
      type: "separator";
    };

// 优化用户下拉菜单
const userDropdownMenu: UserMenuItem[] = [
  {
    type: "item",
    title: "个人资料",
    description: "查看和编辑您的个人信息",
    icon: User,
    href: (username: string) => `/${username}/profile`,
  },
  {
    type: "item",
    title: "账户设置",
    description: "管理您的账户和偏好设置",
    icon: Settings,
    href: (username: string) => `/${username}/settings`,
  },
  {
    type: "separator",
  },
  {
    type: "item",
    title: "退出登录",
    description: "退出当前账户",
    icon: LogOut,
    action: "logout",
    variant: "destructive",
  },
];

export function UserLayout({ children, user }: UserLayoutProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  const isActiveLink = (href: string) => location.pathname === href;

  // 添加收藏夹展开/收起的动画状态
  const [libraryAnimation, setLibraryAnimation] = useState("open");

  // 处理收藏夹展开/收起
  const handleLibraryToggle = (open: boolean) => {
    setLibraryAnimation(open ? "open" : "close");
    setIsLibraryOpen(open);
  };

  // 修改折叠按钮点击处理函数
  const handleSidebarToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <SidebarProvider>
      <TooltipProvider delayDuration={0}>
        <div className="flex h-screen bg-background">
          <div
            className={cn(
              "fixed inset-y-0 z-40 flex transition-all duration-300",
              isSidebarOpen ? "w-64" : "w-16",
              "bg-background/80 backdrop-blur-sm"
            )}
          >
            <Sidebar className="w-full border-r border-border/40 flex flex-col">
              {/* 侧边栏头部 - 修改结构防止事件冒泡 */}
              <SidebarHeader className="border-b border-border/40 px-4 py-3">
                <div className="flex items-center justify-between">
                  {isSidebarOpen && (
                    <Link
                      to="/"
                      className="text-xl font-bold bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent hover:opacity-80 transition-all"
                    >
                      LinkFlow
                    </Link>
                  )}
                  <div
                    className={cn(
                      "flex items-center",
                      !isSidebarOpen && "w-full justify-center"
                    )}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0" // 调整按钮大小
                      onClick={handleSidebarToggle}
                    >
                      {isSidebarOpen ? (
                        <PanelLeftClose className="h-5 w-5" />
                      ) : (
                        <PanelLeftOpen className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>
              </SidebarHeader>

              {/* 侧边栏内容 */}
              <SidebarContent className="flex-1">
                <ScrollArea className="h-full">
                  <div
                    className={cn("space-y-6", isSidebarOpen ? "p-4" : "p-2")}
                  >
                    {/* 主导航菜单 */}
                    <nav className="space-y-1">
                      {navigationMenu.map((item) => {
                        const href = item.href(user.name);
                        const isActive = isActiveLink(href);
                        return (
                          <Tooltip key={item.title}>
                            <TooltipTrigger asChild>
                              <Link
                                to={href}
                                className={cn(
                                  "group flex items-center gap-x-3 rounded-md py-2 text-sm font-medium",
                                  "transition-all hover:bg-accent/50",
                                  isActive &&
                                    "bg-accent text-accent-foreground",
                                  isSidebarOpen ? "px-3" : "justify-center px-2"
                                )}
                              >
                                <item.icon className="h-5 w-5 shrink-0" />
                                {isSidebarOpen && <span>{item.title}</span>}
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={10}>
                              {item.title}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </nav>

                    {/* 资料库菜单 */}
                    {isSidebarOpen ? (
                      <Collapsible
                        open={isLibraryOpen}
                        onOpenChange={handleLibraryToggle}
                      >
                        <div className="space-y-1">
                          <CollapsibleTrigger asChild>
                            <button className="flex w-full items-center justify-between px-3 py-2 hover:bg-accent/50 rounded-md transition-colors">
                              <span className="flex items-center gap-2">
                                <Library className="h-5 w-5" />
                                <span className="text-xs font-semibold uppercase tracking-wider">
                                  资料库
                                </span>
                              </span>
                              <ChevronRight
                                className={cn(
                                  "h-5 w-5 transition-transform duration-200", // 调整图标大小
                                  isLibraryOpen && "rotate-90"
                                )}
                              />
                            </button>
                          </CollapsibleTrigger>

                          <CollapsibleContent>
                            <div className="space-y-1 pt-1">
                              {libraryMenu.map((item) => (
                                <Tooltip key={item.title}>
                                  <TooltipTrigger asChild>
                                    <Link
                                      to={item.href(user.name)}
                                      className="flex items-center gap-x-3 rounded-md px-3 py-2 text-sm font-medium pl-9 hover:bg-accent/50 transition-colors"
                                    >
                                      <item.icon className="h-5 w-5" />
                                      <span>{item.title}</span>
                                    </Link>
                                  </TooltipTrigger>
                                  <TooltipContent side="right">
                                    {item.title}
                                  </TooltipContent>
                                </Tooltip>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ) : (
                      <nav className="space-y-1">
                        {libraryMenu.map((item) => (
                          <Tooltip key={item.title}>
                            <TooltipTrigger asChild>
                              <Link
                                to={item.href(user.name)}
                                className="flex justify-center rounded-md p-2 hover:bg-accent/50 transition-colors"
                              >
                                <item.icon className="h-5 w-5" />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              {item.title}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </nav>
                    )}
                  </div>
                </ScrollArea>
              </SidebarContent>

              {/* 用户信息（底部） */}
              <div className="border-t border-border/40 p-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "flex w-full items-center gap-4 rounded-lg p-2 hover:bg-accent/50 transition-colors",
                        !isSidebarOpen && "justify-center"
                      )}
                    >
                      <Avatar className="h-9 w-9 ring-2 ring-border/40">
                        {user.avatar ? (
                          <AvatarImage src={user.avatar} alt={user.name} />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-blue-500/50 to-violet-500/50 text-white">
                            {user.name[0].toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      {isSidebarOpen && (
                        <>
                          <div className="flex-1 overflow-hidden text-left">
                            <p className="text-sm font-medium leading-none truncate">
                              {user.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate mt-1">
                              {user.email}
                            </p>
                          </div>
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        </>
                      )}
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align={isSidebarOpen ? "end" : "center"}
                    className="w-[240px]"
                    sideOffset={8}
                  >
                    {userDropdownMenu.map((item, index) => {
                      if (item.type === "separator") {
                        return <DropdownMenuSeparator key={index} />;
                      }

                      const content = (
                        <div className="flex items-center gap-3 p-2">
                          <item.icon className="h-5 w-5 shrink-0" />
                          <div className="space-y-0.5">
                            <p className="font-medium text-sm">{item.title}</p>
                            {item.description && (
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      );

                      if ("action" in item && item.action === "logout") {
                        return (
                          <form key={index} action="/logout" method="post">
                            <DropdownMenuItem
                              asChild
                              className="text-red-500 focus:text-red-500 cursor-pointer"
                            >
                              <button type="submit" className="w-full">
                                {content}
                              </button>
                            </DropdownMenuItem>
                          </form>
                        );
                      }

                      if ("href" in item) {
                        return (
                          <DropdownMenuItem key={index} asChild>
                            <Link
                              to={item.href(user.name)}
                              className="cursor-pointer"
                            >
                              {content}
                            </Link>
                          </DropdownMenuItem>
                        );
                      }
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Sidebar>
          </div>

          {/* 主内容区域 */}
          <main
            className={cn(
              "flex-1 overflow-hidden transition-all duration-300",
              "bg-gradient-to-br from-background via-background to-background/80",
              isSidebarOpen ? "ml-64" : "ml-16"
            )}
          >
            <ScrollArea className="h-full">
              <div className="container max-w-6xl p-6">{children}</div>
            </ScrollArea>
          </main>
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
