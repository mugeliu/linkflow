import { useState } from "react";
import { Link, useLocation } from "@remix-run/react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
} from "~/components/ui/sidebar";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Bookmark,
  FolderHeart,
  Home,
  Clock,
  Share2,
  Star,
  Tag,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
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
import { SettingsDialog } from "~/components/settings/settings-dialog";

interface LayoutUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  emailVerified: boolean;
  role: string;
  status: string;
}

interface UserLayoutProps {
  children: React.ReactNode;
  user: LayoutUser;
}

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

export function UserLayout({ children, user }: UserLayoutProps) {
  const [isLibraryOpen, setIsLibraryOpen] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const location = useLocation();

  const isActiveLink = (href: string) => location.pathname === href;

  // 处理收藏夹展开/收起
  const handleLibraryToggle = (open: boolean) => {
    setIsLibraryOpen(open);
  };

  // 处理侧边栏折叠
  const handleSidebarToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSidebarOpen(!isSidebarOpen);
  };

  // 处理用户设置点击
  const handleUserClick = () => {
    setShowUserDialog(true);
  };

  return (
    <SidebarProvider>
      <TooltipProvider delayDuration={0}>
        <div className="flex w-full min-h-svh">
          {/* 侧边栏 */}
          <div
            className={cn(
              "fixed inset-y-0 left-0 z-40 flex transition-all duration-300 ease-in-out",
              isSidebarOpen ? "w-64" : "w-16",
              "bg-background/80 backdrop-blur-sm border-r border-border/10"
            )}
          >
            <Sidebar className="w-full border-r border-border/40 flex flex-col">
              {/* 侧边栏头部 */}
              <SidebarHeader className="border-b border-border/40 px-4 py-3">
                <div className="flex items-center justify-between">
                  {/* Logo 添加淡入淡出效果 */}
                  <div
                    className={cn(
                      "transition-all duration-300 ease-in-out",
                      isSidebarOpen
                        ? "opacity-100"
                        : "opacity-0 w-0 overflow-hidden"
                    )}
                  >
                    <Link
                      to="/"
                      className="text-xl font-bold bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent hover:opacity-80 transition-all"
                    >
                      LinkFlow
                    </Link>
                  </div>
                  <div
                    className={cn(
                      "flex items-center transition-all duration-300 ease-in-out",
                      !isSidebarOpen && "w-full justify-center"
                    )}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 transition-transform duration-300 ease-in-out"
                      onClick={handleSidebarToggle}
                    >
                      <div
                        className={cn(
                          "transition-transform duration-300 ease-in-out",
                          !isSidebarOpen && "rotate-180"
                        )}
                      >
                        <PanelLeftClose className="h-5 w-5" />
                      </div>
                    </Button>
                  </div>
                </div>
              </SidebarHeader>

              {/* 侧边栏内容 */}
              <SidebarContent className="flex-1">
                <ScrollArea className="h-full">
                  <div
                    className={cn(
                      "space-y-6 transition-all duration-300 ease-in-out",
                      isSidebarOpen ? "p-4" : "p-2"
                    )}
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

              {/* 用户信息（底部） - 添加内容过渡效果 */}
              <div className="border-t border-border/40 p-4">
                <button
                  onClick={handleUserClick}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-lg p-2",
                    "hover:bg-accent/50 active:bg-accent/70 transition-all duration-300 ease-in-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    !isSidebarOpen && "justify-center"
                  )}
                >
                  <Avatar className="h-9 w-9 ring-2 ring-border/40 transition-all duration-300 ease-in-out">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-blue-500/50 to-violet-500/50 text-white">
                        {user.name[0].toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {/* 用户信息淡入淡出效果 */}
                  <div
                    className={cn(
                      "flex-1 overflow-hidden transition-all duration-300 ease-in-out",
                      isSidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0"
                    )}
                  >
                    {isSidebarOpen && (
                      <>
                        <p className="text-sm font-medium leading-none truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-1">
                          {user.email}
                        </p>
                      </>
                    )}
                  </div>
                  {isSidebarOpen && (
                    <Settings className="h-5 w-5 text-muted-foreground transition-opacity duration-300 ease-in-out" />
                  )}
                </button>
              </div>
            </Sidebar>
          </div>

          {/* 主内容区域 - 添加平滑过渡 */}
          <div
            className={cn(
              "flex-1 relative transition-all duration-300 ease-in-out",
              isSidebarOpen ? "ml-64" : "ml-16"
            )}
          >
            <main className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/80">
              <ScrollArea className="h-full">
                <div className="p-6 min-h-[calc(100vh-3rem)]">{children}</div>
              </ScrollArea>
            </main>
          </div>

          <SettingsDialog
            open={showUserDialog}
            onOpenChange={setShowUserDialog}
            user={user}
          />
        </div>
      </TooltipProvider>
    </SidebarProvider>
  );
}
