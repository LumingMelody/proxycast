/**
 * @file 步骤卡片组件
 * @description 单个步骤的卡片展示
 * @module components/content-creator/core/StepGuide/StepCard
 */

import React, { memo, useState } from "react";
import styled from "styled-components";
import {
  ChevronDown,
  ChevronUp,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { WorkflowStep } from "../../types";

const Card = styled.div<{ $status: string }>`
  border: 1px solid
    ${({ $status }) =>
      $status === "active" ? "hsl(var(--primary))" : "hsl(var(--border))"};
  border-radius: 12px;
  background: hsl(var(--card));
  overflow: hidden;
  transition: border-color 0.2s;
`;

const CardHeader = styled.button<{ $expandable: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  background: transparent;
  border: none;
  cursor: ${({ $expandable }) => ($expandable ? "pointer" : "default")};
  text-align: left;

  &:hover {
    background: ${({ $expandable }) =>
      $expandable ? "hsl(var(--muted) / 0.5)" : "transparent"};
  }
`;

const StatusIcon = styled.div<{ $status: string }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${({ $status }) => {
    switch ($status) {
      case "completed":
        return `
          background: hsl(142 76% 36% / 0.1);
          color: hsl(142 76% 36%);
        `;
      case "active":
        return `
          background: hsl(var(--primary) / 0.1);
          color: hsl(var(--primary));
        `;
      case "error":
        return `
          background: hsl(var(--destructive) / 0.1);
          color: hsl(var(--destructive));
        `;
      default:
        return `
          background: hsl(var(--muted));
          color: hsl(var(--muted-foreground));
        `;
    }
  }}
`;

const HeaderContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.h4`
  font-size: 15px;
  font-weight: 500;
  color: hsl(var(--foreground));
  margin: 0 0 2px 0;
`;

const Description = styled.p`
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  margin: 0;
`;

const ExpandIcon = styled.div`
  color: hsl(var(--muted-foreground));
`;

const CardContent = styled.div<{ $expanded: boolean }>`
  max-height: ${({ $expanded }) => ($expanded ? "500px" : "0")};
  overflow: hidden;
  transition: max-height 0.3s ease;
`;

const ContentInner = styled.div`
  padding: 0 16px 16px;
  border-top: 1px solid hsl(var(--border));
`;

interface StepCardProps {
  /** 步骤数据 */
  step: WorkflowStep;
  /** 是否展开 */
  expanded?: boolean;
  /** 展开/收起回调 */
  onToggle?: () => void;
  /** 子内容 */
  children?: React.ReactNode;
}

/**
 * 步骤卡片组件
 *
 * 显示单个步骤的标题、描述和状态，支持展开/收起
 */
export const StepCard: React.FC<StepCardProps> = memo(
  ({ step, expanded = false, onToggle, children }) => {
    const [isExpanded, setIsExpanded] = useState(expanded);

    const handleToggle = () => {
      if (children) {
        setIsExpanded(!isExpanded);
        onToggle?.();
      }
    };

    const renderStatusIcon = () => {
      switch (step.status) {
        case "completed":
          return <Check size={18} />;
        case "active":
          return <Loader2 size={18} className="animate-spin" />;
        case "error":
          return <AlertCircle size={18} />;
        default:
          return null;
      }
    };

    return (
      <Card $status={step.status}>
        <CardHeader $expandable={!!children} onClick={handleToggle}>
          <StatusIcon $status={step.status}>{renderStatusIcon()}</StatusIcon>

          <HeaderContent>
            <Title>{step.title}</Title>
            {step.description && <Description>{step.description}</Description>}
          </HeaderContent>

          {children && (
            <ExpandIcon>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </ExpandIcon>
          )}
        </CardHeader>

        {children && (
          <CardContent $expanded={isExpanded}>
            <ContentInner>{children}</ContentInner>
          </CardContent>
        )}
      </Card>
    );
  },
);

StepCard.displayName = "StepCard";
