import React, { memo } from 'react';
import { EdgeProps, EdgeLabelRenderer } from '@xyflow/react';
import { useAgentsStore } from '../../stores/agents';
import { Activity, ArrowRight } from 'lucide-react';

export const DelegationEdge = memo(
  ({
    id,
    source,
    target,
    sourceX,
    sourceY,
    targetX,
    targetY,
    style = {},
    markerEnd,
    data,
  }: EdgeProps) => {
    // Only subscribe to boolean indicating if this specific edge is connected to the selected agent!
    const isEdgeSelected = useAgentsStore(
      (s) => s.selectedAgentId === source || s.selectedAgentId === target
    );

    // Safeguard: Check that all coordinates are valid finite numbers to prevent SVG NaN errors
    if (
      typeof sourceX !== 'number' ||
      typeof sourceY !== 'number' ||
      typeof targetX !== 'number' ||
      typeof targetY !== 'number' ||
      !isFinite(sourceX) ||
      !isFinite(sourceY) ||
      !isFinite(targetX) ||
      !isFinite(targetY)
    ) {
      return null;
    }

    const isSecondary = Boolean(data?.isSecondary);
    const secondaryLabel = (data?.label as string) || (isSecondary ? 'PEER' : 'link');

    const isActive = Boolean(data?.active);
    const isReversed = Boolean(data?.isReversed);

    const sourceColor = (data?.sourceColor as string) || '#ef4444';
    const targetColor = (data?.targetColor as string) || '#64748b';
    const selectedColor = isEdgeSelected ? sourceColor : '#ef4444';
    const trafficColor = (data?.trafficColor as string) || sourceColor;

    const senderName = (data?.senderName as string) || 'Agent';
    const receiverName = (data?.receiverName as string) || 'Target';

    // Path geometry:
    // Primary lines: Straight center-to-center ray (Obsidian note style)
    // Secondary lines: Subtle curved peer arc
    let edgePath = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    let motionPath = isReversed
      ? `M ${targetX} ${targetY} L ${sourceX} ${sourceY}`
      : `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;
    let labelX = (sourceX + targetX) / 2;
    let labelY = (sourceY + targetY) / 2;

    if (isSecondary) {
      const dx = targetX - sourceX;
      const dy = targetY - sourceY;
      const curvature = 0.16;
      const nx = -dy * curvature;
      const ny = dx * curvature;
      const ctrlX = (sourceX + targetX) / 2 + nx;
      const ctrlY = (sourceY + targetY) / 2 + ny;

      edgePath = `M ${sourceX} ${sourceY} Q ${ctrlX} ${ctrlY} ${targetX} ${targetY}`;
      motionPath = isReversed
        ? `M ${targetX} ${targetY} Q ${ctrlX} ${ctrlY} ${sourceX} ${sourceY}`
        : `M ${sourceX} ${sourceY} Q ${ctrlX} ${ctrlY} ${targetX} ${targetY}`;

      labelX = 0.25 * sourceX + 0.5 * ctrlX + 0.25 * targetX;
      labelY = 0.25 * sourceY + 0.5 * ctrlY + 0.25 * targetY;
    }

    const getStrokeColor = () => {
      if (isActive) return trafficColor;
      if (isEdgeSelected) return selectedColor;
      if (isSecondary) return 'rgba(168, 85, 247, 0.4)';
      return 'rgba(255, 255, 255, 0.16)';
    };

    const strokeColor = getStrokeColor();
    const strokeWidth = isActive ? 2.5 : isEdgeSelected ? 1.8 : 1.2;
    const strokeDash = isActive ? '8 6' : isSecondary ? '3 4' : undefined;

    return (
      <>
        {/* Glow halo under active traffic line or selected edge (Hardware-accelerated translucent stroke) */}
        {isActive && (
          <path
            d={edgePath}
            fill="none"
            stroke={trafficColor}
            strokeWidth={5}
            strokeOpacity={0.25}
          />
        )}

        {isEdgeSelected && !isActive && (
          <path
            d={edgePath}
            fill="none"
            stroke={selectedColor}
            strokeWidth={3}
            strokeOpacity={0.2}
          />
        )}

        {/* Base Obsidian Link Line */}
        <path
          id={id}
          style={style}
          d={edgePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDash}
          markerEnd={markerEnd}
        />

        {/* Active Traffic Animation (Smooth pulsing packets) */}
        {isActive && (
          <>
            <circle
              r={4}
              fill="#ffffff"
              stroke={trafficColor}
              strokeWidth={1.5}
            >
              <animateMotion
                path={motionPath}
                dur="1.2s"
                repeatCount="indefinite"
                rotate="auto"
              />
            </circle>
            <circle
              r={2.5}
              fill={trafficColor}
              opacity="0.8"
            >
              <animateMotion
                path={motionPath}
                dur="1.2s"
                begin="0.4s"
                repeatCount="indefinite"
                rotate="auto"
              />
            </circle>
          </>
        )}

        {/* Minimal Label only when active or selected or secondary */}
        {(isActive || isEdgeSelected || isSecondary) && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: 'absolute',
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: 'none',
              }}
            >
              {isActive ? (
                <div
                  className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0a0e14]/95 text-white border shadow-xl font-mono text-[9px] tracking-tight backdrop-blur-md"
                  style={{
                    borderColor: `${trafficColor}99`,
                    boxShadow: `0 0 12px ${trafficColor}44`,
                  }}
                >
                  <Activity className="w-2.5 h-2.5 animate-pulse" style={{ color: trafficColor }} />
                  <span className="font-bold" style={{ color: trafficColor }}>
                    {senderName}
                  </span>
                  <ArrowRight className="w-2 h-2 text-gray-400" />
                  <span className="text-gray-300">
                    {receiverName}
                  </span>
                </div>
              ) : isSecondary ? (
                <div className="px-1.5 py-0.5 rounded-full bg-[#121018]/80 text-purple-300/80 border border-purple-500/20 text-[8px] font-mono tracking-tight backdrop-blur-xs">
                  {secondaryLabel}
                </div>
              ) : isEdgeSelected ? (
                <div
                  className="px-1.5 py-0.5 rounded bg-[#121820]/90 border text-[8px] font-mono tracking-tight backdrop-blur-xs"
                  style={{ borderColor: `${selectedColor}50`, color: selectedColor }}
                >
                  active
                </div>
              ) : null}
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    );
  }
);

DelegationEdge.displayName = 'DelegationEdge';
