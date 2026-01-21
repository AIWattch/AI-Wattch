# Contributing to AI Wattch

Thank you for your interest in contributing! We aim to keep the process as simple, transparent, and collaborative as possible.

## ⚖️ Contributing & Governance

We welcome contributions. Please follow these steps:

1.  **Fork the repo**.
2.  **Create a branch**: `feature/<short-description>`.
3.  **Commit with a clear message** and open a PR.
4.  **Add tests and update docs**.
5.  **One feature per PR**; link relevant issue.

### Pre-PR Discussion

For major architectural or methodology changes, **open an issue first** to discuss design and data assumptions.

- **Methodology is research-sensitive**: Maintain transparency in how variables are chosen.
- **Cite sources**: Include citations and data sources in your PR descriptions.

### Docs to Add/Maintain

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) (detailed)
- [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md)
- [`SECURITY.md`](./SECURITY.md) (vulnerability reporting)

## 🚀 Development Workflow

### 1. Fork & Clone

```bash
git clone https://github.com/AIWattch/AI-Wattch.git
cd ai-wattch-ext
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Development Build

To start the development server with Hot Module Replacement (HMR):

```bash
npm run dev
```

### 4. Production Build

To build the extension for both Chrome and Firefox:

```bash
npm run build:extension
```

This script will:

- Clean previous builds
- Build for Firefox (output in `build-firefox`)
- Build for Chrome (output in `build-chrome`)
- Create ZIP packages for distribution

### 5. Load Extension

**Chrome:**

1. Open `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist` folder (for dev) or `build-chrome` folder (for production build)

**Firefox:**

1. Open `about:debugging`
2. Click **This Firefox**
3. Click **Load Temporary Add-on**
4. Select the `manifest.json` file from the `dist` or `build-firefox` folder

## 🧩 Project Structure

```
/src
  /assets       # Static assets (images, fonts)
  /background   # Background service workers
  /constants    # Global constants and configuration
  /content      # Content scripts injected into pages
  /core         # Core logic (emissions calculation, etc.)
  /icons        # Icon assets
  /modules      # Feature modules
  /shared       # Shared utilities and components
  /types        # TypeScript type definitions
  /utils        # General utility functions
```

## 🧑‍💻 Code Style & Standards

To maintain a consistent and clean codebase:

- **TypeScript**: Use TypeScript for all new code.
- **Functions**: Keep functions small, predictable, and pure where possible.
- **Comments**: Add comments for complex or non-obvious logic.
- **Utilities**: Reuse existing utilities in `src/shared` or `src/utils` — avoid duplication.
- **Modern Syntax**: Prefer ES modules and modern syntax.

## 🔧 Pull Request Process

1. **Keep PRs small**: Small, focused PRs are reviewed & merged faster.
2. **Follow Conventional Commits**:
   - `feat(ui): add new emissions widget`
   - `fix(api): correct model detection`
   - `chore(build): update Vite config`
3. **Update Documentation**: Update README or comments if you change user-facing features or complex logic.
4. **Verify**: Ensure the extension builds and loads correctly in the browser.

## 🐞 Reporting Bugs

When filing an issue, please include:

- Browser version (Chrome, Edge, Firefox, etc.)
- Extension version
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots / logs (if applicable)

## ✨ Requesting New Features

Before submitting a feature request:

1. Check if the feature already exists or is open as an issue.
2. Clearly describe the use case and value.

## 💬 Questions? Need Help?

Open a GitHub Issue or Discussions thread. Maintainers are happy to help!
