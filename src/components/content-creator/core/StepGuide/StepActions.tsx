/**
 * @file 步骤操作按钮组件
 * @description 步骤的确认、跳过、重做操作
 * @module components/content-creator/core/StepGuide/StepActions
 */

import React, { memo } from "react";
import styled from "styled-components";
import { Check, SkipForward, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepBehavior } from "../../types";

const Container = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid hsl(var(--border));
  margin-top: 16px;
`;

const ActionButton = styled(Button)`
  gap: 6px;
`;

interface StepActionsProps {
  /** 步骤行为配置 */
  behavior: StepBehavior;
  /** 是否正在处理 */
  isProcessing?: boolean;
  /** 确认回调 */
  onConfirm?: () => void;
  /** 跳过回调 */
  onSkip?: () => void;
  /** 重做回调 */
  onRedo?: () => void;
  /** 确认按钮文本 */
  confirmLabel?: string;
  /** 跳过按钮文本 */
  skipLabel?: string;
  /** 是否显示重做按钮 */
  showRedo?: boolean;
}

/**
 * 步骤操作按钮组件
 *
 * 提供确认、跳过、重做三种操作
 */
export const StepActions: React.FC<StepActionsProps> = memo(
  ({
    behavior,
    isProcessing,
    onConfirm,
    onSkip,
    onRedo,
    confirmLabel = "确认并继续",
    skipLabel = "跳过",
    showRedo = false,
  }) => {
    return (
      <Container>
        {showRedo && behavior.redoable && (
          <ActionButton
            variant="ghost"
            size="sm"
            onClick={onRedo}
            disabled={isProcessing}
          >
            <RotateCcw size={14} />
            重做
          </ActionButton>
        )}

        {behavior.skippable && (
          <ActionButton
            variant="outline"
            size="sm"
            onClick={onSkip}
            disabled={isProcessing}
          >
            <SkipForward size={14} />
            {skipLabel}
          </ActionButton>
        )}

        <ActionButton size="sm" onClick={onConfirm} disabled={isProcessing}>
          <Check size={14} />
          {confirmLabel}
        </ActionButton>
      </Container>
    );
  },
);

StepActions.displayName = "StepActions";
