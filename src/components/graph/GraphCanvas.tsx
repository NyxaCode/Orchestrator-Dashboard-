import React, { useCallback, useMemo, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useAgentsStore } from '../../stores/agents';
import { UnifiedAgentNode, UnifiedNodeType } from './UnifiedAgentNode';
import { DelegationEdge } from './DelegationEdge';
import { ObsidianGraphControls } from './ObsidianGraphControls';
import {
  ObsidianForceSimulation,
  DEFAULT_FORCE_SETTINGS,
  ForceGraphSettings,
} from './forceSimulation';
import { IconButton } from '../ui/IconButton';
import { AgentDTO } from '../../lib/schemas';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Radio,
} from 'lucide-react';

const nodeTypes = {
  orchestrator: UnifiedAgentNode,
  agent: UnifiedAgentNode,
};

const edgeTypes = {
  delegation: DelegationEdge,
};

export const GraphCanvasInner: React.FC = () => {
  const agents = useAgentsStore((s) => s.agents);
  const selectAgent = useAgentsStore((s) => s.selectAgent);
  const updateAgentPosition = useAgentsStore((s) => s.updateAgentPosition);
  const updateAgentPositionsBatch = useAgentsStore((s) => s.updateAgentPositionsBatch);
  const resetPositionsToRadial = useAgentsStore((s) => s.resetPositionsToRadial);
  const activeDelegations = useAgentsStore((s) => s.activeDelegations);

  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const agentList = useMemo(() => Object.values(agents), [agents]);

  // Force-Directed Graph Simulation Settings & State
  const [forceSettings, setForceSettings] = useState<ForceGraphSettings>(DEFAULT_FORCE_SETTINGS);
  const [isControlsOpen, setIsControlsOpen] = useState(false);
  const simulationRef = useRef<ObsidianForceSimulation | null>(null);

  // Build React Flow Nodes
  const initialNodes: UnifiedNodeType[] = useMemo(() => {
    return agentList.map((agent) => ({
      id: agent.id,
      type: agent.role === 'orchestrator' ? 'orchestrator' : 'agent',
      position: { x: agent.pos_x ?? 400, y: agent.pos_y ?? 300 },
      data: { agent },
    }));
  }, [agentList]);

  // Build React Flow Edges (Hierarchy Primary Lines + Secondary Peer Lines)
  const initialEdges: Edge[] = useMemo(() => {
    const orchestrator = agentList.find((a) => a.role === 'orchestrator');
    if (!orchestrator) return [];

    const edgesList: Edge[] = [];
    const nonOrchestrators = agentList.filter((a) => a.role !== 'orchestrator');

    // 1. PRIMARY HIERARCHY EDGES (Parent -> Child)
    nonOrchestrators.forEach((sub) => {
      const parentId = sub.parent_id || orchestrator.id;
      const parentExists = agentList.some((a) => a.id === parentId);
      const effectiveParentId = parentExists ? parentId : orchestrator.id;

      const delegation = activeDelegations.find(
        (d) =>
          (d.fromAgentId === effectiveParentId && d.toAgentId === sub.id) ||
          (d.fromAgentId === sub.id && d.toAgentId === effectiveParentId)
      );
      const isDelegating = Boolean(delegation);
      const parentAgent = agentList.find((a) => a.id === effectiveParentId);

      edgesList.push({
        id: `primary-${effectiveParentId}-${sub.id}`,
        source: effectiveParentId,
        target: sub.id,
        type: 'delegation',
        animated: isDelegating,
        data: {
          active: isDelegating,
          isSecondary: false,
          label: 'HIERARCHY',
          sourceColor: parentAgent?.color || '#ef4444',
          targetColor: sub.color || '#64748b',
          trafficColor: delegation
            ? (delegation.fromAgentId === sub.id ? sub.color : parentAgent?.color || '#ef4444')
            : undefined,
          senderName: delegation
            ? (delegation.fromAgentId === sub.id ? sub.name : parentAgent?.name || 'Lead')
            : undefined,
          receiverName: delegation
            ? (delegation.toAgentId === sub.id ? sub.name : parentAgent?.name || 'Lead')
            : undefined,
          isReversed: delegation ? delegation.fromAgentId === sub.id : false,
        },
      });
    });

    // 2. SECONDARY PEER EDGES
    // Rule A: Layer 1 sub-agents directly under Orchestrator (e.g. Rika <-> Lia)
    const layer1Agents = agentList.filter(
      (a) => a.role !== 'orchestrator' && (a.parent_id === orchestrator.id || a.layer === 1)
    );
    for (let i = 0; i < layer1Agents.length; i++) {
      for (let j = i + 1; j < layer1Agents.length; j++) {
        const a1 = layer1Agents[i];
        const a2 = layer1Agents[j];
        const delegation = activeDelegations.find(
          (d) =>
            (d.fromAgentId === a1.id && d.toAgentId === a2.id) ||
            (d.fromAgentId === a2.id && d.toAgentId === a1.id)
        );
        const isDelegating = Boolean(delegation);

        edgesList.push({
          id: `sec-l1-${a1.id}-${a2.id}`,
          source: a1.id,
          target: a2.id,
          type: 'delegation',
          animated: isDelegating,
          data: {
            active: isDelegating,
            isSecondary: true,
            label: 'PEER · L1',
            sourceColor: a1.color || '#64748b',
            targetColor: a2.color || '#64748b',
            trafficColor: delegation
              ? (delegation.fromAgentId === a2.id ? a2.color : a1.color)
              : undefined,
            senderName: delegation
              ? (delegation.fromAgentId === a2.id ? a2.name : a1.name)
              : undefined,
            receiverName: delegation
              ? (delegation.toAgentId === a2.id ? a2.name : a1.name)
              : undefined,
            isReversed: delegation ? delegation.fromAgentId === a2.id : false,
          },
        });
      }
    }

    // Rule B: Layer 2 sub-agents under the SAME parent (Cluster siblings)
    const childrenByParent: Record<string, AgentDTO[]> = {};
    nonOrchestrators.forEach((a) => {
      if (a.parent_id && a.parent_id !== orchestrator.id) {
        if (!childrenByParent[a.parent_id]) childrenByParent[a.parent_id] = [];
        childrenByParent[a.parent_id].push(a);
      }
    });

    Object.entries(childrenByParent).forEach(([parentId, children]) => {
      const parentAgent = agentList.find((a) => a.id === parentId);
      const clusterName = parentAgent ? parentAgent.name.toUpperCase() : 'CLUSTER';

      for (let i = 0; i < children.length; i++) {
        for (let j = i + 1; j < children.length; j++) {
          const c1 = children[i];
          const c2 = children[j];
          const delegation = activeDelegations.find(
            (d) =>
              (d.fromAgentId === c1.id && d.toAgentId === c2.id) ||
              (d.fromAgentId === c2.id && d.toAgentId === c1.id)
          );
          const isDelegating = Boolean(delegation);

          edgesList.push({
            id: `sec-l2-${c1.id}-${c2.id}`,
            source: c1.id,
            target: c2.id,
            type: 'delegation',
            animated: isDelegating,
            data: {
              active: isDelegating,
              isSecondary: true,
              label: `PEER · ${clusterName}`,
              sourceColor: c1.color || '#64748b',
              targetColor: c2.color || '#64748b',
              trafficColor: delegation
                ? (delegation.fromAgentId === c2.id ? c2.color : c1.color)
                : undefined,
              senderName: delegation
                ? (delegation.fromAgentId === c2.id ? c2.name : c1.name)
                : undefined,
              receiverName: delegation
                ? (delegation.toAgentId === c2.id ? c2.name : c1.name)
                : undefined,
              isReversed: delegation ? delegation.fromAgentId === c2.id : false,
            },
          });
        }
      }
    });

    return edgesList;
  }, [agentList, activeDelegations]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Synchronize edges efficiently
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Synchronize new/removed agents into nodes state
  useEffect(() => {
    setNodes((prevNodes) => {
      const prevMap = new Map(prevNodes.map((n) => [n.id, n]));
      return agentList.map((agent) => {
        const existing = prevMap.get(agent.id);
        if (existing) {
          // Keep current position if already in state, just update data
          return {
            ...existing,
            data: { agent },
          };
        }
        return {
          id: agent.id,
          type: agent.role === 'orchestrator' ? 'orchestrator' : 'agent',
          position: { x: agent.pos_x ?? 400, y: agent.pos_y ?? 300 },
          data: { agent },
        };
      });
    });
  }, [agentList, setNodes]);

  // Initialize Force-Directed Simulation only when agent count changes or reheat triggered
  useEffect(() => {
    if (!simulationRef.current) {
      simulationRef.current = new ObsidianForceSimulation(forceSettings);
    }

    const simLinks = initialEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      isSecondary: Boolean(e.data?.isSecondary),
    }));

    simulationRef.current.init(
      agentList,
      simLinks,
      (simNodes) => {
        setNodes((prevNodes) =>
          prevNodes.map((pn) => {
            const sn = simNodes.find((n) => n.id === pn.id);
            if (!sn || !isFinite(sn.x as number) || !isFinite(sn.y as number)) return pn;
            // Only update if movement is greater than 1.5px to prevent micro-jitters and save CPU
            const dx = Math.abs((sn.x as number) - pn.position.x);
            const dy = Math.abs((sn.y as number) - pn.position.y);
            if (dx < 1.5 && dy < 1.5) return pn;

            return {
              ...pn,
              position: {
                x: Math.round(sn.x as number),
                y: Math.round(sn.y as number),
              },
            };
          })
        );
      },
      (finalNodes) => {
        const batch: Array<{ id: string; x: number; y: number }> = [];
        finalNodes.forEach((fn) => {
          if (isFinite(fn.x as number) && isFinite(fn.y as number)) {
            batch.push({
              id: fn.id,
              x: Math.round(fn.x as number),
              y: Math.round(fn.y as number),
            });
          }
        });
        if (batch.length > 0) {
          updateAgentPositionsBatch(batch);
        }
      }
    );

    return () => {
      simulationRef.current?.stop();
    };
  }, [agentList.length, updateAgentPositionsBatch]);

  const handleResetLayout = () => {
    resetPositionsToRadial();
    const currentAgents = useAgentsStore.getState().agents;
    const freshNodes: UnifiedNodeType[] = Object.values(currentAgents).map((agent) => ({
      id: agent.id,
      type: agent.role === 'orchestrator' ? 'orchestrator' : 'agent',
      position: { x: agent.pos_x ?? 450, y: agent.pos_y ?? 300 },
      data: { agent },
    }));
    setNodes(freshNodes);

    if (simulationRef.current) {
      simulationRef.current.reheat(0.15);
    }

    setTimeout(() => {
      fitView({ duration: 400, padding: 0.25 });
    }, 50);
  };

  const handleUpdateForceSettings = (newSettings: Partial<ForceGraphSettings>) => {
    const updated = { ...forceSettings, ...newSettings };
    setForceSettings(updated);
    if (simulationRef.current) {
      simulationRef.current.updateSettings(newSettings);
    }
  };

  const handleReheatSimulation = () => {
    if (simulationRef.current) {
      simulationRef.current.reheat(0.7);
    }
  };

  const handleResetForceDefaults = () => {
    setForceSettings(DEFAULT_FORCE_SETTINGS);
    if (simulationRef.current) {
      simulationRef.current.updateSettings(DEFAULT_FORCE_SETTINGS);
      simulationRef.current.reheat(0.6);
    }
  };

  // Node Drag Interactions
  const onNodeDragStart = useCallback((_event: any, node: Node) => {
    simulationRef.current?.onDragStart(node.id, node.position.x, node.position.y);
  }, []);

  const onNodeDrag = useCallback((_event: any, node: Node) => {
    simulationRef.current?.onDrag(node.id, node.position.x, node.position.y);
  }, []);

  const onNodeDragStop = useCallback(
    (_event: any, node: Node) => {
      simulationRef.current?.onDragEnd(node.id, Math.round(node.position.x), Math.round(node.position.y));
      updateAgentPosition(node.id, Math.round(node.position.x), Math.round(node.position.y));
    },
    [updateAgentPosition]
  );

  return (
    <div className="relative w-full h-full bg-[#0a0e14] overflow-hidden">
      {/* Clean Ambient Space Backdrop */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-red-600/[0.04] blur-[120px]"
        aria-hidden="true"
      />

      {/* Clean Subtle Grid Dots */}
      <svg className="pointer-events-none absolute inset-0 w-full h-full opacity-20" aria-hidden="true">
        <pattern id="dot-grid-pat" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="0.75" fill="rgba(255, 255, 255, 0.2)" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#dot-grid-pat)" />
      </svg>

      {/* SIMPLE TOP-LEFT STATUS BADGE */}
      <div className="absolute top-3.5 left-3.5 z-20 select-none pointer-events-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#121820]/90 border border-white/10 shadow-lg backdrop-blur-md">
          <Radio className="w-3.5 h-3.5 text-red-400" />
          <span className="text-white text-xs font-semibold font-mono tracking-tight">
            Graph
          </span>
          <span className="text-gray-500 text-xs">·</span>
          <span className="text-gray-400 text-xs font-mono">
            {agentList.length} Nodes
          </span>
        </div>
      </div>

      {/* SIMPLE TOP-RIGHT CANVAS CONTROLS */}
      <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-2">
        <button
          onClick={handleResetLayout}
          title="Reset Layout ke Posisi Rapi"
          aria-label="Reset Layout"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#161e28]/90 hover:bg-[#202936] text-gray-300 hover:text-white border border-white/15 text-xs font-mono shadow-md transition-all cursor-pointer backdrop-blur-md active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>

        {/* Clean Forces Controls */}
        <ObsidianGraphControls
          settings={forceSettings}
          isOpen={isControlsOpen}
          onToggleOpen={() => setIsControlsOpen((prev) => !prev)}
          onUpdateSettings={handleUpdateForceSettings}
          onReheat={handleReheatSimulation}
          onResetDefaults={handleResetForceDefaults}
        />
      </div>

      {/* BOTTOM-RIGHT ZOOM & FIT CONTROLS */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1 bg-[#121820]/90 border border-white/15 p-1 rounded-lg shadow-xl backdrop-blur-md">
        <IconButton
          aria-label="Perbesar"
          title="Perbesar"
          size="sm"
          variant="ghost"
          onClick={() => zoomIn({ duration: 200 })}
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </IconButton>
        <IconButton
          aria-label="Perkecil"
          title="Perkecil"
          size="sm"
          variant="ghost"
          onClick={() => zoomOut({ duration: 200 })}
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </IconButton>
        <div className="w-[1px] h-3.5 bg-white/20" />
        <IconButton
          aria-label="Pusatkan"
          title="Pusatkan"
          size="sm"
          variant="ghost"
          onClick={() => fitView({ duration: 300, padding: 0.2 })}
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </IconButton>
      </div>

      {/* React Flow Core with High-FPS Optimization */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={() => selectAgent(null)}
        onDoubleClick={() => fitView({ duration: 300, padding: 0.2 })}
        onError={(_id, _msg) => {
          // Suppress harmless React Flow initial handle/mount notifications
        }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.25}
        maxZoom={2.0}
        defaultEdgeOptions={{ type: 'delegation' }}
        proOptions={{ hideAttribution: true }}
        elementsSelectable={true}
        nodesDraggable={true}
        nodesConnectable={false}
        onlyRenderVisibleElements={true}
        elevateNodesOnSelect={false}
        elevateEdgesOnSelect={false}
        className="cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};

export const GraphCanvas: React.FC = () => {
  return (
    <ReactFlowProvider>
      <GraphCanvasInner />
    </ReactFlowProvider>
  );
};
