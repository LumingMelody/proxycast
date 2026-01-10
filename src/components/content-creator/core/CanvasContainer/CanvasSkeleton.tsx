/**
 * @file 画布骨架屏组件
 * @description 画布加载时的占位骨架
 * @module components/content-creator/core/CanvasContainer/CanvasSkeleton
 */

import React, { memo } from "react";
import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
  background: hsl(var(--card));
`;

const ToolbarSkeleton = styled.div`
  display: flex;
  gap: 8px;
  padding-bottom: 16px;
  border-bottom: 1px solid hsl(var(--border));
  margin-bottom: 24px;
`;

const ToolbarButton = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 25%,
    hsl(var(--muted) / 0.5) 50%,
    hsl(var(--muted)) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const ContentArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TitleSkeleton = styled.div`
  width: 60%;
  height: 32px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 25%,
    hsl(var(--muted) / 0.5) 50%,
    hsl(var(--muted)) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const ParagraphSkeleton = styled.div<{ $width?: string; $delay?: number }>`
  width: ${({ $width }) => $width || "100%"};
  height: 16px;
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 25%,
    hsl(var(--muted) / 0.5) 50%,
    hsl(var(--muted)) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  animation-delay: ${({ $delay }) => $delay || 0}ms;
`;

const ParagraphGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ImageSkeleton = styled.div`
  width: 100%;
  height: 200px;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    hsl(var(--muted)) 25%,
    hsl(var(--muted) / 0.5) 50%,
    hsl(var(--muted)) 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  animation-delay: 200ms;
`;

interface CanvasSkeletonProps {
  /** 骨架类型 */
  type?: "document" | "image" | "code";
}

/**
 * 画布骨架屏组件
 *
 * 在画布加载时显示占位骨架
 */
export const CanvasSkeleton: React.FC<CanvasSkeletonProps> = memo(
  ({ type = "document" }) => {
    return (
      <Container>
        {/* 工具栏骨架 */}
        <ToolbarSkeleton>
          <ToolbarButton />
          <ToolbarButton />
          <ToolbarButton />
          <div style={{ flex: 1 }} />
          <ToolbarButton />
          <ToolbarButton />
        </ToolbarSkeleton>

        {/* 内容区骨架 */}
        <ContentArea>
          <TitleSkeleton />

          <ParagraphGroup>
            <ParagraphSkeleton $delay={50} />
            <ParagraphSkeleton $width="95%" $delay={100} />
            <ParagraphSkeleton $width="88%" $delay={150} />
          </ParagraphGroup>

          {type === "image" && <ImageSkeleton />}

          <ParagraphGroup>
            <ParagraphSkeleton $width="92%" $delay={200} />
            <ParagraphSkeleton $width="85%" $delay={250} />
            <ParagraphSkeleton $width="78%" $delay={300} />
          </ParagraphGroup>

          {type === "document" && (
            <ParagraphGroup>
              <ParagraphSkeleton $width="90%" $delay={350} />
              <ParagraphSkeleton $width="82%" $delay={400} />
            </ParagraphGroup>
          )}
        </ContentArea>
      </Container>
    );
  },
);

CanvasSkeleton.displayName = "CanvasSkeleton";
