/**
 * @file 任务文件列表组件
 * @description 显示任务过程中生成的所有文件，底部弹出面板形式
 * @module components/agent/chat/components/TaskFiles/TaskFileList
 */

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  FolderOpen,
  ChevronUp,
  ChevronDown,
  FileText,
  Image,
  Code,
  LayoutGrid,
  X,
} from "lucide-react";
import { TaskFileItem } from "./TaskFileItem";
import type { TaskFilesProps } from "./types";

/** 文件类型过滤器 */
type FileFilter = "all" | "document" | "image" | "code";

const FILTER_ICONS: Record<FileFilter, React.ElementType> = {
  all: LayoutGrid,
  document: FileText,
  image: Image,
  code: Code,
};

export const TaskFileList: React.FC<TaskFilesProps> = ({
  files,
  selectedFileId,
  onFileClick,
  expanded = false,
  onExpandedChange,
}) => {
  const [filter, setFilter] = useState<FileFilter>("all");

  // 过滤文件
  const filteredFiles = files.filter((file) => {
    if (filter === "all") return true;
    if (file.type === "folder") return true;
    return file.type === filter;
  });

  // 统计文件数量
  const fileCount = files.reduce((count, file) => {
    if (file.type === "folder" && file.children) {
      return count + file.children.length;
    }
    return count + 1;
  }, 0);

  // 切换展开状态
  const handleToggle = useCallback(() => {
    onExpandedChange?.(!expanded);
  }, [expanded, onExpandedChange]);

  // 关闭面板
  const handleClose = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onExpandedChange?.(false);
    },
    [onExpandedChange],
  );

  if (files.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* 触发按钮 - 居中显示 */}
      <div className="flex items-center justify-center py-2">
        <button
          type="button"
          className={cn(
            "flex items-center gap-2 px-4 py-1.5 rounded-full",
            "text-sm text-muted-foreground",
            "border border-border bg-background",
            "hover:bg-muted/50 transition-colors",
            expanded && "bg-muted/50",
          )}
          onClick={handleToggle}
        >
          <FolderOpen className="w-4 h-4" />
          <span>任务文件 ({fileCount})</span>
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronUp className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* 弹出面板 - 参考 AnyGen 样式 */}
      {expanded && (
        <div
          className={cn(
            "absolute bottom-full left-1/2 -translate-x-1/2 mb-2",
            "bg-background border border-border rounded-xl shadow-lg",
            "z-50 overflow-hidden",
            "w-[360px] max-h-[320px]",
          )}
        >
          {/* 面板头部 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="w-4 h-4" />
              <span>所有文件</span>
            </div>
            <div className="flex items-center gap-2">
              {/* 过滤器 */}
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                {(Object.keys(FILTER_ICONS) as FileFilter[]).map((key) => {
                  const Icon = FILTER_ICONS[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      className={cn(
                        "p-1.5 rounded-md transition-colors",
                        filter === key
                          ? "bg-background shadow-sm text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      onClick={() => setFilter(key)}
                      title={key === "all" ? "全部" : key}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
              {/* 关闭按钮 */}
              <button
                type="button"
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                onClick={handleClose}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 文件列表 */}
          <div className="max-h-[240px] overflow-y-auto">
            {filteredFiles.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                暂无文件
              </div>
            ) : (
              <div className="py-2 px-2">
                {filteredFiles.map((file) => (
                  <TaskFileItem
                    key={file.id}
                    file={file}
                    isSelected={file.id === selectedFileId}
                    onClick={onFileClick}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
