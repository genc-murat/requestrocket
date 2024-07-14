<script lang="ts">
  import { writable } from "svelte/store";
  import { onDestroy } from "svelte";

  type Option = {
    value: string;
    label: string;
  };

  export let selected = writable("json");
  let isOpen = writable(false);
  let options: Option[] = [
    { value: "json", label: "JSON" },
    { value: "xml", label: "XML" },
  ];

  function toggleDropdown() {
    isOpen.update((n) => !n);
  }

  function selectOption(option: Option) {
    selected.set(option.value);
    isOpen.set(false);
  }

  function handleClickOutside(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest(".dropdown")) {
      isOpen.set(false);
    }
  }

  window.addEventListener("click", handleClickOutside);

  onDestroy(() => {
    window.removeEventListener("click", handleClickOutside);
  });
</script>

<div class="dropdown">
  <div class="dropdown-button" on:click={toggleDropdown} tabindex="0">
    {#if $selected}
      {#each options as option}
        {#if option.value === $selected}
          {option.label}
        {/if}
      {/each}
    {/if}
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
      {#each options as option (option.value)}
        <div
          class="dropdown-item {option.value === $selected ? 'selected' : ''}"
          on:click={() => selectOption(option)}
        >
          {option.label}
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .dropdown {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  .dropdown-button {
    width: 100%;
    background-color: var(--secondary);
    color: var(--light-background);
    font-weight: bold;
    padding: 0.5rem;
    font-size: 0.9rem;
    border: 1px solid var(--divider);
    border-radius: 0.375rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition:
      border-color 0.3s ease-in-out,
      box-shadow 0.3s ease-in-out;
    height: 2.3rem;
    line-height: 2.3rem;
  }

  .dropdown-button:focus {
    border-color: var(--secondary);
    outline: none;
    box-shadow: 0 0 0 3px rgba(23, 162, 184, 0.3);
  }

  .dropdown-content {
    position: absolute;
    top: calc(100% - 1.25rem);
    left: 0;
    width: 100%;
    background-color: var(--light-background);
    border: 1px solid var(--divider);
    border-radius: 0.375rem;
    z-index: 1000;
    max-height: 200px;
    overflow-y: auto;
  }

  .dropdown-item {
    padding: 0.5rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .dropdown-item:hover {
    background-color: var(--secondary);
    color: var(--light-background);
  }

  .dropdown-item.selected {
    background-color: var(--info);
    color: var(--light-background);
  }

  .dropdown-button svg {
    width: 1rem;
    height: 1rem;
  }
</style>
