/**
 * @file Provider 模型列表 Hook
 * @description 根据 Provider 获取对应的模型列表
 * @module hooks/useProviderModels
 */

import { useMemo } from "react";
import { useModelRegistry } from "./useModelRegistry";
import { useAliasConfig } from "./useAliasConfig";
import { isAliasProvider } from "@/lib/constants/providerMappings";
import type { ConfiguredProvider } from "./useConfiguredProviders";
import type {
  EnhancedModelMetadata,
  ProviderAliasConfig,
} from "@/lib/types/modelRegistry";

// ============================================================================
// 类型定义
// ============================================================================

export interface UseProviderModelsOptions {
  /** 是否返回完整的模型元数据（默认只返回模型 ID） */
  returnFullMetadata?: boolean;
  /** 是否自动加载模型注册表 */
  autoLoad?: boolean;
}

export interface UseProviderModelsResult {
  /** 模型 ID 列表 */
  modelIds: string[];
  /** 完整的模型元数据列表（仅当 returnFullMetadata 为 true 时有值） */
  models: EnhancedModelMetadata[];
  /** 是否正在加载 */
  loading: boolean;
  /** 加载错误 */
  error: string | null;
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 模型排序函数
 * 排序优先级：is_latest > release_date（降序） > display_name（字母序）
 */
function sortModels(models: EnhancedModelMetadata[]): EnhancedModelMetadata[] {
  return [...models].sort((a, b) => {
    // 1. is_latest 优先
    if (a.is_latest && !b.is_latest) return -1;
    if (!a.is_latest && b.is_latest) return 1;

    // 2. 按 release_date 降序（最新的在前）
    if (a.release_date && b.release_date) {
      return b.release_date.localeCompare(a.release_date);
    }
    if (a.release_date && !b.release_date) return -1;
    if (!a.release_date && b.release_date) return 1;

    // 3. 按 display_name 字母序
    return a.display_name.localeCompare(b.display_name);
  });
}

/**
 * 将自定义模型列表转换为 EnhancedModelMetadata 格式
 */
function convertCustomModelsToMetadata(
  models: string[],
  providerId: string,
  providerName: string,
): EnhancedModelMetadata[] {
  return models.map((modelName): EnhancedModelMetadata => {
    return {
      id: modelName,
      display_name: modelName,
      provider_id: providerId,
      provider_name: providerName,
      family: null,
      tier: "pro" as const,
      capabilities: {
        vision: false,
        tools: true,
        streaming: true,
        json_mode: true,
        function_calling: true,
        reasoning: modelName.includes("thinking"),
      },
      pricing: null,
      limits: {
        context_length: null,
        max_output_tokens: null,
        requests_per_minute: null,
        tokens_per_minute: null,
      },
      status: "active" as const,
      release_date: null,
      is_latest: false,
      description: `自定义模型: ${modelName}`,
      source: "custom" as const,
      created_at: Date.now() / 1000,
      updated_at: Date.now() / 1000,
    };
  });
}

/**
 * 将别名配置中的模型转换为 EnhancedModelMetadata 格式
 */
function convertAliasModelsToMetadata(
  models: string[],
  aliasConfig: ProviderAliasConfig,
  providerId: string,
  providerName: string,
): EnhancedModelMetadata[] {
  return models.map((modelName): EnhancedModelMetadata => {
    const aliasInfo = aliasConfig.aliases[modelName];
    return {
      id: modelName,
      display_name: modelName,
      provider_id: providerId,
      provider_name: providerName,
      family: aliasInfo?.provider || null,
      tier: "pro" as const,
      capabilities: {
        vision: false,
        tools: true,
        streaming: true,
        json_mode: true,
        function_calling: true,
        reasoning: modelName.includes("thinking"),
      },
      pricing: null,
      limits: {
        context_length: null,
        max_output_tokens: null,
        requests_per_minute: null,
        tokens_per_minute: null,
      },
      status: "active" as const,
      release_date: null,
      is_latest: false,
      description:
        aliasInfo?.description || `${aliasInfo?.actual || modelName}`,
      source: "custom" as const,
      created_at: Date.now() / 1000,
      updated_at: Date.now() / 1000,
    };
  });
}

// ============================================================================
// Hook 实现
// ============================================================================

/**
 * 获取 Provider 的模型列表
 *
 * 根据 Provider 类型，从别名配置或模型注册表获取模型列表。
 * 支持返回模型 ID 列表或完整的模型元数据。
 *
 * @param selectedProvider 当前选中的 Provider
 * @param options 配置选项
 * @returns 模型列表、加载状态和错误信息
 *
 * @example
 * ```tsx
 * // 只获取模型 ID
 * const { modelIds, loading } = useProviderModels(selectedProvider);
 *
 * // 获取完整元数据
 * const { models, loading } = useProviderModels(selectedProvider, {
 *   returnFullMetadata: true
 * });
 * ```
 */
export function useProviderModels(
  selectedProvider: ConfiguredProvider | undefined | null,
  options: UseProviderModelsOptions = {},
): UseProviderModelsResult {
  const { returnFullMetadata = false, autoLoad = true } = options;

  // 获取模型注册表数据
  const {
    models: registryModels,
    loading: registryLoading,
    error: registryError,
  } = useModelRegistry({ autoLoad });

  // 获取别名配置
  const { aliasConfig, loading: aliasLoading } =
    useAliasConfig(selectedProvider);

  // 计算模型列表
  const result = useMemo(() => {
    if (!selectedProvider) {
      return { modelIds: [], models: [] };
    }

    // 收集所有模型
    let allModels: EnhancedModelMetadata[] = [];
    let allModelIds: string[] = [];

    // 1. 首先添加自定义模型（排在最前面）
    if (
      selectedProvider.customModels &&
      selectedProvider.customModels.length > 0
    ) {
      const customModels = convertCustomModelsToMetadata(
        selectedProvider.customModels,
        selectedProvider.key,
        selectedProvider.label,
      );
      allModels = [...customModels];
      allModelIds = [...selectedProvider.customModels];
    }

    // 2. 对于别名 Provider，添加别名配置中的模型
    if (isAliasProvider(selectedProvider.key) && aliasConfig) {
      const aliasModels = convertAliasModelsToMetadata(
        aliasConfig.models,
        aliasConfig,
        selectedProvider.key,
        selectedProvider.label,
      );
      // 过滤掉已存在的模型（避免重复）
      const newAliasModels = aliasModels.filter(
        (m) => !allModelIds.includes(m.id),
      );
      allModels = [...allModels, ...newAliasModels];
      allModelIds = [...allModelIds, ...newAliasModels.map((m) => m.id)];
    }

    // 3. 从模型注册表获取模型
    let registryFilteredModels = registryModels.filter(
      (m) => m.provider_id === selectedProvider.registryId,
    );

    // 如果没有找到模型，尝试使用 fallbackRegistryId
    if (
      registryFilteredModels.length === 0 &&
      selectedProvider.fallbackRegistryId
    ) {
      registryFilteredModels = registryModels.filter(
        (m) => m.provider_id === selectedProvider.fallbackRegistryId,
      );
    }

    // 过滤掉已存在的模型（避免重复）
    const newRegistryModels = registryFilteredModels.filter(
      (m) => !allModelIds.includes(m.id),
    );

    // 排序注册表模型
    const sortedRegistryModels = sortModels(newRegistryModels);

    allModels = [...allModels, ...sortedRegistryModels];
    allModelIds = [...allModelIds, ...sortedRegistryModels.map((m) => m.id)];

    return {
      modelIds: allModelIds,
      models: returnFullMetadata ? allModels : [],
    };
  }, [selectedProvider, registryModels, aliasConfig, returnFullMetadata]);

  // 计算加载状态
  const loading = registryLoading || aliasLoading;

  // 计算错误状态
  const error = registryError || null;

  return {
    ...result,
    loading,
    error,
  };
}

/**
 * 简化版本：只返回模型 ID 列表
 */
export function useProviderModelIds(
  selectedProvider: ConfiguredProvider | undefined | null,
): string[] {
  const { modelIds } = useProviderModels(selectedProvider);
  return modelIds;
}

export default useProviderModels;
