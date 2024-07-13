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
      <div class="bg-white p-6 rounded shadow-lg w-96">
        <p class="mb-4">{message}</p>
        <div class="flex justify-end space-x-2">
          <button on:click={handleClose} class="bg-gray-300 px-4 py-2 rounded">Cancel</button>
          <button on:click={handleConfirm} class="bg-red-500 text-white px-4 py-2 rounded">Confirm</button>
        </div>
      </div>
    </div>
  {/if}
  
  <style>
    .fixed {
      position: fixed;
    }
    .inset-0 {
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
    }
    .flex {
      display: flex;
    }
    .items-center {
      align-items: center;
    }
    .justify-center {
      justify-content: center;
    }
    .bg-black {
      background-color: rgba(0, 0, 0, 0.5);
    }
    .bg-opacity-50 {
      background-opacity: 0.5;
    }
    .bg-white {
      background-color: #ffffff;
    }
    .p-6 {
      padding: 1.5rem;
    }
    .rounded {
      border-radius: 0.5rem;
    }
    .shadow-lg {
      box-shadow:
        0 10px 15px -3px rgba(0, 0, 0, 0.1),
        0 4px 6px -2px rgba(0, 0, 0, 0.05);
    }
    .w-96 {
      width: 24rem;
    }
    .mb-4 {
      margin-bottom: 1rem;
    }
    .flex {
      display: flex;
    }
    .justify-end {
      justify-content: flex-end;
    }
    .space-x-2 > :not(:last-child) {
      margin-right: 0.5rem;
    }
    .bg-gray-300 {
      background-color: #e2e8f0;
    }
    .bg-red-500 {
      background-color: #ef4444;
    }
    .text-white {
      color: #ffffff;
    }
    .px-4 {
      padding-left: 1rem;
      padding-right: 1rem;
    }
    .py-2 {
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
    }
    .rounded {
      border-radius: 0.375rem;
    }
  </style>
  