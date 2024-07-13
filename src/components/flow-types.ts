export type BlockType = 
  | 'start' | 'end' | 'comment' | 'group' | 'api_call' | 'condition' 
  | 'loop' | 'timer' | 'variable' | 'json_transformer' | 'regex' 
  | 'webhook' | 'custom_script' | 'try_catch' | 'switch_case' | 'auth';

export type ConnectionType = 'next' | 'alternative' | 'error';

export interface FlowBlock {
  id: string;
  type: BlockType;
  data: any;
  position: { x: number; y: number };
  next: string | null;
  alternative?: string | null;
  error?: string | null;
  group?: string;
}

export interface Connection {
  id: string;
  source: string;
  target: string;
  type: ConnectionType;
}

export interface Flow {
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
}