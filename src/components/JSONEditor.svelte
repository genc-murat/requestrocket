<script lang="ts">
  import { onMount, onDestroy, afterUpdate } from 'svelte';
  import JSONEditor from 'jsoneditor';
  import type { JSONEditorOptions, JSONEditorMode } from 'jsoneditor';
  import 'jsoneditor/dist/jsoneditor.css';

  export let jsonData: string = '{}';
  export let mode: JSONEditorMode = 'tree';
  export let theme: 'light' | 'dark' = 'light';

  let editorContainer: HTMLElement;
  let editor: JSONEditor;

  function isValidJson(json: string): boolean {
    try {
      JSON.parse(json);
      return true;
    } catch {
      return false;
    }
  }

  onMount(() => {
    const options: JSONEditorOptions = {
      mode,
      modes: ['tree', 'code'],
    };
    editor = new JSONEditor(editorContainer, options);
    if (isValidJson(jsonData)) {
      editor.set(JSON.parse(jsonData));
    } else {
      editor.set({});
    }
  });

  onDestroy(() => {
    if (editor) {
      editor.destroy();
    }
  });

  afterUpdate(() => {
    if (editor) {
      if (isValidJson(jsonData)) {
        editor.update(JSON.parse(jsonData));
      } else {
        editor.update({});
      }
    }
  });

  $: {
    if (editorContainer) {
      editorContainer.classList.toggle('dark-theme', theme === 'dark');
    }
  }
</script>

<div bind:this={editorContainer} class="editor-container"></div>

<style>
  .editor-container {
    height: 100%;
  }

  :global(.jsoneditor) {
    border: 1px solid var(--divider);
    background-color: var(--surface);
  }

  :global(.jsoneditor-menu) {
    background-color: var(--primary);
    border-bottom: 1px solid var(--divider);
  }

  :global(.jsoneditor-menu button) {
    color: var(--secondary-text);
  }

  :global(.jsoneditor-menu button:hover) {
    background-color: var(--secondary);
  }

  :global(.jsoneditor-search input) {
    color: var(--primary-text);
  }

  :global(.jsoneditor-frame) {
    background-color: var(--surface);
    color: var(--primary-text);
  }

  :global(.jsoneditor-search div.jsoneditor-frame) {
    background: var(--surface);
  }

  :global(.jsoneditor-tree) {
    background-color: var(--surface);
    color: var(--primary-text);
  }

  :global(.jsoneditor-field) {
    color: var(--primary);
  }

  :global(.jsoneditor-value) {
    color: var(--secondary);
  }

  :global(.jsoneditor-readonly) {
    color: var(--secondary-text);
  }

  :global(.jsoneditor-empty) {
    background-color: var(--error);
  }

  :global(.jsoneditor-contextmenu .jsoneditor-menu) {
    background-color: var(--surface);
  }

  :global(.jsoneditor-contextmenu .jsoneditor-menu button) {
    background-color: var(--surface);
    color: var(--primary-text);
  }

  :global(.jsoneditor-contextmenu .jsoneditor-menu button:hover) {
    background-color: var(--secondary);
    color: var(--surface);
  }

  :global(.dark-theme) {
    --jse-theme-color: var(--primary);
    --jse-theme-color-highlight: var(--secondary);
    --jse-background-color: var(--background);
    --jse-text-color: var(--primary-text);
    --jse-selection-background-color: var(--secondary);
    --jse-selection-color: var(--surface);
    --jse-separator-color: var(--divider);
    --jse-key-color: var(--primary);
    --jse-value-color: var(--secondary);
    --jse-value-color-number: var(--info);
    --jse-value-color-boolean: var(--warning);
    --jse-value-color-null: var(--error);
    --jse-value-color-string: var(--success);
    --jse-value-color-url: var(--info);
    --jse-menu-color: var(--secondary-text);
    --jse-menu-button-color: var(--secondary-text);
    --jse-menu-button-background-color: var(--primary);
    --jse-menu-button-background-color-hover: var(--secondary);
  }

  :global(.dark-theme .jsoneditor-menu) {
    background-color: var(--primary);
    border-bottom: 1px solid var(--divider);
  }

  :global(.dark-theme .jsoneditor-menu button) {
    color: var(--secondary-text);
  }

  :global(.dark-theme .jsoneditor-menu button:hover) {
    background-color: var(--secondary);
  }
</style>