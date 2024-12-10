import { Link, useLocation } from "@remix-run/react";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarProvider,
} from "~/components/ui/sidebar";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { SettingsDialog } from "~/components/settings/settings-dialog";
import {
  Home,
  Clock,
  Bookmark,
  FolderHeart,
  Tag,
  Star,
  Share2,
  PanelLeftClose,
  Settings,
  Library,
} from "lucide-react";

export interface LayoutUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  avatar?: string | null;
  role: string;
  status: string;
}

interface UserLayoutProps {
  children: React.ReactNode;
  user: LayoutUser;
}

const navigationMenu = [
  { title: "概览", icon: Home, href: (username: string) => `/${username}` },
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
  { title: "标签", icon: Tag, href: (username: string) => `/${username}/tags` },
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

  return (
    <SidebarProvider>
      <TooltipProvider delayDuration={0}>
        <div className="fixed inset-0">
          <Sidebar
            className={cn(
              "absolute inset-y-0 left-0 z-40",
              "flex flex-col border-r border-border/10",
              "bg-background/80 backdrop-blur-sm",
              isSidebarOpen ? "w-64" : "w-16",
              "transition-[width] duration-300 ease-in-out"
            )}
          >
            <SidebarHeader className="border-b border-border/40 px-4 py-3">
              <div className="flex items-center justify-between">
                <Link
                  to="/"
                  className={cn(
                    "font-bold transition-all duration-300 overflow-hidden",
                    "bg-gradient-to-r from-blue-400 via-violet-400 to-blue-400 bg-clip-text text-transparent",
                    isSidebarOpen ? "text-xl w-auto" : "text-lg w-5"
                  )}
                >
                  {isSidebarOpen ? "LinkFlow" : "L"}
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <PanelLeftClose
                    className={cn(
                      "h-5 w-5 transition-transform",
                      !isSidebarOpen && "rotate-180"
                    )}
                  />
                </Button>
              </div>
            </SidebarHeader>

            <SidebarContent className="flex-1">
              <ScrollArea className="h-full">
                <div className="space-y-6 p-2">
                  <nav className="space-y-1">
                    {navigationMenu.map((item) => (
                      <Tooltip key={item.title} delayDuration={0}>
                        <TooltipTrigger asChild>
                          <Link
                            to={item.href(user.name)}
                            className={cn(
                              "group flex items-center rounded-md py-2 text-sm font-medium",
                              "transition-all hover:bg-accent/50",
                              isActiveLink(item.href(user.name)) &&
                                "bg-accent text-accent-foreground",
                              isSidebarOpen
                                ? "px-3 gap-x-3"
                                : "justify-center px-2"
                            )}
                          >
                            <item.icon className="h-5 w-5 shrink-0" />
                            {isSidebarOpen && <span>{item.title}</span>}
                          </Link>
                        </TooltipTrigger>
                        {!isSidebarOpen && (
                          <TooltipContent side="right" sideOffset={10}>
                            {item.title}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    ))}
                  </nav>

                  <div className="space-y-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            "flex w-full items-center rounded-md py-2 hover:bg-accent/50 transition-colors",
                            isSidebarOpen
                              ? "px-3 justify-between"
                              : "justify-center px-2"
                          )}
                          onClick={() =>
                            isSidebarOpen && setIsLibraryOpen(!isLibraryOpen)
                          }
                        >
                          <span className="flex items-center gap-2">
                            <Library className="h-5 w-5" />
                            {isSidebarOpen && (
                              <span className="text-xs font-semibold uppercase tracking-wider">
                                资料库
                              </span>
                            )}
                          </span>
                        </button>
                      </TooltipTrigger>
                      {!isSidebarOpen && (
                        <TooltipContent side="right" sideOffset={10}>
                          资料库
                        </TooltipContent>
                      )}
                    </Tooltip>

                    {isSidebarOpen && isLibraryOpen && (
                      <div className="space-y-1 pt-1">
                        {libraryMenu.map((item) => (
                          <Link
                            key={item.title}
                            to={item.href(user.name)}
                            className={cn(
                              "flex items-center gap-x-3 rounded-md py-2 text-sm font-medium",
                              "hover:bg-accent/50 transition-colors",
                              isSidebarOpen
                                ? "px-3 pl-9"
                                : "justify-center px-2"
                            )}
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                    {!isSidebarOpen && (
                      <>
                        {libraryMenu.map((item) => (
                          <Tooltip key={item.title}>
                            <TooltipTrigger asChild>
                              <Link
                                to={item.href(user.name)}
                                className="flex justify-center rounded-md py-2 px-2 hover:bg-accent/50 transition-colors"
                              >
                                <item.icon className="h-5 w-5" />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={10}>
                              {item.title}
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </ScrollArea>
            </SidebarContent>

            <div className="border-t border-border/40 p-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setShowUserDialog(true)}
                    className={cn(
                      "flex w-full items-center rounded-lg p-2",
                      "hover:bg-accent/50 active:bg-accent/70 transition-all",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isSidebarOpen ? "gap-4" : "justify-center"
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
                        <div className="flex-1 overflow-hidden">
                          <p className="text-sm font-medium leading-none truncate">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {user.email}
                          </p>
                        </div>
                        <Settings className="h-5 w-5 text-muted-foreground" />
                      </>
                    )}
                  </button>
                </TooltipTrigger>
                {!isSidebarOpen && (
                  <TooltipContent side="right" sideOffset={10}>
                    {user.name}
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </Sidebar>

          <main
            className={cn(
              "absolute inset-0",
              isSidebarOpen ? "left-64" : "left-16",
              "transition-[left] duration-300 ease-in-out"
            )}
          >
            {children}
          </main>

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
