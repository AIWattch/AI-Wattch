/**
 * Estimation utilities for AI Wattch
 */

import { DEFAULT_TOKEN_ESTIMATION } from "../../constants";

export const estimateTokens = (value: string) => {
  if (value.length === 0) return DEFAULT_TOKEN_ESTIMATION.baseTokens;
  const tokens = Math.ceil(value.length / DEFAULT_TOKEN_ESTIMATION.factor);
  if (tokens < DEFAULT_TOKEN_ESTIMATION.baseTokens)
    return DEFAULT_TOKEN_ESTIMATION.baseTokens;
  return tokens;
};
