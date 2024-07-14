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
  class="fixed inset-0 flex items-center justify-center  bg-opacity-50"
>
  <div class="headers-panel p-8 rounded-lg shadow-2xl relative max-w-2xl w-full">
    <h2 class="text-2xl font-bold mb-6">Custom Headers</h2>
    <div class="flex mb-6">
      <input
        type="text"
        placeholder="New Header Name"
        bind:value={$newCustomHeaderName}
        class="flex-1 p-3 border rounded-lg text-primary bg-accent mr-4"
      />
      <button
        type="button"
        on:click={handleAddCustomHeader}
        class="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
      >
        <FontAwesomeIcon icon={faPlus} size="lg" class="mr-2" />Add
      </button>
    </div>

    <ul>
      {#each $customHeaders as header}
        <li class="mb-4 flex justify-between items-center">
          <span class="text-primary font-medium">{header.name}</span>
          <button
            type="button"
            on:click={() => deleteCustomHeader(header.id)}
            class="text-red-500 hover:text-red-700"
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
        </li>
      {/each}
    </ul>
    <button
      type="button"
      on:click={closeCustomHeaderPanel}
      style="box-shadow: 0 10px 15px rgba(0, 0, 0, 0.3);"
      class=" rounded-full p-3 shadow-lg absolute top-4 right-4 flex items-center justify-center hover:bg-slate-200"
    >
      <FontAwesomeIcon icon={faClose} size="lg" />
    </button>
  </div>
</div>
