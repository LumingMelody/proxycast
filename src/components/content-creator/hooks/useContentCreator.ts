/**
 * @file useContentCreator Hook
 * @description 内容创作核心状态管理 Hook
 * @module components/content-creator/hooks/useContentCreator
 */

import { useState, useCallback } from "react";
import {
  LayoutMode,
  ThemeType,
  CreationMode,
  ContentFile,
  CanvasState,
  ContentCreatorState,
} from "../types";

/**
 * 默认状态
 */
const DEFAULT_STATE: ContentCreatorState = {
  mode: "chat",
  theme: "general",
  creationMode: "guided",
  activeFile: null,
  canvas: null,
  workflow: {
    steps: [],
    currentStepIndex: 0,
  },
};

/**
 * 内容创作核心状态管理 Hook
 *
 * 管理布局、主题、模式、文件、画布等状态
 */
export function useContentCreator() {
  const [state, setState] = useState<ContentCreatorState>(DEFAULT_STATE);

  /**
   * 设置布局模式
   */
  const setMode = useCallback((mode: LayoutMode) => {
    setState((prev) => ({ ...prev, mode }));
  }, []);

  /**
   * 设置主题
   */
  const setTheme = useCallback((theme: ThemeType) => {
    setState((prev) => ({ ...prev, theme }));
  }, []);

  /**
   * 设置创作模式
   */
  const setCreationMode = useCallback((creationMode: CreationMode) => {
    setState((prev) => ({ ...prev, creationMode }));
  }, []);

  /**
   * 打开文件（切换到画布模式）
   */
  const openFile = useCallback((file: ContentFile) => {
    setState((prev) => ({
      ...prev,
      mode: "chat-canvas",
      activeFile: file,
    }));
  }, []);

  /**
   * 关闭文件（切换回对话模式）
   */
  const closeFile = useCallback(() => {
    setState((prev) => ({
      ...prev,
      mode: "chat",
      activeFile: null,
      canvas: null,
    }));
  }, []);

  /**
   * 设置画布状态
   */
  const setCanvasState = useCallback((canvas: CanvasState | null) => {
    setState((prev) => ({ ...prev, canvas }));
  }, []);

  /**
   * 重置状态
   */
  const reset = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  return {
    // 状态
    ...state,

    // 操作
    setMode,
    setTheme,
    setCreationMode,
    openFile,
    closeFile,
    setCanvasState,
    reset,
  };
}
