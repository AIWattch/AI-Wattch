# Security Policy

## Data Collection

AI Wattch is built with a **privacy-first** approach. The extension:

- **Only stores configuration settings.**
- **Does not store conversation content** or chat history.
- **Does not track user behavior** across websites.

## Data Storage

Settings are stored locally using `chrome.storage.local`. Only configuration and preference values are saved:

- Token energy factors and characters-per-token ratio.
- PUE (Power Usage Effectiveness) values.
- Grid emissions factors (IP-based region detection is optional).
- UI preferences (e.g., overlay position, theme).
- **No conversation data is ever persisted to storage.**

## Logging

### Development Logs

- Console logs are primarily for development and debugging.
- No sensitive user data is ever logged.
- Logs are not persisted or sent to any external server.

### Log Management

- Logs exist only within the browser's console.
- Logs are cleared when the browser or tab is closed.
- There is **no automatic log collection** or external transmission.

## For Developers

### Accessing Logs

Developers can view logs through the **Chrome DevTools Console** or by enabling the extension's debug mode.

### Extension Permissions

The extension requests the minimum permissions required to function:

- `storage`: For saving user preferences and configuration.
- `host_permissions`: Limited to supported AI platforms (e.g., `chat.openai.com`, `chatgpt.com`, `claude.ai`).

## Reporting a Security Vulnerability

If you discover a security vulnerability within this project, please report it responsibly:

1. **Email:** [security@itclimateed.com](mailto:security@itclimateed.com) and [contact@antarcticaglobal.com](mailto:contact@antarcticaglobal.com)
2. **Include:**
   - A detailed description of the issue.
   - Steps to reproduce the vulnerability.
   - The potential impact of the issue.

We aim to acknowledge receipt of your report within **48 hours**.

## Version Information

- **Current Version:** 1.0.11 (MV3)
- **Supported Platforms:** ChatGPT (Free/Plus), Claude.ai
- **Last Security Review:** Jan 2026
