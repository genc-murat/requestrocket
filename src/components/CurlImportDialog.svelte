<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Icon from "@iconify/svelte";

    export let show = false;

    let curlCommand = "";
    const dispatch = createEventDispatcher();

    function handleSubmit() {
        dispatch("submit", curlCommand);
        curlCommand = "";
        show = false;
    }

    function handleCancel() {
        dispatch("cancel");
        curlCommand = "";
        show = false;
    }
</script>

{#if show}
    <div class="modal-backdrop">
        <div class="modal">
            <h2 class="modal-title">Import cURL Command</h2>
            <textarea
                bind:value={curlCommand}
                placeholder="Paste your cURL command here"
                rows="5"
                class="curl-textarea"
            ></textarea>
            <div class="button-group">
                <button on:click={handleSubmit} class="button primary"
                    >Import</button
                >
                <button on:click={handleCancel} class="button secondary"
                    >Cancel</button
                >
            </div>
            <button
                on:click={handleCancel}
                class="close-button"
                aria-label="Close"
            >
                <Icon icon="eva:close-fill" width="20" height="20" />
            </button>
        </div>
    </div>
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.5);
        z-index: 50;
    }

    .modal {
        background: var(--surface);
        padding: 2rem;
        border-radius: 8px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 4px 6px var(--shadow);
        position: relative;
        display: flex;
        flex-direction: column;
        height: 30%;
        gap: 1rem; /* Add gap to provide spacing between elements */
    }

    .modal-title {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 1rem;
        color: var(--primary-text);
    }

    .curl-textarea {
        width: 100%;
        margin-bottom: 1rem;
        padding: 0.5rem;
        border: 1px solid var(--divider);
        border-radius: 4px;
        background-color: var(--light-background);
        color: var(--primary-text);
        font-size: 0.875rem;
    }

    .button-group {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-left: auto; /* Align buttons to the right */
    }

    .button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.875rem;
        transition: background-color 0.3s ease;
    }

    .primary {
        background-color: var(--primary);
        color: var(--background);
    }

    .secondary {
        background-color: var(--secondary);
        color: var(--primary-text);
    }

    .close-button {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--primary-text);
        transition: color 0.3s ease;
    }

    .close-button:hover {
        color: var(--error);
    }
</style>
