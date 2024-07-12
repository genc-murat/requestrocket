<script lang="ts">
  import { onMount, onDestroy, afterUpdate } from 'svelte';
  import JSONEditor from 'jsoneditor';
  import type { JSONEditorOptions, JSONEditorMode } from 'jsoneditor';
  import 'jsoneditor/dist/jsoneditor.css';

  export let jsonData: string = '{}';
  export let mode: JSONEditorMode = 'tree';

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
</script>

<div bind:this={editorContainer} class="editor-container"></div>

<style>
  .editor-container {
    height: 100%;
  }
</style>
