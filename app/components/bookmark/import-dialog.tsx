import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Plus, Upload, Loader2 } from "lucide-react";
import { useFetcher } from "@remix-run/react";
import { useToast } from "../ui/use-toast";
import { cn } from "~/lib/utils";
import { BookmarkParser, type ChromeBookmark } from "~/utils/bookmark-parser";

interface ImportResponse {
  success?: boolean;
  error?: string;
  message?: string;
  count?: number;
}

interface ImportDialogProps {
  // ... 其他属性 ...
}

export function ImportDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const fetcher = useFetcher<ImportResponse>();
  const { toast } = useToast();
  const isImporting = fetcher.state !== "idle";
  const [browserType, setBrowserType] = useState<
    "chrome" | "firefox" | "safari" | "ie"
  >("chrome");

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.success) {
        toast({
          title: "导入成功",
          description: `成功导入 ${fetcher.data.count} 个书签`,
        });
        setIsOpen(false);
      } else if (fetcher.data.error) {
        toast({
          title: "导入失败",
          description: fetcher.data.error,
          variant: "destructive",
        });
      }
    }
  }, [fetcher.data, toast]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "文件过大",
        description: "请选择小于 5MB 的文件",
        variant: "destructive",
      });
      return;
    }

    try {
      const text = await file.text();
      console.log("File content preview:", text.slice(0, 500));

      const bookmarks = BookmarkParser.parseBookmarkFile(text, browserType);
      console.log("Parsed bookmarks:", bookmarks);

      if (bookmarks.length === 0) {
        toast({
          title: "无效的书签文件",
          description: "未找到任何书签",
          variant: "destructive",
        });
        return;
      }

      // 发送到服务器
      const formData = new FormData();
      formData.append("bookmarks", JSON.stringify(bookmarks));
      fetcher.submit(formData, {
        method: "post",
        action: "/api/bookmarks/import",
        encType: "multipart/form-data",
      });
    } catch (error) {
      console.error("Parse error:", error);
      toast({
        title: "解析失败",
        description: "无法解析书签文件",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          添加书签
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>导入书签</DialogTitle>
          <DialogDescription>
            从浏览器导入书签。请先在浏览器中导出书签为 HTML 文件。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <label className="text-sm">选择浏览器：</label>
            <select
              value={browserType}
              onChange={(e) =>
                setBrowserType(e.target.value as typeof browserType)
              }
              className="rounded-md border px-3 py-2 bg-background"
            >
              <option value="chrome">Chrome</option>
              <option value="firefox">Firefox</option>
              <option value="safari">Safari</option>
              <option value="ie">Internet Explorer</option>
            </select>
          </div>

          <div
            className={cn(
              "flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed rounded-lg transition-colors",
              isImporting
                ? "opacity-50 pointer-events-none"
                : "hover:border-primary/50"
            )}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                将书签文件拖放到此处，或
              </p>
              <label
                htmlFor="bookmark-file"
                className="inline-flex mt-2 text-sm text-primary hover:underline cursor-pointer"
              >
                选择文件
                <input
                  id="bookmark-file"
                  type="file"
                  accept=".html"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isImporting}
                />
              </label>
              <p className="mt-2 text-xs text-muted-foreground">
                支持 Chrome 导出的 HTML 格式书签文件（最大 5MB）
              </p>
            </div>
          </div>

          {isImporting && (
            <div className="flex flex-col items-center justify-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <div className="text-center">
                <p className="text-sm font-medium">正在导入书签...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  请勿关闭窗口，导入完成后会自动关闭
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
