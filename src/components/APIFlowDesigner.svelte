<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { writable, get } from 'svelte/store';
  import type { Writable } from 'svelte/store';
  import { v4 as uuidv4 } from 'uuid';
  import { fade, fly } from 'svelte/transition';
 

  type Connection = {
    id: string;
    source: string;
    target: string;
    type: 'next' | 'alternative' | 'error';
  };

  type FlowBlock = {
  id: string;
  type: BlockType;
  data: any;
  position: { x: number; y: number };
  next: string | null;
  alternative?: string | null;
  error?: string | null;
  group?: string;
};

  type Flow = {
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

  export let initialFlow: Flow | null = null;
  export let readOnly: boolean = false;

  let flow: Writable<Flow> = writable(initialFlow || {
    id: uuidv4(),
    name: 'New Flow',
    description: '',
    version: '1.0.0',
    blocks: [],
    connections: [],
    variables: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'Anonymous',
    tags: []
  });

  let selectedBlock: Writable<FlowBlock | null> = writable(null);
  let isDragging: boolean = false;
  let dragOffset: { x: number; y: number } | null = null;
  let showPropertiesModal: boolean = false;
  let isConnecting: boolean = false;
  let connectionStart: string | null = null;
  let connectionEnd: { x: number; y: number } | null = null;
  let zoom: number = 1;
  let pan: { x: number; y: number } = { x: 0, y: 0 };
  let searchTerm = '';
  let categoryFilter = 'all';
  let showVariablesPanel = false;
  let showHelpPanel = false;
  let showContextMenu = false;
  let contextMenuPosition = { x: 0, y: 0 };
  let contextMenuTargetId: string | null = null;

  const dispatch = createEventDispatcher();

  const blockCategories = {
    'all': 'All',
    'input-output': 'Input/Output',
    'logic': 'Logic',
    'data': 'Data Manipulation',
    'util': 'Utilities'
  };

  const blockTypes = {
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
  'group': { category: 'util', name: 'Group' }
} as const;

type BlockType = keyof typeof blockTypes;

  // Undo/Redo işlemleri için geçmiş
  let history: Flow[] = [];
  let historyIndex = -1;

  function saveToHistory() {
    history = history.slice(0, historyIndex + 1);
    history.push(JSON.parse(JSON.stringify(get(flow))));
    historyIndex++;
  }

  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      flow.set(JSON.parse(JSON.stringify(history[historyIndex])));
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      historyIndex++;
      flow.set(JSON.parse(JSON.stringify(history[historyIndex])));
    }
  }

  onMount(() => {
    const canvas = document.querySelector('.canvas') as HTMLElement;
    if (canvas) {
      canvas.addEventListener('wheel', handleZoom);
      canvas.addEventListener('mousedown', startPan);
      canvas.addEventListener('mousemove', handlePan);
      canvas.addEventListener('mouseup', endPan);
      canvas.addEventListener('mouseleave', endPan);
    }
    document.addEventListener('keydown', handleKeyDown);
    saveToHistory();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  });

  function addBlock(type: BlockType) {
  const newBlock: FlowBlock = {
    id: uuidv4(),
    type,
    data: {},
    position: { x: 100, y: 100 },
    next: null
  };
  flow.update(f => ({
    ...f,
    blocks: [...f.blocks, newBlock]
  }));
  saveToHistory();
}

  function updateBlockPosition(id: string, position: { x: number; y: number }) {
    flow.update(f => ({
      ...f,
      blocks: f.blocks.map(block => 
        block.id === id ? { ...block, position } : block
      )
    }));
    saveToHistory();
  }

  function connectBlocks(sourceId: string, targetId: string, type: Connection['type'] = 'next') {
    flow.update(f => ({
      ...f,
      connections: [...f.connections, { id: uuidv4(), source: sourceId, target: targetId, type }]
    }));
    saveToHistory();
  }

  function deleteBlock(id: string) {
    flow.update(f => ({
      ...f,
      blocks: f.blocks.filter(block => block.id !== id),
      connections: f.connections.filter(conn => conn.source !== id && conn.target !== id)
    }));
    saveToHistory();
  }

  function deleteConnection(id: string) {
    flow.update(f => ({
      ...f,
      connections: f.connections.filter(conn => conn.id !== id)
    }));
    saveToHistory();
  }

  function saveFlow() {
    dispatch('save', get(flow));
  }

  function runFlow() {
    dispatch('run', get(flow));
  }

  function handleDragStart(event: DragEvent, blockId: string) {
    if (readOnly || !event.target) return;
    isDragging = true;
    const target = event.target as HTMLElement;
    const rect = target.getBoundingClientRect();
    dragOffset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
    event.dataTransfer?.setData('text/plain', blockId);
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    const blockId = event.dataTransfer?.getData('text/plain');
    if (blockId && dragOffset) {
      const canvas = event.currentTarget as HTMLElement;
      const canvasRect = canvas.getBoundingClientRect();
      const newPosition = {
        x: (event.clientX - canvasRect.left - dragOffset.x - pan.x) / zoom,
        y: (event.clientY - canvasRect.top - dragOffset.y - pan.y) / zoom
      };
      updateBlockPosition(blockId, newPosition);
    }
    isDragging = false;
    dragOffset = null;
  }

  function startConnection(blockId: string) {
    isConnecting = true;
    connectionStart = blockId;
  }

  function handleMouseMove(event: MouseEvent) {
    if (isConnecting) {
      const canvas = event.currentTarget as HTMLElement;
      const canvasRect = canvas.getBoundingClientRect();
      connectionEnd = {
        x: (event.clientX - canvasRect.left - pan.x) / zoom,
        y: (event.clientY - canvasRect.top - pan.y) / zoom
      };
    }
  }

  function handleMouseUp(event: MouseEvent) {
    if (isConnecting && connectionStart) {
      const targetElement = event.target as HTMLElement;
      const targetBlock = targetElement.closest('.block') as HTMLElement;
      if (targetBlock) {
        const targetId = targetBlock.dataset.id;
        if (targetId && targetId !== connectionStart) {
          connectBlocks(connectionStart, targetId);
        }
      }
    }
    isConnecting = false;
    connectionStart = null;
    connectionEnd = null;
  }

  function openPropertiesModal(block: FlowBlock) {
    selectedBlock.set(block);
    showPropertiesModal = true;
  }

  function closePropertiesModal() {
    showPropertiesModal = false;
    selectedBlock.set(null);
  }

  function updateBlockProperties() {
    if (get(selectedBlock)) {
      flow.update(f => ({
        ...f,
        blocks: f.blocks.map(block => 
          block.id === get(selectedBlock)!.id ? get(selectedBlock)! : block
        )
      }));
    }
    closePropertiesModal();
    saveToHistory();
  }

  function handleZoom(event: WheelEvent) {
    event.preventDefault();
    const zoomSpeed = 0.1;
    const zoomDelta = event.deltaY > 0 ? -zoomSpeed : zoomSpeed;
    zoom = Math.max(0.1, Math.min(2, zoom + zoomDelta));
  }

  let isPanning = false;
  let panStart = { x: 0, y: 0 };

  function startPan(event: MouseEvent) {
    if (event.button === 1) { // Middle mouse button
      isPanning = true;
      panStart = { x: event.clientX, y: event.clientY };
    }
  }

  function handlePan(event: MouseEvent) {
    if (isPanning) {
      const dx = event.clientX - panStart.x;
      const dy = event.clientY - panStart.y;
      pan = { x: pan.x + dx, y: pan.y + dy };
      panStart = { x: event.clientX, y: event.clientY };
    }
  }

  function endPan() {
    isPanning = false;
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey) {
      switch(event.key) {
        case 'z':
          event.preventDefault();
          undo();
          break;
        case 'y':
          event.preventDefault();
          redo();
          break;
        case 's':
          event.preventDefault();
          saveFlow();
          break;
      }
    }
  }

  function openContextMenu(event: MouseEvent, blockId: string) {
    event.preventDefault();
    contextMenuPosition = { x: event.clientX, y: event.clientY };
    contextMenuTargetId = blockId;
    showContextMenu = true;
  }

  function closeContextMenu() {
    showContextMenu = false;
    contextMenuTargetId = null;
  }

  function duplicateBlock() {
  if (contextMenuTargetId) {
    const originalBlock = $flow.blocks.find(b => b.id === contextMenuTargetId);
    if (originalBlock) {
      const newBlock: FlowBlock = {
        ...JSON.parse(JSON.stringify(originalBlock)),
        id: uuidv4(),
        position: {
          x: originalBlock.position.x + 20,
          y: originalBlock.position.y + 20
        }
      };
      flow.update(f => ({
        ...f,
        blocks: [...f.blocks, newBlock]
      }));
      saveToHistory();
    }
  }
  closeContextMenu();
}

  function validateFlow() {
    const unconnectedBlocks = get(flow).blocks.filter(block => 
      !get(flow).connections.some(conn => conn.source === block.id || conn.target === block.id)
    );
    if (unconnectedBlocks.length > 0) {
      console.warn('Unconnected blocks found:', unconnectedBlocks);
    }
    // Diğer doğrulama kuralları...
  }

  $: filteredBlocks = $flow.blocks.filter(block => 
  block.type.toLowerCase().includes(searchTerm.toLowerCase()) &&
  (categoryFilter === 'all' || blockTypes[block.type].category === categoryFilter)
);

  function generatePath(start: { x: number; y: number }, end: { x: number; y: number }): string {
    const midX = (start.x + end.x) / 2;
    return `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
  }

  function addVariable() {
    flow.update(f => ({
      ...f,
      variables: { ...f.variables, ['newVariable']: '' }
    }));
  }

  function deleteVariable(key: string) {
    flow.update(f => {
      const { [key]: _, ...rest } = f.variables;
      return { ...f, variables: rest };
    });
  }
  function isValidBlockType(type: string): type is BlockType {
    return type in blockTypes;
  }

  function safeAddBlock(type: string) {
    if (isValidBlockType(type)) {
      addBlock(type);
    } else {
      console.error(`Invalid block type: ${type}`);
    }
  }
  function handleAddBlock(type: string) {
    addBlock(type as BlockType);
  }

</script>

<svelte:window on:keydown={handleKeyDown} on:click={closeContextMenu} />

<div class="api-flow-designer">
  <div class="toolbar">
    <input type="text" bind:value={searchTerm} placeholder="Search blocks..." />

      <select class="w-full focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"  bind:value={categoryFilter}>
        {#each Object.entries(blockCategories) as [value, name]}
          <option value={value}>{name}</option>
        {/each}
      </select>
 
    
    
    
    {#each Object.entries(blockTypes) as [type, { category, name }]}
    {#if categoryFilter === 'all' || categoryFilter === category}
      <button on:click={() => handleAddBlock(type)}>{name}</button>
    {/if}
  {/each}
    <button on:click={saveFlow}>Save Flow</button>
    <button on:click={runFlow}>Run Flow</button>
    <button on:click={validateFlow}>Validate Flow</button>
    <button on:click={() => showVariablesPanel = true}>Variables</button>
    <button on:click={() => showHelpPanel = true}>Help</button>
    <button on:click={undo} disabled={historyIndex <= 0}>Undo</button>
    <button on:click={redo} disabled={historyIndex >= history.length - 1}>Redo</button>
  </div>

  <div class="canvas" 
    on:dragover|preventDefault 
    on:drop={handleDrop}
    on:mousemove={handleMouseMove}
    on:mouseup={handleMouseUp}
    style="transform: scale({zoom}) translate({pan.x}px, {pan.y}px);">
    <svg class="connections" width="100%" height="100%">
      {#each $flow.connections as connection}
        {@const sourceBlock = $flow.blocks.find(b => b.id === connection.source)}
        {@const targetBlock = $flow.blocks.find(b => b.id === connection.target)}
        {#if sourceBlock && targetBlock}
          <path 
            d={generatePath(sourceBlock.position, targetBlock.position)}
            fill="none"
            stroke="black" 
            stroke-width="2"
          />
          <text 
            x={(sourceBlock.position.x + targetBlock.position.x) / 2} 
            y={(sourceBlock.position.y + targetBlock.position.y) / 2 - 10}
            text-anchor="middle"
            fill="black"
          >
            {connection.type}
          </text>
          <circle
            cx={(sourceBlock.position.x + targetBlock.position.x) / 2}
            cy={(sourceBlock.position.y + targetBlock.position.y) / 2}
            r="5"
            fill="red"
            on:click={() => deleteConnection(connection.id)}
          />
        {/if}
      {/each}
      {#if isConnecting && connectionStart && connectionEnd}
        {@const startBlock = $flow.blocks.find(b => b.id === connectionStart)}
        {#if startBlock}
          <path 
            d={generatePath(startBlock.position, connectionEnd)}
            fill="none"
            stroke="black" 
            stroke-width="2" 
            stroke-dasharray="5,5"
          />
        {/if}
      {/if}
    </svg>
    {#each filteredBlocks as block (block.id)}
    <div 
      class="block {block.type}"
      style="left: {block.position.x}px; top: {block.position.y}px;"
      draggable="true"
      on:dragstart={(e) => handleDragStart(e, block.id)}
      on:click={() => openPropertiesModal(block)}
      on:contextmenu={(e) => openContextMenu(e, block.id)}
      data-id={block.id}
      transition:fade
    >
      <h3>{blockTypes[block.type].name}</h3>
      <button class="delete-button" on:click|stopPropagation={() => deleteBlock(block.id)}>×</button>
      <button on:mousedown|stopPropagation={() => startConnection(block.id)} class="connect-button">Connect</button>
    </div>
  {/each}
  </div>

  <div class="minimap">
    <svg width="100%" height="100%" viewBox="0 0 1000 1000">
      <g class="minimap-content" style="transform: scale({1/zoom}) translate({-pan.x}px, {-pan.y}px)">
        {#each $flow.blocks as block}
          <rect 
            x={block.position.x / 5} 
            y={block.position.y / 5} 
            width="30" 
            height="20" 
            fill="blue" 
          />
        {/each}
      </g>
    </svg>
  </div>

  {#if showPropertiesModal && $selectedBlock}
    <div class="modal" transition:fly="{{ y: 200, duration: 300 }}">
      <div class="modal-content">
        <h2>Block Properties: {blockTypes[$selectedBlock.type].name}</h2>
        {#if $selectedBlock.type === 'api_call'}
          <label>
            URL: 
            <input type="text" bind:value={$selectedBlock.data.url} />
          </label>
          <label>
            Method: 
            <select bind:value={$selectedBlock.data.method}>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </label>
          <label>
            Headers:
            <textarea bind:value={$selectedBlock.data.headers}></textarea>
          </label>
          <label>
            Body:
            <textarea bind:value={$selectedBlock.data.body}></textarea>
          </label>
        {:else if $selectedBlock.type === 'condition'}
          <label>
            Condition: 
            <input type="text" bind:value={$selectedBlock.data.condition} />
          </label>
        {:else if $selectedBlock.type === 'loop'}
          <label>
            Iterator: 
            <input type="text" bind:value={$selectedBlock.data.iterator} />
          </label>
          <label>
            Max Iterations: 
            <input type="number" bind:value={$selectedBlock.data.maxIterations} />
          </label>
          {:else if $selectedBlock.type === 'regex'}
  <label>
    Regular Expression:
    <input type="text" bind:value={$selectedBlock.data.pattern} />
  </label>
  <label>
    Flags:
    <input type="text" bind:value={$selectedBlock.data.flags} />
  </label>
        {:else if $selectedBlock.type === 'variable'}
          <label>
            Name: 
            <input type="text" bind:value={$selectedBlock.data.name} />
          </label>
          <label>
            Value: 
            <input type="text" bind:value={$selectedBlock.data.value} />
          </label>
        {:else if $selectedBlock.type === 'json_transformer'}
          <label>
            Transform Function:
            <textarea bind:value={$selectedBlock.data.transformFunction}></textarea>
          </label>
        {:else if $selectedBlock.type === 'custom_script'}
          <label>
            Script:
            <textarea bind:value={$selectedBlock.data.script}></textarea>
          </label>
        {:else if $selectedBlock.type === 'webhook'}
          <label>
            Webhook URL:
            <input type="text" bind:value={$selectedBlock.data.webhookUrl} />
          </label>
        {:else if $selectedBlock.type === 'auth'}
          <label>
            Auth Type:
            <select bind:value={$selectedBlock.data.authType}>
              <option value="basic">Basic</option>
              <option value="bearer">Bearer Token</option>
              <option value="oauth2">OAuth 2.0</option>
            </select>
          </label>
          {#if $selectedBlock.data.authType === 'basic'}
            <label>
              Username:
              <input type="text" bind:value={$selectedBlock.data.username} />
            </label>
            <label>
              Password:
              <input type="password" bind:value={$selectedBlock.data.password} />
            </label>
          {:else if $selectedBlock.data.authType === 'bearer'}
            <label>
              Token:
              <input type="text" bind:value={$selectedBlock.data.token} />
            </label>
          {:else if $selectedBlock.data.authType === 'oauth2'}
            <label>
              Client ID:
              <input type="text" bind:value={$selectedBlock.data.clientId} />
            </label>
            <label>
              Client Secret:
              <input type="password" bind:value={$selectedBlock.data.clientSecret} />
            </label>
            <label>
              Token URL:
              <input type="text" bind:value={$selectedBlock.data.tokenUrl} />
            </label>
          {/if}
        {/if}
        <button on:click={updateBlockProperties}>Save</button>
        <button on:click={closePropertiesModal}>Cancel</button>
      </div>
    </div>
  {/if}

  {#if showVariablesPanel}
    <div class="modal" transition:fly="{{ x: 200, duration: 300 }}">
      <div class="modal-content">
        <h2>Variables</h2>
        {#each Object.entries($flow.variables) as [key, value]}
          <div>
            <input type="text" bind:value={key} />
            <input type="text" bind:value={value} />
            <button on:click={() => deleteVariable(key)}>Delete</button>
          </div>
        {/each}
        <button on:click={addVariable}>Add Variable</button>
        <button on:click={() => showVariablesPanel = false}>Close</button>
      </div>
    </div>
  {/if}

  {#if showHelpPanel}
    <div class="modal" transition:fly="{{ x: -200, duration: 300 }}">
      <div class="modal-content">
        <h2>Help</h2>
        <h3>Block Types</h3>
        <ul>
          {#each Object.entries(blockTypes) as [type, { name }]}
            <li>
              <strong>{name}:</strong> 
              {#if type === 'api_call'}
                Used to make API calls to external services.
              {:else if type === 'condition'}
                Allows for conditional branching in the flow.
              {:else if type === 'loop'}
                Repeats a set of actions for a specified number of times or until a condition is met.
              {:else if type === 'variable'}
                Defines a variable that can be used throughout the flow.
              {:else if type === 'json_transformer'}
                Transforms JSON data from one format to another.
              {:else if type === 'custom_script'}
                Executes custom JavaScript code.
              {:else if type === 'webhook'}
                Listens for incoming HTTP requests.
              {:else if type === 'auth'}
                Handles authentication for API calls.
              {/if}
            </li>
          {/each}
        </ul>
        <h3>Keyboard Shortcuts</h3>
        <ul>
          <li><strong>Ctrl/Cmd + Z:</strong> Undo</li>
          <li><strong>Ctrl/Cmd + Y:</strong> Redo</li>
          <li><strong>Ctrl/Cmd + S:</strong> Save Flow</li>
        </ul>
        <button on:click={() => showHelpPanel = false}>Close</button>
      </div>
    </div>
  {/if}

  {#if showContextMenu}
  <div class="context-menu" style="left: {contextMenuPosition.x}px; top: {contextMenuPosition.y}px;">
    <button on:click={duplicateBlock}>Duplicate</button>
    <button on:click={() => {
      if (contextMenuTargetId) {
        deleteBlock(contextMenuTargetId);
        closeContextMenu();
      }
    }}>Delete</button>
    <button on:click={() => {
      if (contextMenuTargetId) {
        const block = $flow.blocks.find(b => b.id === contextMenuTargetId);
        if (block) {
          openPropertiesModal(block);
          closeContextMenu();
        }
      }
    }}>Edit Properties</button>
  </div>
{/if}
</div>

<style>
  .api-flow-designer {
    display: flex;
    height: 100%;
    width: 100%;
    overflow: hidden;
  }

  .toolbar {
    width: 200px;
    padding: 10px;
    border-right: 1px solid #ccc;
    background-color: #f8f8f8;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }

  .toolbar input, .toolbar select, .toolbar button {
    margin-bottom: 10px;
  }

  .canvas {
    flex-grow: 1;
    position: relative;
    overflow: hidden;
    height: 100%;
    background-color: #f0f0f0;
    transition: transform 0.1s ease-out;
  }

  .connections {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
  }

  .block {
    position: absolute;
    width: 150px;
    height: 100px;
    border: 1px solid #000;
    background-color: #fff;
    cursor: move;
    user-select: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    border-radius: 5px;
    transition: transform 0.2s ease-out;
  }

  .block:hover {
    transform: scale(1.05);
  }

  .connect-button {
    position: absolute;
    bottom: 5px;
    right: 5px;
    background-color: #4CAF50;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
  }

  .delete-button {
    position: absolute;
    top: 5px;
    right: 5px;
    background-color: #f44336;
    color: white;
    border: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 12px;
  }

  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    width: 400px;
    max-width: 90%;
    max-height: 90%;
    overflow-y: auto;
  }

  .minimap {
    position: absolute;
    bottom: 20px;
    right: 20px;
    width: 200px;
    height: 150px;
    background-color: rgba(255, 255, 255, 0.8);
    border: 1px solid #ccc;
    border-radius: 5px;
    overflow: hidden;
  }

  .minimap-content {
    transform-origin: 0 0;
  }

  .context-menu {
    position: fixed;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 5px;
    z-index: 1000;
  }

  .context-menu button {
    display: block;
    width: 100%;
    text-align: left;
    padding: 5px 10px;
    border: none;
    background: none;
    cursor: pointer;
  }

  .context-menu button:hover {
    background-color: #f0f0f0;
  }
</style>