/**
 * @file 文档画布注册
 * @description 将文档画布注册到全局画布注册中心
 * @module components/content-creator/canvas/document/registerDocumentCanvas
 */

import type { ComponentType } from "react";
import { canvasRegistry } from "../../core/CanvasContainer";
import { DocumentCanvas } from "./DocumentCanvas";
import type { CanvasPlugin, CanvasProps } from "../../types";

/**
 * 文档画布插件配置
 */
export const documentCanvasPlugin: CanvasPlugin = {
  type: "document",
  name: "文档画布",
  icon: "📄",
  supportedThemes: ["social-media", "document", "knowledge", "planning"],
  supportedFileTypes: ["md", "markdown", "txt"],
  // DocumentCanvas 接受 DocumentCanvasProps，与 CanvasProps 兼容
  component: DocumentCanvas as unknown as ComponentType<CanvasProps>,
};

/**
 * 注册文档画布到全局注册中心
 */
export function registerDocumentCanvas(): void {
  canvasRegistry.register(documentCanvasPlugin);
}

/**
 * 注销文档画布
 */
export function unregisterDocumentCanvas(): void {
  canvasRegistry.unregister("document");
}
