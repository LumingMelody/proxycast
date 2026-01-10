/**
 * @file 任务文件类型定义
 * @description 定义任务过程中生成的文件类型
 * @module components/agent/chat/components/TaskFiles/types
 */

/**
 * 文件类型
 */
export type TaskFileType = "document" | "folder" | "image" | "code" | "data";

/**
 * 任务文件
 */
export interface TaskFile {
  /** 文件 ID */
  id: string;
  /** 文件名 */
  name: string;
  /** 文件类型 */
  type: TaskFileType;
  /** 文件内容（文档类型） */
  content?: string;
  /** 版本号 */
  version?: number;
  /** 创建时间 */
  createdAt: number;
  /** 更新时间 */
  updatedAt: number;
  /** 子文件（文件夹类型） */
  children?: TaskFile[];
}

/**
 * 任务文件列表 Props
 */
export interface TaskFilesProps {
  /** 文件列表 */
  files: TaskFile[];
  /** 当前选中的文件 ID */
  selectedFileId?: string;
  /** 文件点击回调 */
  onFileClick: (file: TaskFile) => void;
  /** 是否展开 */
  expanded?: boolean;
  /** 展开状态变更回调 */
  onExpandedChange?: (expanded: boolean) => void;
}
