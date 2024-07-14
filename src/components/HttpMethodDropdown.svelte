<script lang="ts">
    import { writable } from "svelte/store";
    import { onDestroy } from 'svelte';
  
    export let method = writable("GET");
    let isOpen = writable(false);
    let options = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"];
  
    function toggleDropdown() {
      isOpen.update((n) => !n);
    }
  
    function selectOption(option: string) {
      method.set(option);
      isOpen.set(false);
    }
  
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target as HTMLElement).closest('.dropdown')) {
        isOpen.set(false);
      }
    }
  
    window.addEventListener('click', handleClickOutside);
  
    onDestroy(() => {
      window.removeEventListener('click', handleClickOutside);
    });
  </script>
  
  <style>
    .dropdown {
      position: relative;
      display: inline-block;
      width: 17%;
    }
  
    .dropdown-button {
      width: 100%;
      background-color: var(--secondary);
      color: var(--light-background);
      font-weight: bold;
      padding: 0 0.5rem;
      font-size: 0.75rem;
      border: 1px solid var(--divider);
      border-radius: 0.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      transition: border-color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
      height: 2.3rem; /* Input yüksekliği ile aynı */
      line-height: 2.3rem; /* Input yüksekliği ile aynı */
    }
  
    .dropdown-button:focus {
      border-color: var(--info);
      outline: none;
      box-shadow: 0 0 0 3px rgba(23, 162, 184, 0.3);
    }
  
    .dropdown-content {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      background-color: var(--surface);
      border: 1px solid var(--divider);
      border-radius: 0.25rem;
      z-index: 1;
      max-height: 200px;
      overflow-y: auto;
    }
  
    .dropdown-item {
      padding: 0.25rem 0.5rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }
  
    .dropdown-item:hover {
      background-color: var(--light-background);
    }
  
    .dropdown-button svg {
      width: 1rem; /* İkon boyutu küçültüldü */
      height: 1rem; /* İkon boyutu küçültüldü */
    }
  </style>
  
  <div class="dropdown">
    <div class="dropdown-button" on:click={toggleDropdown} tabindex="0">
      {#if $method} { $method } {/if}
      <svg
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        ></path>
      </svg>
    </div>
    {#if $isOpen}
      <div class="dropdown-content">
        {#each options as option}
          <div class="dropdown-item" on:click={() => selectOption(option)}>
            {option}
          </div>
        {/each}
      </div>
    {/if}
  </div>
  