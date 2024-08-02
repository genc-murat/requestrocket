<script lang="ts">
  import { createEventDispatcher, onMount } from "svelte";
  import type { HistoryItem } from "./api-types";
  import { diffJson, diffLines } from "diff";
  import type { Change } from "diff";
  import Prism from "prismjs";
  import "prismjs/components/prism-json";

  export let leftItem: HistoryItem;
  export let rightItem: HistoryItem;

  const dispatch = createEventDispatcher();

  let diffResults: { [key: string]: Change[] } = {};
  const fields = ["body", "curl_command", "duration", "error", "headers"];
  let activeTab = "body";

  onMount(() => {
    fields.forEach((field) => {
      diffResults[field] = getDiff(field);
    });
  });

  function getDiff(field: string): Change[] {
    try {
      const leftContent = leftItem.response
        ? JSON.parse(leftItem.response)[field]
        : "";
      const rightContent = rightItem.response
        ? JSON.parse(rightItem.response)[field]
        : "";

      if (field === "body") {
        const leftFormatted = JSON.stringify(JSON.parse(leftContent), null, 2);
        const rightFormatted = JSON.stringify(
          JSON.parse(rightContent),
          null,
          2,
        );
        return diffLines(leftFormatted, rightFormatted);
      } else if (
        typeof leftContent === "string" &&
        typeof rightContent === "string"
      ) {
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
    return Prism.highlight(json, Prism.languages.json, "json");
  }

  function closeModal() {
    dispatch("close");
  }
</script>

<div class="diff-viewer">
  <div class="diff-header">
    <h2>Response Differences</h2>
    <button on:click={closeModal} class="close-button" aria-label="Close"
      >×</button
    >
  </div>

  <div class="tabs">
    {#each fields as field}
      <button
        class="tab-button {activeTab === field ? 'active' : ''}"
        on:click={() => (activeTab = field)}
      >
        {field}
      </button>
    {/each}
  </div>

  <div class="diff-content">
    {#each fields as field}
      {#if activeTab === field}
        <div class="panel diff-panel {field}">
          <div class="diff-result">
            {#if Array.isArray(diffResults[field])}
              {#each diffResults[field] as part}
                <div
                  class="diff-line {part.added
                    ? 'added'
                    : part.removed
                      ? 'removed'
                      : 'unchanged'}"
                >
                  <span class="line-indicator"
                    >{part.added ? "+" : part.removed ? "-" : " "}</span
                  >
                  {#if field === "body" || field === "headers"}
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
      {/if}
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

  
  .tabs {
    display: flex;
    background-color: var(--surface);
    border-bottom: 1px solid var(--divider);
  }

  .tab-button {
    padding: 0.5rem 1rem;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 1rem;

    transition: all 0.3s ease;
  }

  .tab-button.active {
    color: var(--primary-text);
    border-bottom: 2px solid var(--primary);
  }

  .diff-content {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  .panel {
    height: 100%;
  }

  .diff-result {
    font-family: monospace;
    font-size: 0.7rem;
    line-height: 1.5;
    border: 1px solid var(--divider);
    border-radius: 4px;
    overflow: auto;
    height: 100%;
  }

  .diff-line {
    display: flex;
    padding: 5px 0;
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
    font-weight: bold;
  }

  .diff-line.removed {
    background-color: rgba(255, 0, 0, 0.1);
    font-weight: bold;
  }

  .diff-line.added .line-indicator {
    color: var(--success);
    font-weight: bold;
  }

  .diff-line.removed .line-indicator {
    color: var(--error);
    font-weight: bold;
  }

  .error {
    color: var(--error);
    padding: 0.5rem;
  }

  /* Prism.js tema ayarları */
  :global(.token.property) {
    color: #f8c555;
  }
  :global(.token.string) {
    color: var(--dark-text);
  }
  :global(.token.number) {
    color: #f08d49;
  }
  :global(.token.boolean) {
    color: #ff8b50;
  }
  :global(.token.null) {
    color: #ff8b50;
  }
</style>
