import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCollide,
  forceCenter,
  Simulation,
  SimulationNodeDatum,
  SimulationLinkDatum,
} from 'd3-force';
import { AgentDTO } from '../../lib/schemas';

export interface ForceNode extends SimulationNodeDatum {
  id: string;
  name: string;
  role: 'orchestrator' | 'agent';
  layer: number;
  color?: string;
  radius: number;
}

export interface ForceLink extends SimulationLinkDatum<ForceNode> {
  id: string;
  source: string | ForceNode;
  target: string | ForceNode;
  isSecondary: boolean;
}

export interface ForceGraphSettings {
  centerForce: number;      // 0.02 - 0.20 (default: 0.04)
  repelForce: number;       // -300 to -1200 (default: -480)
  linkDistance: number;     // 120 - 280 (default: 175)
  linkForce: number;        // default: 0.65
  collisionPadding: number; // default: 28
  livePhysics: boolean;
}

export const DEFAULT_FORCE_SETTINGS: ForceGraphSettings = {
  centerForce: 0.04,
  repelForce: -480,
  linkDistance: 175,
  linkForce: 0.65,
  collisionPadding: 28,
  livePhysics: true,
};

export class ObsidianForceSimulation {
  private simulation: Simulation<ForceNode, ForceLink> | null = null;
  private nodes: ForceNode[] = [];
  private links: ForceLink[] = [];
  private onTickCallback: ((nodes: ForceNode[]) => void) | null = null;
  private onEndCallback: ((nodes: ForceNode[]) => void) | null = null;
  private settings: ForceGraphSettings = { ...DEFAULT_FORCE_SETTINGS };
  private centerX = 400;
  private centerY = 300;
  private animFrameId: number | null = null;
  private activeDraggingId: string | null = null;

  constructor(settings?: Partial<ForceGraphSettings>) {
    if (settings) {
      this.settings = { ...DEFAULT_FORCE_SETTINGS, ...settings };
    }
  }

  public getActiveDraggingId(): string | null {
    return this.activeDraggingId;
  }

  public setCenter(x: number, y: number) {
    if (isFinite(x) && isFinite(y)) {
      this.centerX = x;
      this.centerY = y;
      if (this.simulation) {
        const center = this.simulation.force('center') as any;
        if (center) {
          center.x(x).y(y);
        }
      }
    }
  }

  public updateSettings(newSettings: Partial<ForceGraphSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (!this.simulation) return;

    const center = this.simulation.force('center') as any;
    if (center) {
      center.strength(this.settings.centerForce);
    }

    const charge = this.simulation.force('charge') as any;
    if (charge) {
      charge.strength((d: ForceNode) =>
        d.role === 'orchestrator' ? this.settings.repelForce * 1.5 : this.settings.repelForce
      );
    }

    const link = this.simulation.force('link') as any;
    if (link) {
      link.strength((l: ForceLink) =>
        l.isSecondary ? this.settings.linkForce * 0.4 : this.settings.linkForce
      );
      link.distance((l: ForceLink) =>
        l.isSecondary ? this.settings.linkDistance * 1.3 : this.settings.linkDistance
      );
    }

    this.reheat(0.3);
  }

  public init(
    agents: AgentDTO[],
    links: Array<{ id: string; source: string; target: string; isSecondary: boolean }>,
    onTick: (nodes: ForceNode[]) => void,
    onEnd?: (nodes: ForceNode[]) => void,
    autoStart = false
  ) {
    this.stop();
    this.onTickCallback = onTick;
    this.onEndCallback = onEnd || null;

    // Convert agents to simulation nodes with validated coordinates
    this.nodes = agents.map((a) => {
      const existing = this.nodes.find((n) => n.id === a.id);
      const isOrchestrator = a.role === 'orchestrator';
      const initialX = isFinite(existing?.x as number)
        ? (existing!.x as number)
        : isFinite(a.pos_x as number)
        ? (a.pos_x as number)
        : this.centerX;
      const initialY = isFinite(existing?.y as number)
        ? (existing!.y as number)
        : isFinite(a.pos_y as number)
        ? (a.pos_y as number)
        : this.centerY;

      return {
        id: a.id,
        name: a.name,
        role: a.role,
        layer: a.layer ?? (isOrchestrator ? 0 : 1),
        color: a.color,
        radius: isOrchestrator ? 36 : 32,
        x: initialX,
        y: initialY,
        vx: 0,
        vy: 0,
        fx: isOrchestrator ? initialX : undefined,
        fy: isOrchestrator ? initialY : undefined,
      };
    });

    this.links = links.map((l) => ({
      id: l.id,
      source: l.source,
      target: l.target,
      isSecondary: l.isSecondary,
    }));

    // Obsidian Physics Engine:
    // 1. Center Gravity keeps the star clustered without drifting away
    // 2. Many-Body Coulomb Repulsion pushes nodes apart
    // 3. Hooke's Elastic Spring Force holds the star constellation together
    // 4. Elastic collision prevention prevents node overlap
    // 5. Velocity Decay (0.42) produces bouncy, organic spring follow
    this.simulation = forceSimulation<ForceNode, ForceLink>(this.nodes)
      .force('center', forceCenter(this.centerX, this.centerY).strength(this.settings.centerForce))
      .force(
        'charge',
        forceManyBody<ForceNode>()
          .strength((d) =>
            d.role === 'orchestrator' ? this.settings.repelForce * 1.5 : this.settings.repelForce
          )
          .distanceMax(800)
      )
      .force(
        'link',
        forceLink<ForceNode, ForceLink>(this.links)
          .id((d) => d.id)
          .distance((l) =>
            l.isSecondary ? this.settings.linkDistance * 1.3 : this.settings.linkDistance
          )
          .strength((l) =>
            l.isSecondary ? this.settings.linkForce * 0.4 : this.settings.linkForce
          )
      )
      .force(
        'collide',
        forceCollide<ForceNode>()
          .radius((d) => d.radius + this.settings.collisionPadding)
          .iterations(1)
      )
      .velocityDecay(0.42)
      .alphaDecay(0.05)
      .alphaMin(0.005);

    this.setupListeners();

    if (!autoStart) {
      // Don't auto-run continuously on initial load, nodes are neatly initialized
      this.simulation.stop();
    }
  }

  private setupListeners() {
    if (!this.simulation) return;

    this.simulation.on('tick', () => {
      if (!this.onTickCallback) return;
      if (this.animFrameId !== null) return;

      this.animFrameId = requestAnimationFrame(() => {
        this.animFrameId = null;
        if (this.onTickCallback) {
          const safeNodes = this.nodes.filter(
            (n) => isFinite(n.x as number) && isFinite(n.y as number)
          );
          this.onTickCallback(safeNodes);
        }
      });
    });

    this.simulation.on('end', () => {
      if (this.animFrameId !== null) {
        cancelAnimationFrame(this.animFrameId);
        this.animFrameId = null;
      }
      if (this.onEndCallback) {
        const safeNodes = this.nodes.filter(
          (n) => isFinite(n.x as number) && isFinite(n.y as number)
        );
        this.onEndCallback(safeNodes);
      }
    });
  }

  public reheat(alpha = 0.3) {
    if (this.simulation) {
      this.setupListeners();
      this.simulation.alpha(alpha).restart();
    }
  }

  public onDragStart(nodeId: string, x: number, y: number) {
    this.activeDraggingId = nodeId;
    const node = this.nodes.find((n) => n.id === nodeId);
    if (node && isFinite(x) && isFinite(y)) {
      node.fx = x;
      node.fy = y;
    }
    // Reheat simulation actively during drag so springs pull neighboring nodes
    if (this.simulation) {
      this.setupListeners();
      this.simulation.alphaTarget(0.3).restart();
    }
  }

  public onDrag(nodeId: string, x: number, y: number) {
    if (!isFinite(x) || !isFinite(y)) return;
    const node = this.nodes.find((n) => n.id === nodeId);
    if (node) {
      node.fx = x;
      node.fy = y;
      node.x = x;
      node.y = y;
    }
    // Maintain active physics energy while moving
    if (this.simulation && this.simulation.alpha() < 0.25) {
      this.simulation.alphaTarget(0.3).restart();
    }
  }

  public onDragEnd(nodeId: string, finalX: number, finalY: number) {
    this.activeDraggingId = null;
    const node = this.nodes.find((n) => n.id === nodeId);
    if (node) {
      if (node.role === 'orchestrator') {
        node.fx = isFinite(finalX) ? finalX : this.centerX;
        node.fy = isFinite(finalY) ? finalY : this.centerY;
        if (isFinite(finalX)) node.x = finalX;
        if (isFinite(finalY)) node.y = finalY;
      } else {
        // Elastic release: clear fx, fy so springs settle organically into equilibrium
        node.fx = null;
        node.fy = null;
        if (isFinite(finalX)) node.x = finalX;
        if (isFinite(finalY)) node.y = finalY;
      }
    }
    if (this.simulation) {
      // Release target alpha so simulation dampens smoothly to rest
      this.simulation.alphaTarget(0);
      this.simulation.alpha(0.18).restart();
    }
  }

  public stop() {
    this.activeDraggingId = null;
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.simulation) {
      this.simulation.stop();
      this.simulation = null;
    }
  }

  public getSettings(): ForceGraphSettings {
    return { ...this.settings };
  }
}
