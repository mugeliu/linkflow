import { useState, useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { useToast } from "~/components/ui/use-toast";

interface EditDialogProps {
  bookmark: {
    id: string;
    title: string;
    url: string;
    description?: string | null;
    collection?: { id: string; name: string } | null;
    tags: Array<{ id: string; name: string }>;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ActionResponse {
  success: boolean;
  bookmark?: any;
  error?: string;
}

export function EditDialog({ bookmark, open, onOpenChange }: EditDialogProps) {
  const fetcher = useFetcher<ActionResponse>();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: bookmark.title,
    url: bookmark.url,
    description: bookmark.description || "",
    collectionId: bookmark.collection?.id || "",
    tags: bookmark.tags.map((t) => t.name).join(", "),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    toast({
      title: "正在保存",
      description: "正在更新书签信息...",
    });

    fetcher.submit(
      {
        id: bookmark.id,
        title: formData.title,
        url: formData.url,
        description: formData.description,
        tags: formData.tags,
        _action: "update",
      },
      {
        method: "POST",
        action: "/api/bookmarks",
      }
    );
  };

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.success) {
        onOpenChange(false);
        toast({
          title: "保存成功",
          description: "书签信息已更新",
        });
      } else {
        toast({
          title: "保存失败",
          description: fetcher.data.error || "更新书签时出现错误",
          variant: "destructive",
        });
      }
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑书签</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">网址</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, url: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">标签 (用逗号分隔)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tags: e.target.value }))
              }
              placeholder="技术, 工具, 参考"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit">保存</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
