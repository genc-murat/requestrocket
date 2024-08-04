<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Icon from "@iconify/svelte";

    interface TableData {
        headers: string[];
        rows: (string | number)[][];
    }

    export let data: TableData = { headers: [], rows: [] };
    export let itemsPerPage: number = 20;
    export let currentPage: number = 1;

    let searchTerm: string = "";
    let sortColumn: number = -1;
    let sortAscending: boolean = true;

    const dispatch = createEventDispatcher();

    $: filteredData = data.rows.filter((row) =>
        row.some((cell) =>
            cell.toString().toLowerCase().includes(searchTerm.toLowerCase()),
        ),
    );

    $: sortedData =
        sortColumn !== -1
            ? [...filteredData].sort((a, b) => {
                  const aValue = a[sortColumn].toString();
                  const bValue = b[sortColumn].toString();
                  return sortAscending
                      ? aValue.localeCompare(bValue, undefined, {
                            numeric: true,
                            sensitivity: "base",
                        })
                      : bValue.localeCompare(aValue, undefined, {
                            numeric: true,
                            sensitivity: "base",
                        });
              })
            : filteredData;

    $: paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage,
    );
    $: totalPages = Math.ceil(sortedData.length / itemsPerPage);

    function handleSort(columnIndex: number): void {
        if (sortColumn === columnIndex) {
            sortAscending = !sortAscending;
        } else {
            sortColumn = columnIndex;
            sortAscending = true;
        }
    }

    function handlePageChange(newPage: number): void {
        if (newPage >= 1 && newPage <= totalPages) {
            currentPage = newPage;
            dispatch("pageChange", { page: currentPage });
        }
    }

    function getSortIndicator(columnIndex: number): string {
        if (sortColumn === columnIndex) {
            return sortAscending ? "▲" : "▼";
        }
        return "";
    }
</script>

<div class="table-container">
    <div class="table-controls">
        <input
            type="text"
            bind:value={searchTerm}
            placeholder="Search..."
            class="search-input"
        />
        <div class="pagination">
            <button
                on:click={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <Icon icon="mingcute:left-fill" width="18" height="18" />
            </button>
            <span>{currentPage}/{totalPages}</span>
            <button
                on:click={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <Icon icon="mingcute:right-fill" width="18" height="18" />
            </button>
        </div>
    </div>

    <div class="table">
        <div class="row header">
            {#each data.headers as header, index}
                <div
                    class="cell-header"
                    on:click={() => handleSort(index)}
                    title={header}
                >
                    {header}
                    <span class="sort-indicator">{getSortIndicator(index)}</span
                    >
                </div>
            {/each}
        </div>
        {#each paginatedData as row}
            <div class="row">
                {#each row as cell}
                    <div class="cell" title={cell.toString()}>{cell}</div>
                {/each}
            </div>
        {/each}
    </div>
</div>

<style>
    .table-container {
        font-family: Arial, sans-serif;
        margin: 20px 0;
    }

    .table-controls {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
    }

    .search-input {
        padding: 5px;
        border: 1px solid var(--divider);
        border-radius: 4px;
    }

    .pagination {
        display: flex;
        align-items: center;
        font-size: 0.65rem;
        font-weight: bolder;
    }

    .pagination button {
        padding: 5px 10px;
        margin: 0 5px;
        background-color: var(--surface);
        border: 1px solid var(--divider);
        border-radius: 4px;
        cursor: pointer;
        color: var(--primary-text);
    }

    .pagination button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .table {
        display: flex;
        flex-direction: column;
        width: 100%;
        border: 1px solid var(--divider);
    }

    .row {
        display: flex;
        width: 100%;
    }

    .cell-header {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid var(--divider);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--background);
        background-color: var(--secondary);
        font-weight: bold;
        cursor: pointer;
    }

    /* .cell {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid var(--divider);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--primary-text);
    }
  
    .header {
      background-color: var(--secondary);
      font-weight: bold;
    }
   */
    /* .header .cell {
      border-top: none;
    } */

    .sort-indicator {
        margin-left: 5px;
    }

    @media (max-width: 600px) {
        .table-controls {
            flex-direction: column;
        }

        .search-input {
            margin-bottom: 10px;
        }

        .row {
            flex-direction: column;
        }

        .cell,
        .cell-header {
            width: 100%;
            border-top: none;
        }
    }
</style>
