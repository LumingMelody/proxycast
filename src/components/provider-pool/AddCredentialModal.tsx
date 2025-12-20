import { useState, useEffect } from "react";
import { X, Key, FolderOpen, LogIn, Copy, Check, Loader2 } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { listen } from "@tauri-apps/api/event";
import { providerPoolApi, PoolProviderType } from "@/lib/api/providerPool";

interface AddCredentialModalProps {
  providerType: PoolProviderType;
  onClose: () => void;
  onSuccess: () => void;
}

// Default credential paths
const defaultCredsPath: Record<string, string> = {
  kiro: "~/.aws/sso/cache/kiro-auth-token.json",
  gemini: "~/.gemini/oauth_creds.json",
  qwen: "~/.qwen/oauth_creds.json",
  antigravity: "",
  codex: "~/.codex/oauth.json",
  claude_oauth: "~/.claude/oauth.json",
  iflow: "~/.iflow/oauth_creds.json",
};

export function AddCredentialModal({
  providerType,
  onClose,
  onSuccess,
}: AddCredentialModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // OAuth fields - initialize with default path
  const [credsFilePath, setCredsFilePath] = useState(
    defaultCredsPath[providerType] || "",
  );
  const [projectId, setProjectId] = useState("");

  // API Key fields
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

  // Antigravity 添加方式: "login" | "file"
  const [antigravityMode, setAntigravityMode] = useState<"login" | "file">(
    "login",
  );

  const isOAuth = [
    "kiro",
    "gemini",
    "qwen",
    "antigravity",
    "codex",
    "claude_oauth",
    "iflow",
  ].includes(providerType);

  const providerLabels: Record<PoolProviderType, string> = {
    kiro: "Kiro (AWS)",
    gemini: "Gemini (Google)",
    qwen: "Qwen (阿里)",
    openai: "OpenAI",
    claude: "Claude (Anthropic)",
    antigravity: "Antigravity (Gemini 3 Pro)",
    codex: "Codex (OpenAI OAuth)",
    claude_oauth: "Claude OAuth",
    iflow: "iFlow",
  };

  const handleSelectFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: "JSON", extensions: ["json"] }],
      });
      if (selected) {
        setCredsFilePath(selected as string);
      }
    } catch (e) {
      console.error("Failed to open file dialog:", e);
    }
  };

  // Antigravity OAuth 登录状态
  const [antigravityAuthUrl, setAntigravityAuthUrl] = useState<string | null>(
    null,
  );
  const [urlCopied, setUrlCopied] = useState(false);
  const [waitingForCallback, setWaitingForCallback] = useState(false);

  // 监听后端发送的授权 URL 事件
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupListener = async () => {
      unlisten = await listen<{ auth_url: string }>(
        "antigravity-auth-url",
        (event) => {
          setAntigravityAuthUrl(event.payload.auth_url);
        },
      );
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);

  const handleAntigravityLogin = async () => {
    setLoading(true);
    setError(null);
    setAntigravityAuthUrl(null);

    try {
      const trimmedName = name.trim() || undefined;
      await providerPoolApi.startAntigravityOAuthLogin(trimmedName, false);
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  // 获取授权 URL 并启动服务器等待回调
  const handleGetAntigravityAuthUrl = async () => {
    setLoading(true);
    setError(null);
    setAntigravityAuthUrl(null);
    setUrlCopied(false);
    setWaitingForCallback(true);

    try {
      const trimmedName = name.trim() || undefined;
      // 调用后端：启动服务器并等待回调
      // 授权 URL 会通过事件发送
      await providerPoolApi.getAntigravityAuthUrlAndWait(trimmedName, false);
      // 如果成功返回，说明授权完成
      onSuccess();
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      setError(errorMsg);
      setWaitingForCallback(false);
    } finally {
      setLoading(false);
    }
  };

  // 复制授权 URL
  const handleCopyAuthUrl = () => {
    if (antigravityAuthUrl) {
      navigator.clipboard.writeText(antigravityAuthUrl);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    }
  };

  const handleSubmit = async () => {
    // Antigravity 登录模式单独处理
    if (providerType === "antigravity" && antigravityMode === "login") {
      await handleAntigravityLogin();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const trimmedName = name.trim() || undefined;

      if (isOAuth) {
        if (!credsFilePath) {
          setError("请选择凭证文件");
          return;
        }

        switch (providerType) {
          case "kiro":
            await providerPoolApi.addKiroOAuth(credsFilePath, trimmedName);
            break;
          case "gemini":
            await providerPoolApi.addGeminiOAuth(
              credsFilePath,
              projectId.trim() || undefined,
              trimmedName,
            );
            break;
          case "qwen":
            await providerPoolApi.addQwenOAuth(credsFilePath, trimmedName);
            break;
          case "antigravity":
            await providerPoolApi.addAntigravityOAuth(
              credsFilePath,
              projectId.trim() || undefined,
              trimmedName,
            );
            break;
          case "codex":
            await providerPoolApi.addCodexOAuth(credsFilePath, trimmedName);
            break;
          case "claude_oauth":
            await providerPoolApi.addClaudeOAuth(credsFilePath, trimmedName);
            break;
          case "iflow":
            await providerPoolApi.addIFlowOAuth(credsFilePath, trimmedName);
            break;
        }
      } else {
        if (!apiKey) {
          setError("请输入 API Key");
          return;
        }

        switch (providerType) {
          case "openai":
            await providerPoolApi.addOpenAIKey(
              apiKey,
              baseUrl.trim() || undefined,
              trimmedName,
            );
            break;
          case "claude":
            await providerPoolApi.addClaudeKey(
              apiKey,
              baseUrl.trim() || undefined,
              trimmedName,
            );
            break;
        }
      }

      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  // Antigravity 特殊渲染
  const renderAntigravityContent = () => (
    <>
      {/* 模式选择 */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setAntigravityMode("login")}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
            antigravityMode === "login"
              ? "border-primary bg-primary/10 text-primary"
              : "hover:bg-muted"
          }`}
        >
          <LogIn className="inline h-4 w-4 mr-1" />
          Google 登录
        </button>
        <button
          type="button"
          onClick={() => setAntigravityMode("file")}
          className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
            antigravityMode === "file"
              ? "border-primary bg-primary/10 text-primary"
              : "hover:bg-muted"
          }`}
        >
          <FolderOpen className="inline h-4 w-4 mr-1" />
          导入文件
        </button>
      </div>

      {antigravityMode === "login" ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              点击下方按钮获取授权
              URL，然后复制到浏览器（支持指纹浏览器）完成登录。
            </p>
            <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
              授权成功后，凭证将自动保存并添加到凭证池。
            </p>
          </div>

          {/* 授权 URL 显示区域 */}
          {antigravityAuthUrl && (
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">授权 URL</span>
                  <button
                    type="button"
                    onClick={handleCopyAuthUrl}
                    className="flex items-center gap-1 rounded px-2 py-1 text-xs hover:bg-muted"
                  >
                    {urlCopied ? (
                      <>
                        <Check className="h-3 w-3 text-green-500" />
                        <span className="text-green-500">已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>复制</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground break-all font-mono">
                  {antigravityAuthUrl.slice(0, 100)}...
                </p>
              </div>

              {waitingForCallback && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950/30">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      请复制上方 URL 到浏览器完成登录，正在等待授权回调...
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* 文件选择 */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              凭证文件路径 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={credsFilePath}
                onChange={(e) => setCredsFilePath(e.target.value)}
                placeholder="选择 accounts.json 或 oauth_creds.json..."
                className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={handleSelectFile}
                className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
              >
                <FolderOpen className="h-4 w-4" />
                浏览
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              支持 antigravity2api-nodejs 的 data/accounts.json 格式
            </p>
          </div>

          {/* Project ID */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Project ID (可选)
            </label>
            <input
              type="text"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              placeholder="Google Cloud Project ID..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>
        </>
      )}
    </>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <h3 className="text-lg font-semibold">
            添加 {providerLabels[providerType]} 凭证
          </h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4">
          {/* Name field */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              名称 (可选)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="给这个凭证起个名字..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>

          {providerType === "antigravity" ? (
            renderAntigravityContent()
          ) : isOAuth ? (
            <>
              {/* Credential File */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  凭证文件路径 <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={credsFilePath}
                    onChange={(e) => setCredsFilePath(e.target.value)}
                    placeholder="输入凭证文件的完整路径..."
                    className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleSelectFile}
                    className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
                  >
                    <FolderOpen className="h-4 w-4" />
                    浏览
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {providerType === "kiro" &&
                    "默认路径: ~/.aws/sso/cache/kiro-auth-token.json"}
                  {providerType === "gemini" &&
                    "默认路径: ~/.gemini/oauth_creds.json"}
                  {providerType === "qwen" &&
                    "默认路径: ~/.qwen/oauth_creds.json"}
                  {providerType === "codex" && "默认路径: ~/.codex/oauth.json"}
                  {providerType === "claude_oauth" &&
                    "默认路径: ~/.claude/oauth.json"}
                  {providerType === "iflow" &&
                    "默认路径: ~/.iflow/oauth_creds.json"}
                </p>
              </div>

              {/* Gemini specific: Project ID */}
              {providerType === "gemini" && (
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Project ID (可选)
                  </label>
                  <input
                    type="text"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="Google Cloud Project ID..."
                    className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              {/* API Key */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  API Key <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full rounded-lg border bg-background pl-10 pr-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Base URL */}
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Base URL (可选)
                </label>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder={
                    providerType === "openai"
                      ? "https://api.openai.com/v1"
                      : "https://api.anthropic.com/v1"
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  留空使用默认 URL，或输入自定义代理地址
                </p>
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-500 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
          >
            取消
          </button>
          {providerType === "antigravity" && antigravityMode === "login" ? (
            // Antigravity 登录模式：显示获取授权 URL 按钮
            !antigravityAuthUrl && (
              <button
                onClick={handleGetAntigravityAuthUrl}
                disabled={loading}
                className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "获取中..." : "获取授权 URL"}
              </button>
            )
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "添加中..." : "添加凭证"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
