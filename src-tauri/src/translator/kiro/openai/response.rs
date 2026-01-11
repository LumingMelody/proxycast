//! Kiro 响应转换为 OpenAI SSE 格式
//!
//! 将 `StreamEvent` 转换为 OpenAI Chat Completions 流式响应格式。

use crate::stream::{OpenAiSseGenerator, StreamEvent};
use crate::translator::traits::{ResponseTranslator, SseResponseTranslator};

/// OpenAI 响应转换器
///
/// 将 `StreamEvent` 转换为 OpenAI SSE 格式
#[derive(Debug)]
pub struct OpenAiResponseTranslator {
    /// SSE 生成器
    generator: OpenAiSseGenerator,
}

impl Default for OpenAiResponseTranslator {
    fn default() -> Self {
        Self::new("unknown".to_string())
    }
}

impl OpenAiResponseTranslator {
    /// 创建新的转换器
    pub fn new(model: String) -> Self {
        Self {
            generator: OpenAiSseGenerator::new(model),
        }
    }

    /// 使用指定的响应 ID 创建转换器
    pub fn with_id(id: String, model: String) -> Self {
        Self {
            generator: OpenAiSseGenerator::with_id(id, model),
        }
    }

    /// 获取响应 ID
    pub fn response_id(&self) -> &str {
        self.generator.response_id()
    }
}

impl ResponseTranslator for OpenAiResponseTranslator {
    type Output = String;

    fn translate_event(&mut self, event: &StreamEvent) -> Option<Self::Output> {
        self.generator.generate(event)
    }

    fn finalize(&mut self) -> Vec<Self::Output> {
        vec![self.generator.generate_done()]
    }

    fn reset(&mut self) {
        self.generator = OpenAiSseGenerator::new("unknown".to_string());
    }
}

impl SseResponseTranslator for OpenAiResponseTranslator {
    fn translate_to_sse(&mut self, event: &StreamEvent) -> Vec<String> {
        self.generator.generate(event).into_iter().collect()
    }

    fn finalize_sse(&mut self) -> Vec<String> {
        vec![self.generator.generate_done()]
    }

    fn reset(&mut self) {
        self.generator = OpenAiSseGenerator::new("unknown".to_string());
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::stream::StopReason;

    #[test]
    fn test_translate_text_delta() {
        let mut translator = OpenAiResponseTranslator::new("gpt-4".to_string());

        let event = StreamEvent::TextDelta {
            text: "Hello".to_string(),
        };

        let sse = translator.translate_event(&event);
        assert!(sse.is_some());
        let sse = sse.unwrap();
        assert!(sse.starts_with("data: "));
        assert!(sse.contains("\"content\":\"Hello\""));
    }

    #[test]
    fn test_translate_tool_use() {
        let mut translator = OpenAiResponseTranslator::new("gpt-4".to_string());

        // 工具调用开始
        let event = StreamEvent::ToolUseStart {
            id: "call_123".to_string(),
            name: "read_file".to_string(),
        };
        let sse = translator.translate_event(&event);
        assert!(sse.is_some());
        assert!(sse.unwrap().contains("\"tool_calls\""));

        // 工具参数增量
        let event = StreamEvent::ToolUseInputDelta {
            id: "call_123".to_string(),
            partial_json: "{\"path\":".to_string(),
        };
        let sse = translator.translate_event(&event);
        assert!(sse.is_some());
    }

    #[test]
    fn test_translate_message_stop() {
        let mut translator = OpenAiResponseTranslator::new("gpt-4".to_string());

        let event = StreamEvent::MessageStop {
            stop_reason: StopReason::EndTurn,
        };

        let sse = translator.translate_event(&event);
        assert!(sse.is_some());
        let sse = sse.unwrap();
        assert!(sse.contains("\"finish_reason\":\"stop\""));
        assert!(sse.contains("[DONE]"));
    }
}
