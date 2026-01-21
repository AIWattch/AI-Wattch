export const LLM_MODELS = [
  {
    modelName: "GPT-5.2",
    detectionName: "5.2,5.2 Thinking,5.2 Instant,5.2 Pro",
    platform: "chatgpt",
    modelId: "gpt-5.2",
  },
  {
    modelName: "GPT-5",
    detectionName: "5,5 Pro,5 Thinking,5 Instant",
    platform: "chatgpt",
    modelId: "gpt-5",
  },
  {
    modelName: "GPT-5.1",
    detectionName: "5.1,5.1 Thinking,5.1 Instant,5.1 Pro",
    platform: "chatgpt",
    modelId: "gpt-5.1",
  },
  {
    modelName: "GPT-4",
    detectionName: "4",
    platform: "chatgpt",
    modelId: "gpt-4",
  },
  {
    modelName: "GPT-4o",
    detectionName: "4o",
    platform: "chatgpt",
    modelId: "gpt-4o",
  },
  {
    modelName: "GPT-4o mini",
    detectionName: "4o mini",
    platform: "chatgpt",
    modelId: "gpt-4o-mini",
  },
  {
    modelName: "GPT-4.1 mini",
    detectionName: "4.1 mini",
    platform: "chatgpt",
    modelId: "gpt-4.1-mini",
  },
  {
    modelName: "GPT-4.1",
    detectionName: "4.1",
    platform: "chatgpt",
    modelId: "gpt-4.1",
  },
  {
    modelName: "Claude Opus 3",
    detectionName: "Opus 3",
    platform: "claude",
    modelId: "claude-opus-3",
  },
  {
    modelName: "Claude Opus 4",
    detectionName: "Opus 4",
    platform: "claude",
    modelId: "claude-opus-4",
  },
  {
    modelName: "Claude Opus 4.1",
    detectionName: "Opus 4.1",
    platform: "claude",
    modelId: "claude-opus-4.1",
  },
  {
    modelName: "Claude-3.5 Haiku",
    detectionName: "Haiku 3.5",
    platform: "claude",
    modelId: "claude-3.5-haiku",
  },
  {
    modelName: "Claude Haiku 4.5",
    detectionName: "Haiku 4.5",
    platform: "claude",
    modelId: "claude-4.5-haiku",
  },
  {
    modelName: "Claude-3.7 Sonnet",
    detectionName: "Sonnet 3.7",
    platform: "claude",
    modelId: "claude-3.7-sonnet",
  },
  {
    modelName: "Claude-4 Sonnet",
    detectionName: "Sonnet 4",
    platform: "claude",
    modelId: "claude-4-sonnet",
  },

  {
    modelName: "Claude-4.5 Sonnet",
    detectionName: "Sonnet 4.5",
    platform: "claude",
    modelId: "claude-4.5-sonnet",
  },
  {
    modelName: "Claude Opus 4.5",
    detectionName: "Opus 4.5",
    platform: "claude",
    modelId: "claude-opus-4.5",
  },
];

export const getDefaultModel = (platform?: "chatgpt" | "claude") => {
  return platform === "chatgpt" ? LLM_MODELS[0] : LLM_MODELS[6];
};

export const getAllModelsByPlatform = (platform: "chatgpt" | "claude") => {
  return LLM_MODELS.filter((model) => model.platform === platform);
};

export const DEFAULT_DETECTION_MODEL = {
  chatgpt: LLM_MODELS[0],
  claude: LLM_MODELS[10],
};

export const DEFAULT_TOKEN_ESTIMATION = {
  factor: 4, // 4 characters per token
  baseTokens: 10, // base tokens per request
};
