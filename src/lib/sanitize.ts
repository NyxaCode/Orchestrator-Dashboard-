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
  type: 'paragraph' | 'code-block' | 'list' | 'table' | 'system-line';
  content: string;
  items?: string[];
  tableHeaders?: string[];
  tableRows?: string[][];
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
  let tableBuffer: string[] = [];

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

  const flushTable = () => {
    if (tableBuffer.length >= 2) {
      // First row is headers
      const rawHeader = tableBuffer[0];
      const headers = rawHeader
        .split('|')
        .map((c) => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);

      // Remaining rows (skipping delimiter row :--- | :---)
      const rows: string[][] = [];
      for (let r = 1; r < tableBuffer.length; r++) {
        const rowLine = tableBuffer[r];
        if (rowLine.includes('---')) continue; // divider row
        const cells = rowLine
          .split('|')
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
        if (cells.length > 0) {
          rows.push(cells);
        }
      }

      blocks.push({
        type: 'table',
        content: '',
        tableHeaders: headers,
        tableRows: rows,
      });
      tableBuffer = [];
    } else if (tableBuffer.length > 0) {
      tableBuffer.forEach((line) => {
        blocks.push({ type: 'paragraph', content: line });
      });
      tableBuffer = [];
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
        flushTable();
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Table line detection (e.g. | col1 | col2 |)
    const trimmed = line.trim();
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2) {
      flushList();
      tableBuffer.push(trimmed);
      continue;
    } else {
      flushTable();
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
  flushTable();

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
