<script lang="ts">
    import { writable } from 'svelte/store';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
    import { faClose } from '@fortawesome/free-solid-svg-icons';
  
    export let showSettings = writable(false);
    export let requestTimeout = writable(Number(localStorage.getItem('requestTimeout')) || 30000);
  
    $: {
      if ($requestTimeout) {
        localStorage.setItem('requestTimeout', String($requestTimeout));
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
  </style>
  
  <div class="settings-modal" on:click|stopPropagation="{closeSettings}">
    <div class="settings-content" on:click|stopPropagation>
      <button class="close-button" on:click="{closeSettings}">
        <FontAwesomeIcon icon={faClose} />
      </button>
      <h2>Settings</h2>
      <div class="field">
        <label for="timeout">Request Timeout (seconds):</label>
        <input
          id="timeout"
          type="number"
          min="1"
          value={$requestTimeout / 1000}
          on:input={updateTimeout}
        />
      </div>
    </div>
  </div>
  