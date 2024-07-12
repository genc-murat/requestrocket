<script lang="ts">
    import { onMount, createEventDispatcher } from 'svelte';
    import { writable } from 'svelte/store';
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
      type: 'api_call' | 'condition' | 'loop' | 'timer' | 'json_transformer' | 'regex' | 'variable' | 'try_catch' | 'switch_case' | 'custom_script' | 'webhook' | 'auth' | 'comment' | 'group';
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
  
    const dispatch = createEventDispatcher();
  
    onMount(() => {
      const canvas = document.querySelector('.canvas') as HTMLElement;
      if (canvas) {
        canvas.addEventListener('wheel', handleZoom);
        canvas.addEventListener('mousedown', startPan);
        canvas.addEventListener('mousemove', handlePan);
        canvas.addEventListener('mouseup', endPan);
        canvas.addEventListener('mouseleave', endPan);
      }
    });
  
    function addBlock(type: FlowBlock['type']) {
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
    }
  
    function updateBlockPosition(id: string, position: { x: number; y: number }) {
      flow.update(f => ({
        ...f,
        blocks: f.blocks.map(block => 
          block.id === id ? { ...block, position } : block
        )
      }));
    }
  
    function connectBlocks(sourceId: string, targetId: string, type: Connection['type'] = 'next') {
      flow.update(f => ({
        ...f,
        connections: [...f.connections, { id: uuidv4(), source: sourceId, target: targetId, type }]
      }));
    }
  
    function deleteBlock(id: string) {
      flow.update(f => ({
        ...f,
        blocks: f.blocks.filter(block => block.id !== id),
        connections: f.connections.filter(conn => conn.source !== id && conn.target !== id)
      }));
    }
  
    function deleteConnection(id: string) {
      flow.update(f => ({
        ...f,
        connections: f.connections.filter(conn => conn.id !== id)
      }));
    }
  
    function saveFlow() {
      dispatch('save', $flow);
    }
  
    function runFlow() {
      dispatch('run', $flow);
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
      if ($selectedBlock) {
        flow.update(f => ({
          ...f,
          blocks: f.blocks.map(block => 
            block.id === $selectedBlock.id ? $selectedBlock : block
          )
        }));
      }
      closePropertiesModal();
    }
  
    function generatePath(start: { x: number; y: number }, end: { x: number; y: number }): string {
  const midX = (start.x + end.x) / 2;
  return `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
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
  </script>
  
  <style>
    .api-flow-designer {
      display: flex;
      height: 100%;
      width: 100%;
    }
  
    .toolbar {
      width: 200px;
      padding: 10px;
      border-right: 1px solid #ccc;
      background-color: #f8f8f8;
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
    }
  
    .toolbar button {
      display: block;
      width: 100%;
      margin-bottom: 10px;
      padding: 10px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
  
    .toolbar button:hover {
      background-color: #45a049;
    }
  
    .block h3 {
      margin: 0;
      font-size: 14px;
      text-align: center;
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
  </style>
  
  <div class="api-flow-designer">
    <div class="toolbar">
      <button on:click={() => addBlock('api_call')}>Add API Call</button>
      <button on:click={() => addBlock('condition')}>Add Condition</button>
      <button on:click={() => addBlock('loop')}>Add Loop</button>
      <button on:click={() => addBlock('variable')}>Add Variable</button>
      <button on:click={() => addBlock('json_transformer')}>Add JSON Transformer</button>
      <button on:click={saveFlow}>Save Flow</button>
      <button on:click={runFlow}>Run Flow</button>
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
      {#each $flow.blocks as block (block.id)}
        <div 
          class="block {block.type}"
          style="left: {block.position.x}px; top: {block.position.y}px;"
          draggable="true"
          on:dragstart={(e) => handleDragStart(e, block.id)}
          on:click={() => openPropertiesModal(block)}
          data-id={block.id}
          transition:fade
        >
          <h3>{block.type}</h3>
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
          <h2>Block Properties: {$selectedBlock.type}</h2>
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
          {/if}
          <button on:click={updateBlockProperties}>Save</button>
          <button on:click={closePropertiesModal}>Cancel</button>
        </div>
      </div>
    {/if}
  </div>