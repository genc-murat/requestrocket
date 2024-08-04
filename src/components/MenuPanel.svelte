<script lang="ts">
    import Icon from "@iconify/svelte";
    import { createEventDispatcher } from "svelte";
    import ImportPopupMenu from "./ImportPopupMenu.svelte";

    const dispatch = createEventDispatcher();

    let showImportMenu = false;

    function toggleImportMenu() {
        showImportMenu = !showImportMenu;
    }

    function closeImportMenu() {
        showImportMenu = false;
    }

    function handleImport(
        event: CustomEvent<{ type: "har" | "curl" | "postman" }>,
    ) {
        dispatch("import", event.detail);
        closeImportMenu();
    }

    function dispatchEvent(eventName: string) {
        dispatch(eventName);
    }
</script>

<div class="menu-panel panel">
    <div class="vertical-buttons">
        <button
            type="button"
            on:click={() => dispatchEvent("openThemeSwitcher")}
            class="button-item hover"
            title="Change Theme"
        >
            <Icon icon="mdi:paint-outline" width="24" height="24" />
        </button>
        <button
            type="button"
            class="button-item hover"
            title="Change Group"
            on:click={() => dispatchEvent("openGroupModal")}
        >
            <Icon icon="fluent-mdl2:database-sync" width="24" height="24" />
        </button>
        <button
            type="button"
            on:click={() => dispatchEvent("openCustomHeaderPanel")}
            class="button-item hover"
            title="Headers"
        >
            <Icon icon="cil:header" width="24" height="24" />
        </button>
        <button
            type="button"
            on:click={() => dispatchEvent("openVariablesPanel")}
            class="button-item hover"
            title="Variables"
        >
            <Icon
                icon="gravity-ui:curly-brackets-function"
                width="24"
                height="24"
            />
        </button>
        <button
            type="button"
            on:click={() => dispatchEvent("openHarAnalyzer")}
            class="button-item hover"
            title="HAR Analyzer"
        >
            <Icon icon="mdi:file-document-outline" width="24" height="24" />
        </button>
        <div class="import-button-container">
            <button
                type="button"
                on:click={toggleImportMenu}
                class="button-item hover"
                title="Import"
            >
                <Icon icon="mdi:import" width="24" height="24" />
            </button>
            <ImportPopupMenu
                bind:show={showImportMenu}
                on:import={handleImport}
                on:close={closeImportMenu}
            />
        </div>
        <button
            type="button"
            on:click={() => dispatchEvent("downloadApiDocumentation")}
            class="button-item hover"
            title="Doc"
        >
            <Icon icon="icon-park-solid:download-web" width="24" height="24" />
        </button>
        <button
            type="button"
            on:click={() => dispatchEvent("openApiFlowModal")}
            class="button-item bg-gray-300 rounded-md cursor-not-allowed opacity-50"
            title="Designer"
            disabled
        >
            <Icon icon="mdi:design" width="24" height="24" />
        </button>
        <button
            type="button"
            on:click={() => dispatchEvent("handleExport")}
            class="button-item bg-gray-300 rounded-md cursor-not-allowed opacity-50"
            title="Export"
            disabled
        >
            <Icon icon="foundation:page-export-csv" width="24" height="24" />
        </button>
        <button
            type="button"
            on:click={() => dispatchEvent("openSettings")}
            class="button-item hover"
            title="Settings"
        >
            <Icon icon="iconamoon:settings-fill" width="24" height="24" />
        </button>
    </div>
</div>

<style>
    .vertical-buttons {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.1rem;
        margin-bottom: 0.5rem;
        padding-bottom: 0.1rem;
        padding-top: 0.1rem;
        border-bottom: 1px solid var(--divider);
        border-top: 1px solid var(--divider);
    }
    .button-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 0.65rem;
        width: 100%;
        height: 2.5rem;
        border-top: 1px solid var(--divider);
        border-bottom: 1px solid var(--divider);
        background-color: var(--surface);
        transition: background-color 0.3s ease;
        text-align: center;
    }
    .button-item:hover {
        background-color: var(--light-background);
    }
</style>
