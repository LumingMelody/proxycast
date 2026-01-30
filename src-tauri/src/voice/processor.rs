//! 语音处理器
//!
//! 处理语音识别结果的 LLM 润色

use crate::config::VoiceInstruction;

/// 处理文本（应用指令模板）
pub fn process_text(text: &str, instruction: &VoiceInstruction) -> String {
    // 替换模板中的占位符
    instruction.prompt.replace("{{text}}", text)
}

/// 使用 LLM 润色文本
///
/// 通过本地 API 服务器调用 LLM 进行文本润色
pub async fn polish_text(
    text: &str,
    instruction: &VoiceInstruction,
    _provider: Option<&str>,
    model: Option<&str>,
) -> Result<String, String> {
    // 如果是原始输出指令，直接返回
    if instruction.id == "raw" {
        return Ok(text.to_string());
    }

    // 构建 prompt
    let prompt = process_text(text, instruction);

    // 调用本地 API 服务器
    let result = call_local_llm(&prompt, model).await?;
    Ok(result)
}

/// 调用本地 API 服务器进行 LLM 推理
async fn call_local_llm(prompt: &str, model: Option<&str>) -> Result<String, String> {
    use crate::config::load_config;

    // 加载配置获取 API 地址和密钥
    let config = load_config().map_err(|e| e.to_string())?;
    let base_url = format!("http://{}:{}", config.server.host, config.server.port);
    let api_key = &config.server.api_key;

    // 使用配置的模型或默认模型
    let model_name = model.unwrap_or("claude-sonnet-4-20250514");

    // 构建请求
    #[derive(serde::Serialize)]
    struct Message {
        role: String,
        content: String,
    }

    #[derive(serde::Serialize)]
    struct ChatRequest {
        model: String,
        messages: Vec<Message>,
        max_tokens: u32,
        temperature: f32,
    }

    let request = ChatRequest {
        model: model_name.to_string(),
        messages: vec![Message {
            role: "user".to_string(),
            content: prompt.to_string(),
        }],
        max_tokens: 2048,
        temperature: 0.3,
    };

    // 发送请求
    let client = reqwest::Client::new();
    let response = client
        .post(format!("{}/v1/chat/completions", base_url))
        .header("Authorization", format!("Bearer {}", api_key))
        .header("Content-Type", "application/json")
        .json(&request)
        .send()
        .await
        .map_err(|e| format!("请求失败: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(format!("LLM API 错误: {} - {}", status, body));
    }

    // 解析响应
    #[derive(serde::Deserialize)]
    struct Choice {
        message: ResponseMessage,
    }

    #[derive(serde::Deserialize)]
    struct ResponseMessage {
        content: Option<String>,
    }

    #[derive(serde::Deserialize)]
    struct ChatResponse {
        choices: Vec<Choice>,
    }

    let result: ChatResponse = response
        .json()
        .await
        .map_err(|e| format!("解析响应失败: {}", e))?;

    result
        .choices
        .first()
        .and_then(|c| c.message.content.clone())
        .ok_or_else(|| "LLM 返回空内容".to_string())
}
