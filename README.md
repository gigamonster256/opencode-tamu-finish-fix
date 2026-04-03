# opencode-tamu-finish-fix

> **Note:** This project is not built by the OpenCode team and is not affiliated with them in any way.

Fixes incorrect `finish_reason` values from OpenAI-compatible proxies that return `"stop"` when tool calls are present, causing opencode to exit the agent loop prematurely.

## Requirements

- A patched version of opencode with the `chat.finish` hook. Use [gigamonster256/opencode@finish-hook](https://github.com/gigamonster256/opencode/tree/finish-hook)
- `@opencode-ai/plugin` >= 1.3.10

## Setup

### Install

place the index.ts file in ~/.config/opencode/plugins/
see [my nix config](https://github.com/gigamonster256/nix-config/blob/cced830044a88634a16e7cb72abe6b5ea345c9fa/modules/dev/opencode/opencode.nix) for an example setup applying the patch and setting the plugin up


## How it works

The plugin hooks into `chat.finish` and corrects the finish reason: if tool calls were made but the finish reason is `"stop"`, it changes it to `"tool-calls"` so the agent loop continues.