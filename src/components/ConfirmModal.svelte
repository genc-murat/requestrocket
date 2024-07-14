<script lang="ts">
    import { createEventDispatcher } from "svelte";
  
    export let show = false;
    export let message = "Are you sure you want to proceed?";
  
    const dispatch = createEventDispatcher();
  
    function handleConfirm() {
      dispatch("confirm");
    }
  
    function handleClose() {
      dispatch("close");
    }
  </script>
  
  {#if show}
    <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="confirm-dialog dark:bg-slate-800 p-6 rounded shadow-lg w-96">
        <p class="mb-4 text-primary-text">{message}</p>
        <div class="flex justify-end space-x-2">
          <button on:click={handleClose} class=" cancel px-4 py-2 rounded">Cancel</button>
          <button on:click={handleConfirm} class="confirm px-4 py-2 rounded">Confirm</button>
        </div>
      </div>
    </div>
  {/if}
  
