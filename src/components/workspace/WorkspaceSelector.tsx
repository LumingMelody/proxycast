/**
 * @file WorkspaceSelector.tsx
 * @description Workspace 选择器组件，用于切换和管理工作目录
 * @module components/workspace/WorkspaceSelector
 */

import { useState } from "react";
import { FolderOpen, Plus, Check, ChevronDown } from "lucide-react";
import { useWorkspace, type Workspace } from "@/hooks/useWorkspace";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface WorkspaceSelectorProps {
  /** 自定义类名 */
  className?: string;
  /** 选择 Workspace 后的回调 */
  onSelect?: (workspace: Workspace) => void;
  /** 点击添加按钮的回调 */
  onAddClick?: () => void;
}

/**
 * Workspace 选择器组件
 */
export function WorkspaceSelector({
  className,
  onSelect,
  onAddClick,
}: WorkspaceSelectorProps) {
  const { workspaces, currentWorkspace, loading, setDefault } = useWorkspace();
  const [open, setOpen] = useState(false);

  const handleSelect = async (workspace: Workspace) => {
    if (workspace.id !== currentWorkspace?.id) {
      await setDefault(workspace.id);
      onSelect?.(workspace);
    }
    setOpen(false);
  };

  const handleAddClick = () => {
    setOpen(false);
    onAddClick?.();
  };

  // 获取显示名称（路径的最后一部分）
  const getDisplayName = (workspace: Workspace) => {
    const parts = workspace.rootPath.split("/");
    return parts[parts.length - 1] || workspace.name;
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("gap-2 px-2", className)}
          disabled={loading}
        >
          <FolderOpen className="h-4 w-4" />
          <span className="max-w-[120px] truncate">
            {currentWorkspace
              ? getDisplayName(currentWorkspace)
              : "选择工作目录"}
          </span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        {workspaces.length === 0 ? (
          <div className="px-2 py-4 text-center text-sm text-muted-foreground">
            暂无工作目录
          </div>
        ) : (
          workspaces.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => handleSelect(workspace)}
              className="gap-2"
            >
              <FolderOpen className="h-4 w-4 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="truncate font-medium">
                  {getDisplayName(workspace)}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {workspace.rootPath}
                </div>
              </div>
              {workspace.id === currentWorkspace?.id && (
                <Check className="h-4 w-4 shrink-0 text-primary" />
              )}
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleAddClick} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>添加工作目录...</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default WorkspaceSelector;
