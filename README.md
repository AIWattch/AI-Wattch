# AI Wattch - Track Your AI Footprint

Discover how your AI usage impacts the planet. Measure, compare, and optimize your AI footprint in real time.

### Available on:

1. [**Chrome Web Store**](https://chromewebstore.google.com/detail/ai-wattch-track-your-ai-f/dicpbfeifndejijbnhenndlnbnglkgcl)
2. [**Firefox Store**](https://addons.mozilla.org/en-US/firefox/addon/aiwattch/?utm_source=addons.mozilla.org&utm_medium=referral&utm_content=search)

## Project Summary

[AI Wattch](https://antarctica.io/ai-wattch) is an open-source browser extension powered by[Antarctica’s One Token Model (OTM)](https://antarctica.io/research/one-token-model) that estimates the energy use and carbon footprint of end-user interactions with LLM-powered chat interfaces such as ChatGPT and Claude. It combines token-based and time-based estimation, regional infrastructure mapping, and model-specific parameters to deliver transparent, science-backed emissions reporting per session.

## Why AI Wattch

- **Transparency:** Makes invisible energy costs visible - per session, per token, per model.
- **Efficiency:** Helps people prompt more efficiently and choose more efficient models.
- **Privacy:** Prioritizes privacy; no chat text leaves the browser.
- **Scalability:** Built for extensibility: multi-model, multi-region, multi-browser roadmap.

## How it works (high level)

1. The extension parses the page DOM for supported chat UIs (ChatGPT, Claude).
2. It captures lightweight telemetry (timestamps, token counts, model selection) - never full chat text.
3. Two estimation approaches run (token-based & time-based). Both can be combined into a hybrid estimate.
4. Regional factors (PUE, grid carbon intensity) and model-specific hardware stats (TDP, quantization) convert energy → emissions.
5. The UI surfaces real-time metrics, session summaries, model comparisons, and prompt-efficiency tips.

## Supported Models & Platforms

Initially supported (V1.5 / V2.0 planned mapping):

- **ChatGPT model family** (manual selection for ChatGPT Pro/Plus; automatic detection for free-tier where possible)
- **Claude family** (automatic detection via DOM parsing)
- **Planned:** Gemini, other LLMs (modular architecture supports adding new detectors)

## Browsers

- **Chrome (MV3)** - current release
- **Firefox** - current release

## Methodologies (overview)

AI Wattch runs two complementary estimators and a hybrid orchestration:

### I. Token-based estimator (DOM-derived token proxy)

- Counts characters/tokens from DOM, converts to tokens (default 4 chars/token, configurable 3–5).
- Uses token energy factors (input/output) and infrastructure multipliers (PUE, grid intensity) to compute energy and emissions.

### II. Time-based estimator (timestamp-derived compute duration)

- Uses timestamps T1 (request), T2 (first token), T3 (last token) to derive computation time.
- Maps computation time to GPU power, utilization, server baseline, and PUE → energy → emissions.

### III. Hybrid & model-aware approach (Antarctica enhancements)

- Uses model-specific metadata (total/active params, quantization, estimated active GPUs, GPU TDP & memory, token generation rate) to refine active GPU count and per-token energy.
- Dynamically applies regional PUE and carbon intensity based on IP region or manual selection.
- Handles edge cases (summarization, streaming vs. batch, cached responses fallback logic).

---

## Install / Build / Run (developer)

### Prerequisites

- Node.js (LTS recommended)
- npm or yarn
- Chrome (for load-unpacked development)

### Clone & Install

```bash
git clone https://github.com/AIWattch/AI-Wattch.git
cd ai-wattch-ext
npm install
```

### Development Build (watch)

```bash
npm run dev
```

Load `dist/` via `chrome://extensions` → Developer mode → Load unpacked → select `browser-extension/dist`.

### Production Build

```bash
npm run build:extension
```

Artifact appears in `dist/`. Use packaged release workflow for Chrome Web Store.

### Release

1. Create a release branch `release/vX.Y.Z`
2. Update `CHANGELOG.md` and `package.json` version
3. `npm run build:extension` → create zip → upload to GitHub Release and Chrome Web Store.

---

## Development Workflow & Recommended Practices

- **Language:** TypeScript (strict mode)
- **Linting:** ESLint + Prettier (pre-commit hook)
- **Commit style:** Conventional commits (feat/fix/chore/docs)
- **Branching:** feature branches, one feature per PR
- **PR checklist (required):** build passes, tests pass, docs updated, minimal surface area

## Testing

**Unit tests:** Vitest
**Run tests:**

```bash
npm test
```

### Tests cover:

- Token counting & character → token mapping
- Timestamp-based computation logic
- Basic model-detection flows (mock DOM)
- Regional lookup fallbacks

### Integration & Scenario Tests (recommended):

End-to-end simulation with recorded DOM payloads (place in `tests/fixtures/`)

## Contributing & Governance

We welcome contributions. Please follow these steps:

1. Fork the repo.
2. Create branch `feature/<short-description>`.
3. Commit with a clear message; open a PR.
4. Add tests and update docs.
5. One feature per PR; link relevant issue.

**Pre-PR:** For major architectural or methodology changes, open an issue to discuss design and data assumptions (methodology is research-sensitive). Maintain transparency in how variables are chosen and cite sources in PR descriptions.

### Docs to Add/Maintain

- [**CONTRIBUTING.md**](./CONTRIBUTING.md) (detailed)
- [**CODE_OF_CONDUCT.md**](./CODE_OF_CONDUCT.md)
- [**SECURITY.md**](./SECURITY.md) (vulnerability reporting)

## Privacy & Security

- AI Wattch does not send chat contents off-device.
- The extension collects minimal telemetry (token counts, timestamps, model id) used only for computation.
- IP-based region detection is optional - users can manually set the region (privacy-first).
- For any detected security/privacy issue: follow [**SECURITY.md**](./SECURITY.md) and do not open a public issue; contact maintainers.

## Short Glossary & Variable Origin

- **EcoLogits:** baseline token energy literature.
- **Artificial Analysis:** latency & generation rate estimates.
- **ArXiv:** academic sources used for deriving token → latency relations and GPU utilization assumptions.
- **Quantization Q:** bytes per parameter mapping (INT4=0.5, INT8=1, FP16=2, FP32=4). Overhead factor ~1.2 applied.

## Detection & Model Identification (implementation notes)

- **Claude:** DOM parsing available - use robust selectors and feature flags; test extensively against different Claude UIs.
- **ChatGPT:** free-tier detection possible via DOM; paid tiers restrict automatic detection - provide a manual model dropdown and clear UX to set model if detection fails.
- **Fallbacks:** assume global average PUE & carbon intensity if location/model cannot be resolved.

## Example Test Cases (to include under tests/fixtures)

- **Short QA exchange (50 tokens output):** verify token and time estimators align within tolerance.
- **Long summarization (15,000-word doc):** ensure chunking recommendation triggers and energy spike is reported.
- **Rapid retries (3 prompts within 3 minutes):** ensure repetitive/iterative category detection and nudge.

## License & Credits

- **License:** MIT (see [**LICENSE**](./LICENSE) file).
- Built by **Antarctica** & **IT Climate Ed** with contributions from the open-source community. See [**AUTHORS.md**](./AUTHORS.md).
