/**
 * @file 画布注册中心
 * @description 管理画布插件的注册和查找
 * @module components/content-creator/core/CanvasContainer/CanvasRegistry
 */

import { CanvasPlugin, ThemeType } from "../../types";

/**
 * 画布注册中心
 *
 * 管理所有画布插件的注册、查找和获取
 */
export class CanvasRegistry {
  private plugins: Map<string, CanvasPlugin> = new Map();

  /**
   * 注册画布插件
   */
  register(plugin: CanvasPlugin): void {
    if (this.plugins.has(plugin.type)) {
      console.warn(`画布插件 "${plugin.type}" 已存在，将被覆盖`);
    }
    this.plugins.set(plugin.type, plugin);
  }

  /**
   * 批量注册画布插件
   */
  registerAll(plugins: CanvasPlugin[]): void {
    plugins.forEach((plugin) => this.register(plugin));
  }

  /**
   * 注销画布插件
   */
  unregister(type: string): boolean {
    return this.plugins.delete(type);
  }

  /**
   * 获取画布插件
   */
  get(type: string): CanvasPlugin | undefined {
    return this.plugins.get(type);
  }

  /**
   * 获取所有画布插件
   */
  getAll(): CanvasPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * 按主题查找画布插件
   */
  findByTheme(theme: ThemeType): CanvasPlugin[] {
    return this.getAll().filter((plugin) =>
      plugin.supportedThemes.includes(theme),
    );
  }

  /**
   * 按文件类型查找画布插件
   */
  findByFileType(fileType: string): CanvasPlugin[] {
    return this.getAll().filter((plugin) =>
      plugin.supportedFileTypes.includes(fileType),
    );
  }

  /**
   * 查找最匹配的画布插件
   *
   * 优先级：精确文件类型匹配 > 主题匹配 > 默认
   */
  findBestMatch(theme: ThemeType, fileType?: string): CanvasPlugin | undefined {
    // 1. 精确文件类型匹配
    if (fileType) {
      const byFileType = this.findByFileType(fileType);
      if (byFileType.length > 0) {
        // 优先选择同时支持主题的
        const withTheme = byFileType.find((p) =>
          p.supportedThemes.includes(theme),
        );
        if (withTheme) return withTheme;
        return byFileType[0];
      }
    }

    // 2. 主题匹配
    const byTheme = this.findByTheme(theme);
    if (byTheme.length > 0) {
      return byTheme[0];
    }

    // 3. 返回默认画布（document 类型）
    return this.get("document");
  }

  /**
   * 检查是否有可用的画布插件
   */
  hasPlugin(type: string): boolean {
    return this.plugins.has(type);
  }

  /**
   * 获取已注册的画布类型列表
   */
  getTypes(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * 清空所有注册
   */
  clear(): void {
    this.plugins.clear();
  }
}

/**
 * 全局画布注册中心实例
 */
export const canvasRegistry = new CanvasRegistry();
