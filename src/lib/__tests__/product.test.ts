import { describe, expect, it } from "vitest";
import { toProduct } from "../product";

describe("toProduct", () => {
  it("maps known Claude model ids to 'Claude'", () => {
    expect(toProduct("claude-opus-4-7")).toBe("Claude");
    expect(toProduct("claude-sonnet-4-5")).toBe("Claude");
    expect(toProduct("claude-haiku-4-5")).toBe("Claude");
    expect(toProduct("claude-opus-3")).toBe("Claude");
  });

  it("maps known ChatGPT model ids to 'ChatGPT'", () => {
    expect(toProduct("gpt-5")).toBe("ChatGPT");
    expect(toProduct("gpt-4.1")).toBe("ChatGPT");
    expect(toProduct("gpt-5.4")).toBe("ChatGPT");
  });

  it("maps known Gemini model ids to 'Gemini'", () => {
    expect(toProduct("gemini-2.0-flash")).toBe("Gemini");
    expect(toProduct("gemini-3-flash-preview")).toBe("Gemini");
  });

  it("all Claude model versions collapse to 'Claude'", () => {
    const claudeIds = [
      "claude-opus-4-7",
      "claude-opus-4-6",
      "claude-opus-4-5",
      "claude-sonnet-4-5",
      "claude-haiku-4-5",
      "claude-opus-4-1",
      "claude-opus-4-0",
      "claude-sonnet-4-0",
      "claude-opus-3",
    ];
    for (const id of claudeIds) {
      expect(toProduct(id)).toBe("Claude");
    }
  });

  it("passes through unknown model id unchanged", () => {
    expect(toProduct("unknown-model-xyz")).toBe("unknown-model-xyz");
    expect(toProduct("gpt-9-super")).toBe("gpt-9-super");
  });
});
