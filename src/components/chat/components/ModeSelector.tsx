/**
 * @file 创作模式选择器组件
 * @description 选择创作模式（引导/快速/混合/框架）
 * @module components/chat/components/ModeSelector
 */

import React, { memo } from "react";
import styled from "styled-components";
import { GraduationCap, Zap, RefreshCw, LayoutTemplate } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * 创作模式类型
 */
export type CreationMode = "guided" | "fast" | "hybrid" | "framework";

/**
 * 模式配置
 */
interface ModeConfig {
  id: CreationMode;
  name: string;
  icon: React.ElementType;
  aiRole: string;
  userInvolvement: "high" | "medium" | "low";
  description: string;
}

/**
 * 模式配置列表
 */
const MODE_CONFIGS: ModeConfig[] = [
  {
    id: "guided",
    name: "引导模式",
    icon: GraduationCap,
    aiRole: "教练（提问引导）",
    userInvolvement: "high",
    description: "追求真实性、个人经历类内容",
  },
  {
    id: "fast",
    name: "快速模式",
    icon: Zap,
    aiRole: "助手（生成初稿）",
    userInvolvement: "low",
    description: "信息整理、快速产出",
  },
  {
    id: "hybrid",
    name: "混合模式",
    icon: RefreshCw,
    aiRole: "协作者（写框架）",
    userInvolvement: "medium",
    description: "平衡质量和效率",
  },
  {
    id: "framework",
    name: "框架模式",
    icon: LayoutTemplate,
    aiRole: "填充者（按框架生成）",
    userInvolvement: "medium",
    description: "固定格式文档（报告、标书）",
  },
];

const Container = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px 0;
`;

const ModeButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid
    ${({ $active }) => ($active ? "hsl(var(--primary))" : "hsl(var(--border))")};
  border-radius: 8px;
  background: ${({ $active }) =>
    $active ? "hsl(var(--primary) / 0.1)" : "hsl(var(--card))"};
  color: ${({ $active }) =>
    $active ? "hsl(var(--primary))" : "hsl(var(--foreground))"};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: hsl(var(--primary));
    background: hsl(var(--primary) / 0.05);
  }
`;

const TooltipBody = styled.div`
  max-width: 200px;
`;

const TooltipTitle = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const TooltipRole = styled.div`
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  margin-bottom: 4px;
`;

const TooltipDesc = styled.div`
  font-size: 12px;
  color: hsl(var(--muted-foreground));
`;

const InvolvementBadge = styled.span<{ $level: "high" | "medium" | "low" }>`
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  background: ${({ $level }) => {
    switch ($level) {
      case "high":
        return "hsl(var(--primary) / 0.2)";
      case "medium":
        return "hsl(var(--warning) / 0.2)";
      case "low":
        return "hsl(var(--muted) / 0.5)";
    }
  }};
  color: ${({ $level }) => {
    switch ($level) {
      case "high":
        return "hsl(var(--primary))";
      case "medium":
        return "hsl(var(--warning))";
      case "low":
        return "hsl(var(--muted-foreground))";
    }
  }};
`;

interface ModeSelectorProps {
  /** 当前选中的模式 */
  currentMode: CreationMode;
  /** 模式变更回调 */
  onModeChange: (mode: CreationMode) => void;
}

/**
 * 创作模式选择器组件
 *
 * 提供 4 种创作模式选择：
 * - 引导模式：AI 提问引导，用户参与度高
 * - 快速模式：AI 生成初稿，用户参与度低
 * - 混合模式：AI 写框架，用户填核心
 * - 框架模式：用户提供框架，AI 按框架填充
 */
export const ModeSelector: React.FC<ModeSelectorProps> = memo(
  ({ currentMode, onModeChange }) => {
    const getInvolvementText = (level: "high" | "medium" | "low") => {
      switch (level) {
        case "high":
          return "高参与";
        case "medium":
          return "中参与";
        case "low":
          return "低参与";
      }
    };

    return (
      <TooltipProvider>
        <Container>
          {MODE_CONFIGS.map((mode) => (
            <Tooltip key={mode.id}>
              <TooltipTrigger asChild>
                <ModeButton
                  $active={currentMode === mode.id}
                  onClick={() => onModeChange(mode.id)}
                >
                  <mode.icon size={16} />
                  {mode.name}
                </ModeButton>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <TooltipBody>
                  <TooltipTitle>{mode.name}</TooltipTitle>
                  <TooltipRole>AI 角色：{mode.aiRole}</TooltipRole>
                  <TooltipDesc>{mode.description}</TooltipDesc>
                  <div style={{ marginTop: 8 }}>
                    <InvolvementBadge $level={mode.userInvolvement}>
                      {getInvolvementText(mode.userInvolvement)}
                    </InvolvementBadge>
                  </div>
                </TooltipBody>
              </TooltipContent>
            </Tooltip>
          ))}
        </Container>
      </TooltipProvider>
    );
  },
);

ModeSelector.displayName = "ModeSelector";
