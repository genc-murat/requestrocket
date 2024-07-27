<script lang="ts" context="module">
    import { writable } from "svelte/store";
    import type { Writable } from "svelte/store";
    import { themes } from "$lib/themes";

    export function applyTheme(theme: string) {
        const themeProperties = themes[theme];
        for (const [property, value] of Object.entries(themeProperties)) {
            document.documentElement.style.setProperty(property, value);
        }
        currentTheme.set(theme);
        localStorage.setItem("selectedTheme", theme);
    }

    export const currentTheme: Writable<string> = writable("default");
</script>

<script lang="ts">
    import { onMount } from "svelte";

    onMount(() => {
        const savedTheme = localStorage.getItem("selectedTheme");
        if (savedTheme && themes[savedTheme]) {
            applyTheme(savedTheme);
        } else {
            applyTheme("default");
        }
    });
</script>

<div
    class="theme-switcher grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
>
    {#each Object.keys(themes) as theme}
        <button
            class="theme-button"
            style="background: linear-gradient(to right, {themes[theme][
                '--background'
            ]} 40%, {themes[theme]['--surface']} 70%, {themes[theme][
                '--primary'
            ]} 90%, {themes[theme]['--secondary']} 95%); color: {themes[theme][
                '--primary-text'
            ]};"
            on:click={() => applyTheme(theme)}
        >
            {theme
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())}
        </button>
    {/each}
</div>

<style>
    .theme-switcher {
        display: flex;
        flex-wrap: wrap;
        gap: 3px;
    }

    .theme-button {
        cursor: pointer;
        border: none;
        border-radius: 5px;
        transition:
            background-color 0.3s ease,
            color 0.3s ease;
        text-align: center;
        width: 97px;
        height: 28px;
    }
</style>
