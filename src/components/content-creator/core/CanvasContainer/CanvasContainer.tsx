/**
 * @file 画布容器组件
 * @description 动态加载和渲染画布插件
 * @module components/content-creator/core/CanvasContainer/CanvasContainer
 */

import React, { memo, Suspense, useMemo, useCallback } from "react";
import styled from "styled-components";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CanvasState, ThemeType } from "../../types";
import { canvasRegistry } from "./CanvasRegistry";
import { CanvasSkeleton } from "./CanvasSkeleton";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: hsl(var(--card));
  border-left: 1px solid hsl(var(--border));
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid hsl(var(--border));
`;

const Title = styled.h3`
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--foreground));
  margin: 0;
`;

const CloseButton = styled(Button)`
  width: 28px;
  height: 28px;
  padding: 0;
`;

const Content = styled.div`
  flex: 1;
  overflow: hidden;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
  text-align: center;
  gap: 12px;
`;

const ErrorIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: hsl(var(--destructive) / 0.1);
  color: hsl(var(--destructive));
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ErrorTitle = styled.h4`
  font-size: 16px;
  font-weight: 500;
  color: hsl(var(--foreground));
  margin: 0;
`;

const ErrorMessage = styled.p`
  font-size: 14px;
  color: hsl(var(--muted-foreground));
  margin: 0;
`;

/**
 * 错误边界组件
 */
class CanvasErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: {
    children: React.ReactNode;
    onError?: (error: Error) => void;
  }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorIcon>
            <AlertCircle size={24} />
          </ErrorIcon>
          <ErrorTitle>画布加载失败</ErrorTitle>
          <ErrorMessage>{this.state.error?.message || "未知错误"}</ErrorMessage>
          <Button
            variant="outline"
            size="sm"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            重试
          </Button>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

interface CanvasContainerProps {
  /** 画布状态 */
  state: CanvasState;
  /** 当前主题 */
  theme: ThemeType;
  /** 状态变更回调 */
  onStateChange: (state: CanvasState) => void;
  /** 关闭回调 */
  onClose: () => void;
  /** 标题 */
  title?: string;
}

/**
 * 画布容器组件
 *
 * 负责动态加载画布插件并渲染
 */
export const CanvasContainer: React.FC<CanvasContainerProps> = memo(
  ({ state, theme, onStateChange, onClose, title }) => {
    // 查找匹配的画布插件
    const plugin = useMemo(() => {
      return canvasRegistry.findBestMatch(theme, state.type);
    }, [theme, state.type]);

    // 错误处理
    const handleError = useCallback((error: Error) => {
      console.error("画布渲染错误:", error);
    }, []);

    // 渲染画布内容
    const renderCanvas = () => {
      if (!plugin) {
        return (
          <ErrorContainer>
            <ErrorIcon>
              <AlertCircle size={24} />
            </ErrorIcon>
            <ErrorTitle>未找到画布插件</ErrorTitle>
            <ErrorMessage>
              没有找到支持 "{state.type}" 类型的画布插件
            </ErrorMessage>
          </ErrorContainer>
        );
      }

      const CanvasComponent = plugin.component;

      return (
        <CanvasErrorBoundary onError={handleError}>
          <Suspense
            fallback={
              <CanvasSkeleton
                type={state.type as "document" | "image" | "code"}
              />
            }
          >
            <CanvasComponent state={state} onStateChange={onStateChange} />
          </Suspense>
        </CanvasErrorBoundary>
      );
    };

    return (
      <Container>
        <Header>
          <Title>{title || plugin?.name || "画布"}</Title>
          <CloseButton variant="ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </CloseButton>
        </Header>
        <Content>{renderCanvas()}</Content>
      </Container>
    );
  },
);

CanvasContainer.displayName = "CanvasContainer";
