<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { HistoryItem } from './api-types';
  import { diffJson, diffLines } from 'diff';
  import type { Change } from 'diff';
  import Prism from 'prismjs';
  import 'prismjs/components/prism-json';

  export let leftItem: HistoryItem;
  export let rightItem: HistoryItem;

  const dispatch = createEventDispatcher();

  let diffResults: { [key: string]: Change[] } = {};
  const fields = ['body', 'curl_command', 'duration', 'error', 'headers'];

  onMount(() => {
    fields.forEach(field => {
      diffResults[field] = getDiff(field);
    });
  });

  function getDiff(field: string): Change[] {
    try {
      const leftContent = leftItem.response ? JSON.parse(leftItem.response)[field] : '';
      const rightContent = rightItem.response ? JSON.parse(rightItem.response)[field] : '';

      if (field === 'body') {
        const leftFormatted = JSON.stringify(JSON.parse(leftContent), null, 2);
        const rightFormatted = JSON.stringify(JSON.parse(rightContent), null, 2);
        return diffLines(leftFormatted, rightFormatted);
      } else if (typeof leftContent === 'string' && typeof rightContent === 'string') {
        return diffLines(leftContent, rightContent);
      } else {
        return diffJson(leftContent || {}, rightContent || {});
      }
    } catch (error) {
      console.error(`Error parsing ${field}:`, error);
      return [];
    }
  }

  function highlightJson(json: string): string {
    return Prism.highlight(json, Prism.languages.json, 'json');
  }

  function closeModal() {
    dispatch('close');
  }
</script>


<div class="diff-viewer">
  <div class="diff-header">
    <h2>Response Differences</h2>
    <button on:click={closeModal} class="close-button" aria-label="Close">×</button>
  </div>

  <div class="diff-content">
    {#each fields as field}
      <div class="panel diff-panel {field}">
        <h3>{field}</h3>
        <div class="diff-result">
          {#if Array.isArray(diffResults[field])}
            {#each diffResults[field] as part}
              <div class="diff-line {part.added ? 'added' : part.removed ? 'removed' : 'unchanged'}">
                <span class="line-indicator">{part.added ? '+' : part.removed ? '-' : ' '}</span>
                {#if field === 'body' || field === 'headers'}
                  <pre><code>{@html highlightJson(part.value)}</code></pre>
                {:else}
                  <pre><code>{part.value}</code></pre>
                {/if}
              </div>
            {/each}
          {:else}
            <div class="error">No diff available for this field.</div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .diff-viewer {
    background-color: var(--background);
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    width: 1280px;
    height: 1024px;
    overflow: hidden;
    margin: auto;
  }

  .diff-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background-color: var(--surface);
    border-bottom: 1px solid var(--divider);
  }

  .diff-header h2 {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary-text);
  }

  .close-button {
    background: none;
    border: none;
    cursor: pointer;
    color: var(--secondary-text);
    font-size: 1.5rem;
    transition: color 0.3s ease;
  }

  .close-button:hover {
    color: var(--primary-text);
  }

  .diff-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  .panel {
    margin-bottom: 2rem;
  }

  .panel h3 {
    font-size: 1.2rem;
    color: var(--dark-text);
    margin-bottom: 0.5rem;
    text-transform: capitalize;
  }

  .diff-result {
    font-family: monospace;
    font-size: 0.9rem;
    line-height: 1.5;
    border: 1px solid var(--divider);
    border-radius: 4px;
    overflow: auto;
  }

  .panel.body .diff-result {
    max-height: 98%;
  }

  .panel.headers .diff-result {
    max-height: 98%;
  }

  /* Yeni eklenen stiller */
  .panel.error,
  .panel.duration,
  .panel.curl_command {
    height: auto;
  }

  .panel.error .diff-result,
  .panel.duration .diff-result,
  .panel.curl_command .diff-result {
    max-height: none;
    height: auto;
  }

  .diff-line {
    display: flex;
    padding: 2px 0;
    transition: background-color 0.2s ease;
  }

  .diff-line:hover {
    background-color: var(--hover-background);
  }

  .line-indicator {
    flex: 0 0 20px;
    text-align: center;
    user-select: none;
  }

  .diff-line pre {
    margin: 0;
    padding: 0 0.5rem;
    white-space: pre-wrap;
    word-break: break-all;
    flex: 1;
  }

  .diff-line code {
    font-family: inherit;
  }

  .diff-line.added {
    background-color: rgba(0, 255, 0, 0.1);
  }

  .diff-line.removed {
    background-color: rgba(255, 0, 0, 0.1);
  }

  .diff-line.added .line-indicator {
    color: green;
  }

  .diff-line.removed .line-indicator {
    color: red;
  }

  .error {
    color: var(--error-color);
    padding: 0.5rem;
  }

  /* Prism.js tema ayarları */
  :global(.token.property) { color: #f8c555; }
  :global(.token.string) { color: #7ec699; }
  :global(.token.number) { color: #f08d49; }
  :global(.token.boolean) { color: #ff8b50; }
  :global(.token.null) { color: #ff8b50; }
</style>