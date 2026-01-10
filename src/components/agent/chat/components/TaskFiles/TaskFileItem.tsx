/**
 * @file 任务文件项组件
 * @description 单个文件/文件夹的展示组件
 * @module components/agent/chat/components/TaskFiles/TaskFileItem
 */

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  FileText,
  Folder,
  FolderOpen,
  Image,
  Code,
  Database,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import type { TaskFile, TaskFileType } from "./types";

/** 文件类型图标映射 */
const FILE_ICONS: Record<TaskFileType, React.ElementType> = {
  document: FileText,
  folder: Folder,
  image: Image,
  code: Code,
  data: Database,
};

/** 文件类型颜色映射 */
const FILE_COLORS: Record<TaskFileType, string> = {
  document: "text-blue-500",
  folder: "text-amber-500",
  image: "text-green-500",
  code: "text-purple-500",
  data: "text-orange-500",
};

/** 文件类型背景色映射 */
const FILE_BG_COLORS: Record<TaskFileType, string> = {
  document: "bg-blue-500/10",
  folder: "bg-amber-500/10",
  image: "bg-green-500/10",
  code: "bg-purple-500/10",
  data: "bg-orange-500/10",
};

interface TaskFileItemProps {
  file: TaskFile;
  isSelected?: boolean;
  onClick: (file: TaskFile) => void;
  level?: number;
}

export const TaskFileItem: React.FC<TaskFileItemProps> = ({
  file,
  isSelected = false,
  onClick,
  level = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isFolder = file.type === "folder";
  const Icon = isFolder
    ? isExpanded
      ? FolderOpen
      : Folder
    : FILE_ICONS[file.type];
  const iconColor = FILE_COLORS[file.type];
  const iconBgColor = FILE_BG_COLORS[file.type];

  const handleClick = () => {
    if (isFolder) {
      setIsExpanded(!isExpanded);
    } else {
      onClick(file);
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes} 分钟前`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `大约 ${hours} 小时前`;
    const days = Math.floor(hours / 24);
    return `大约 ${days} 天前`;
  };

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg transition-colors",
          "hover:bg-muted/50",
          isSelected && "bg-primary/10",
        )}
        style={{ paddingLeft: `${12 + level * 16}px` }}
        onClick={handleClick}
      >
        {/* 展开箭头（仅文件夹） */}
        {isFolder && (
          <ChevronRight
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform flex-shrink-0",
              isExpanded && "rotate-90",
            )}
          />
        )}

        {/* 文件图标 - 带背景色 */}
        <div className={cn("p-2 rounded-lg flex-shrink-0", iconBgColor)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>

        {/* 文件信息 */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{file.name}</div>
          <div className="text-xs text-muted-foreground">
            {file.version && `Version ${file.version} · `}
            {formatTime(file.updatedAt)}
          </div>
        </div>

        {/* 更多操作 */}
        <button
          className="p-1.5 rounded-md hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            // TODO: 显示更多操作菜单
          }}
        >
          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* 子文件（文件夹展开时） */}
      {isFolder && isExpanded && file.children && (
        <div>
          {file.children.map((child) => (
            <TaskFileItem
              key={child.id}
              file={child}
              isSelected={isSelected}
              onClick={onClick}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
