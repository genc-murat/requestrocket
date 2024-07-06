<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
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
  };

  type Header = {
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
  let body = writable('');
  let headers = writable<Header[]>([]);
  let bodyType = writable('json'); // 'json', 'xml', 'form-data', 'form-urlencoded'
  let formData = writable<Header[]>([{ key: '', value: '' }]); // Used for form-data and form-urlencoded
  let response = writable<ResponseData | null>(null);
  let history = writable<HistoryItem[]>([]);
  let selectedTab = writable('response');

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

      // Save to history
      const newHistoryItem: HistoryItem = { id: Date.now(), url: $url, method: $method, body: $body, response: JSON.stringify(res) };
      history.update(h => {
        const newHistory = [...h, newHistoryItem];
        saveHistory(newHistoryItem); // Save history to IndexedDB
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

  async function loadHistory() {
    console.log('Loading history...');
    try {
      const db = await dbPromise;
      const allHistoryItems = await db.getAll('history');
      console.log('Saved history:', allHistoryItems);
      history.set(allHistoryItems);
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
    } catch (error) {
      console.error('Error deleting history item:', error instanceof Error ? error.message : error);
    }
  }

  function getStatusColor(status: number): string {
    if (status >= 200 && status < 300) {
      return 'text-green-500';
    } else if (status >= 300 && status < 400) {
      return 'text-blue-500';
    } else if (status >= 400 && status < 500) {
      return 'text-yellow-500';
    } else if (status >= 500) {
      return 'text-red-500';
    } else {
      return 'text-gray-500';
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
    // Reset headers and form data
    headers.set([]);
    formData.set([{ key: '', value: '' }]);
    response.set(JSON.parse(item.response));
  }

  onMount(() => {
    loadHistory(); // Load history from IndexedDB on mount
    response.subscribe(value => {
      if (value) {
        Prism.highlightAll();
      }
    });
  });
</script>

<style>
 pre {
  background: #f5f5f5; /* match the theme */
  color: #ccc; /* match the theme */
  padding: 1em;
  border-radius: 5px;
}
</style>

<div class="flex h-screen">
  <div class="history-panel panel">
    <h2 class="text-xl font-bold mb-4">History</h2>
    <ul>
      {#each $history as item}
        <li class="mb-2 history-item flex justify-between items-center">
          <button type="button" class="w-full text-left" on:click={() => selectHistoryItem(item)}>
            <strong class="px-2 py-1 rounded {item.method === 'GET' ? 'bg-green-500' : ''} {item.method === 'POST' ? 'bg-blue-500' : ''} {item.method === 'PUT' ? 'bg-yellow-500' : ''} {item.method === 'DELETE' ? 'bg-red-500' : ''} text-white">
              {item.method}
            </strong> <span class="url">{item.url}</span>
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

  <div class="request-panel panel">
    <h2 class="text-xl font-bold mb-4">Request</h2>
    <div class="flex mb-4">
      <select id="method" bind:value={$method} class="p-2 border rounded text-primary bg-accent mr-2">
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
      </select>
      <input type="text" id="url" bind:value={$url} placeholder="https://api.example.com/data" class="flex-1 p-2 border rounded text-primary bg-accent" />
    </div>
    <div class="mb-4">
      <label for="bodyType" class="block mb-2">Body Type</label>
      <select id="bodyType" bind:value={$bodyType} class="w-full mb-4 p-2 border rounded text-primary bg-accent">
        <option value="json">JSON</option>
        <option value="xml">XML</option>
        <option value="form-data">Form Data</option>
        <option value="form-urlencoded">Form URL Encoded</option>
      </select>
      <div class="tab-content">
        {#if $bodyType === 'json' || $bodyType === 'xml'}
          <textarea id="body" bind:value={$body} placeholder={$bodyType === 'json' ? '{"key": "value"}' : '<xml></xml>'} class="w-full mb-4 p-2 border rounded text-primary bg-accent"></textarea>
        {:else}
          {#each $formData as field, index}
            <div class="flex mb-2">
              <input type="text" placeholder="Key" bind:value={field.key} class="flex-1 p-2 border rounded text-primary bg-accent mr-2" />
              <input type="text" placeholder="Value" bind:value={field.value} class="flex-1 p-2 border rounded text-primary bg-accent" />
            </div>
          {/each}
          <button type="button" on:click={addFormField} class="w-full p-2 bg-primary text-background rounded">Add Field</button>
        {/if}
      </div>
    </div>
    <button type="button" on:click={sendRequest} class="button">Send Request</button>
  </div>

  <div class="response-panel panel">
    <h2 class="text-xl font-bold mb-4">Results</h2>
    {#if $response}
      <div class="flex space-x-4 mb-4">
        <div class="flex-1">
          <div>Status Code: <span class="{getStatusColor($response.status)}">{$response.status}</span></div>
        </div>
        <div class="flex-1">
          <div>Duration: {$response.duration} ms</div>
        </div>
        <div class="flex-1">
          <div>Size: {$response.size} bytes</div>
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
