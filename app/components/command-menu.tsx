import { useState, useEffect } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "~/components/ui/command";
import { Input } from "~/components/ui/input";
import { Search } from "lucide-react";
import { useNavigate } from "@remix-run/react";
import { useHotkeys } from "~/hooks/use-hotkeys";

interface CommandMenuProps {
  className?: string;
}

export function CommandMenu({ className }: CommandMenuProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // 使用 Cmd+K 或 Ctrl+K 打开命令菜单
  useHotkeys("mod+k", (e) => {
    e.preventDefault();
    setOpen((open) => !open);
  });

  return (
    <>
      {/* 搜索输入框 */}
      <div className={className}>
        <div
          className="relative"
          onClick={() => setOpen(true)}
          role="button"
          tabIndex={0}
        >
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9 pr-12 bg-background"
            placeholder="搜索书签..."
            onClick={(e) => e.preventDefault()}
            readOnly
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 select-none rounded border bg-muted px-1.5 font-mono text-xs text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* 命令菜单弹窗 */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="搜索书签、收藏夹、标签..." />
        <CommandList>
          <CommandEmpty>未找到相关结果</CommandEmpty>
          <CommandGroup heading="书签">
            <CommandItem
              onSelect={() => {
                setOpen(false);
                // TODO: 跳转到书签
              }}
            >
              示例书签
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="收藏夹">
            <CommandItem
              onSelect={() => {
                setOpen(false);
                // TODO: 跳转到收藏夹
              }}
            >
              示例收藏夹
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="标签">
            <CommandItem
              onSelect={() => {
                setOpen(false);
                // TODO: 跳转到标签
              }}
            >
              示例标签
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
