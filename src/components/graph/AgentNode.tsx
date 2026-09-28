import React, { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { UnifiedAgentNode, UnifiedNodeType } from './UnifiedAgentNode';

export type AgentNodeType = UnifiedNodeType;

export const AgentNode = memo((props: NodeProps<AgentNodeType>) => {
  return <UnifiedAgentNode {...props} />;
});

AgentNode.displayName = 'AgentNode';
