<script lang="ts">
    import { writable } from 'svelte/store';
    import { invoke } from '@tauri-apps/api/tauri';
  
    type HistoryItem = {
      url: string;
      method: string;
      body: string;
      response: string;
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
    let response = writable<ResponseData | null>(null);
    let history = writable<HistoryItem[]>([]);
    let selectedTab = writable('response');
  
    async function sendRequest() {
      const requestData = {
        url: $url,
        method: $method,
        body: $method === 'GET' ? null : $body
      };
  
      try {
        const res: ResponseData = await invoke<ResponseData>('send_request', { requestData });
        response.set(res);
  
        // Geçmişe kaydet
        history.update(h => [...h, { url: $url, method: $method, body: $body, response: JSON.stringify(res) }]);
      } catch (error) {
        response.set(null);
      }
    }
  </script>
  
  <style>
    .tab {
      cursor: pointer;
      padding: 0.5rem 1rem;
      margin-right: 0.5rem;
      border: 1px solid #ccc;
      border-bottom: none;
      background: #f7f7f7;
    }
    .tab.active {
      background: white;
      border-bottom: 1px solid white;
    }
    .tab-content {
      border: 1px solid #ccc;
      padding: 1rem;
      background: white;
    }
  </style>
  
  <div class="flex h-screen">
    <div class="w-1/5 bg-gray-100 border-r border-gray-300 p-4">
      <h2 class="text-xl font-bold mb-4">History</h2>
      <ul>
        {#each $history as item}
          <li class="mb-2">
            <strong>{item.method}</strong> {item.url}
          </li>
        {/each}
      </ul>
    </div>
  
    <div class="w-2/5 border-r border-gray-300 p-4">
      <h2 class="text-xl font-bold mb-4">Request</h2>
      <label for="url" class="block mb-2">URL</label>
      <input type="text" id="url" bind:value={$url} placeholder="https://api.example.com/data" class="w-full mb-4 p-2 border rounded" />
  
      <label for="method" class="block mb-2">Method</label>
      <select id="method" bind:value={$method} class="w-full mb-4 p-2 border rounded">
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
      </select>
  
      <label for="body" class="block mb-2">Body</label>
      <textarea id="body" bind:value={$body} placeholder='{'{'}"key": "value"{'}'}' class="w-full mb-4 p-2 border rounded"></textarea>
  
      <button on:click={sendRequest} class="w-full p-2 bg-blue-500 text-white rounded">Send Request</button>
    </div>
  
    <div class="w-2/5 bg-gray-100 p-4">
      <h2 class="text-xl font-bold mb-4">Results</h2>
      {#if $response}
        <div class="mb-4">
          <div>Status Code: {$response.status}</div>
          <div>Duration: {$response.duration} ms</div>
          <div>Size: {$response.size} bytes</div>
        </div>
        <div class="flex mb-4">
          <div
            class="tab { $selectedTab === 'response' ? 'active' : '' }"
            on:click={() => selectedTab.set('response')}
          >
            Response
          </div>
          <div
            class="tab { $selectedTab === 'headers' ? 'active' : '' }"
            on:click={() => selectedTab.set('headers')}
          >
            Headers
          </div>
        </div>
        <div class="tab-content">
          {#if $selectedTab === 'response'}
            <pre class="bg-gray-200 p-2 rounded">{$response.body}</pre>
          {:else}
            <pre class="bg-gray-200 p-2 rounded">
              {#each $response.headers as [key, value]}
                {key}: {value}\n
              {/each}
            </pre>
          {/if}
        </div>
      {:else}
        <div>No response</div>
      {/if}
    </div>
  </div>
  