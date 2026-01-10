/**
 * @file 消息列表组件
 * @description 渲染消息列表，支持自动滚动
 * @module components/chat/components/MessageList
 */

import React, { useRef, useEffect, memo } from "react";
import styled from "styled-components";
import { MessageItem } from "./MessageItem";
import { Message } from "../types";

const ListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 16px;

  /* 自定义滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: hsl(var(--muted-foreground) / 0.3);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--muted-foreground) / 0.5);
  }
`;

const MessagesWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 16px 0;
`;

const ScrollAnchor = styled.div`
  height: 1px;
`;

interface MessageListProps {
  /** 消息列表 */
  messages: Message[];
  /** 是否正在生成 */
  isGenerating?: boolean;
  /** 删除消息回调 */
  onDeleteMessage?: (id: string) => void;
  /** 重试消息回调 */
  onRetryMessage?: (id: string) => void;
}

/**
 * 消息列表组件
 *
 * 渲染消息列表，支持：
 * - 自动滚动到底部
 * - 消息删除和重试
 */
export const MessageList: React.FC<MessageListProps> = memo(
  ({ messages, isGenerating, onDeleteMessage, onRetryMessage }) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // 自动滚动到底部
    useEffect(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [messages]);

    return (
      <ListContainer ref={containerRef}>
        <MessagesWrapper>
          {messages.map((message, index) => (
            <MessageItem
              key={message.id}
              message={message}
              isGenerating={isGenerating && index === messages.length - 1}
              onDelete={onDeleteMessage}
              onRetry={
                message.role === "assistant" ? onRetryMessage : undefined
              }
            />
          ))}
          <ScrollAnchor ref={scrollRef} />
        </MessagesWrapper>
      </ListContainer>
    );
  },
);

MessageList.displayName = "MessageList";
