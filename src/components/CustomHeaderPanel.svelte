<script lang="ts">
  import {
    customHeaders,
    newCustomHeaderName,
    addCustomHeader,
    deleteCustomHeader,
    closeCustomHeaderPanel,
  } from "./CustomHeaderModule";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import {
    faPlus,
    faTrashAlt,
    faClose,
  } from "@fortawesome/free-solid-svg-icons";

  function handleAddCustomHeader() {
    if ($newCustomHeaderName) {
      addCustomHeader($newCustomHeaderName);
      newCustomHeaderName.set("");
    }
  }
</script>

<div
  class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
>
  <div class="variables-panel bg-white p-4 rounded shadow-lg relative">
    <h2 class="text-xl font-bold mb-4">Custom Headers</h2>
    <div class="flex mb-4">
      <input
        type="text"
        placeholder="New Header Name"
        bind:value={$newCustomHeaderName}
        class="flex-1 p-2 border rounded text-primary bg-accent mr-2"
      />
      <button
        type="button"
        on:click={handleAddCustomHeader}
        class="flex items-center"
      >
        <FontAwesomeIcon icon={faPlus} size="lg" class="mr-2" />Add
      </button>
    </div>

    <ul>
      {#each $customHeaders as header}
        <li class="mb-2 flex justify-between items-center">
          <span class="text-primary">{header.name}</span>
          <button
            type="button"
            on:click={() => deleteCustomHeader(header.id)}
            class="text-red-500"
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
        </li>
      {/each}
    </ul>
    <button
      type="button"
      on:click={closeCustomHeaderPanel}
      class="text-red-900 bg-slate-50 rounded-full p-2 shadow absolute top-4 right-4 flex items-center justify-center"
    >
      <FontAwesomeIcon icon={faClose} size="lg" />
    </button>
  </div>
</div>
