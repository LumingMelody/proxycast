/**
 * @file 输入栏组件
 * @description 消息输入栏，支持多行输入和快捷键
 * @module components/chat/components/InputBar
 */

import React, { useState, useCallback, useRef, useEffect, memo } from "react";
import styled from "styled-components";
import { Send, Square, Paperclip, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";

const InputContainer = styled.div`
  padding: 16px;
  border-top: 1px solid hsl(var(--border));
  background: hsl(var(--background));
`;

const InputWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const InputBox = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  background: hsl(var(--card));
  transition: border-color 0.2s;

  &:focus-within {
    border-color: hsl(var(--primary));
  }
`;

const TextArea = styled.textarea`
  flex: 1;
  min-height: 24px;
  max-height: 200px;
  padding: 0;
  border: none;
  background: transparent;
  color: hsl(var(--foreground));
  font-size: 15px;
  line-height: 1.5;
  resize: none;
  outline: none;

  &::placeholder {
    color: hsl(var(--muted-foreground));
  }
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const IconButton = styled(Button)`
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 8px;
`;

const SendButton = styled(IconButton)<{ $isGenerating?: boolean }>`
  background: ${({ $isGenerating }) =>
    $isGenerating ? "hsl(var(--destructive))" : "hsl(var(--primary))"};
  color: hsl(var(--primary-foreground));

  &:hover {
    background: ${({ $isGenerating }) =>
      $isGenerating
        ? "hsl(var(--destructive) / 0.9)"
        : "hsl(var(--primary) / 0.9)"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const HintText = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
  text-align: center;
`;

interface InputBarProps {
  /** 发送消息回调 */
  onSend: (content: string) => void;
  /** 是否正在生成 */
  isGenerating?: boolean;
  /** 停止生成回调 */
  onStop?: () => void;
  /** 是否禁用 */
  disabled?: boolean;
  /** 占位符文本 */
  placeholder?: string;
}

/**
 * 输入栏组件
 *
 * 支持：
 * - 多行输入
 * - Cmd/Ctrl + Enter 发送
 * - 自动调整高度
 * - 停止生成
 */
export const InputBar: React.FC<InputBarProps> = memo(
  ({
    onSend,
    isGenerating,
    onStop,
    disabled,
    placeholder = "输入消息，按 Enter 发送...",
  }) => {
    const [input, setInput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // 自动调整高度
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
      }
    }, [input]);

    const handleSend = useCallback(() => {
      if (isGenerating) {
        onStop?.();
        return;
      }

      const trimmed = input.trim();
      if (!trimmed || disabled) return;

      onSend(trimmed);
      setInput("");

      // 重置高度
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }, [input, isGenerating, disabled, onSend, onStop]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        // Enter 发送（不按 Shift）
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSend();
        }
      },
      [handleSend],
    );

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
      },
      [],
    );

    const canSend = input.trim().length > 0 || isGenerating;

    return (
      <InputContainer>
        <InputWrapper>
          <InputBox>
            <IconButton variant="ghost" size="sm" disabled>
              <Paperclip size={18} />
            </IconButton>

            <TextArea
              ref={textareaRef}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
            />

            <ActionButtons>
              <IconButton variant="ghost" size="sm" disabled>
                <Mic size={18} />
              </IconButton>

              <SendButton
                $isGenerating={isGenerating}
                onClick={handleSend}
                disabled={!canSend && !isGenerating}
              >
                {isGenerating ? <Square size={16} /> : <Send size={16} />}
              </SendButton>
            </ActionButtons>
          </InputBox>

          <HintText>按 Enter 发送，Shift + Enter 换行</HintText>
        </InputWrapper>
      </InputContainer>
    );
  },
);

InputBar.displayName = "InputBar";
