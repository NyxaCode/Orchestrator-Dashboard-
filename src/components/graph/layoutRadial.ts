export interface Point {
  x: number;
  y: number;
}

export interface RadialLayoutResult {
  orchestrator: Point;
  agents: Point[];
}

/**
 * Calculates radial positions for Orchestrator at center and N agents in concentric rings.
 * Ring 1 (up to 8 agents): R1 = 260px
 * Ring 2 (agents 9-16): R2 = 440px
 * Ring 3 (agents 17-24): R3 = 620px
 * 
 * Ensures distance between any two nodes >= 140px for n = 1..24.
 */
export function layoutRadial(
  n: number,
  centerX: number = 400,
  centerY: number = 320
): RadialLayoutResult {
  const orchestrator: Point = { x: centerX, y: centerY };
  if (n <= 0) {
    return { orchestrator, agents: [] };
  }

  const agents: Point[] = [];

  // If n <= 4, spread nicely along an arc above and around the orchestrator (-140° to -40°)
  if (n <= 4) {
    const R1 = 260;
    const startAngle = -145 * (Math.PI / 180);
    const endAngle = -35 * (Math.PI / 180);
    const angleStep = n === 1 ? 0 : (endAngle - startAngle) / (n - 1);

    for (let i = 0; i < n; i++) {
      const angle = n === 1 ? -90 * (Math.PI / 180) : startAngle + i * angleStep;
      agents.push({
        x: Math.round(centerX + R1 * Math.cos(angle)),
        y: Math.round(centerY + R1 * Math.sin(angle)),
      });
    }
    return { orchestrator, agents };
  }

  // Multi-ring distribution:
  // Ring 1 holds up to 8 agents
  // Ring 2 holds up to 8 agents (9-16)
  // Ring 3 holds remaining up to 24
  const rings: number[][] = [];
  let remaining = n;
  let agentIndex = 0;

  // Ring 1
  const countR1 = Math.min(8, remaining);
  const ring1Indices: number[] = [];
  for (let i = 0; i < countR1; i++) ring1Indices.push(agentIndex++);
  rings.push(ring1Indices);
  remaining -= countR1;

  // Ring 2
  if (remaining > 0) {
    const countR2 = Math.min(8, remaining);
    const ring2Indices: number[] = [];
    for (let i = 0; i < countR2; i++) ring2Indices.push(agentIndex++);
    rings.push(ring2Indices);
    remaining -= countR2;
  }

  // Ring 3
  if (remaining > 0) {
    const ring3Indices: number[] = [];
    for (let i = 0; i < remaining; i++) ring3Indices.push(agentIndex++);
    rings.push(ring3Indices);
  }

  const ringRadii = [260, 440, 620];

  rings.forEach((ring, ringIdx) => {
    const count = ring.length;
    const radius = ringRadii[ringIdx] || 260 + ringIdx * 180;
    // Offset each ring slightly so rays don't overlap directly
    const baseAngleDeg = -90 + (ringIdx % 2 === 1 ? 22.5 : 0);
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
