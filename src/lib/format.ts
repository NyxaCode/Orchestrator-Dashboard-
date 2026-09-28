export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const sec = (ms / 1000).toFixed(1);
  return `${sec}s`;
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60000) return 'Baru saja';
  const min = Math.floor(diff / 60000);
  if (min < 60) return `${min}m lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}j lalu`;
  return `${Math.floor(hr / 24)}h lalu`;
}

/**
 * Strips provider prefixes like "via 9router · ", "9router / ", etc.
 * Returns only the model identifier, e.g. "claude-3-7-sonnet", "gpt-4o-mini", "deepseek-chat".
 */
export function cleanModelName(modelLabel?: string | null): string {
  if (!modelLabel) return 'claude-3-7-sonnet';
  return modelLabel
    .replace(/^via\s+9router\s*[·/]\s*/i, '')
    .replace(/^9router\s*[·/]\s*/i, '')
    .replace(/^via\s+/i, '')
    .trim();
}

