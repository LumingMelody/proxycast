//! aster_client 模块测试
//!
//! 测试 AsterClient 的序列化、反序列化和 URL 格式

use proxycast_lib::agent::{
    AsterClient, ChatRequest, ChatResponse, CreateAgentRequest, CreateAgentResponse, ModelConfig,
    SendToAgentRequest, SendToAgentResponse,
};

#[test]
fn test_aster_client_creation() {
    let client = AsterClient::new("http://127.0.0.1:8081".to_string());
    assert!(client.is_ok());
}

#[test]
fn test_model_config_serialization() {
    let config = ModelConfig {
        provider: Some("gateway".to_string()),
        model: Some("claude-opus-4-5-20251101".to_string()),
        api_key: Some("test-key".to_string()),
        base_url: Some("http://127.0.0.1:8999".to_string()),
    };

    let json = serde_json::to_string(&config).unwrap();
    assert!(json.contains("gateway"));
    assert!(json.contains("claude-opus-4-5-20251101"));
    assert!(json.contains("test-key"));
    assert!(json.contains("http://127.0.0.1:8999"));
}

#[test]
fn test_model_config_skip_none() {
    let config = ModelConfig {
        provider: Some("gateway".to_string()),
        model: None,
        api_key: None,
        base_url: None,
    };

    let json = serde_json::to_string(&config).unwrap();
    assert!(json.contains("gateway"));
    assert!(!json.contains("\"model\""));
    assert!(!json.contains("api_key"));
    assert!(!json.contains("base_url"));
}

#[test]
fn test_create_agent_request_serialization() {
    let config = ModelConfig {
        provider: Some("gateway".to_string()),
        model: Some("claude-opus-4-5-20251101".to_string()),
        api_key: Some("test-key".to_string()),
        base_url: Some("http://127.0.0.1:8999".to_string()),
    };

    let request = CreateAgentRequest {
        template_id: "chat".to_string(),
        name: None,
        model_config: Some(config),
    };

    let json = serde_json::to_string(&request).unwrap();
    assert!(json.contains("template_id"));
    assert!(json.contains("chat"));
    assert!(json.contains("model_config"));
    assert!(json.contains("gateway"));
    assert!(!json.contains("\"name\"")); // name is None, should be skipped
}

#[test]
fn test_chat_request_serialization() {
    let config = ModelConfig {
        provider: Some("gateway".to_string()),
        model: Some("claude-opus-4-5-20251101".to_string()),
        api_key: Some("test-key".to_string()),
        base_url: Some("http://127.0.0.1:8999".to_string()),
    };

    let request = ChatRequest {
        template_id: "chat".to_string(),
        input: Some("Hello, world!".to_string()),
        images: None,
        model_config: Some(config),
    };

    let json = serde_json::to_string(&request).unwrap();
    assert!(json.contains("template_id"));
    assert!(json.contains("chat"));
    assert!(json.contains("input"));
    assert!(json.contains("Hello, world!"));
    assert!(json.contains("model_config"));
}

#[test]
fn test_send_to_agent_request_serialization() {
    let request = SendToAgentRequest {
        message: "Test message".to_string(),
    };

    let json = serde_json::to_string(&request).unwrap();
    assert!(json.contains("message"));
    assert!(json.contains("Test message"));
}

#[test]
fn test_create_agent_response_deserialization() {
    let json = r#"{"data": {"id": "agt-12345"}, "success": true}"#;
    let response: CreateAgentResponse = serde_json::from_str(json).unwrap();
    assert_eq!(response.data.id, "agt-12345");
    assert!(response.success);
}

#[test]
fn test_chat_response_deserialization() {
    let json = r#"{
        "agent_id": "agt-12345",
        "output": "Hello!",
        "text": "Hello!",
        "status": "ok",
        "success": true
    }"#;
    let response: ChatResponse = serde_json::from_str(json).unwrap();
    assert_eq!(response.agent_id, "agt-12345");
    assert_eq!(response.output, "Hello!");
    assert_eq!(response.text, "Hello!");
    assert_eq!(response.status, "ok");
    assert!(response.success);
}

#[test]
fn test_chat_response_with_empty_output() {
    let json = r#"{
        "agent_id": "agt-12345",
        "status": "ok",
        "success": true
    }"#;
    let response: ChatResponse = serde_json::from_str(json).unwrap();
    assert_eq!(response.agent_id, "agt-12345");
    assert_eq!(response.output, ""); // default value
    assert_eq!(response.text, ""); // default value
    assert!(response.success);
}

#[test]
fn test_send_to_agent_response_deserialization() {
    let json = r#"{"text": "Response text", "success": true}"#;
    let response: SendToAgentResponse = serde_json::from_str(json).unwrap();
    assert_eq!(response.text, "Response text");
    assert!(response.success);
}

#[test]
fn test_send_to_agent_response_with_empty_text() {
    let json = r#"{"success": true}"#;
    let response: SendToAgentResponse = serde_json::from_str(json).unwrap();
    assert_eq!(response.text, ""); // default value
    assert!(response.success);
}

#[test]
fn test_url_format_create_agent() {
    let base_url = "http://127.0.0.1:8081";
    let expected_url = "http://127.0.0.1:8081/v1/agents";
    let actual_url = format!("{}/v1/agents", base_url);
    assert_eq!(actual_url, expected_url);
}

#[test]
fn test_url_format_send_to_agent() {
    let base_url = "http://127.0.0.1:8081";
    let agent_id = "agt-12345";
    let expected_url = "http://127.0.0.1:8081/v1/agents/agt-12345/send";
    let actual_url = format!("{}/v1/agents/{}/send", base_url, agent_id);
    assert_eq!(actual_url, expected_url);
}

#[test]
fn test_url_format_chat() {
    let base_url = "http://127.0.0.1:8081";
    let expected_url = "http://127.0.0.1:8081/v1/agents/chat";
    let actual_url = format!("{}/v1/agents/chat", base_url);
    assert_eq!(actual_url, expected_url);
}
