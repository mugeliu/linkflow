import { useState } from "react";
import { LayoutGrid, List } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export type ViewMode = "grid" | "list";

interface ViewToggleProps {
  defaultView?: ViewMode;
  onViewChange?: (view: ViewMode) => void;
}

export function ViewToggle({
  defaultView = "grid",
  onViewChange,
}: ViewToggleProps) {
  const [view, setView] = useState<ViewMode>(defaultView);

  const handleViewChange = (newView: ViewMode) => {
    setView(newView);
    onViewChange?.(newView);
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 transition-all duration-200 ${
                view === "grid"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
              onClick={() => handleViewChange("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="sr-only">网格视图</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">网格视图</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 transition-all duration-200 ${
                view === "list"
                  ? "bg-background shadow-sm text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
              onClick={() => handleViewChange("list")}
            >
              <List className="h-4 w-4" />
              <span className="sr-only">列表视图</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">列表视图</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
