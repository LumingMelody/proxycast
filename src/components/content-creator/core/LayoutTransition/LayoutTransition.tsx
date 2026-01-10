/**
 * @file 布局过渡组件
 * @description 处理对话和画布之间的布局切换动画
 * @module components/content-creator/core/LayoutTransition/LayoutTransition
 */

import React, { memo } from "react";
import styled from "styled-components";
import { LayoutMode } from "../../types";
import { useLayoutTransition, TransitionConfig } from "./useLayoutTransition";

const Container = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const ChatPanel = styled.div<{ $width: string; $duration: number }>`
  height: 100%;
  overflow: hidden;
  transition: width ${({ $duration }) => $duration}ms ease-out;
  width: ${({ $width }) => $width};
  will-change: width;
  display: flex;
  flex-direction: column;
`;

const CanvasPanel = styled.div<{
  $visible: boolean;
  $transform: string;
  $opacity: number;
  $duration: number;
}>`
  position: relative;
  height: 100%;
  flex: 1;
  overflow: hidden;
  transition:
    transform ${({ $duration }) => $duration}ms ease-out,
    opacity ${({ $duration }) => $duration}ms ease-out;
  transform: ${({ $transform }) => $transform};
  opacity: ${({ $opacity }) => $opacity};
  display: ${({ $visible }) => ($visible ? "block" : "none")};
  will-change: transform, opacity;
`;

interface LayoutTransitionProps {
  /** 当前布局模式 */
  mode: LayoutMode;
  /** 对话区域内容 */
  chatContent: React.ReactNode;
  /** 画布区域内容 */
  canvasContent: React.ReactNode;
  /** 过渡配置 */
  transitionConfig?: TransitionConfig;
}

/**
 * 布局过渡组件
 *
 * 处理纯对话和对话+画布两种布局之间的平滑切换
 */
export const LayoutTransition: React.FC<LayoutTransitionProps> = memo(
  ({ mode, chatContent, canvasContent, transitionConfig }) => {
    const { isCanvasVisible, getTransitionStyles } = useLayoutTransition(
      mode,
      transitionConfig,
    );

    const chatStyles = getTransitionStyles("chat");
    const canvasStyles = getTransitionStyles("canvas");

    return (
      <Container>
        <ChatPanel
          $width={chatStyles.width as string}
          $duration={parseInt(
            chatStyles.transition?.match(/\d+/)?.[0] || "300",
          )}
        >
          {chatContent}
        </ChatPanel>

        <CanvasPanel
          $visible={isCanvasVisible}
          $transform={canvasStyles.transform as string}
          $opacity={canvasStyles.opacity as number}
          $duration={parseInt(
            canvasStyles.transition?.match(/\d+/)?.[0] || "300",
          )}
        >
          {canvasContent}
        </CanvasPanel>
      </Container>
    );
  },
);

LayoutTransition.displayName = "LayoutTransition";
