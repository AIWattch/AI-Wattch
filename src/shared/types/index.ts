// Shared types for AI Wattch extension

export interface AIMetrics {
  platform: string;
  tokenCount: number;
  textLength: number;
  timestamp: number;
  model?: string;
  region?: string;
}

export interface ModelInfo {
  modelName: string;
  detectionName: string;
  platform: SupportedPlatform;
  modelId: string;
  // outputTokenPerSecond: number;
  // latency: {
  //   reasoning: number;
  //   nonReasoning: number;
  //   intermediate: number;
  // };
  // totalParameters: number;
  // activeParameters: number;
  // gpuPower: number;
  // gpuMemory: number;
  // installedGPUs: number;
  // GPUUtilzationRate: number;
  // quantization: number;
  autoDetected?: boolean;
}

export interface QueryMetric {
  startTime: number; // Unix timestamp in seconds
  firstTokenTime: number;
  lastTokenTime: number;
  outputTokens: number;
  inputTokens: number;
  inputTextLength: number;
  outputTextLength: number;
  platform: SupportedPlatform;
  modelId?: string;
  calculationMethod?: "token" | "time";
  energyKWh?: number;
  carbonEmissionsKgCO2e?: number;
  waterConsumption?: number;
  lightBulbMinutes?: number;
  smartphoneCharges?: number;
}

export interface QueryMetricResponse {
  energyKWh: number;
  carbonEmissionsKgCO2e: number;
  waterConsumption: number;
  lightBulbMinutes: number;
  smartphoneCharges: number;
}

// Day bucket structure for optimized storage
export interface DayBucket {
  date: string; // YYYY-MM-DD format
  sessions: QueryMetric[];
  lastUpdated: number;
}

// Optimized session data structure using day buckets
export interface SessionData {
  dayBuckets: Record<string, DayBucket>; // Key: YYYY-MM-DD
  currentSession?: {
    chatgpt?: QueryMetric;
    claude?: QueryMetric;
  }; // Latest session for today
  lastUpdated: number;
}

export interface CalculationConfig {
  method: "token" | "time";
  model: string;
  location: string;
}

export interface ImpactMetrics {
  waterConsumption: number; // in liters
  lightBulbMinutes: number; // equivalent minutes
  smartphoneCharges: number; // number of smartphones
}

export interface PlatformConfig {
  name: string;
  domain: string;
  selectors: {
    messages: string;
    input: string;
    response: string;
  };
  tokenEstimation: {
    factor: number; // tokens per character
    baseTokens: number; // base tokens per request
  };
}

export interface Consumption {
  energyKWh: number;
  carbonEmissionsKgCO2e: number;
  metrics: ImpactMetrics;
}

export interface ConsumptionByPlatform {
  chatgptConsumption: Consumption;
  claudeConsumption: Consumption;
  currentConsumption: {
    chatgpt: Consumption;
    claude: Consumption;
  };
}

export interface Location {
  countryName: string;
  countryCode: string | null;
  flagIcon: string | null;
  emissionFactor: number; // kgCO2e per kWh,
  autoDetected?: boolean;
  wueOffsite: number;
}

export interface UserSettings {
  calculationMethod: "token" | "time";
  selectedModel: ModelInfo | null;
  location: Location | null;
  hasSeenWelcome?: boolean;
  allowedToTrack?: boolean;
}

export type SupportedPlatform = "chatgpt" | "claude";

export interface ExtensionMessage {
  type:
    | "AI_METRICS"
    | "GET_SESSION_DATA"
    | "RESET_SESSION"
    | "SESSION_UPDATED"
    | "CONFIG_UPDATE"
    | "TOGGLE_MODAL"
    | "MODEL_CHANGED";
  data?: any;
}

export interface PlatformDetails {
  currentPlatform: SupportedPlatform | null;
  platformName: string;
  currentModel: ModelInfo | null;
  isLoading: boolean;
}
