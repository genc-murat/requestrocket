<script lang="ts">
    import { appWindow } from "@tauri-apps/api/window";
    import logo from "../assets/32x32.png";

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
    <div class="title-container">
        <img src={logo} alt="Logo" class="title-logo" />
        <div class="title">Request Rocket</div>
    </div>
    <div class="buttons">
        <button on:click={minimize}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
            >
                <path fill="currentColor" d="M19 13H5v-2h14v2z" />
            </svg>
        </button>
        <button on:click={maximize}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
            >
                <path
                    fill="currentColor"
                    d="M3 5v14h18V5H3zm16 12H5V7h14v10z"
                />
            </svg>
        </button>
        <button on:click={close}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
            >
                <path
                    fill="currentColor"
                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                />
            </svg>
        </button>
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
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 2.5rem;
        z-index: 1000;
    }

    .title-container {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .title-logo {
        width: 32px;
        height: 32px;
        object-fit: contain;
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

    .titlebar button svg {
        width: 20px;
        height: 20px;
        display: block;
    }
</style>
