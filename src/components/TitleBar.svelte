<script lang="ts">
    import { appWindow } from '@tauri-apps/api/window';
  
    async function minimize() {
      await appWindow.minimize();
    }
  
    async function maximize() {
      await appWindow.toggleMaximize();
    }
  
    async function close() {
      await appWindow.close();
    }
  </script>
  
  <style>
    .titlebar {
      background-color: var(--background);
      color: var(--primary-text);
      padding: 0.5rem 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--divider);
    }
  
    .titlebar .title {
      -webkit-app-region: drag; /* Bu alanlarda pencere taşınabilir */
    }
  
    .titlebar .buttons {
      display: flex;
      gap: 0.5rem;
      -webkit-app-region: no-drag; /* Bu alanlarda pencere taşınamaz */
    }
  
    .titlebar button {
      background: none;
      border: none;
      color: var(--primary-text);
      cursor: pointer;
      font-size: 1rem;
    }
  
    .titlebar button:hover {
      color: var(--error);
    }
  </style>
  
  <div data-tauri-drag-region class="titlebar">
    <div class="title">Your App Title</div>
    <div class="buttons">
      <button on:click={minimize}>_</button>
      <button on:click={maximize}>[]</button>
      <button on:click={close}>×</button>
    </div>
  </div>
  