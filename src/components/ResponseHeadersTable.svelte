<script lang="ts">
    type Header = [string, string];

    export let headers: Header[] = [];
</script>

<div class="table-container">
    <table class="w-full">
        {#each headers as [key, value]}
            <tr class="w-full">
                <th class="w-1/4">{key}</th>
                <td class="w-3/4">{value}</td>
            </tr>
        {/each}
    </table>
</div>
