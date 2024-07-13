export const blockTypes = {
  'api_call': { category: 'input-output', name: 'API Call' },
  'condition': { category: 'logic', name: 'Condition' },
  'loop': { category: 'logic', name: 'Loop' },
  'timer': { category: 'util', name: 'Timer' },
  'variable': { category: 'data', name: 'Variable' },
  'json_transformer': { category: 'data', name: 'JSON Transformer' },
  'regex': { category: 'data', name: 'Regex' },
  'webhook': { category: 'input-output', name: 'Webhook' },
  'custom_script': { category: 'util', name: 'Custom Script' },
  'try_catch': { category: 'logic', name: 'Try-Catch' },
  'switch_case': { category: 'logic', name: 'Switch-Case' },
  'auth': { category: 'input-output', name: 'Authentication' },
  'comment': { category: 'util', name: 'Comment' },
  'group': { category: 'util', name: 'Group' },
  'start': { category: 'control', name: 'Start' },
  'end': { category: 'control', name: 'End' }
} as const;

export type BlockType = keyof typeof blockTypes;

export type Connection = {
  id: string;
  source: string;
  target: string;
  type: 'next' | 'alternative' | 'error';
};

export type FlowBlock = {
  id: string;
  type: BlockType;
  data: any;
  position: { x: number; y: number };
  next: string | null;
  alternative?: string | null;
  error?: string | null;
  group?: string;
};

export type Flow = {
  id: string;
  name: string;
  description: string;
  version: string;
  blocks: FlowBlock[];
  connections: Connection[];
  variables: { [key: string]: any };
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags: string[];
};

export type SwitchCase = {
  value: string;
  next: string | null;
};