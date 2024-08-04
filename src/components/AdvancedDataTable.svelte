<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Icon from "@iconify/svelte";

    export let data: { headers: string[]; rows: string[][] };
    export let itemsPerPage = 10;

    let currentPage = 1;
    let searchTerm = "";
    let sortColumn: string | null = null;
    let sortDirection: "asc" | "desc" = "asc";

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

    function nextPage() {
        if (currentPage < totalPages) currentPage++;
    }

    function prevPage() {
        if (currentPage > 1) currentPage--;
    }

    function sort(column: string) {
        if (sortColumn === column) {
            sortDirection = sortDirection === "asc" ? "desc" : "asc";
        } else {
            sortColumn = column;
            sortDirection = "asc";
        }
    }

    const dispatch = createEventDispatcher();

    function handleCellClick(rowIndex: number, columnIndex: number) {
        dispatch("cellClick", {
            rowIndex: startIndex + rowIndex,
            columnIndex,
            value: visibleRows[rowIndex][columnIndex],
        });
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
            <button on:click={prevPage} disabled={currentPage === 1}>
                <Icon icon="mdi:chevron-left" width="24" height="24" />
            </button>
            <span>{currentPage} / {totalPages}</span>
            <button on:click={nextPage} disabled={currentPage === totalPages}>
                <Icon icon="mdi:chevron-right" width="24" height="24" />
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
                {#each visibleRows as row, rowIndex}
                    <tr>
                        {#each row as cell, columnIndex}
                            <td
                                title={cell}
                                on:click={() =>
                                    handleCellClick(rowIndex, columnIndex)}
                                >{cell}</td
                            >
                        {/each}
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

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
    }

    .pagination button {
        background: none;
        border: none;
        cursor: pointer;
        padding: 5px;
    }

    .pagination span {
        margin: 0 10px;
        font-weight: bolder;
        font-size: 0.65rem;
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
