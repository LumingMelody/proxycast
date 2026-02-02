/**
 * @file Artifact 侧边面板组件
 * @description 可调整大小的侧边面板，集成 ArtifactList、ArtifactToolbar、ArtifactRenderer
 * @module components/artifact/ArtifactPanel
 * @requirements 10.1, 10.3, 10.4, 10.5, 10.6
 */

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { X, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  artifactsAtom,
  selectedArtifactAtom,
  artifactPanelStateAtom,
  artifactActionsAtom,
} from "@/lib/artifact/store";
import { ArtifactList } from "./ArtifactList";
import { ArtifactToolbar } from "./ArtifactToolbar";
import { ArtifactRenderer } from "./ArtifactRenderer";

// ============================================================================
// 常量定义
// ============================================================================

/** 面板最小宽度 */
const MIN_PANEL_WIDTH = 320;
/** 面板最大宽度 */
const MAX_PANEL_WIDTH = 800;

// ============================================================================
// 辅助组件
// ============================================================================

/**
 * 空状态组件
 */
const EmptyState: React.FC<{ message: string }> = memo(({ message }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-gray-400">
    <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
      <span className="text-2xl">📄</span>
    </div>
    <p className="text-sm">{message}</p>
  </div>
));
EmptyState.displayName = "EmptyState";

/**
 * 拖拽手柄组件
 */
interface ResizeHandleProps {
  onMouseDown: (e: React.MouseEvent) => void;
  isResizing: boolean;
}

const ResizeHandle: React.FC<ResizeHandleProps> = memo(
  ({ onMouseDown, isResizing }) => (
    <div
      className={cn(
        "absolute left-0 top-0 bottom-0 w-1 cursor-col-resize group",
        "hover:bg-blue-500/50 transition-colors",
        isResizing && "bg-blue-500/50",
      )}
      onMouseDown={onMouseDown}
    >
      <div
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2",
          "w-4 h-8 flex items-center justify-center",
          "opacity-0 group-hover:opacity-100 transition-opacity",
          isResizing && "opacity-100",
        )}
      >
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>
    </div>
  ),
);
ResizeHandle.displayName = "ResizeHandle";

/**
 * 折叠状态面板
 */
interface CollapsedPanelProps {
  artifactCount: number;
  onExpand: () => void;
}

const CollapsedPanel: React.FC<CollapsedPanelProps> = memo(
  ({ artifactCount, onExpand }) => (
    <div className="h-full w-12 bg-[#1e2227] border-l border-white/10 flex flex-col items-center py-4">
      <button
        onClick={onExpand}
        className="flex flex-col items-center gap-2 p-2 rounded hover:bg-white/10 transition-colors"
        title="展开面板"
      >
        <ChevronLeft className="w-5 h-5 text-gray-400" />
        {artifactCount > 0 && (
          <span className="text-xs text-gray-400 bg-white/10 px-1.5 py-0.5 rounded">
            {artifactCount}
          </span>
        )}
      </button>
    </div>
  ),
);
CollapsedPanel.displayName = "CollapsedPanel";

// ============================================================================
// 主组件
// ============================================================================

/**
 * ArtifactPanel Props
 */
export interface ArtifactPanelProps {
  /** 关闭面板回调 */
  onClose?: () => void;
  /** 自定义类名 */
  className?: string;
}

/**
 * Artifact 侧边面板组件
 *
 * 功能特性：
 * - 可调整大小的侧边面板 (Requirement 10.1)
 * - 集成 ArtifactList、ArtifactToolbar、ArtifactRenderer
 * - 键盘导航：上下键选择 artifact (Requirement 10.3)
 * - 快捷键：Escape 关闭面板 (Requirement 10.4)
 * - 支持展开/折叠 (Requirement 10.5)
 * - 宽度持久化 (Requirement 10.6)
 *
 * @param onClose - 关闭面板回调
 * @param className - 自定义类名
 */
export const ArtifactPanel: React.FC<ArtifactPanelProps> = memo(
  ({ onClose, className }) => {
    // ============================================================================
    // 状态管理
    // ============================================================================

    // Jotai atoms
    const artifacts = useAtomValue(artifactsAtom);
    const selectedArtifact = useAtomValue(selectedArtifactAtom);
    const [panelState, setPanelState] = useAtom(artifactPanelStateAtom);
    const dispatch = useSetAtom(artifactActionsAtom);

    // 本地状态
    const [isResizing, setIsResizing] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showSource, setShowSource] = useState(false);
    const [viewMode, setViewMode] = useState<"source" | "preview">("source");
    const [previewSize, setPreviewSize] = useState<
      "mobile" | "tablet" | "desktop"
    >("desktop");

    // Refs
    const panelRef = useRef<HTMLDivElement>(null);
    const startXRef = useRef(0);
    const startWidthRef = useRef(0);

    // ============================================================================
    // 宽度调整逻辑
    // ============================================================================

    /**
     * 开始拖拽调整宽度
     */
    const handleResizeStart = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        startXRef.current = e.clientX;
        startWidthRef.current = panelState.width;
      },
      [panelState.width],
    );

    /**
     * 拖拽过程中更新宽度
     */
    useEffect(() => {
      if (!isResizing) return;

      const handleMouseMove = (e: MouseEvent) => {
        // 向左拖拽增加宽度，向右拖拽减少宽度
        const delta = startXRef.current - e.clientX;
        const newWidth = Math.min(
          MAX_PANEL_WIDTH,
          Math.max(MIN_PANEL_WIDTH, startWidthRef.current + delta),
        );
        setPanelState((prev) => ({ ...prev, width: newWidth }));
      };

      const handleMouseUp = () => {
        setIsResizing(false);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }, [isResizing, setPanelState]);

    // ============================================================================
    // 键盘导航
    // ============================================================================

    /**
     * 处理键盘事件
     * - 上下键选择 artifact (Requirement 10.3)
     * - Escape 关闭面板 (Requirement 10.4)
     */
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        // Escape 关闭面板
        if (e.key === "Escape") {
          e.preventDefault();
          onClose?.();
          return;
        }

        // 上下键导航
        if (artifacts.length === 0) return;

        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();

          const currentIndex = selectedArtifact
            ? artifacts.findIndex((a) => a.id === selectedArtifact.id)
            : -1;

          let newIndex: number;
          if (e.key === "ArrowUp") {
            // 向上选择
            newIndex =
              currentIndex <= 0 ? artifacts.length - 1 : currentIndex - 1;
          } else {
            // 向下选择
            newIndex =
              currentIndex >= artifacts.length - 1 ? 0 : currentIndex + 1;
          }

          dispatch({ type: "select", id: artifacts[newIndex].id });
        }
      };

      // 只在面板获得焦点时监听键盘事件
      const panel = panelRef.current;
      if (panel) {
        panel.addEventListener("keydown", handleKeyDown);
        return () => panel.removeEventListener("keydown", handleKeyDown);
      }
    }, [artifacts, selectedArtifact, dispatch, onClose]);

    // ============================================================================
    // 事件处理
    // ============================================================================

    /**
     * 选择 artifact
     */
    const handleSelectArtifact = useCallback(
      (id: string) => {
        dispatch({ type: "select", id });
        setShowSource(false); // 切换 artifact 时重置源码视图
        setViewMode("source"); // 重置视图模式
      },
      [dispatch],
    );

    /**
     * 切换源码视图
     */
    const handleToggleSource = useCallback(() => {
      setShowSource((prev) => !prev);
    }, []);

    /**
     * 切换视图模式（代码预览）
     */
    const handleViewModeChange = useCallback((mode: "source" | "preview") => {
      setViewMode(mode);
    }, []);

    /**
     * 切换预览尺寸
     */
    const handlePreviewSizeChange = useCallback(
      (size: "mobile" | "tablet" | "desktop") => {
        setPreviewSize(size);
      },
      [],
    );

    /**
     * 关闭面板
     */
    const handleClose = useCallback(() => {
      onClose?.();
    }, [onClose]);

    /**
     * 展开面板
     */
    const handleExpand = useCallback(() => {
      setIsCollapsed(false);
    }, []);

    /**
     * 折叠面板
     */
    const handleCollapse = useCallback(() => {
      setIsCollapsed(true);
    }, []);

    // ============================================================================
    // 渲染
    // ============================================================================

    // 折叠状态
    if (isCollapsed) {
      return (
        <CollapsedPanel
          artifactCount={artifacts.length}
          onExpand={handleExpand}
        />
      );
    }

    return (
      <div
        ref={panelRef}
        tabIndex={0}
        className={cn(
          "relative h-full flex flex-col bg-[#1e2227] border-l border-white/10",
          "focus:outline-none",
          className,
        )}
        style={{ width: panelState.width }}
      >
        {/* 拖拽调整宽度手柄 */}
        <ResizeHandle onMouseDown={handleResizeStart} isResizing={isResizing} />

        {/* 头部 */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-[#21252b]">
          <h3 className="text-sm font-medium text-white">Artifacts</h3>
          <div className="flex items-center gap-1">
            {/* 折叠按钮 */}
            <button
              onClick={handleCollapse}
              className="flex items-center justify-center w-7 h-7 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="折叠面板"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {/* 关闭按钮 */}
            <button
              onClick={handleClose}
              className="flex items-center justify-center w-7 h-7 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="关闭面板"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Artifact 列表（多个 artifact 时显示） */}
        {artifacts.length > 1 && (
          <ArtifactList
            artifacts={artifacts}
            selectedId={selectedArtifact?.id}
            onSelect={handleSelectArtifact}
          />
        )}

        {/* 渲染区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedArtifact ? (
            <>
              {/* 工具栏 */}
              <ArtifactToolbar
                artifact={selectedArtifact}
                showSource={showSource}
                onToggleSource={handleToggleSource}
                onClose={handleClose}
                isStreaming={selectedArtifact.status === "streaming"}
                viewMode={viewMode}
                onViewModeChange={handleViewModeChange}
                previewSize={previewSize}
                onPreviewSizeChange={handlePreviewSizeChange}
              />
              {/* 渲染器 */}
              <div className="flex-1 overflow-auto">
                <ArtifactRenderer
                  artifact={selectedArtifact}
                  isStreaming={selectedArtifact.status === "streaming"}
                  hideToolbar={true}
                  viewMode={viewMode}
                  previewSize={previewSize}
                />
              </div>
            </>
          ) : artifacts.length > 0 ? (
            <EmptyState message="选择一个 Artifact 查看" />
          ) : (
            <EmptyState message="暂无 Artifact" />
          )}
        </div>
      </div>
    );
  },
);

ArtifactPanel.displayName = "ArtifactPanel";

export default ArtifactPanel;
