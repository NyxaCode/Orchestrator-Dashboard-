export interface Point {
  x: number;
  y: number;
}

export interface RadialLayoutResult {
  orchestrator: Point;
  agents: Point[];
}

export interface AgentLayoutInput {
  id: string;
  role: 'orchestrator' | 'agent';
  layer?: number;
  parent_id?: string | null;
}

/**
 * Calculates clean, balanced, hierarchical-radial positions for agents.
 * The Orchestrator sits at the center, with Layer 1 agents flanking symmetrically,
 * and Layer 2 agents structured cleanly in an upper arc above their respective parents.
 */
export function layoutRadial(
  n: number,
  centerX: number = 450,
  centerY: number = 300
): RadialLayoutResult {
  const orchestrator: Point = { x: centerX, y: centerY };
  if (n <= 0) {
    return { orchestrator, agents: [] };
  }

  const agents: Point[] = [];

  // When standard 6 sub-agents are present (Rika, Lia, Momo, Cody, Aria, Sonix):
  if (n === 6) {
    // Symmetrical hierarchical layout
    return {
      orchestrator,
      agents: [
        { x: centerX - 210, y: centerY - 85 }, // Rika (L1 Left)
        { x: centerX + 210, y: centerY - 85 }, // Lia (L1 Right)
        { x: centerX - 330, y: centerY - 215 }, // Momo (L2 Left-outer)
        { x: centerX - 165, y: centerY - 225 }, // Cody (L2 Left-inner)
        { x: centerX + 165, y: centerY - 225 }, // Aria (L2 Right-inner)
        { x: centerX + 330, y: centerY - 215 }, // Sonix (L2 Right-outer)
      ],
    };
  }

  // If 1 to 4 agents, spread in a clean upward arc around Orchestrator
  if (n <= 4) {
    const radius = 220;
    const startAngle = -150 * (Math.PI / 180);
    const endAngle = -30 * (Math.PI / 180);
    const angleStep = n === 1 ? 0 : (endAngle - startAngle) / (n - 1);

    for (let i = 0; i < n; i++) {
      const angle = n === 1 ? -90 * (Math.PI / 180) : startAngle + i * angleStep;
      agents.push({
        x: Math.round(centerX + radius * Math.cos(angle)),
        y: Math.round(centerY + radius * Math.sin(angle)),
      });
    }
    return { orchestrator, agents };
  }

  // Multi-tier radial distribution for arbitrary N
  const rings: number[][] = [];
  let remaining = n;
  let agentIndex = 0;

  // Ring 1 (up to 6 agents)
  const countR1 = Math.min(6, remaining);
  const ring1: number[] = [];
  for (let i = 0; i < countR1; i++) ring1.push(agentIndex++);
  rings.push(ring1);
  remaining -= countR1;

  // Ring 2 (up to 10 agents)
  if (remaining > 0) {
    const countR2 = Math.min(10, remaining);
    const ring2: number[] = [];
    for (let i = 0; i < countR2; i++) ring2.push(agentIndex++);
    rings.push(ring2);
    remaining -= countR2;
  }

  // Ring 3 (remaining)
  if (remaining > 0) {
    const ring3: number[] = [];
    for (let i = 0; i < remaining; i++) ring3.push(agentIndex++);
    rings.push(ring3);
  }

  const ringRadii = [210, 360, 520];

  rings.forEach((ring, ringIdx) => {
    const count = ring.length;
    const radius = ringRadii[ringIdx] || 210 + ringIdx * 150;
    // Upper-biased radial layout so nodes stay above and around orchestrator
    const baseAngleDeg = -90 + (ringIdx % 2 === 1 ? 25 : 0);
    const baseAngle = baseAngleDeg * (Math.PI / 180);
    const angleStep = (2 * Math.PI) / count;

    ring.forEach((_, idx) => {
      const angle = baseAngle + idx * angleStep;
      agents.push({
        x: Math.round(centerX + radius * Math.cos(angle)),
        y: Math.round(centerY + radius * Math.sin(angle)),
      });
    });
  });

  return { orchestrator, agents };
}

/**
 * Calculates Euclidean distance between two points
 */
export function calculateDistance(p1: Point, p2: Point): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}
