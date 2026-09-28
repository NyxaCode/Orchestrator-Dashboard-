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
  centerForce: number;      // 0.02 - 0.20 (default: 0.08)
  repelForce: number;       // -300 to -1200 (default: -700)
  linkDistance: number;     // 120 - 280 (default: 180)
  linkForce: number;        // default: 0.6
  collisionPadding: number; // default: 40
  livePhysics: boolean;
}

export const DEFAULT_FORCE_SETTINGS: ForceGraphSettings = {
  centerForce: 0.08,
  repelForce: -700,
  linkDistance: 180,
  linkForce: 0.6,
  collisionPadding: 40,
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

  constructor(settings?: Partial<ForceGraphSettings>) {
    if (settings) {
      this.settings = { ...DEFAULT_FORCE_SETTINGS, ...settings };
    }
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
        d.role === 'orchestrator' ? this.settings.repelForce * 1.4 : this.settings.repelForce
      );
    }

    const link = this.simulation.force('link') as any;
    if (link) {
      link.strength(this.settings.linkForce);
      link.distance((l: ForceLink) =>
        l.isSecondary ? this.settings.linkDistance * 0.8 : this.settings.linkDistance
      );
    }

    this.reheat(0.4);
  }

  public init(
    agents: AgentDTO[],
    links: Array<{ id: string; source: string; target: string; isSecondary: boolean }>,
    onTick: (nodes: ForceNode[]) => void,
    onEnd?: (nodes: ForceNode[]) => void
  ) {
    this.stop();
    this.onTickCallback = onTick;
    this.onEndCallback = onEnd || null;

    // Convert agents to simulation nodes with validated finite coordinates
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
        radius: isOrchestrator ? 38 : 34,
        x: initialX,
        y: initialY,
        vx: 0,
        vy: 0,
        fx: isOrchestrator ? this.centerX : undefined,
        fy: isOrchestrator ? this.centerY : undefined,
      };
    });

    this.links = links.map((l) => ({
      id: l.id,
      source: l.source,
      target: l.target,
      isSecondary: l.isSecondary,
    }));

    this.simulation = forceSimulation<ForceNode, ForceLink>(this.nodes)
      .force('center', forceCenter(this.centerX, this.centerY).strength(this.settings.centerForce))
      .force(
        'charge',
        forceManyBody<ForceNode>()
          .strength((d) =>
            d.role === 'orchestrator' ? this.settings.repelForce * 1.4 : this.settings.repelForce
          )
          .distanceMax(900)
      )
      .force(
        'link',
        forceLink<ForceNode, ForceLink>(this.links)
          .id((d) => d.id)
          .distance((l) =>
            l.isSecondary ? this.settings.linkDistance * 0.8 : this.settings.linkDistance
          )
          .strength(this.settings.linkForce)
      )
      .force(
        'collide',
        forceCollide<ForceNode>()
          .radius((d) => d.radius + this.settings.collisionPadding)
          .iterations(2)
      )
      .velocityDecay(0.4)
      .alphaDecay(0.03);

    this.simulation.on('tick', () => {
      if (!this.onTickCallback) return;
      if (this.animFrameId !== null) return;
      this.animFrameId = requestAnimationFrame(() => {
        this.animFrameId = null;
        if (this.onTickCallback) {
          // Filter to ensure finite numbers
          const safeNodes = this.nodes.filter((n) => isFinite(n.x as number) && isFinite(n.y as number));
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
        const safeNodes = this.nodes.filter((n) => isFinite(n.x as number) && isFinite(n.y as number));
        this.onEndCallback(safeNodes);
      }
    });
  }

  public reheat(alpha = 0.5) {
    if (this.simulation) {
      this.simulation.alpha(alpha).restart();
    }
  }

  public onDragStart(nodeId: string, x: number, y: number) {
    if (!this.simulation || !isFinite(x) || !isFinite(y)) return;
    const node = this.nodes.find((n) => n.id === nodeId);
    if (node) {
      node.fx = x;
      node.fy = y;
      if (this.settings.livePhysics) {
        this.simulation.alphaTarget(0.3).restart();
      }
    }
  }

  public onDrag(nodeId: string, x: number, y: number) {
    if (!isFinite(x) || !isFinite(y)) return;
    const node = this.nodes.find((n) => n.id === nodeId);
    if (node) {
      node.fx = x;
      node.fy = y;
    }
  }

  public onDragEnd(nodeId: string, finalX: number, finalY: number) {
    const node = this.nodes.find((n) => n.id === nodeId);
    if (node) {
      if (node.role === 'orchestrator') {
        node.fx = isFinite(finalX) ? finalX : this.centerX;
        node.fy = isFinite(finalY) ? finalY : this.centerY;
      } else {
        node.fx = null;
        node.fy = null;
        if (isFinite(finalX)) node.x = finalX;
        if (isFinite(finalY)) node.y = finalY;
      }
      if (this.simulation) {
        this.simulation.alphaTarget(0);
      }
    }
  }

  public stop() {
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
