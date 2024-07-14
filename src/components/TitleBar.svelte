<script lang="ts">
    import { appWindow } from "@tauri-apps/api/window";

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

<div data-tauri-drag-region class="titlebar">
    <div class="title">Request Rocket</div>
    <div class="buttons">
        <button on:click={minimize}>_</button>
        <button on:click={maximize}>[]</button>
        <button on:click={close}>×</button>
    </div>
</div>

<style>
    .titlebar {
        background-color: var(--background);
        color: var(--primary-text);
        padding: 0.5rem 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--divider);
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 2.5rem;
        z-index: 1000;
    }

    .titlebar .title {
        color: var(--dark-text);
    }

    .titlebar .buttons {
        display: flex;
        gap: 0.5rem;
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
