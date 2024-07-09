<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import type { Writable } from 'svelte/store';
  import { openDB } from 'idb';
  import { invoke } from '@tauri-apps/api/tauri';
  import Prism from 'prismjs';
  import 'prismjs/components/prism-json';
  import 'prismjs/themes/prism-solarizedlight.css';
  import { faPlus, faTrashAlt, faClone, faEdit } from '@fortawesome/free-solid-svg-icons';
  import { library } from '@fortawesome/fontawesome-svg-core';
  import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

  library.add(faPlus, faTrashAlt, faClone, faEdit);

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
    curl_command: string;
  };

  let url = writable('');
  let method = writable('GET');
  let body = writable('{"key": "value"}');
  let headers = writable<Header[]>([]);
  let params = writable<Param[]>([]);
  let bodyType = writable('json');
  let formData = writable<Header[]>([{ key: '', value: '' }]);
  let response = writable<ResponseData | null>(null);
  let history = writable<HistoryItem[]>([]);
  let selectedTab = writable('response');
  let selectedRequestTab = writable('body');
  let selectedGroup = writable('');
  let groups = writable<string[]>([]);
  let newGroupName = writable('');
  let modalOpen = writable(true);

  let variables = writable<{ [key: string]: string }>({});
  let newVariableKey = writable('');
  let newVariableValue = writable('');

  let variablesPanelOpen = writable(false);

  const dbPromise = openDB('request-rocket-db', 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        if (!db.objectStoreNames.contains('history')) {
          db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
        }
      }
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('variables')) {
          db.createObjectStore('variables', { keyPath: 'key' });
        }
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

  function clearHeaders() {
    headers.set([]);
  }

  function clearParams() {
    params.set([]);
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

  function replaceVariables(str: string, vars: { [key: string]: string }): string {
    return str.replace(/{{(.*?)}}/g, (_, key) => vars[key.trim()] || '');
  }

  async function sendRequest() {
    const actualUrl = replaceVariables($url, $variables);
    const actualHeaders = $headers.map(header => ({
      key: replaceVariables(header.key, $variables),
      value: replaceVariables(header.value, $variables)
    }));

    let requestBody;
    if ($method === 'GET') {
      requestBody = null;
    } else {
      switch ($bodyType) {
        case 'json':
        case 'xml':
          requestBody = replaceVariables($body, $variables);
          break;
        case 'form-data':
          const formDataObject = new FormData();
          $formData.forEach(field => formDataObject.append(field.key, replaceVariables(field.value, $variables)));
          requestBody = formDataObject;
          break;
        case 'form-urlencoded':
          requestBody = new URLSearchParams($formData.map(field => [field.key, replaceVariables(field.value, $variables)])).toString();
          break;
      }
    }

    const requestData: any = {
      url: actualUrl,
      method: $method,
      body: requestBody,
      headers: Object.fromEntries(actualHeaders.map(header => [header.key, header.value]))
    };

    console.log('Sending request with data:', requestData);

    try {
      const res: ResponseData = await invoke<ResponseData>('send_request', { requestData });
      console.log('Response received:', res);
      response.set(res);

      const existingHistoryItem = $history.find(item => item.url === actualUrl && item.method === $method && item.group === $selectedGroup);
      if (existingHistoryItem) {
        const updatedHistoryItem: HistoryItem = { 
          ...existingHistoryItem,
          body: $body, 
          headers: actualHeaders,
          params: $params,
          response: JSON.stringify(res),
        };
        updateHistoryItem(updatedHistoryItem);
      } else {
        const newHistoryItem: HistoryItem = { 
          id: Date.now(), 
          url: actualUrl, 
          method: $method, 
          body: $body, 
          headers: actualHeaders,
          params: $params,
          response: JSON.stringify(res),
          group: $selectedGroup
        };
        history.update(h => {
          const newHistory = [...h, newHistoryItem];
          saveHistory(newHistoryItem);
          return newHistory;
        });
      }
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

  async function updateHistoryItem(historyItem: HistoryItem) {
    console.log('Updating history:', historyItem);
    try {
      const db = await dbPromise;
      await db.put('history', historyItem);
      console.log('History updated successfully.');
      history.update(h => h.map(item => item.id === historyItem.id ? historyItem : item));
    } catch (error) {
      console.error('Error updating history:', error instanceof Error ? error.message : error);
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

  async function saveVariable(key: string, value: string) {
    console.log('Saving variable:', { key, value });
    try {
      const db = await dbPromise;
      await db.put('variables', { key, value });
      console.log('Variable saved successfully.');
    } catch (error) {
      console.error('Error saving variable:', error instanceof Error ? error.message : error);
    }
  }

  async function deleteVariableFromDb(key: string) {
    console.log('Deleting variable:', key);
    try {
      const db = await dbPromise;
      await db.delete('variables', key);
      console.log('Variable deleted successfully.');
    } catch (error) {
      console.error('Error deleting variable:', error instanceof Error ? error.message : error);
    }
  }

  async function loadVariables() {
    console.log('Loading variables...');
    try {
      const db = await dbPromise;
      const allVariables = await db.getAll('variables');
      const variablesObject = Object.fromEntries(allVariables.map(v => [v.key, v.value]));
      variables.set(variablesObject);
    } catch (error) {
      console.error('Failed to load variables:', error instanceof Error ? error.message : error);
    }
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
    headers.set(item.headers || []);
    params.set(item.params || []);
    response.set(item.response ? JSON.parse(item.response) : null);
  }

  function handleGroupSelect(group: string) {
    selectedGroup.set(group);
    modalOpen.set(false);
    loadHistory(group);
  }

  function clearInput(store: Writable<string>) {
    store.set('');
    headers.set([]);
    params.set([]);
    response.set(null);
  }

  function addVariable() {
    if ($newVariableKey && $newVariableValue) {
      variables.update(vars => ({ ...vars, [$newVariableKey]: $newVariableValue }));
      saveVariable($newVariableKey, $newVariableValue);
      newVariableKey.set('');
      newVariableValue.set('');
    }
  }

  function deleteVariable(key: string) {
    variables.update(vars => {
      const { [key]: _, ...rest } = vars;
      return rest;
    });
    deleteVariableFromDb(key);
  }

  onMount(() => {
    loadGroups();
    loadVariables(); // Load variables on mount
    response.subscribe(value => {
      if (value) {
        Prism.highlightAll();
      }
    });
  });

  $: $params, updateUrl(); // Update URL whenever params change
</script>

<style>
  /* Styles for the application */
  pre {
    background: var(--light-background);
    color: var(--primary-text);
    /* padding: 1em;
    border-radius: 5px; */
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

  .top-buttons {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .separator {
    width: 1px;
    height: 20px;
    background-color: #ccc;
  }

  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    border-radius: 0.375rem;
    cursor: pointer;
  }

  .btn-add {
    background-color: var(--primary);
    color: var(--background);
  }

  .btn-clear {
    background-color: var(--error);
    color: var(--background);
  }

  .variables-panel {
    padding: 1rem;
    border: 1px solid #ccc;
    margin-top: 1rem;
    border-radius: 0.5rem;
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
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold mb-2">{$selectedGroup}</h3>
          <button type="button" on:click={() => variablesPanelOpen.set(true)} class="text-">
            <FontAwesomeIcon icon="edit" size="lg" /> Variables
          </button>
        </div>
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
                <FontAwesomeIcon icon="clone" size="lg" />
              </button>
              <button 
                class="delete-icon text-red-500" 
                aria-label="Delete history item" 
                on:click={() => deleteHistoryItem(item.id)}
                on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') deleteHistoryItem(item.id); }}
              >
                <FontAwesomeIcon icon="trash-alt" size="lg" />
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
        <div class="top-buttons">
          <button type="button" on:click={addParam} class="">
            <FontAwesomeIcon icon="plus" size="lg"/> Add
          </button>
          <span class="separator"></span>
          <button type="button" on:click={clearParams} class="text-red-700">
            <FontAwesomeIcon icon="trash-alt" size="lg" /> Delete All
          </button>
        </div>
        <div class="params-container">
          {#each $params as param, index}
            <div class="header-row">
              <input type="text" placeholder="Key" bind:value={param.key} class="flex-1 p-2 border rounded text-primary bg-accent mr-2" />
              <input type="text" placeholder="Value" bind:value={param.value} class="flex-1 p-2 border rounded text-primary bg-accent" />
              <button type="button" on:click={() => params.update(p => p.filter((_, i) => i !== index))} class="text-red-500">
                <FontAwesomeIcon icon="trash-alt" size="lg" />
              </button>
            </div>
          {/each}
        </div>
      {:else if $selectedRequestTab === 'headers'}
        <div class="top-buttons">
          <button type="button" on:click={addHeader} class="">
            <FontAwesomeIcon icon="plus" size="lg"/> Add
          </button>
          <span class="separator"></span>
          <button type="button" on:click={clearHeaders} class="text-red-700">
            <FontAwesomeIcon icon="trash-alt" size="lg" /> Delete All
          </button>
        </div>
        <div class="header-container">
          {#each $headers as header, index}
            <div class="header-row">
              <input type="text" placeholder="Key" bind:value={header.key} class="flex-1 p-2 border rounded text-primary bg-accent mr-2" />
              <input type="text" placeholder="Value" bind:value={header.value} class="flex-1 p-2 border rounded text-primary bg-accent" />
              <button type="button" on:click={() => headers.update(h => h.filter((_, i) => i !== index))} class="text-red-500">
                <FontAwesomeIcon icon="trash-alt" size="lg" />
              </button>
            </div>
          {/each}
        </div>
      {:else if $selectedRequestTab === 'group'}
        <div class="mb-4">
      
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
        <button 
          type="button" 
          class="tab { $selectedTab === 'curl' ? 'active' : '' }" 
          on:click={() => selectedTab.set('curl')} 
          aria-label="Curl Command Tab"
        >
          Curl Command
        </button>
      </div>
      <div class="tab-content">
        {#if $selectedTab === 'response'}
          <pre class="bg-secondary text-background p-2 rounded">
            {@html formatJson($response.body)}
          </pre>
        {:else if $selectedTab === 'headers'}
          <table>
            {#each $response.headers as [key, value]}
              <tr>
                <td>{key}</td>
                <td>{value}</td>
              </tr>
            {/each}
          </table>
        {:else if $selectedTab === 'curl'}
          <span class="p-2 rounded">
            {@html $response.curl_command}
          </span>
        {/if}
      </div>
    {:else}
      <div>No response</div>
    {/if}
  </div>

  {#if $variablesPanelOpen}
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div class="variables-panel bg-white p-4 rounded shadow-lg">
        <h2 class="text-xl font-bold mb-4">Variables</h2>
        <div class="flex mb-4">
          <input type="text" placeholder="Key" bind:value={$newVariableKey} class="flex-1 p-2 border rounded text-primary bg-accent mr-2" />
          <input type="text" placeholder="Value" bind:value={$newVariableValue} class="flex-1 p-2 border rounded text-primary bg-accent mr-2" />
          <button type="button" on:click={addVariable} class="flex items-center">
            <FontAwesomeIcon icon="plus" size="lg" class="mr-2" />Add
          </button>
        </div>
        
        <ul>
          {#each Object.entries($variables) as [key, value]}
            <li class="mb-2 flex justify-between items-center">
              <strong class="text-primary">{key}:</strong> <span class="text-secondary">{value}</span>
              <button type="button" on:click={() => deleteVariable(key)} class="text-red-500">
                <FontAwesomeIcon icon="trash-alt"/> 
              </button>
            </li>
          {/each}
        </ul>
        <button type="button" on:click={() => variablesPanelOpen.set(false)} class="">Close Panel</button>
      </div>
    </div>
  {/if}
</div>
