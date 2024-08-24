<script lang="ts">
    import { createEventDispatcher } from "svelte";

    export let headers: string[];
    export let row: string[];

    const dispatch = createEventDispatcher();

    function closeDialog() {
        dispatch("close");
    }
</script>

<div class="dialog-overlay" on:click={closeDialog}>
    <div class="dialog-content" on:click|stopPropagation>
        <h2>Row Details</h2>
        <table>
            <tbody>
                {#each headers as header, index}
                    <tr>
                        <th>{header}</th>
                        <td>{row[index]}</td>
                    </tr>
                {/each}
            </tbody>
        </table>
        <button on:click={closeDialog}>Close</button>
    </div>
</div>

<style>
    .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .dialog-content {
        background-color: var(--light-background);
        padding: 20px;
        border-radius: 5px;
        max-width: 80%;
        max-height: 80%;
        overflow-y: auto;
    }

    h2 {
        margin-top: 0;
        font-size: 1rem;
        font-weight: bold;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        padding: 8px;
        border: 1px solid #ddd;
        text-align: left;
    }

    th {
        background-color: #f2f2f2;
        font-weight: bold;
        width: 25%;
        background-color: var(--secondary);
        cursor: pointer;
    }

    tr:nth-child(even) {
        background-color: var(--light-background);
    }

    button {
        margin-top: 15px;
        padding: 5px 10px;
        background-color: var(--primary);
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
    }

    button:hover {
        background-color: var(--primary-dark);
    }
</style>