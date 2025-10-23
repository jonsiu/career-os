/**
 * AI Model Constants
 *
 * Centralized location for AI model identifiers to make updates easier
 */

// Anthropic Claude Models
export const CLAUDE_MODELS = {
  // Latest Sonnet model (as of January 2025)
  SONNET: 'claude-3-5-sonnet-20250122',

  // Haiku for faster, lighter tasks
  HAIKU: 'claude-3-5-haiku-20241022',

  // Opus for most capable tasks (when needed)
  OPUS: 'claude-3-opus-20240229',
} as const;

// Default model for most operations
export const DEFAULT_CLAUDE_MODEL = CLAUDE_MODELS.SONNET;

// Model for resume parsing (Convex)
export const RESUME_PARSE_MODEL = CLAUDE_MODELS.SONNET;
