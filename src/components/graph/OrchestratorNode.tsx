import React, { memo } from 'react';
import { NodeProps } from '@xyflow/react';
import { UnifiedAgentNode, UnifiedNodeType } from './UnifiedAgentNode';

export type OrchestratorNodeType = UnifiedNodeType;

export const OrchestratorNode = memo((props: NodeProps<OrchestratorNodeType>) => {
  return <UnifiedAgentNode {...props} />;
});

OrchestratorNode.displayName = 'OrchestratorNode';
