<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Icon from "@iconify/svelte";
    import Dialog from "./DataDialog.svelte";

    export let data: { headers: string[]; rows: string[][] };
    export let itemsPerPage = 10;

    let currentPage = 1;
    let searchTerm = "";
    let sortColumn: string | null = null;
    let sortDirection: "asc" | "desc" = "asc";
    let showDialog = false;
    let selectedRow: string[] | null = null;

    $: totalPages = Math.ceil(filteredAndSortedRows.length / itemsPerPage);
    $: startIndex = (currentPage - 1) * itemsPerPage;
    $: endIndex = Math.min(
        startIndex + itemsPerPage,
        filteredAndSortedRows.length,
    );
    $: visibleRows = filteredAndSortedRows.slice(startIndex, endIndex);

    $: filteredRows = data.rows.filter((row) =>
        row.some((cell) =>
            cell.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    );

    $: filteredAndSortedRows = sortRows(
        filteredRows,
        sortColumn,
        sortDirection,
    );

    $: paginationRange = getPaginationRange(currentPage, totalPages);

    function sortRows(
        rows: string[][],
        column: string | null,
        direction: "asc" | "desc",
    ): string[][] {
        if (column === null) return rows;

        return [...rows].sort((a, b) => {
            const columnIndex = data.headers.indexOf(column);
            const aValue = a[columnIndex];
            const bValue = b[columnIndex];
            if (aValue < bValue) return direction === "asc" ? -1 : 1;
            if (aValue > bValue) return direction === "asc" ? 1 : -1;
            return 0;
        });
    }

    function goToPage(page: number) {
        currentPage = Math.max(1, Math.min(page, totalPages));
    }

    function sort(column: string) {
        if (sortColumn === column) {
            sortDirection = sortDirection === "asc" ? "desc" : "asc";
        } else {
            sortColumn = column;
            sortDirection = "asc";
        }
    }

    function getPaginationRange(
        current: number,
        total: number,
    ): (number | string)[] {
        const range: (number | string)[] = [];
        const delta = 2;

        for (
            let i = Math.max(2, current - delta);
            i <= Math.min(total - 1, current + delta);
            i++
        ) {
            range.push(i);
        }

        if (current - delta > 2) {
            range.unshift("...");
        }
        if (current + delta < total - 1) {
            range.push("...");
        }

        range.unshift(1);
        if (total !== 1) {
            range.push(total);
        }

        return range;
    }

    const dispatch = createEventDispatcher();

    function handleRowClick(row: string[]) {
        selectedRow = row;
        showDialog = true;
    }

    function closeDialog() {
        showDialog = false;
        selectedRow = null;
    }
</script>

<div class="advanced-data-table">
    <div class="table-controls">
        <div class="search-container">
            <input
                type="text"
                placeholder="Search..."
                bind:value={searchTerm}
            />
        </div>
        <div class="pagination">
            <button
                on:click={() => goToPage(1)}
                disabled={currentPage === 1}
                class="page-button"
            >
                <Icon icon="mdi:chevron-double-left" width="18" height="18" />
            </button>
            <button
                on:click={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                class="page-button"
            >
                <Icon icon="mdi:chevron-left" width="18" height="18" />
            </button>
            {#each paginationRange as page}
                {#if typeof page === "number"}
                    <button
                        on:click={() => goToPage(page)}
                        class="page-button"
                        class:active={currentPage === page}
                    >
                        {page}
                    </button>
                {:else}
                    <span class="ellipsis">...</span>
                {/if}
            {/each}
            <button
                on:click={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                class="page-button"
            >
                <Icon icon="mdi:chevron-right" width="18" height="18" />
            </button>
            <button
                on:click={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                class="page-button"
            >
                <Icon icon="mdi:chevron-double-right" width="18" height="18" />
            </button>
        </div>
    </div>

    <div class="table-container">
        <table>
            <thead>
                <tr>
                    {#each data.headers as header}
                        <th title={header} on:click={() => sort(header)}>
                            {header}
                            {#if sortColumn === header}
                                <Icon
                                    icon={sortDirection === "asc"
                                        ? "mdi:arrow-up"
                                        : "mdi:arrow-down"}
                                />
                            {/if}
                        </th>
                    {/each}
                </tr>
            </thead>
            <tbody>
                {#each visibleRows as row}
                    <tr on:click={() => handleRowClick(row)}>
                        {#each row as cell}
                            <td title={cell}>{cell}</td>
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

{#if showDialog && selectedRow}
    <Dialog headers={data.headers} row={selectedRow} on:close={closeDialog} />
{/if}
<style>
    .advanced-data-table {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .table-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background-color: var(--surface);
        border-bottom: 1px solid var(--divider);
    }

    .search-container {
        flex: 1;
        margin-right: 10px;
    }

    .search-container input {
        width: 100%;
        padding: 5px;
        border: 1px solid var(--divider);
        border-radius: 4px;
    }

    .pagination {
        display: flex;
        align-items: center;
        gap: 5px;
    }

    .page-button {
        background: none;
        border: 1px solid var(--divider);
        border-radius: 4px;
        cursor: pointer;
        padding: 5px 10px;
        font-size: 11px;
        transition:
            background-color 0.3s,
            color 0.3s;
    }

    .page-button:hover:not(:disabled) {
        background-color: var(--primary);
        color: white;
    }

    .page-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .page-button.active {
        background-color: var(--primary);
        color: white;
    }

    .ellipsis {
        padding: 5px;
        color: var(--text-secondary);
    }

    .table-container {
        flex: 1;
        overflow-y: auto;
    }

    table {
        width: 100%;
        border-collapse: collapse;
    }

    th,
    td {
        padding: 9px;
        border: 1px solid var(--divider);
        text-align: left;
        justify-content: space-around;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    th {
        background-color: var(--secondary);
        cursor: pointer;
    }

    tr:nth-child(even) {
        background-color: var(--light-background);
    }
</style>
