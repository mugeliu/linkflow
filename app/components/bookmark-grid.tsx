import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Star,
  Share2,
  MoreHorizontal,
  ExternalLink,
  Pencil,
  FolderInput,
  Trash2,
  BookmarkX,
  ArrowUpRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { ViewMode } from "./view-toggle";
import { cn } from "~/lib/utils";
import { Logo } from "~/components/ui/logo";

interface Bookmark {
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
}

interface BookmarkGridProps {
  bookmarks: Bookmark[];
  viewMode?: ViewMode;
}

const ListItem = ({ bookmark }: { bookmark: Bookmark }) => (
  <div
    className={cn(
      "group flex items-center gap-3 p-3 hover:bg-accent transition-colors"
    )}
  >
    {/* 标题和URL */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium hover:underline truncate group-hover:text-primary"
        >
          {bookmark.title}
        </a>
        {bookmark.collection && (
          <Badge
            variant="secondary"
            className="text-[10px] px-1.5 py-0 font-normal"
            style={
              bookmark.collection.color
                ? {
                    backgroundColor: `${bookmark.collection.color}10`,
                    color: bookmark.collection.color,
                  }
                : undefined
            }
          >
            {bookmark.collection.name}
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        <p className="text-xs text-muted-foreground truncate">{bookmark.url}</p>
        {bookmark.tags.length > 0 && (
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground/50">•</span>
            <div className="flex items-center gap-1">
              {bookmark.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag.id}
                  className="text-[10px] text-muted-foreground/70"
                  style={tag.color ? { color: tag.color } : undefined}
                >
                  #{tag.name}
                </span>
              ))}
              {bookmark.tags.length > 2 && (
                <span className="text-[10px] text-muted-foreground/50">
                  +{bookmark.tags.length - 2}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>

    {/* 操作按钮 */}
    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-foreground"
      >
        <Star className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 text-muted-foreground hover:text-foreground"
      >
        <Share2 className="h-3.5 w-3.5" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem>
            <Pencil className="h-4 w-4 mr-2" />
            编辑
          </DropdownMenuItem>
          <DropdownMenuItem>
            <FolderInput className="h-4 w-4 mr-2" />
            移动到...
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-500">
            <Trash2 className="h-4 w-4 mr-2" />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>
);

const GridItem = ({ bookmark }: { bookmark: Bookmark }) => (
  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 hover:border-border">
    {/* 预览图区域 */}
    <div className="relative aspect-video bg-gradient-to-br from-background to-muted">
      {/* Logo 背景 */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[2rem] font-bold bg-gradient-to-r from-blue-400/20 via-violet-400/20 to-blue-400/20 bg-clip-text text-transparent select-none">
          LinkFlow
        </span>
      </div>

      {/* 悬浮操作按钮 */}
      <div className="absolute inset-x-0 top-0 p-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-background/90 hover:bg-background shadow-sm"
          >
            <Star className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-background/90 hover:bg-background shadow-sm"
          >
            <Share2 className="h-4 w-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 bg-background/90 hover:bg-background shadow-sm"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Pencil className="h-4 w-4 mr-2" />
                编辑
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FolderInput className="h-4 w-4 mr-2" />
                移动到...
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500">
                <Trash2 className="h-4 w-4 mr-2" />
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>

    {/* 内容区域 */}
    <CardContent className="p-3 space-y-2">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          {bookmark.collection && (
            <Badge
              variant="secondary"
              className="text-xs px-2 py-0.5"
              style={
                bookmark.collection.color
                  ? {
                      backgroundColor: `${bookmark.collection.color}10`,
                      color: bookmark.collection.color,
                    }
                  : undefined
              }
            >
              {bookmark.collection.name}
            </Badge>
          )}
        </div>
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium hover:underline line-clamp-1"
        >
          {bookmark.title}
        </a>
        <p className="text-sm text-muted-foreground truncate mt-0.5">
          {bookmark.url}
        </p>
      </div>

      {bookmark.description && (
        <p className="text-sm text-muted-foreground/90 line-clamp-2">
          {bookmark.description}
        </p>
      )}

      {/* 标签 */}
      {bookmark.tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {bookmark.tags.map((tag) => (
            <span
              key={tag.id}
              className="text-xs text-muted-foreground/70 hover:text-foreground transition-colors cursor-pointer"
              style={tag.color ? { color: tag.color } : undefined}
            >
              #{tag.name}
            </span>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);

export function BookmarkGrid({
  bookmarks,
  viewMode = "grid",
}: BookmarkGridProps) {
  if (!bookmarks.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <BookmarkX className="h-12 w-12 mb-4 text-muted-foreground/50" />
        <p>还没有添加任何书签</p>
        <p className="text-sm text-muted-foreground/80 mt-1">
          点击右上角的"添加书签"开始
        </p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-0.5 rounded-lg border bg-card">
        {bookmarks.map((bookmark, index) => (
          <ListItem key={bookmark.id} bookmark={bookmark} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {bookmarks.map((bookmark) => (
        <GridItem key={bookmark.id} bookmark={bookmark} />
      ))}
    </div>
  );
}
