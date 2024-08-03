<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import type { HarFile, HarEntry } from "./har-types";
    import Icon from "@iconify/svelte";
    import { Chart } from "chart.js/auto";
    import type { ChartType, ChartData, ChartOptions } from "chart.js/auto";

    export let show = false;

    const dispatch = createEventDispatcher();

    let file: File | null = null;
    let harData: HarFile | null = null;
    let error: string | null = null;
    let loading = false;

    function closeModal() {
        show = false;
        dispatch("close");
    }

    let statusCodeChartCanvas: HTMLCanvasElement;
    let mimeTypeChartCanvas: HTMLCanvasElement;
    let loadTimeChartCanvas: HTMLCanvasElement;
    let contentTypesChartCanvas: HTMLCanvasElement;
    let timingBreakdownChartCanvas: HTMLCanvasElement;
    let resourcesPerDomainChartCanvas: HTMLCanvasElement;

    let statusCodeChart: Chart | undefined;
    let mimeTypeChart: Chart | undefined;
    let loadTimeChart: Chart | undefined;
    let contentTypesChart: Chart | undefined;
    let timingBreakdownChart: Chart | undefined;
    let resourcesPerDomainChart: Chart | undefined;

    function createChart(
        canvas: HTMLCanvasElement,
        type: ChartType,
        data: ChartData,
        options: ChartOptions,
    ): Chart {
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                return new Chart(ctx, {
                    type,
                    data,
                    options: {
                        ...options,
                        maintainAspectRatio: false,
                        responsive: true,
                    },
                });
            }
        }
        throw new Error("Canvas context not available");
    }

    function createStatusCodeChart(distribution: { [key: string]: number }) {
        if (statusCodeChart) statusCodeChart.destroy();
        statusCodeChart = createChart(
            statusCodeChartCanvas,
            "pie",
            {
                labels: Object.keys(distribution),
                datasets: [
                    {
                        data: Object.values(distribution),
                        backgroundColor: [
                            "#FF6384",
                            "#36A2EB",
                            "#FFCE56",
                            "#4BC0C0",
                            "#9966FF",
                        ],
                    },
                ],
            },
            {
                plugins: {
                    legend: {
                        position: "right",
                    },
                    title: {
                        display: true,
                        text: "Status Code Distribution",
                    },
                },
            },
        );
    }

    function createMimeTypeChart(distribution: { [key: string]: number }) {
        if (mimeTypeChart) mimeTypeChart.destroy();
        mimeTypeChart = createChart(
            mimeTypeChartCanvas,
            "doughnut",
            {
                labels: Object.keys(distribution),
                datasets: [
                    {
                        data: Object.values(distribution),
                        backgroundColor: [
                            "#FF6384",
                            "#36A2EB",
                            "#FFCE56",
                            "#4BC0C0",
                            "#9966FF",
                            "#FF9F40",
                        ],
                    },
                ],
            },
            {
                plugins: {
                    legend: {
                        position: "right",
                    },
                    title: {
                        display: true,
                        text: "MIME Type Distribution",
                    },
                },
            },
        );
    }

    function createLoadTimeChart(distribution: number[]) {
        if (loadTimeChart) loadTimeChart.destroy();
        loadTimeChart = createChart(
            loadTimeChartCanvas,
            "bar",
            {
                labels: [
                    "0-100",
                    "100-200",
                    "200-500",
                    "500-1000",
                    "1000-2000",
                    "2000-5000",
                    "5000+",
                ],
                datasets: [
                    {
                        label: "Number of Requests",
                        data: distribution,
                        backgroundColor: "#36A2EB",
                    },
                ],
            },
            {
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: "Load Time Distribution",
                    },
                },
            },
        );
    }

    function createContentTypesChart(breakdown: { [key: string]: number }) {
        if (contentTypesChart) contentTypesChart.destroy();
        contentTypesChart = createChart(
            contentTypesChartCanvas,
            "doughnut",
            {
                labels: Object.keys(breakdown),
                datasets: [
                    {
                        data: Object.values(breakdown),
                        backgroundColor: [
                            "#FF6384",
                            "#36A2EB",
                            "#FFCE56",
                            "#4BC0C0",
                            "#9966FF",
                            "#FF9F40",
                            "#FF6384",
                            "#36A2EB",
                            "#FFCE56",
                            "#4BC0C0",
                        ],
                    },
                ],
            },
            {
                plugins: {
                    legend: {
                        position: "right",
                    },
                    title: {
                        display: true,
                        text: "Content Types Breakdown",
                    },
                },
            },
        );
    }

    function createTimingBreakdownChart(breakdown: { [key: string]: number }) {
        if (timingBreakdownChart) timingBreakdownChart.destroy();
        timingBreakdownChart = createChart(
            timingBreakdownChartCanvas,
            "bar",
            {
                labels: Object.keys(breakdown),
                datasets: [
                    {
                        label: "Time (ms)",
                        data: Object.values(breakdown),
                        backgroundColor: "#36A2EB",
                    },
                ],
            },
            {
                plugins: {
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: "Timing Breakdown",
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        );
    }

    function createResourcesPerDomainChart(breakdown: {
        [key: string]: number;
    }) {
        if (resourcesPerDomainChart) resourcesPerDomainChart.destroy();
        const sortedData = Object.entries(breakdown)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        resourcesPerDomainChart = createChart(
            resourcesPerDomainChartCanvas,
            "bar",
            {
                labels: sortedData.map(([domain]) => domain),
                datasets: [
                    {
                        label: "Number of Requests",
                        data: sortedData.map(([, count]) => count),
                        backgroundColor: "#FF6384",
                    },
                ],
            },
            {
                plugins: {
                    legend: {
                        display: false,
                    },
                    title: {
                        display: true,
                        text: "Top 10 Domains by Number of Requests",
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                    },
                },
            },
        );
    }

    async function handleFileUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            file = input.files[0];
            loading = true;
            try {
                const text = await file.text();
                harData = JSON.parse(text);
                error = null;
            } catch (e) {
                error =
                    "Error parsing HAR file. Please make sure it's a valid JSON.";
                harData = null;
            } finally {
                loading = false;
            }
        }
    }

    function getTotalSize(entries: HarEntry[]): string {
        const totalBytes = entries.reduce(
            (sum, entry) => sum + entry.response.content.size,
            0,
        );
        return formatBytes(totalBytes);
    }

    function getAverageResponseTime(entries: HarEntry[]): string {
        const avgTime =
            entries.reduce((sum, entry) => sum + entry.time, 0) /
            entries.length;
        return avgTime.toFixed(2) + " ms";
    }

    function getStatusCodeDistribution(entries: HarEntry[]): {
        [key: string]: number;
    } {
        return entries.reduce(
            (dist, entry) => {
                const status = entry.response.status;
                const category = Math.floor(status / 100) + "xx";
                dist[category] = (dist[category] || 0) + 1;
                return dist;
            },
            {} as { [key: string]: number },
        );
    }

    function getMimeTypeDistribution(entries: HarEntry[]): {
        [key: string]: number;
    } {
        return entries.reduce(
            (dist, entry) => {
                const mimeType = entry.response.content.mimeType.split(";")[0];
                dist[mimeType] = (dist[mimeType] || 0) + 1;
                return dist;
            },
            {} as { [key: string]: number },
        );
    }

    function getSlowestResources(entries: HarEntry[]): HarEntry[] {
        return entries.sort((a, b) => b.time - a.time).slice(0, 5);
    }

    function getLargestResources(entries: HarEntry[]): HarEntry[] {
        return entries
            .sort((a, b) => b.response.content.size - a.response.content.size)
            .slice(0, 5);
    }

    function getDomainDistribution(entries: HarEntry[]): {
        [key: string]: number;
    } {
        return entries.reduce(
            (dist, entry) => {
                const url = new URL(entry.request.url);
                const domain = url.hostname;
                dist[domain] = (dist[domain] || 0) + 1;
                return dist;
            },
            {} as { [key: string]: number },
        );
    }

    function getMethodDistribution(entries: HarEntry[]): {
        [key: string]: number;
    } {
        return entries.reduce(
            (dist, entry) => {
                const method = entry.request.method;
                dist[method] = (dist[method] || 0) + 1;
                return dist;
            },
            {} as { [key: string]: number },
        );
    }

    function getErrorRequests(entries: HarEntry[]): HarEntry[] {
        return entries.filter((entry) => entry.response.status >= 400);
    }

    function getRedirectRequests(entries: HarEntry[]): HarEntry[] {
        return entries.filter(
            (entry) =>
                entry.response.status >= 300 && entry.response.status < 400,
        );
    }

    function getCacheAnalysis(entries: HarEntry[]): {
        cached: number;
        notCached: number;
    } {
        return entries.reduce(
            (analysis, entry) => {
                const cacheControl = entry.response.headers.find(
                    (h) => h.name.toLowerCase() === "cache-control",
                );
                if (cacheControl && cacheControl.value.includes("max-age")) {
                    analysis.cached++;
                } else {
                    analysis.notCached++;
                }
                return analysis;
            },
            { cached: 0, notCached: 0 },
        );
    }

    function getLoadTimeDistribution(entries: HarEntry[]): number[] {
        const timeRanges = [0, 100, 200, 500, 1000, 2000, 5000];
        const distribution = new Array(timeRanges.length).fill(0);

        entries.forEach((entry) => {
            const time = entry.time;
            for (let i = 0; i < timeRanges.length; i++) {
                if (time <= timeRanges[i] || i === timeRanges.length - 1) {
                    distribution[i]++;
                    break;
                }
            }
        });

        return distribution;
    }

    function getTopDomains(
        entries: HarEntry[],
    ): { domain: string; count: number }[] {
        const domainCounts = getDomainDistribution(entries);
        return Object.entries(domainCounts)
            .map(([domain, count]) => ({ domain, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }

    function formatBytes(bytes: number): string {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    function getResponseTimeExtremes(entries: HarEntry[]): {
        fastest: number;
        slowest: number;
        average: number;
    } {
        if (entries.length === 0) {
            return { fastest: 0, slowest: 0, average: 0 };
        }
        const times = entries.map((e) => e.time);
        return {
            fastest: Math.min(...times),
            slowest: Math.max(...times),
            average: times.reduce((sum, time) => sum + time, 0) / times.length,
        };
    }

    function getContentTypesBreakdown(entries: HarEntry[]): {
        [key: string]: number;
    } {
        return entries.reduce(
            (breakdown, entry) => {
                const contentType =
                    entry.response.content.mimeType.split(";")[0];
                breakdown[contentType] = (breakdown[contentType] || 0) + 1;
                return breakdown;
            },
            {} as { [key: string]: number },
        );
    }

    function getTimingBreakdown(entries: HarEntry[]): {
        [key: string]: number;
    } {
        const timings = [
            "blocked",
            "dns",
            "connect",
            "send",
            "wait",
            "receive",
            "ssl",
        ] as const;
        return entries.reduce(
            (breakdown, entry) => {
                if (entry.timings) {
                    timings.forEach((timing) => {
                        const value = entry.timings[timing];
                        if (typeof value === "number" && !isNaN(value)) {
                            breakdown[timing] =
                                (breakdown[timing] || 0) + value;
                        }
                    });
                }
                return breakdown;
            },
            {} as { [key: string]: number },
        );
    }

    function getThirdPartyRequests(
        entries: HarEntry[],
        mainDomain: string,
    ): HarEntry[] {
        return entries.filter((entry) => {
            const url = new URL(entry.request.url);
            return url.hostname !== mainDomain;
        });
    }

    function getPageLoadTime(entries: HarEntry[]): number {
        return Math.max(...entries.map((entry) => entry.time));
    }

    function getFirstContentfulPaint(entries: HarEntry[]): number {
        // This is a simplification. In reality, FCP is more complex to calculate.
        const htmlEntry = entries.find((entry) =>
            entry.response.content.mimeType.includes("text/html"),
        );
        return htmlEntry ? htmlEntry.time : 0;
    }

    function getResourcesPerDomain(entries: HarEntry[]): {
        [key: string]: number;
    } {
        return entries.reduce(
            (domains, entry) => {
                const url = new URL(entry.request.url);
                domains[url.hostname] = (domains[url.hostname] || 0) + 1;
                return domains;
            },
            {} as { [key: string]: number },
        );
    }

    $: analysisData = harData
        ? {
              totalRequests: harData.log.entries.length,
              totalSize: getTotalSize(harData.log.entries),
              averageResponseTime: getAverageResponseTime(harData.log.entries),
              statusCodeDistribution: getStatusCodeDistribution(
                  harData.log.entries,
              ),
              mimeTypeDistribution: getMimeTypeDistribution(
                  harData.log.entries,
              ),
              slowestResources: getSlowestResources(harData.log.entries),
              largestResources: getLargestResources(harData.log.entries),
              domainDistribution: getDomainDistribution(harData.log.entries),
              methodDistribution: getMethodDistribution(harData.log.entries),
              errorRequests: getErrorRequests(harData.log.entries),
              redirectRequests: getRedirectRequests(harData.log.entries),
              cacheAnalysis: getCacheAnalysis(harData.log.entries),
              loadTimeDistribution: getLoadTimeDistribution(
                  harData.log.entries,
              ),
              contentTypesBreakdown: getContentTypesBreakdown(
                  harData.log.entries,
              ),
              timingBreakdown: getTimingBreakdown(harData.log.entries),
              thirdPartyRequests: getThirdPartyRequests(
                  harData.log.entries,
                  new URL(harData.log.entries[0].request.url).hostname,
              ),
              pageLoadTime: getPageLoadTime(harData.log.entries),
              firstContentfulPaint: getFirstContentfulPaint(
                  harData.log.entries,
              ),
              resourcesPerDomain: getResourcesPerDomain(harData.log.entries),
          }
        : null;

    $: topDomains = harData ? getTopDomains(harData.log.entries) : [];
    $: totalTransferSize = harData
        ? harData.log.entries.reduce(
              (sum, entry) => sum + entry.response.content.size,
              0,
          )
        : 0;

    $: if (analysisData) {
        setTimeout(() => {
            createStatusCodeChart(analysisData.statusCodeDistribution);
            createMimeTypeChart(analysisData.mimeTypeDistribution);
            createLoadTimeChart(analysisData.loadTimeDistribution);
            createContentTypesChart(analysisData.contentTypesBreakdown);
            createTimingBreakdownChart(analysisData.timingBreakdown);
            createResourcesPerDomainChart(analysisData.resourcesPerDomain);
        }, 0);
    }
</script>

{#if show}
    <div class="modal-overlay" on:click|self={closeModal}>
        <div class="modal-content" on:click|stopPropagation>
            <h2 class="text-2xl font-bold mb-4">HAR File Analyzer</h2>
            <button class="close-button" on:click={closeModal}>
                <Icon icon="mdi:close" />
            </button>

            <div class="file-upload mb-4">
                <label for="har-file" class="file-input-label">
                    <Icon icon="mdi:file-upload" />
                    <span>Choose HAR file</span>
                </label>
                <input
                    id="har-file"
                    type="file"
                    accept=".har"
                    on:change={handleFileUpload}
                    class="hidden"
                />
            </div>

            {#if error}
                <p class="error mb-4">{error}</p>
            {/if}

            {#if loading}
                <div class="loading">
                    <Icon
                        icon="mdi:loading"
                        class="animate-spin"
                        width="48"
                        height="48"
                    />
                    <p>Analyzing HAR file...</p>
                </div>
            {:else if analysisData && harData}
                <div class="har-analysis">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="analysis-card">
                            <div class="card-content">
                                <h3 class="card-title">
                                    <Icon icon="mdi:file-document-multiple" /> Overview
                                </h3>
                                <div class="card-details">
                                    <p>
                                        Total Requests: {analysisData.totalRequests}
                                    </p>
                                    <p>Total Size: {analysisData.totalSize}</p>
                                    <p>
                                        Avg Response Time: {analysisData.averageResponseTime}
                                    </p>
                                    <p>
                                        Page Load Time: {analysisData.pageLoadTime.toFixed(
                                            2,
                                        )} ms
                                    </p>
                                    <p>
                                        First Contentful Paint: {analysisData.firstContentfulPaint.toFixed(
                                            2,
                                        )} ms
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="analysis-card">
                            <div class="card-content">
                                <h3 class="card-title">
                                    <Icon icon="mdi:chart-pie" /> Status Codes
                                </h3>
                                <div class="card-details chart-container">
                                    <canvas bind:this={statusCodeChartCanvas}
                                    ></canvas>
                                </div>
                            </div>
                        </div>

                        <div class="analysis-card">
                            <div class="card-content">
                                <h3 class="card-title">
                                    <Icon icon="mdi:file-type" /> MIME Types
                                </h3>
                                <div class="card-details chart-container">
                                    <canvas bind:this={mimeTypeChartCanvas}
                                    ></canvas>
                                </div>
                            </div>
                        </div>

                        <div class="analysis-card">
                            <div class="card-content">
                                <h3 class="card-title">
                                    <Icon icon="mdi:chart-timeline" /> Load Time
                                    Distribution
                                </h3>
                                <div class="card-details chart-container">
                                    <canvas bind:this={loadTimeChartCanvas}
                                    ></canvas>
                                </div>
                            </div>
                        </div>

                        <div class="analysis-card">
                            <div class="card-content">
                                <h3 class="card-title">
                                    <Icon icon="mdi:file-tree" /> Content Types Breakdown
                                </h3>
                                <div class="card-details chart-container">
                                    <canvas bind:this={contentTypesChartCanvas}
                                    ></canvas>
                                </div>
                            </div>
                        </div>

                        <div class="analysis-card">
                            <div class="card-content">
                                <h3 class="card-title">
                                    <Icon icon="mdi:clock-outline" /> Timing Breakdown
                                </h3>
                                <div class="card-details chart-container">
                                    <canvas
                                        bind:this={timingBreakdownChartCanvas}
                                    ></canvas>
                                </div>
                            </div>
                        </div>

                        <div class="analysis-card">
                            <div class="card-content">
                                <h3 class="card-title">
                                    <Icon icon="mdi:web" /> Resources Per Domain
                                </h3>
                                <div class="card-details chart-container">
                                    <canvas
                                        bind:this={resourcesPerDomainChartCanvas}
                                    ></canvas>
                                </div>
                            </div>
                        </div>

                        <div class="analysis-card">
                            <div class="card-content">
                                <h3 class="card-title">
                                    <Icon icon="mdi:clock-outline" /> Slowest Resources
                                </h3>
                                <div class="card-details">
                                    <ol>
                                        {#each analysisData.slowestResources as resource}
                                            <li>
                                                {resource.request.url
                                                    .split("/")
                                                    .pop()} -
                                                {resource.time.toFixed(2)} ms
                                            </li>
                                        {/each}
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <div class="analysis-card">
                            <div class="card-content">
                                <h3 class="card-title">
                                    <Icon icon="mdi:weight" /> Largest Resources
                                </h3>
                                <div class="card-details">
                                    <ol>
                                        {#each analysisData.largestResources as resource}
                                            <li>
                                                {resource.request.url
                                                    .split("/")
                                                    .pop()} -
                                                {formatBytes(
                                                    resource.response.content
                                                        .size,
                                                )}
                                            </li>
                                        {/each}
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <div class="analysis-card">
                            <div class="card-content">
                                <h3 class="card-title">
                                    <Icon icon="mdi:api" /> HTTP Methods
                                </h3>
                                <div class="card-details">
                                    {#each Object.entries(analysisData.methodDistribution) as [method, count]}
                                        <div class="flex justify-between">
                                            <span>{method}:</span>
                                            <span>{count}</span>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        </div>

                        <div class="analysis-card">
                            <div class="card-content">
                                <h3 class="card-title">
                                    <Icon icon="mdi:alert-circle" /> Error Requests
                                </h3>
                                <div class="card-details">
                                    <ul>
                                        {#each analysisData.errorRequests as request}
                                            <li>
                                                {request.request.url} - Status: {request
                                                    .response.status}
                                            </li>
                                        {/each}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="analysis-card">
                            <div class="card-content">
                                <h3 class="card-title">
                                    <Icon icon="mdi:redirect" /> Redirect Requests
                                </h3>
                                <div class="card-details">
                                    <ul>
                                        {#each analysisData.redirectRequests as request}
                                            <li>
                                                {request.request.url} - Status: {request
                                                    .response.status}
                                            </li>
                                        {/each}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div class="analysis-card">
                            <div class="card-content">
                                <h3 class="card-title">
                                    <Icon icon="mdi:cached" /> Cache Analysis
                                </h3>
                                <div class="card-details">
                                    <p>
                                        Cached: {analysisData.cacheAnalysis
                                            .cached}
                                    </p>
                                    <p>
                                        Not Cached: {analysisData.cacheAnalysis
                                            .notCached}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="analysis-card">
                            <div class="card-content">
                                <h3 class="card-title">
                                    <Icon icon="mdi:earth" /> Top Domains
                                </h3>
                                <div class="card-details">
                                    <ol>
                                        {#each topDomains as { domain, count }}
                                            <li>{domain} - {count} requests</li>
                                        {/each}
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <div class="analysis-card">
                            <div class="card-content">
                                <h3 class="card-title">
                                    <Icon icon="mdi:file-transfer" /> Transfer Size
                                </h3>
                                <div class="card-details">
                                    <p>
                                        Total: {formatBytes(totalTransferSize)}
                                    </p>
                                    <p>
                                        Average: {formatBytes(
                                            totalTransferSize /
                                                analysisData.totalRequests,
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div class="analysis-card">
                            <div class="card-content">
                                <h3 class="card-title">
                                    <Icon icon="mdi:chart-timeline-variant" /> Response
                                    Time
                                </h3>
                                <div class="card-details">
                                    {#if harData.log.entries.length > 0}
                                        {@const responseTimeExtremes =
                                            getResponseTimeExtremes(
                                                harData.log.entries,
                                            )}
                                        <p>
                                            Fastest: {responseTimeExtremes.fastest.toFixed(
                                                2,
                                            )} ms
                                        </p>
                                        <p>
                                            Slowest: {responseTimeExtremes.slowest.toFixed(
                                                2,
                                            )} ms
                                        </p>
                                        <p>
                                            Average: {responseTimeExtremes.average.toFixed(
                                                2,
                                            )} ms
                                        </p>
                                    {:else}
                                        <p>No data available</p>
                                    {/if}
                                </div>
                            </div>
                        </div>

                        <div class="analysis-card">
                            <div class="card-content">
                                <h3 class="card-title">
                                    <Icon icon="mdi:web-box" /> Third-Party Requests
                                </h3>
                                <div class="card-details">
                                    <p>
                                        Count: {analysisData.thirdPartyRequests
                                            .length}
                                    </p>
                                    <p>
                                        Percentage: {(
                                            (analysisData.thirdPartyRequests
                                                .length /
                                                analysisData.totalRequests) *
                                            100
                                        ).toFixed(2)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-8">
                        <h3 class="text-xl font-bold mb-4">
                            Performance Insights
                        </h3>
                        <ul class="list-disc pl-5">
                            {#if analysisData.totalRequests > 100}
                                <li>
                                    High number of requests ({analysisData.totalRequests}).
                                    Consider reducing HTTP requests by combining
                                    files or using sprites.
                                </li>
                            {/if}
                            {#if Object.entries(analysisData.statusCodeDistribution).some(([status, count]) => status.startsWith("4") && count > 0)}
                                <li>
                                    There are client errors (4xx status codes).
                                    Check these requests and fix any issues.
                                </li>
                            {/if}
                            {#if analysisData.cacheAnalysis.notCached / analysisData.totalRequests > 0.5}
                                <li>
                                    More than 50% of resources are not cached.
                                    Implement proper caching strategies to
                                    improve load times.
                                </li>
                            {/if}
                            {#if analysisData.loadTimeDistribution[5] + analysisData.loadTimeDistribution[6] > 0}
                                <li>
                                    Some requests take more than 2 seconds to
                                    load. Optimize slow resources to improve
                                    user experience.
                                </li>
                            {/if}
                            {#if topDomains.length > 0 && topDomains[0].count / analysisData.totalRequests > 0.7}
                                <li>
                                    More than 70% of requests are to a single
                                    domain ({topDomains[0].domain}). Consider
                                    using a CDN or optimizing this domain.
                                </li>
                            {/if}
                            {#if analysisData.largestResources.length > 0 && analysisData.largestResources[0].response.content.size > 1000000}
                                <li>
                                    The largest resource is over 1MB. Consider
                                    optimizing or compressing large files.
                                </li>
                            {/if}
                            {#if analysisData.pageLoadTime > 3000}
                                <li>
                                    Page load time is over 3 seconds ({analysisData.pageLoadTime.toFixed(
                                        2,
                                    )} ms). Consider optimizing for faster load times.
                                </li>
                            {/if}
                            {#if analysisData.thirdPartyRequests.length / analysisData.totalRequests > 0.3}
                                <li>
                                    More than 30% of requests are to third-party
                                    domains. Consider reducing reliance on
                                    third-party resources.
                                </li>
                            {/if}
                        </ul>
                    </div>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
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

    .modal-content {
        background-color: white;
        padding: 2rem;
        border-radius: 0.5rem;
        width: 90%;
        max-width: 1280px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .close-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
    }

    .file-input-label {
        display: inline-flex;
        align-items: center;
        padding: 0.5rem 1rem;
        background-color: #3498db;
        color: white;
        border-radius: 0.25rem;
        cursor: pointer;
        transition: background-color 0.3s;
    }

    .file-input-label:hover {
        background-color: #2980b9;
    }

    .file-input-label > :global(svg) {
        margin-right: 0.5rem;
    }

    .error {
        color: #e74c3c;
        font-weight: bold;
    }

    .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
    }

    .analysis-card {
        background-color: #f8f9fa;
        border-radius: 0.5rem;
        padding: 1rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
    }

    .card-content {
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .card-title {
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
    }

    .chart-container {
        height: 300px;
        width: 100%;
    }

    .card-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow: hidden;
    }

    @media (max-width: 768px) {
        .modal-content {
            padding: 1rem;
        }

        .analysis-card {
            padding: 0.75rem;
        }

        .card-title {
            font-size: 1rem;
            margin-bottom: 0.5rem;
        }

        .chart-container {
            height: 200px;
        }
    }
</style>
