<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { invoke } from '@tauri-apps/api/tauri';
  import { writeTextFile, readTextFile, BaseDirectory } from '@tauri-apps/api/fs';
  import Prism from 'prismjs';
  import 'prismjs/components/prism-json';
  import 'prismjs/themes/prism-solarizedlight.css';

  type HistoryItem = {
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

  function addHeader() {
    headers.update(h => [...h, { key: '', value: '' }]);
  }

  function addFormField() {
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
      const newHistoryItem: HistoryItem = { url: $url, method: $method, body: $body, response: JSON.stringify(res) };
      history.update(h => {
        const newHistory = [...h, newHistoryItem];
        saveHistory(newHistory); // Save history to local storage
        return newHistory;
      });
    } catch (error) {
      console.error('Request failed:', error);
      response.set(null);
    }
  }

  async function saveHistory(history: HistoryItem[]) {
    console.log('Saving history:', history);
    await writeTextFile('request-history.json', JSON.stringify(history), { dir: BaseDirectory.App });
  }

  async function loadHistory() {
    console.log('Loading history...');
    try {
      const savedHistory = await readTextFile('request-history.json', { dir: BaseDirectory.App });
      console.log('Saved history:', savedHistory);
      if (savedHistory) {
        history.set(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
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
    loadHistory(); // Load history from local storage on mount
    response.subscribe(value => {
      if (value) {
        Prism.highlightAll();
      }
    });
  });
</script>

<style>
  pre {
    background: #2d2d2d; /* match the theme */
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
        <li class="mb-2">
          <button type="button" class="w-full text-left" on:click={() => selectHistoryItem(item)}>
            <strong class="px-2 py-1 rounded {item.method === 'GET' ? 'bg-green-500' : ''} {item.method === 'POST' ? 'bg-blue-500' : ''} {item.method === 'PUT' ? 'bg-yellow-500' : ''} {item.method === 'DELETE' ? 'bg-red-500' : ''} text-white">
              {item.method}
            </strong> <span class="url">{item.url}</span>
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
