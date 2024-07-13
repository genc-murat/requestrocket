<script lang="ts">
  import { onMount, onDestroy, afterUpdate } from 'svelte';
  import JSONEditor from 'jsoneditor';
  import type { JSONEditorOptions, JSONEditorMode } from 'jsoneditor';
  import 'jsoneditor/dist/jsoneditor.css';

  export let jsonData: string = '{}';
  export let mode: JSONEditorMode = 'code';
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
      modes: ['code','tree' ,'text'],
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
    background-color: var(--surface);
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

  /* Code mode styles */
  :global(.ace-jsoneditor) {
    background-color: var(--surface) !important;
    color: var(--primary-text) !important;
  }

  :global(.ace-jsoneditor .ace_scroller) {
    background-color: var(--surface) !important;
  }

  :global(.ace-jsoneditor .ace_gutter) {
    background-color: var(--light-background) !important;
    color: var(--secondary-text) !important;
  }

  :global(.ace-jsoneditor .ace_string) {
    color: var(--info) !important;
  }

  :global(.ace-jsoneditor .ace_constant.ace_numeric) {
    color: var(--warning) !important;
  }

  :global(.ace-jsoneditor .ace_constant.ace_boolean) {
    color: var(--success) !important;
  }

  :global(.ace-jsoneditor .ace_variable) {
    color: var(--primary) !important;
  }

  :global(.jsoneditor-mode-code) {
    background-color: var(--surface) !important;
  }

  /* Hide "powered by ace" link */
  :global(.jsoneditor-poweredBy) {
    display: none !important;
  }

  /* Adjust scrollbar styles for better visibility */
  :global(.ace_scrollbar::-webkit-scrollbar) {
    width: 8px;
    height: 8px;
  }

  :global(.ace_scrollbar::-webkit-scrollbar-track) {
    background: var(--light-background);
  }

  :global(.ace_scrollbar::-webkit-scrollbar-thumb) {
    background-color: var(--secondary);
    border-radius: 4px;
  }

  :global(.ace_scrollbar::-webkit-scrollbar-thumb:hover) {
    background-color: var(--primary);
  }
</style>