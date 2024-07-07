<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import type { Writable } from 'svelte/store';
  import { openDB } from 'idb';
  import { invoke } from '@tauri-apps/api/tauri';
  import Prism from 'prismjs';
  import 'prismjs/components/prism-json';
  import 'prismjs/themes/prism-solarizedlight.css';

  type HistoryItem = {
    id: number;
    url: string;
    method: string;
    body: string;
    response: string;
    headers: Header[];
    params: Param[];
    group: string;
  };

  type Header = {
    key: string;
    value: string;
  };

  type Param = {
    key: string;
    value: string;
  };

  type ResponseData = {
    status: number;
    duration: number;
    size: number;
    body: string;
    headers: [string, string][];
  };

  let url = writable('');
  let method = writable('GET');
  let body = writable('{"key": "value"}'); // Set default JSON value
  let headers = writable<Header[]>([]);
  let params = writable<Param[]>([]);
  let bodyType = writable('json'); // Default to JSON
  let formData = writable<Header[]>([{ key: '', value: '' }]);
  let response = writable<ResponseData | null>(null);
  let history = writable<HistoryItem[]>([]);
  let selectedTab = writable('response'); // For results section
  let selectedRequestTab = writable('body'); // For request section
  let selectedGroup = writable('');
  let groups = writable<string[]>([]);
  let newGroupName = writable('');
  let modalOpen = writable(true);

  const dbPromise = openDB('request-rocket-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('history')) {
        db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
      }
    },
  });

  async function addHeader() {
    headers.update(h => [...h, { key: '', value: '' }]);
  }

  async function addFormField() {
    formData.update(f => [...f, { key: '', value: '' }]);
  }

  async function addParam() {
    params.update(p => [...p, { key: '', value: '' }]);
    updateUrl();
  }

  function createNewGroup() {
    if ($newGroupName) {
      groups.update(g => [...g, $newGroupName]);
      selectedGroup.set($newGroupName);
      newGroupName.set('');
      modalOpen.set(false);
    }
  }

  function updateUrl() {
    let urlWithParams = $url;
    if ($params.length > 0) {
      const queryString = new URLSearchParams($params.map(param => [param.key, param.value])).toString();
      urlWithParams = $url.split('?')[0] + `?${queryString}`;
    }
    url.set(urlWithParams);
  }

  async function sendRequest() {
    let requestBody;
    if ($method === 'GET') {
      requestBody = null;
    } else {
      switch ($bodyType) {
        case 'json':
          requestBody = $body;
          break;
        case 'xml':
          requestBody = $body;
          break;
        case 'form-data':
          const formDataObject = new FormData();
          $formData.forEach(field => formDataObject.append(field.key, field.value));
          requestBody = formDataObject;
          break;
        case 'form-urlencoded':
          requestBody = new URLSearchParams($formData.map(field => [field.key, field.value])).toString();
          break;
      }
    }

    const requestData: any = {
      url: $url,
      method: $method,
      body: requestBody
    };

    if ($headers.length > 0) {
      requestData.headers = Object.fromEntries($headers.map(header => [header.key, header.value]));
    }

    console.log('Sending request with data:', requestData);

    try {
      const res: ResponseData = await invoke<ResponseData>('send_request', { requestData });
      console.log('Response received:', res);
      response.set(res);

      const newHistoryItem: HistoryItem = { 
        id: Date.now(), 
        url: $url, 
        method: $method, 
        body: $body, 
        headers: $headers,
        params: $params,
        response: JSON.stringify(res),
        group: $selectedGroup // Save the group information
      };

      history.update(h => {
        const newHistory = [...h, newHistoryItem];
        saveHistory(newHistoryItem);
        return newHistory;
      });
    } catch (error) {
      console.error('Request failed:', error);
      response.set(null);
    }
  }

  async function saveHistory(historyItem: HistoryItem) {
    console.log('Saving history:', historyItem);
    try {
      const db = await dbPromise;
      await db.add('history', historyItem);
      console.log('History saved successfully.');
    } catch (error) {
      console.error('Error saving history:', error instanceof Error ? error.message : error);
    }
  }

  async function loadGroups() {
    console.log('Loading groups...');
    try {
      const db = await dbPromise;
      const allHistoryItems = await db.getAll('history');
      const uniqueGroups = [...new Set(allHistoryItems.map(item => item.group))];
      groups.set(uniqueGroups);
    } catch (error) {
      console.error('Failed to load groups:', error instanceof Error ? error.message : error);
    }
  }

  async function loadHistory(selectedGroup: string) {
    console.log('Loading history for group:', selectedGroup);
    try {
      const db = await dbPromise;
      const allHistoryItems = await db.getAll('history');
      const filteredHistory = allHistoryItems.filter(item => item.group === selectedGroup);
      history.set(filteredHistory);
    } catch (error) {
      console.error('Failed to load history:', error instanceof Error ? error.message : error);
    }
  }

  async function deleteHistoryItem(id: number) {
    console.log('Deleting history item:', id);
    try {
      const db = await dbPromise;
      await db.delete('history', id);
      history.update(h => h.filter(item => item.id !== id));
      console.log('History item deleted successfully.');
      clearInput(url);
    } catch (error) {
      console.error('Error deleting history item:', error instanceof Error ? error.message : error);
    }
  }

  function duplicateHistoryItem(item: HistoryItem) {
    const newHistoryItem: HistoryItem = {
      ...item,
      id: Date.now(),
      url: item.url,
    };
    history.update(h => {
      const newHistory = [...h, newHistoryItem];
      saveHistory(newHistoryItem);
      return newHistory;
    });

    selectHistoryItem(newHistoryItem);
  }

  function getStatusClass(status: number): string {
    if (status >= 200 && status < 300) {
      return 'bg-green-500';
    } else if (status >= 300 && status < 400) {
      return 'bg-blue-500';
    } else if (status >= 400 && status < 500) {
      return 'bg-yellow-500';
    } else if (status >= 500) {
      return 'bg-red-500';
    } else {
      return 'bg-gray-500';
    }
  }

  function formatJson(json: string): string {
    try {
      json = JSON.stringify(JSON.parse(json.trim()), null, 2);
      return Prism.highlight(json, Prism.languages.json, 'json');
    } catch (e) {
      return json;
    }
  }

  function selectHistoryItem(item: HistoryItem) {
    url.set(item.url);
    method.set(item.method);
    body.set(item.body);
    headers.set(item.headers || []); // Ensure headers is an array
    params.set(item.params || []); // Ensure params is an array
    response.set(item.response ? JSON.parse(item.response) : null); // Ensure response is properly parsed
  }

  function handleGroupSelect(group: string) {
    selectedGroup.set(group);
    modalOpen.set(false);
    loadHistory(group); // Load history based on selected group
  }

  function clearInput(store: Writable<string>) {
    store.set('');
    headers.set([]); // Clear headers
    params.set([]); // Clear params
    response.set(null);
  }

  onMount(() => {
    loadGroups();
    response.subscribe(value => {
      if (value) {
        Prism.highlightAll();
      }
    });
  });

  $: $params, updateUrl(); // Update URL whenever params change
</script>

<style>
  pre {
    background: #f5f5f5;
    color: #ccc;
    padding: 1em;
    border-radius: 5px;
  }

  .fixed {
    position: fixed;
  }
  .inset-0 {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
  .flex {
    display: flex;
  }
  .items-center {
    align-items: center;
  }
  .justify-center {
    justify-content: center;
  }
  .bg-black {
    background-color: rgba(0, 0, 0, 0.5);
  }
  .bg-opacity-50 {
    background-opacity: 0.5;
  }
  .bg-white {
    background-color: #ffffff;
  }
  .p-4 {
    padding: 1rem;
  }
  .rounded {
    border-radius: 0.5rem;
  }
  .shadow-lg {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .group-card {
    border: 1px solid #ccc;
    padding: 0.4rem;
    margin-bottom: 0.1rem;
    cursor: pointer;
    text-align: center;
  }

  .group-card:hover {
    background-color: #f0f0f0;
  }

  .input-container {
    position: relative;
    width: 100%;
  }

  .clear-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    font-size: 1rem;
    color: var(--secondary-text);
    transition: color 0.3s ease;
    user-select: none;
  }

  .clear-icon:hover {
    color: var(--error);
    font-weight: bolder;
  }

  .header-container {
    margin-top: 1rem;
  }

  .header-row {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .header-row input {
    flex: 1;
    margin-right: 0.5rem;
  }

  .header-row button {
    margin-left: 0.5rem;
  }

  .duplicate-icon {
    display: none;
    cursor: pointer;
    margin-left: 10px;
  }

  .history-item:hover .duplicate-icon {
    display: inline;
  }

  .tab {
    cursor: pointer;
    padding: 0.3rem 0.6rem;
    margin-right: 0.3rem;
    border: 1px solid var(--divider);
    border-bottom: none;
    background: var(--surface);
    border-radius: 4px 4px 0 0;
  }

  .tab.active {
    background: var(--light-background);
    border-bottom: 1px solid var(--surface);
    color: var(--dark-text);
  }

  .tab-content {
    border: 1px solid var(--divider);
    padding: 0.5rem;
    background: var(--surface);
    white-space: pre-wrap;
    word-break: break-word;
    overflow-y: auto;
    max-height: 100%;
  }
</style>

<div class="flex h-screen">
  {#if $modalOpen}
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white p-4 rounded shadow-lg w-1/2">
      <h2 class="text-lg font-bold mb-4">Select Group</h2>
      <div class="grid grid-cols-4 gap-2">
        {#each $groups as group}
          <div class="group-card" on:click={() => handleGroupSelect(group)}>
            {group}
          </div>
        {/each}
      </div>
      <div class="mt-4">
        <input type="text" placeholder="New Group Name" bind:value={$newGroupName} class="w-full mb-2 p-2 border rounded text-primary bg-accent" />
        <button type="button" on:click={createNewGroup} class="w-full p-2 bg-primary text-background rounded">Add Group</button>
      </div>
    </div>
  </div>
  {/if}
  <div class="history-panel panel">
    <h2 class="text-xl font-bold mb-4">History</h2>
    {#if $selectedGroup}
      <div class="group">
        <h3 class="text-lg font-semibold mb-2">{$selectedGroup}</h3>
        <ul>
          {#each $history as item}
            <li class="mb-2 history-item flex justify-between items-center">
              <button type="button" class="w-full text-left" on:click={() => selectHistoryItem(item)}>
                <strong class="px-2 py-1 rounded {item.method === 'GET' ? 'bg-green-500' : ''} {item.method === 'POST' ? 'bg-blue-500' : ''} {item.method === 'PUT' ? 'bg-yellow-500' : ''} {item.method === 'DELETE' ? 'bg-red-500' : ''} text-white">
                  {item.method}
                </strong> <span class="url">{item.url}</span>
              </button>
              <button 
                class="duplicate-icon text-blue-500" 
                aria-label="Duplicate history item" 
                on:click={() => duplicateHistoryItem(item)}
                on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') duplicateHistoryItem(item); }}
              >
                <svg class="icon" viewBox="0 0 24 24">
                  <path d="M3 6h18v2H3V6zm2 2h14v14H5V8zm6 0V4h2v4h-2zm0 0h2v2h-2V8zm0 0h2v12h-2V8zM8 10v10H6V10h2zm0 0h2v10H8V10zm8 0v10h-2V10h2zm0 0h-2v10h2V10z"/>
                </svg>
              </button>
              <button 
                class="delete-icon text-red-500" 
                aria-label="Delete history item" 
                on:click={() => deleteHistoryItem(item.id)}
                on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') deleteHistoryItem(item.id); }}
              >
                <svg class="icon" viewBox="0 0 24 24">
                  <path d="M3 6h18v2H3V6zm2 2h14v14H5V8zm6 0V4h2v4h-2zm0 0h2v2h-2V8zm0 0h2v12h-2V8zM8 10v10H6V10h2zm0 0h2v10H8V10zm8 0v10h-2V10h2zm0 0h-2v10h2V10z"/>
                </svg>
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>

  <div class="request-panel panel">
    <h2 class="text-xl font-bold mb-4">Request</h2>
    <div class="flex mb-4">
      <select id="method" bind:value={$method} class="p-2 border rounded text-primary bg-accent mr-2">
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
      </select>
      <div class="input-container">
        <input type="text" id="url" bind:value={$url} placeholder="https://api.example.com/data" class="flex-1 p-2 border rounded text-primary bg-accent" />
        {#if $url}
          <span class="clear-icon" on:click={() => clearInput(url)}>×</span>
        {/if}
      </div>
    </div>
    <button type="button" on:click={sendRequest} class="button mb-4">Send Request</button>
    <div class="tabs">
      <button 
        type="button" 
        class="tab { $selectedRequestTab === 'body' ? 'active' : '' }" 
        on:click={() => selectedRequestTab.set('body')} 
        aria-label="Body Tab"
      >
        Body
      </button>
      <button 
        type="button" 
        class="tab { $selectedRequestTab === 'params' ? 'active' : '' }" 
        on:click={() => selectedRequestTab.set('params')} 
        aria-label="Params Tab"
      >
        Params
      </button>
      <button 
        type="button" 
        class="tab { $selectedRequestTab === 'headers' ? 'active' : '' }" 
        on:click={() => selectedRequestTab.set('headers')} 
        aria-label="Headers Tab"
      >
        Headers
      </button>
      <button 
        type="button" 
        class="tab { $selectedRequestTab === 'group' ? 'active' : '' }" 
        on:click={() => selectedRequestTab.set('group')} 
        aria-label="Group Tab"
      >
        Group
      </button>
    </div>
    <div class="tab-content">
      {#if $selectedRequestTab === 'body'}
        <label for="bodyType" class="block mb-2">Body Type</label>
        <select id="bodyType" bind:value={$bodyType} class="w-full mb-4 p-2 border rounded text-primary bg-accent">
          <option value="json">JSON</option>
          <option value="xml">XML</option>
          <option value="form-data">Form Data</option>
          <option value="form-urlencoded">Form URL Encoded</option>
        </select>
        {#if $bodyType === 'json' || $bodyType === 'xml'}
          <textarea id="body" bind:value={$body} placeholder={$bodyType === 'json' ? '{"key": "value"}' : '<xml></xml>'} class="w-full mb-4 p-2 border rounded text-primary bg-accent h-40"></textarea>
        {:else}
          {#each $formData as field, index}
            <div class="flex mb-2">
              <input type="text" placeholder="Key" bind:value={field.key} class="flex-1 p-2 border rounded text-primary bg-accent mr-2" />
              <input type="text" placeholder="Value" bind:value={field.value} class="flex-1 p-2 border rounded text-primary bg-accent" />
            </div>
          {/each}
          <button type="button" on:click={addFormField} class="w-full p-2 bg-primary text-background rounded">Add Field</button>
        {/if}
      {:else if $selectedRequestTab === 'params'}
        <div class="params-container">
          <label for="params" class="block mb-2">Params</label>
          {#each $params as param, index}
            <div class="header-row">
              <input type="text" placeholder="Key" bind:value={param.key} class="flex-1 p-2 border rounded text-primary bg-accent mr-2" />
              <input type="text" placeholder="Value" bind:value={param.value} class="flex-1 p-2 border rounded text-primary bg-accent" />
              <button type="button" on:click={() => params.update(p => p.filter((_, i) => i !== index))} class="p-2 bg-red-500 text-white rounded">Delete</button>
            </div>
          {/each}
          <button type="button" on:click={addParam} class="w-full p-2 bg-primary text-background rounded">Add Param</button>
        </div>
      {:else if $selectedRequestTab === 'headers'}
        <div class="header-container">
          <label for="headers" class="block mb-2">Headers</label>
          {#each $headers as header, index}
            <div class="header-row">
              <input type="text" placeholder="Key" bind:value={header.key} class="flex-1 p-2 border rounded text-primary bg-accent mr-2" />
              <input type="text" placeholder="Value" bind:value={header.value} class="flex-1 p-2 border rounded text-primary bg-accent" />
              <button type="button" on:click={() => headers.update(h => h.filter((_, i) => i !== index))} class="p-2 bg-red-500 text-white rounded">Delete</button>
            </div>
          {/each}
          <button type="button" on:click={addHeader} class="w-full p-2 bg-primary text-background rounded">Add Header</button>
        </div>
      {:else if $selectedRequestTab === 'group'}
        <div class="mb-4">
          <label for="group" class="block mb-2">Group</label>
          <select id="group" bind:value={$selectedGroup} class="w-full mb-4 p-2 border rounded text-primary bg-accent">
            {#each $groups as group}
              <option value={group}>{group}</option>
            {/each}
            <option value="new">+ Create New Group</option>
          </select>
          {#if $selectedGroup === 'new'}
            <input type="text" placeholder="New Group Name" bind:value={$newGroupName} class="w-full mb-4 p-2 border rounded text-primary bg-accent" on:blur={createNewGroup} />
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <div class="response-panel panel">
    <h2 class="text-xl font-bold mb-4">Results</h2>
    {#if $response}
    <div class="status-box border border-gray-500 p-4 mb-4 rounded">
      <div class="flex justify-end">
        <div class="flex items-center">
          <span class="text-white px-2 py-1 rounded {getStatusClass($response.status)}">{$response.status} { $response.status === 200 ? 'OK' : '' }</span>
        </div>
        <div class="flex items-center ml-2">
          <span>{$response.duration} ms</span>
        </div>
        <div class="flex items-center ml-2">
          <span>{($response.size / 1024).toFixed(2)} KB</span>
        </div>
      </div>
    </div>
      <div class="flex mb-4">
        <button 
          type="button" 
          class="tab { $selectedTab === 'response' ? 'active' : '' }" 
          on:click={() => selectedTab.set('response')} 
          aria-label="Response Tab"
        >
          Response
        </button>
        <button 
          type="button" 
          class="tab { $selectedTab === 'headers' ? 'active' : '' }" 
          on:click={() => selectedTab.set('headers')} 
          aria-label="Headers Tab"
        >
          Headers
        </button>
      </div>
      <div class="tab-content">
        {#if $selectedTab === 'response'}
          <pre class="bg-secondary text-background p-2 rounded">
            {@html formatJson($response.body)}
          </pre>
        {:else}
          <table>
            {#each $response.headers as [key, value]}
              <tr>
                <td>{key}</td>
                <td>{value}</td>
              </tr>
            {/each}
          </table>
        {/if}
      </div>
    {:else}
      <div>No response</div>
    {/if}
  </div>
</div>
