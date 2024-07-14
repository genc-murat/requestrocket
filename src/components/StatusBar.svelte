<!-- StatusBar.svelte -->
<script lang="ts">
    import { writable } from "svelte/store";
    import type { Writable } from "svelte/store";
    
    export let message: string | null = null;
    export let type: 'info' | 'warn' | 'error' = 'info';

    const visible: Writable<boolean> = writable(false);

    $: if (message) {
        visible.set(true);
        setTimeout(() => {
            visible.set(false);
        }, 2000);
    }
</script>

<div class="status-bar {$visible ? 'visible' : ''} {type}">
    {message}
</div>

<style>
    /* Status Bar Styles */
    .status-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        color: var(--background);
        font-weight: bold;
        text-align: center;
        padding: 0.2rem;
        z-index: 1000;
        transition: 
            opacity 0.5s ease,
            transform 0.5s ease;
        transform: translateY(100%);
        opacity: 0;
    }

    .status-bar.visible {
        transform: translateY(0);
        opacity: 1;
    }

    .status-bar.info {
        background-color: var(--info);
    }

    .status-bar.warn {
        background-color: var(--warning);
        color: var(--dark-text); /* Daha iyi okunabilirlik için */
    }

    .status-bar.error {
        background-color: var(--error);
    }

   
</style>