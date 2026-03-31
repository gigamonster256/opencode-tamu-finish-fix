import type { Plugin } from "@opencode-ai/plugin";
import type { Model } from "@opencode-ai/sdk";

// extend the plugin hooks to include the "chat.finish" hook with the correct types
declare module "@opencode-ai/plugin" {
  interface Hooks {
    "chat.finish"?: (
      input: {
        sessionID: string;
        messageID: string;
        agent: string;
        model: Model;
        providerID: string;
        finishReason: string | undefined;
        toolCalls: Array<{ id: string; name: string; input: unknown }>;
        usage: {
          promptTokens: number;
          completionTokens: number;
          totalTokens: number;
        };
      },
      output: { reason: string },
    ) => Promise<void>;
  }
}

/**
 * Fixes incorrect finish_reason values from upstream providers.
 *
 * Some OpenAI-compatible proxies return finish_reason: "stop" when tool calls
 * are present, which causes opencode to exit the agent loop prematurely.
 * This plugin ensures that if tool calls were made, the finish reason is
 * set to "tool-calls" so the loop continues.
 */
export const server: Plugin = async () => {
  return {
    "chat.finish": async (input, output) => {
      if (output.reason === "stop" && input.toolCalls.length > 0) {
        output.reason = "tool-calls";
      }
    },
  };
};
