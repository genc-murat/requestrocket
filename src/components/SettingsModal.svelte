<script lang="ts">
  import { writable } from "svelte/store";
  import Icon from "@iconify/svelte";

  export let showSettings = writable(false);
  export let requestTimeout = writable(
    Number(localStorage.getItem("requestTimeout")) || 30000,
  );

  $: {
    if ($requestTimeout) {
      localStorage.setItem("requestTimeout", String($requestTimeout));
    }
  }

  function closeSettings() {
    showSettings.set(false);
  }

  function updateTimeout(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    requestTimeout.set(Number(value) * 1000); // Convert to milliseconds
  }
</script>

{#if $showSettings}
  <div class="settings-modal" on:click|stopPropagation={closeSettings}>
    <div class="settings-content" on:click|stopPropagation>
      <button
        type="button"
        style="box-shadow: 0 7px 12px rgba(0, 0, 0, 0.3);"
        class="close-button rounded-full p-1 shadow-lg absolute top-1 right-1 flex items-center justify-center"
        on:click={closeSettings}
      >
        <Icon icon="eva:close-fill" width="20" height="20" />
      </button>
      <h2 class="text-lg font-bold mb-4 text-neutral-950">Settings</h2>
      <div class="field">
        <label for="timeout">Request Timeout (seconds):</label>
        <input
          id="timeout"
          type="number"
          min="1"
          value={$requestTimeout / 1000}
          on:input={updateTimeout}
          class="p-2 border rounded text-primary bg-accent"
        />
      </div>
    </div>
  </div>
{/if}

<style>
  .settings-modal {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    z-index: 50;
  }

  .settings-content {
    background: white;
    padding: 2rem;
    border-radius: 0.5rem;
    width: 400px;
    max-width: 90%;
    position: relative;
  }

  .close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    cursor: pointer;
  }

  .field {
    margin-top: 1rem;
  }

  .field label {
    display: block;
    margin-bottom: 0.5rem;
  }

  .field input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
  }
</style>
