# opencode-tamu-finish-fix

An opencode plugin that fixes incorrect `finish_reason` values from OpenAI-compatible proxies.

## Problem

Some OpenAI-compatible proxies (like Texas A&M chat) return `finish_reason: "stop"` when the model makes tool calls, instead of the correct `finish_reason: "tool_calls"`. This causes opencode to exit the agent loop prematurely after the first tool call, requiring manual prompts to continue.

## Solution

This plugin hooks into opencode's `chat.finish` event and corrects the finish reason: if tool calls were made but the finish reason is `"stop"`, it changes it to `"tool-calls"` so the agent loop continues autonomously.

## Requirements

- A patched version of opencode that includes the `chat.finish` hook (see `opencode-chat-finish-hook.patch`)
- `@opencode-ai/plugin` >= 1.3.10

> **Note:** The `chat.finish` hook is not part of the upstream opencode plugin API yet. You must apply the included patch to the opencode source and build it before using this plugin.

## Setup

### 1. Patch opencode

Apply `opencode-chat-finish-hook.patch` to the opencode repository and rebuild:

```bash
cd /path/to/opencode
git apply /path/to/opencode-chat-finish-fix/opencode-chat-finish-hook.patch
# rebuild opencode
```

### 2. Install the plugin

#### Local

Clone this repo and build:

```bash
git clone <this-repo>
cd opencode-tamu-finish-fix
npm install
npm run build
```

Then add to your `opencode.json`:

```json
{
  "plugin": ["<path-to-this-directory>"]
}
```

#### npm

```bash
npm install opencode-tamu-finish-fix
```

Then add to your `opencode.json`:

```json
{
  "plugin": ["opencode-tamu-finish-fix"]
}
```

## How it works

The plugin registers a `chat.finish` hook that runs every time the LLM step finishes. It checks:

1. Was the finish reason `"stop"`?
2. Were any tool calls made during this step?

If both are true, it overrides the finish reason to `"tool-calls"`, telling opencode to continue the agent loop and feed tool results back to the model.

## Development

```bash
npm install
npm run typecheck  # type check
npm run build      # compile to dist/
```

## Plugin API

This plugin uses the `chat.finish` hook (added by the included patch):

```typescript
"chat.finish"?: (
  input: {
    sessionID: string
    messageID: string
    agent: string
    model: Model
    providerID: string
    finishReason: string | undefined
    toolCalls: Array<{ id: string; name: string; input: unknown }>
    usage: {
      promptTokens: number
      completionTokens: number
      totalTokens: number
    }
  },
  output: { reason: string },
) => Promise<void>
```

The `output.reason` field is mutable — plugins can override it to change how opencode handles the step completion.
