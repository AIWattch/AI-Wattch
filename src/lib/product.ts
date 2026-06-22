import { LLM_MODELS } from "../constants/modelDefinitions";

const PLATFORM_TO_PRODUCT: Record<string, string> = {
  claude: "Claude",
  chatgpt: "ChatGPT",
  gemini: "Gemini",
};

const MODEL_ID_TO_PRODUCT = new Map<string, string>(
  LLM_MODELS.map((m) => [
    m.modelId,
    PLATFORM_TO_PRODUCT[m.platform] ?? m.platform,
  ])
);

export function toProduct(modelId: string): string {
  return MODEL_ID_TO_PRODUCT.get(modelId) ?? modelId;
}
