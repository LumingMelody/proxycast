/**
 * @file 文档渲染器组件
 * @description 根据平台类型选择对应的渲染器
 * @module components/content-creator/canvas/document/DocumentRenderer
 */

import React, { memo } from "react";
import styled from "styled-components";
import type { DocumentRendererProps, PlatformType } from "./types";
import {
  MarkdownRenderer,
  WechatRenderer,
  XiaohongshuRenderer,
  ZhihuRenderer,
} from "./platforms";

const Container = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: hsl(var(--background));
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: hsl(var(--muted-foreground));
  font-size: 14px;
  gap: 8px;
`;

const EmptyIcon = styled.span`
  font-size: 48px;
  opacity: 0.5;
`;

/**
 * 根据平台类型获取渲染器
 */
const getRenderer = (platform: PlatformType, content: string) => {
  switch (platform) {
    case "wechat":
      return <WechatRenderer content={content} />;
    case "xiaohongshu":
      return <XiaohongshuRenderer content={content} />;
    case "zhihu":
      return <ZhihuRenderer content={content} />;
    case "markdown":
    default:
      return <MarkdownRenderer content={content} />;
  }
};

/**
 * 文档渲染器组件
 */
export const DocumentRenderer: React.FC<DocumentRendererProps> = memo(
  ({ content, platform }) => {
    if (!content || content.trim() === "") {
      return (
        <Container>
          <EmptyState>
            <EmptyIcon>📄</EmptyIcon>
            <span>暂无内容</span>
            <span>AI 生成的文档将在这里显示</span>
          </EmptyState>
        </Container>
      );
    }

    return <Container>{getRenderer(platform, content)}</Container>;
  },
);

DocumentRenderer.displayName = "DocumentRenderer";
