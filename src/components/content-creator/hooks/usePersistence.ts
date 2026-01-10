/**
 * @file 状态持久化 Hook
 * @description 管理内容创作状态的本地持久化
 * @module components/content-creator/hooks/usePersistence
 */

import { useCallback, useEffect, useRef } from "react";
import { ThemeType, CreationMode, WorkflowStep } from "../types";

/** 持久化数据结构 */
interface PersistedState {
  theme: ThemeType;
  creationMode: CreationMode;
  workflowProgress?: {
    steps: WorkflowStep[];
    currentStepIndex: number;
    lastUpdated: number;
  };
}

/** 存储键名 */
const STORAGE_KEY = "proxycast_content_creator_state";

/** 工作流过期时间 (24小时) */
const WORKFLOW_EXPIRY_MS = 24 * 60 * 60 * 1000;

/**
 * 从 localStorage 读取状态
 */
function loadState(): PersistedState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored) as PersistedState;

    // 检查工作流是否过期
    if (parsed.workflowProgress) {
      const elapsed = Date.now() - parsed.workflowProgress.lastUpdated;
      if (elapsed > WORKFLOW_EXPIRY_MS) {
        // 清除过期的工作流进度
        parsed.workflowProgress = undefined;
      }
    }

    return parsed;
  } catch (error) {
    console.warn("读取持久化状态失败:", error);
    return null;
  }
}

/**
 * 保存状态到 localStorage
 */
function saveState(state: PersistedState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("保存持久化状态失败:", error);
  }
}

/**
 * 清除持久化状态
 */
function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("清除持久化状态失败:", error);
  }
}

interface UsePersistenceOptions {
  /** 是否自动保存 */
  autoSave?: boolean;
  /** 自动保存延迟 (ms) */
  saveDelay?: number;
}

/**
 * 状态持久化 Hook
 *
 * 管理主题、模式和工作流进度的本地持久化
 */
export function usePersistence(options: UsePersistenceOptions = {}) {
  const { autoSave = true, saveDelay = 500 } = options;
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef<PersistedState | null>(null);

  // 初始化时加载状态
  useEffect(() => {
    stateRef.current = loadState();
  }, []);

  /**
   * 获取持久化的主题
   */
  const getPersistedTheme = useCallback((): ThemeType | null => {
    const state = stateRef.current || loadState();
    return state?.theme || null;
  }, []);

  /**
   * 获取持久化的创作模式
   */
  const getPersistedMode = useCallback((): CreationMode | null => {
    const state = stateRef.current || loadState();
    return state?.creationMode || null;
  }, []);

  /**
   * 获取持久化的工作流进度
   */
  const getPersistedWorkflow = useCallback(() => {
    const state = stateRef.current || loadState();
    return state?.workflowProgress || null;
  }, []);

  /**
   * 保存主题
   */
  const persistTheme = useCallback(
    (theme: ThemeType) => {
      const current = stateRef.current ||
        loadState() || {
          theme: "general",
          creationMode: "guided" as CreationMode,
        };
      const newState = { ...current, theme };
      stateRef.current = newState;

      if (autoSave) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          saveState(newState);
        }, saveDelay);
      }
    },
    [autoSave, saveDelay],
  );

  /**
   * 保存创作模式
   */
  const persistMode = useCallback(
    (creationMode: CreationMode) => {
      const current = stateRef.current ||
        loadState() || {
          theme: "general" as ThemeType,
          creationMode: "guided",
        };
      const newState = { ...current, creationMode };
      stateRef.current = newState;

      if (autoSave) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          saveState(newState);
        }, saveDelay);
      }
    },
    [autoSave, saveDelay],
  );

  /**
   * 保存工作流进度
   */
  const persistWorkflow = useCallback(
    (steps: WorkflowStep[], currentStepIndex: number) => {
      const current = stateRef.current ||
        loadState() || {
          theme: "general" as ThemeType,
          creationMode: "guided" as CreationMode,
        };
      const newState: PersistedState = {
        ...current,
        workflowProgress: {
          steps,
          currentStepIndex,
          lastUpdated: Date.now(),
        },
      };
      stateRef.current = newState;

      if (autoSave) {
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
          saveState(newState);
        }, saveDelay);
      }
    },
    [autoSave, saveDelay],
  );

  /**
   * 清除工作流进度
   */
  const clearWorkflow = useCallback(() => {
    const current = stateRef.current || loadState();
    if (current) {
      const newState = { ...current, workflowProgress: undefined };
      stateRef.current = newState;
      saveState(newState);
    }
  }, []);

  /**
   * 清除所有持久化状态
   */
  const clearAll = useCallback(() => {
    stateRef.current = null;
    clearState();
  }, []);

  /**
   * 立即保存当前状态
   */
  const saveNow = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
    if (stateRef.current) {
      saveState(stateRef.current);
    }
  }, []);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    // 读取
    getPersistedTheme,
    getPersistedMode,
    getPersistedWorkflow,

    // 写入
    persistTheme,
    persistMode,
    persistWorkflow,

    // 清除
    clearWorkflow,
    clearAll,

    // 工具
    saveNow,
  };
}
