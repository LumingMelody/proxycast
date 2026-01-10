/**
 * @file 版本管理 Hook
 * @description 管理文档版本历史，支持 localStorage 持久化
 * @module components/content-creator/canvas/document/hooks/useVersions
 */

import { useState, useEffect, useCallback } from "react";
import type { DocumentVersion } from "../types";

const STORAGE_KEY_PREFIX = "proxycast_doc_versions_";

/**
 * 版本管理 Hook
 */
export function useVersions(documentId: string) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 从 localStorage 加载版本
  useEffect(() => {
    if (!documentId) return;

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${documentId}`);
      if (stored) {
        const parsed = JSON.parse(stored) as DocumentVersion[];
        setVersions(parsed);
      }
    } catch (error) {
      console.error("加载版本历史失败:", error);
    }
    setIsLoaded(true);
  }, [documentId]);

  // 保存到 localStorage
  useEffect(() => {
    if (!documentId || !isLoaded) return;

    try {
      localStorage.setItem(
        `${STORAGE_KEY_PREFIX}${documentId}`,
        JSON.stringify(versions),
      );
    } catch (error) {
      console.error("保存版本历史失败:", error);
    }
  }, [documentId, versions, isLoaded]);

  /**
   * 添加新版本
   */
  const addVersion = useCallback((content: string, description?: string) => {
    const newVersion: DocumentVersion = {
      id: crypto.randomUUID(),
      content,
      createdAt: Date.now(),
      description,
    };

    setVersions((prev) => [...prev, newVersion]);
    return newVersion;
  }, []);

  /**
   * 获取指定版本
   */
  const getVersion = useCallback(
    (versionId: string) => {
      return versions.find((v) => v.id === versionId) || null;
    },
    [versions],
  );

  /**
   * 获取最新版本
   */
  const getLatestVersion = useCallback(() => {
    if (versions.length === 0) return null;
    return versions[versions.length - 1];
  }, [versions]);

  /**
   * 清除所有版本
   */
  const clearVersions = useCallback(() => {
    setVersions([]);
    if (documentId) {
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${documentId}`);
    }
  }, [documentId]);

  /**
   * 格式化版本时间
   */
  const formatVersionTime = useCallback((timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - timestamp;

    // 1 分钟内
    if (diff < 60 * 1000) {
      return "刚刚";
    }
    // 1 小时内
    if (diff < 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 1000))} 分钟前`;
    }
    // 今天
    if (date.toDateString() === now.toDateString()) {
      return `今天 ${date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
    }
    // 昨天
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `昨天 ${date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`;
    }
    // 其他
    return date.toLocaleString("zh-CN", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  return {
    versions,
    isLoaded,
    addVersion,
    getVersion,
    getLatestVersion,
    clearVersions,
    formatVersionTime,
  };
}
