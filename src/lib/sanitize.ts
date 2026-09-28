/**
 * Sanitizes raw HTML and parses lightweight markdown safely.
 * Strips script tags, HTML tags, and on* attributes.
 */
export function sanitizeText(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export interface MarkdownBlock {
  type: 'paragraph' | 'code-block' | 'list' | 'system-line';
  content: string;
  items?: string[];
  language?: string;
}

export function parseMarkdown(text: string): MarkdownBlock[] {
  if (!text) return [];

  const lines = text.split('\n');
  const blocks: MarkdownBlock[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';
  let listBuffer: string[] = [];

  const flushList = () => {
    if (listBuffer.length > 0) {
      blocks.push({
        type: 'list',
        content: '',
        items: [...listBuffer],
      });
      listBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check code fence
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({
          type: 'code-block',
          content: codeBuffer.join('\n'),
          language: codeLang || 'text',
        });
        codeBuffer = [];
        codeLang = '';
        inCodeBlock = false;
      } else {
        flushList();
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // List item (e.g. - item or * item)
    const listMatch = line.match(/^(\s*[-*]\s+)(.*)$/);
    if (listMatch) {
      listBuffer.push(listMatch[2]);
      continue;
    } else {
      flushList();
    }

    // Normal line or empty line
    if (line.trim().length > 0) {
      blocks.push({
        type: 'paragraph',
        content: line,
      });
    }
  }

  flushList();

  if (inCodeBlock && codeBuffer.length > 0) {
    blocks.push({
      type: 'code-block',
      content: codeBuffer.join('\n'),
      language: codeLang || 'text',
    });
  }

  return blocks;
}

/**
 * Render inline markdown elements like **bold** and `code`
 */
export function formatInlineMarkdown(text: string): string {
  // First escape
  let safe = sanitizeText(text);

  // Replace `code`
  safe = safe.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-white/10 text-red-300 font-mono text-xs">$1</code>');

  // Replace **bold**
  safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');

  // Replace *italic*
  safe = safe.replace(/\*([^*]+)\*/g, '<em class="italic text-gray-300">$1</em>');

  return safe;
}

/**
 * Extracts all @mentions from anywhere in text, e.g. "@rika dan @lia tolong analisis"
 */
export function extractAllMentions(
  text: string,
  agents: Record<string, { id: string; name: string }> | Array<{ id: string; name: string }>
): Array<{ id: string; name: string }> {
  if (!text) return [];
  const agentList = Array.isArray(agents) ? agents : Object.values(agents);
  const mentionMatches = text.match(/@([a-zA-Z0-9_-]+)/g);
  if (!mentionMatches) return [];

  const matched: Array<{ id: string; name: string }> = [];
  const seen = new Set<string>();

  for (const m of mentionMatches) {
    const raw = m.slice(1).toLowerCase();
    const found = agentList.find(
      (a) => a.id.toLowerCase() === raw || a.name.toLowerCase() === raw
    );
    if (found && !seen.has(found.id)) {
      seen.add(found.id);
      matched.push(found);
    }
  }

  return matched;
}

/**
 * Extracts @mentions from text, e.g. "@rika tolong cek database"
 */
export function extractMention(text: string, validAgentIds: string[]): { targetAgentId: string | null; cleanContent: string } {
  const match = text.match(/^@([a-zA-Z0-9_-]+)\s*(.*)$/);
  if (match) {
    const mentionId = match[1].toLowerCase();
    if (validAgentIds.includes(mentionId)) {
      return {
        targetAgentId: mentionId,
        cleanContent: match[2].trim() || text,
      };
    }
  }
  return {
    targetAgentId: null,
    cleanContent: text,
  };
}
