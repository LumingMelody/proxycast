/**
 * @file ASR 凭证卡片组件
 * @description 显示单个 ASR 凭证的信息和操作按钮
 * @module components/voice/AsrCredentialCard
 */

import { useState } from "react";
import {
  Star,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Activity,
  Cpu,
  Cloud,
  Sparkles,
} from "lucide-react";
import type { AsrCredentialEntry, AsrProviderType } from "./types";
import { ASR_PROVIDERS } from "./types";

interface AsrCredentialCardProps {
  credential: AsrCredentialEntry;
  onSetDefault: () => void;
  onToggle: () => void;
  onDelete: () => void;
  onTest: () => Promise<{ success: boolean; message: string }>;
}

/** 获取 Provider 图标 */
const ProviderIcon = ({ type }: { type: AsrProviderType }) => {
  switch (type) {
    case "whisper_local":
      return <Cpu className="h-5 w-5" />;
    case "openai":
      return <Sparkles className="h-5 w-5" />;
    default:
      return <Cloud className="h-5 w-5" />;
  }
};

/** 获取 Provider 标签 */
const getProviderLabel = (type: AsrProviderType): string => {
  return ASR_PROVIDERS.find((p) => p.type === type)?.label || type;
};

export function AsrCredentialCard({
  credential,
  onSetDefault,
  onToggle,
  onDelete,
  onTest,
}: AsrCredentialCardProps) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await onTest();
      setTestResult(result);
    } catch (e) {
      setTestResult({
        success: false,
        message: e instanceof Error ? e.message : "测试失败",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        credential.disabled
          ? "border-border bg-muted/50 opacity-60"
          : credential.is_default
            ? "border-primary bg-primary/5"
            : "border-border bg-card hover:border-primary/50"
      }`}
    >
      <div className="flex items-start justify-between">
        {/* 左侧：图标和信息 */}
        <div className="flex items-start gap-3">
          <div
            className={`rounded-lg p-2 ${
              credential.is_default
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <ProviderIcon type={credential.provider} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {credential.name || getProviderLabel(credential.provider)}
              </span>
              {credential.is_default && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  默认
                </span>
              )}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              <span>{getProviderLabel(credential.provider)}</span>
              <span className="mx-2">·</span>
              <span>语言: {credential.language}</span>
            </div>
          </div>
        </div>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center gap-1">
          {!credential.is_default && !credential.disabled && (
            <button
              onClick={onSetDefault}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              title="设为默认"
            >
              <Star className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={handleTest}
            disabled={testing || credential.disabled}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
            title="测试连接"
          >
            <Activity className={`h-4 w-4 ${testing ? "animate-pulse" : ""}`} />
          </button>
          <button
            onClick={onToggle}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            title={credential.disabled ? "启用" : "禁用"}
          >
            {credential.disabled ? (
              <ToggleLeft className="h-4 w-4" />
            ) : (
              <ToggleRight className="h-4 w-4 text-green-500" />
            )}
          </button>
          <button
            onClick={onDelete}
            className="rounded-lg p-2 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950"
            title="删除"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 测试结果 */}
      {testResult && (
        <div
          className={`mt-3 rounded-lg px-3 py-2 text-sm ${
            testResult.success
              ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400"
              : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400"
          }`}
        >
          {testResult.message}
        </div>
      )}
    </div>
  );
}
