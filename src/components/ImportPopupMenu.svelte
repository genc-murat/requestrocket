<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Icon from "@iconify/svelte";

    export let show = false;

    type ImportType = "har" | "curl" | "postman";

    const dispatch = createEventDispatcher<{
        import: { type: ImportType };
        close: void;
    }>();

    function handleImport(type: ImportType) {
        dispatch("import", { type });
        dispatch("close");
    }
</script>

{#if show}
    <div class="popup-menu">
        <button on:click={() => handleImport("har")} title="Import HAR">
            <Icon icon="material-symbols:http-rounded" width="24" height="24" />
        </button>
        <button on:click={() => handleImport("curl")} title="Import cURL">
            <Icon icon="logos:curl" width="24" height="24" />
        </button>
        <button
            on:click={() => handleImport("postman")}
            title="Import Postman Collection"
        >
            <Icon icon="logos:postman-icon" width="24" height="24" />
        </button>
    </div>
{/if}

<style>
    .popup-menu {
        position: absolute;
        top: 100%;
        left: -7px;
        background: var(--surface);
        border: 1px solid var(--divider);
        padding: 0.15rem;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        z-index: 9000;
        min-width: 1%;
    }

    .popup-menu button {
        display: flex;
        align-items: center;
        padding: 0.55rem;
        width: 100%;
        height: 2.5rem;

        border: none;
        background: none;
        cursor: pointer;
        transition: background-color 0.2s;
        color: var(--text-color);
    }

    .popup-menu button:hover {
        background-color: var(--light-background);
    }

    .popup-menu button :global(svg) {
        margin-right: 8px;
    }
</style>
