<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { writable } from "svelte/store";
  import type { Writable } from "svelte/store";
  import Prism from "prismjs";
  import "prismjs/components/prism-markup";
  import { openDB } from "idb";
  import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
  import { invoke } from "@tauri-apps/api/tauri";

  import Icon from "@iconify/svelte";
  import {
    writeTextFile,
    readTextFile,
    writeBinaryFile,
  } from "@tauri-apps/api/fs";
  import { dialog } from "@tauri-apps/api";
  import JSONEditor from "../components/JSONEditor.svelte";
  import APIFlowDesigner from "../components/APIFlowDesigner.svelte";
  import {
    customHeaders,
    customHeaderPanelOpen,
    loadCustomHeaders,
    openCustomHeaderPanel,
    setDatabase,
  } from "../components/CustomHeaderModule";
  import CustomHeaderPanel from "../components/CustomHeaderPanel.svelte";

  import ConfirmModal from "../components/ConfirmModal.svelte";
  import {
    headers,
    queryParams,
    pathParams,
    formParams,
  } from "../stores/paramsStore";

  import type {
    Flow,
    FlowBlock,
    Connection,
    BlockType,
    SwitchCase,
  } from "../types/flow-types";

  import type {
    HistoryItem,
    Header,
    Param,
    ResponseData,
    StatusHistoryItem,
    ApiDoc,
  } from "../types/api-types";

  import HttpMethodDropdown from "../components/HttpMethodDropdown.svelte";

  import HttpBodyDropdown from "../components/HttpBodyDropdown.svelte";
  import ThemeSwitcher, {
    applyTheme,
    currentTheme,
  } from "../components/ThemeSwitcher.svelte";

  import TitleBar from "../components/TitleBar.svelte";

  import SplashScreen from "../components/SplashScreen.svelte";

  import StatusBar from "../components/StatusBar.svelte";

  import SettingsModal from "../components/SettingsModal.svelte";
  import { currentLayout } from "../stores/layoutStore";

  import { dividerPosition, handleMouseDown } from "../lib/resizablePanel";

  import DiffViewer from "../components/DiffViewer.svelte";

  import {
    sendRequest,
    prepareRequestData,
    createNewStatusHistoryItem,
    createNewHistoryItem,
  } from "$lib/requestModule";

  import CurlImportDialog from "../components/CurlImportDialog.svelte";

  import { importCurlCommand, validateCurlCommand } from "$lib/curlImporter";

  import { importHarFile } from "$lib/harImporter";

  import MenuPanel from "../components/MenuPanel.svelte";

  import HarAnalyzerModal from "../components/HarAnalyzerModal.svelte";

  import { url, method } from "../stores/urlStore";


  import {
    showModal,
    itemToDelete,
    variablesPanelOpen,
    groupModalOpen,
    themeModalOpen,
    apiFlowModalOpen,
    showDiffView,
  } from "../stores/modalStatesStore";

  import ResponseHeadersTable from "../components/ResponseHeadersTable.svelte";

  import AdvancedDataTable from "../components/AdvancedDataTable.svelte";

  let showHarAnalyzerModal = false;

  function openHarAnalyzerModal() {
    showHarAnalyzerModal = true;
  }

  let showImportMenu = false;

   const urlAutocomplete = writable<string[]>([]);
 const headerAutocomplete = writable<string[]>([]);
 const queryParamAutocomplete = writable<string[]>([]);

  function handleImport(
    event: CustomEvent<{ type: "har" | "curl" | "postman" }>,
  ) {
    const { type } = event.detail;
    switch (type) {
      case "har":
        handleImportHar();
        break;
      case "curl":
        openCurlImportDialog();
        break;
      case "postman":
        importPostmanCollection();
        break;
    }
    closeImportMenu();
  }

  function toggleImportMenu() {
    showImportMenu = !showImportMenu;
  }

  function closeImportMenu() {
    showImportMenu = false;
  }
  async function handleImportHar() {
    try {
      const selected = await dialog.open({
        multiple: false,
        filters: [{ name: "HAR Files", extensions: ["har"] }],
      });

      if (selected) {
        const content = await readTextFile(selected as string);
        const importedItems = await importHarFile(content);

        for (const item of importedItems) {
          history.update((h) => [item, ...h]);
          await saveHistory(item);
        }

        showStatusMessage(
          `Imported ${importedItems.length} requests from HAR file`,
          "info",
        );
      }
    } catch (error) {
      console.error("Error importing HAR file:", error);
      showStatusMessage("Failed to import HAR file", "error");
    }
  }
  let showCurlImportDialog = false;

  function openCurlImportDialog() {
    showCurlImportDialog = true;
  }

  async function handleCurlImport(event: CustomEvent<string>) {
    const curlCommand = event.detail;
    if (validateCurlCommand(curlCommand)) {
      try {
        const historyItem = await importCurlCommand(curlCommand);
        history.update((h) => [historyItem, ...h]);
        await saveHistory(historyItem);
        showStatusMessage("cURL command imported successfully", "info");

        url.set(historyItem.url);
        method.set(historyItem.method);
        body.set(historyItem.body);
        headers.set(historyItem.headers);
      } catch (error) {
        showStatusMessage("Failed to import cURL command", "error");
      }
    } else {
      showStatusMessage("Invalid cURL command", "error");
    }
  }

  type EnvVariable = {
    key: string;
    values: { [env: string]: string };
  };

  $: $currentLayout, localStorage.setItem("preferredLayout", $currentLayout);

  export let currentEnvironment = writable("default");

  export let envVariables: Writable<EnvVariable[]> = writable([]);

  export let requestTimeout = writable(
    Number(localStorage.getItem("requestTimeout")) || 30000,
  );

  function getEnvVariableValue(key: string): string {
    let value = "";
    envVariables.subscribe((vars) => {
      const variable = vars.find((v) => v.key === key);
      if (variable) {
        value = variable.values[$currentEnvironment] || "";
      }
    })();
    return value;
  }

  async function exportResponseToPDF() {
    if ($response && $response.body) {
      const responseBody = JSON.parse($response.body);
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const fontSize = 12;

      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      page.setFont(helveticaFont);
      page.setFontSize(fontSize);

      let yPosition = height - 40;

      const addText = (text: string, x: number, y: number) => {
        page.drawText(text, { x, y, size: fontSize });
      };

      const addJsonToPdf = (json: any, indent = 0) => {
        const indentSpaces = " ".repeat(indent * 2);
        for (const key in json) {
          if (typeof json[key] === "object" && json[key] !== null) {
            addText(`${indentSpaces}${key}:`, 40, yPosition);
            yPosition -= fontSize + 5;
            addJsonToPdf(json[key], indent + 1);
          } else {
            addText(`${indentSpaces}${key}: ${json[key]}`, 40, yPosition);
            yPosition -= fontSize + 5;
          }
        }
      };

      addJsonToPdf(responseBody);

      const pdfBytes = await pdfDoc.save();

      const filePath = await dialog.save({
        defaultPath: "response.pdf",
        title: "Save PDF",
        filters: [
          {
            name: "PDF",
            extensions: ["pdf"],
          },
        ],
      });

      if (filePath) {
        await writeBinaryFile(filePath, pdfBytes);
        console.log("PDF file saved successfully:", filePath);
        showStatusMessage("PDF file saved successfully.");
      }
    } else {
      showStatusMessage("No response data to export.", "error");
    }
  }
  export let showSettings = writable(false);
  function openSettings() {
    showSettings.set(true);
  }

  const statusMessage: Writable<string | null> = writable(null);
  const statusType: Writable<"info" | "warn" | "error"> = writable("info");

  function showStatusMessage(
    message: string,
    type: "info" | "warn" | "error" = "info",
  ): void {
    statusMessage.set(message);
    statusType.set(type);
    setTimeout(() => {
      statusMessage.set(null);
    }, 3000);
  }

  function openThemeSwitcherModal() {
    themeModalOpen.set(true);
  }

  function closeThemeSwitcherModal() {
    themeModalOpen.set(false);
  }

  let currentFlow: Writable<Flow | null> = writable(null);
  let flowResults: Writable<{ [key: string]: any } | null> = writable(null);

  function openModal(id: number) {
    itemToDelete.set(id);
    showModal.set(true);
  }

  function closeModal() {
    showModal.set(false);
    itemToDelete.set(null);
  }

  function confirmDelete() {
    itemToDelete.update((id) => {
      if (id !== null) {
        deleteHistoryItem(id);
      }
      return null;
    });
    closeModal();
  }

  async function runFlow(flow: Flow) {
    console.log("Running flow:", flow);
    flowResults.set(null);

    const variables: { [key: string]: any } = {};

    let currentBlockIndex = 0;

    while (currentBlockIndex < flow.blocks.length) {
      let block = flow.blocks[currentBlockIndex];
      try {
        let result;
        switch (block.type) {
          case "api_call":
            result = await executeApiCall(block, variables);
            break;
          case "condition":
            result = executeCondition(block, variables);
            break;
          case "loop":
            result = await executeLoop(block, variables, flow);
            break;
          case "variable":
            result = executeVariable(block, variables);
            break;
          case "json_transformer":
            result = executeJsonTransformer(block, variables);
            break;
          case "regex":
            result = executeRegex(block, variables);
            break;
          case "custom_script":
            result = executeCustomScript(block, variables);
            break;
          case "webhook":
            result = await executeWebhook(block, variables);
            break;
          case "try_catch":
            result = await executeTryCatch(block, variables, flow);
            break;
          case "switch_case":
            result = executeSwitchCase(block, variables);
            break;
          case "auth":
            result = await executeAuth(block, variables);
            break;
          case "start":
          case "end":
          case "comment":
          case "group":
            result = { message: `${block.type} block executed` };
            break;
          default:
            console.warn(`Unsupported block type: ${block.type}`);
            result = { error: `Unsupported block type: ${block.type}` };
        }

        flowResults.update((results) => ({ ...results, [block.id]: result }));

        const nextBlockId = determineNextBlock(block, result, flow);
        if (!nextBlockId) break;

        const nextBlockIndex = flow.blocks.findIndex(
          (b) => b.id === nextBlockId,
        );
        if (nextBlockIndex === -1) {
          console.error(`Next block with id ${nextBlockId} not found`);
          break;
        }

        currentBlockIndex = nextBlockIndex;
      } catch (error) {
        console.error("Error in flow execution:", error);
        flowResults.update((results) => ({
          ...results,
          [block.id]: {
            error: error instanceof Error ? error.message : String(error),
          },
        }));
        break;
      }
    }
  }

  async function executeApiCall(
    block: FlowBlock,
    variables: { [key: string]: any },
  ): Promise<any> {
    const requestData = {
      url: replaceVariables(block.data.url, variables),
      method: block.data.method,
      headers: Object.fromEntries(
        Object.entries(block.data.headers).map(([key, value]) => [
          key,
          replaceVariables(value as string, variables),
        ]),
      ),
      body: replaceVariables(block.data.body, variables),
    };
    return await invoke<ResponseData>("send_request", { requestData });
  }

  function executeCondition(
    block: FlowBlock,
    variables: { [key: string]: any },
  ): boolean {
    const condition = replaceVariables(block.data.condition, variables);
    return eval(condition);
  }

  async function executeLoop(
    block: FlowBlock,
    variables: { [key: string]: any },
    flow: Flow,
  ): Promise<any[]> {
    const results: any[] = [];
    const maxIterations = parseInt(
      replaceVariables(block.data.maxIterations, variables),
    );
    const loopBlocks = flow.blocks.filter((b) => b.group === block.id);

    for (let i = 0; i < maxIterations; i++) {
      variables[block.data.iterator] = i;
      let currentBlockId = block.next;

      while (currentBlockId) {
        const currentBlock = loopBlocks.find((b) => b.id === currentBlockId);
        if (!currentBlock) break;

        try {
          let result;
          switch (currentBlock.type) {
            case "api_call":
              result = await executeApiCall(currentBlock, variables);
              break;
            case "condition":
              result = executeCondition(currentBlock, variables);
              break;

            default:
              result = {
                message: `Unsupported block type in loop: ${currentBlock.type}`,
              };
          }

          results.push(result);

          currentBlockId = determineNextBlock(currentBlock, result, flow);
        } catch (error) {
          console.error(
            `Error in loop iteration ${i}, block ${currentBlockId}:`,
            error,
          );
          results.push({
            error: error instanceof Error ? error.message : String(error),
          });
          break;
        }
      }

      if (currentBlockId === null) break;
    }

    return results;
  }

  function executeVariable(
    block: FlowBlock,
    variables: { [key: string]: any },
  ): any {
    const value = replaceVariables(block.data.value, variables);
    variables[block.data.name] = value;
    return { [block.data.name]: value };
  }

  function executeJsonTransformer(
    block: FlowBlock,
    variables: { [key: string]: any },
  ): any {
    const input = JSON.parse(replaceVariables(block.data.input, variables));
    const transformFunction = new Function(
      "input",
      block.data.transformFunction,
    );
    return transformFunction(input);
  }

  function executeRegex(
    block: FlowBlock,
    variables: { [key: string]: any },
  ): any {
    const input = replaceVariables(block.data.input, variables);
    const regex = new RegExp(block.data.pattern, block.data.flags);
    return input.match(regex);
  }

  function executeCustomScript(
    block: FlowBlock,
    variables: { [key: string]: any },
  ): any {
    const script = replaceVariables(block.data.script, variables);
    return eval(script);
  }

  async function executeWebhook(
    block: FlowBlock,
    variables: { [key: string]: any },
  ): Promise<any> {
    return { message: "Webhook executed" };
  }

  async function executeTryCatch(
    block: FlowBlock,
    variables: { [key: string]: any },
    flow: Flow,
  ): Promise<any> {
    try {
      // Try bloğundaki işlemleri çalıştır
    } catch (error) {
      // Catch bloğundaki işlemleri çalıştır
    }
    return { message: "Try-Catch executed" };
  }

  function executeSwitchCase(
    block: FlowBlock,
    variables: { [key: string]: any },
  ): any {
    const value = replaceVariables(block.data.switchValue, variables);
    const cases = block.data.cases;
    for (const caseItem of cases) {
      if (caseItem.value === value) {
        return { result: caseItem.result };
      }
    }
    return { result: block.data.defaultCase };
  }

  async function executeAuth(
    block: FlowBlock,
    variables: { [key: string]: any },
  ): Promise<any> {
    return { message: "Auth executed" };
  }

  function replaceVariables(
    str: string,
    variables: { [key: string]: any },
  ): string {
    return str.replace(/\{\{(.*?)\}\}/g, (match, key) => {
      let value = "";
      envVariables.subscribe((vars) => {
        const variable = vars.find((v) => v.key === key.trim());
        if (variable) {
          value = variable.values[$currentEnvironment] || match;
        } else {
          value = match;
        }
      })();
      return value;
    });
  }

  function determineNextBlock(
    currentBlock: FlowBlock,
    result: any,
    flow: Flow,
  ): string | null {
    if (currentBlock.type === "condition") {
      return result
        ? currentBlock.next ?? null
        : currentBlock.alternative ?? null;
    } else if (currentBlock.type === "switch_case") {
      const matchingCase = currentBlock.data.cases.find(
        (c: SwitchCase) => c.value === result.result,
      );
      return matchingCase?.next ?? currentBlock.data.defaultNext ?? null;
    } else {
      return currentBlock.next ?? null;
    }
  }

  currentFlow.set({
    id: crypto.randomUUID(),
    name: "New Flow",
    description: "",
    version: "1.0.0",
    blocks: [],
    connections: [],
    variables: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: "Anonymous",
    tags: [],
  });

  function handleFlowSave(event: CustomEvent<Flow>) {
    currentFlow.set(event.detail);

    console.log("Flow saved:", event.detail);
  }

  function handleFlowRun(event: CustomEvent<Flow>) {
    runFlow(event.detail);
  }

  function openApiFlowModal() {
    apiFlowModalOpen.set(true);
  }

  function closeApiFlowModal() {
    apiFlowModalOpen.set(false);
  }

  let body = writable("");
  let params = writable<Param[]>([]);
  let bodyType = writable("json");
  let response = writable<ResponseData | null>(null);
  let history = writable<HistoryItem[]>([]);
  let selectedTab = writable("response");
  let selectedRequestTab = writable("body");
  let selectedGroup = writable("");
  let groups = writable<string[]>([]);
  let newGroupName = writable("");

  let isSending = writable(false);
  let elapsedTime = writable(0);
  let startTime: number;
  let timer: ReturnType<typeof setInterval>;

  let variables = writable<{ [key: string]: string }>({});
  let newVariableKey = writable("");
  let newVariableValue = writable("");

  const DB_NAME = "request-rocket-db";
  const DB_VERSION = 1;

  const dbPromise = openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("history")) {
        db.createObjectStore("history", { keyPath: "id", autoIncrement: true });
      }

      if (!db.objectStoreNames.contains("variables")) {
        db.createObjectStore("variables", { keyPath: "key" });
      }

      if (!db.objectStoreNames.contains("statusHistory")) {
        const statusHistoryStore = db.createObjectStore("statusHistory", {
          keyPath: "id",
          autoIncrement: true,
        });
        statusHistoryStore.createIndex("url", "url");
      }

      if (!db.objectStoreNames.contains("customHeaders")) {
        db.createObjectStore("customHeaders", {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    },
  });

  let statusHistory = writable<StatusHistoryItem[]>([]);

  async function saveStatusHistory(statusHistoryItem: StatusHistoryItem) {
    console.log("Saving status history:", statusHistoryItem);
    try {
      const db = await dbPromise;
      await db.add("statusHistory", statusHistoryItem);
      console.log("Status history saved successfully.");
    } catch (error) {
      console.error(
        "Error saving status history:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  async function loadStatusHistory(url: string) {
    console.log("Loading status history for URL:", url);
    try {
      const db = await dbPromise;
      const tx = db.transaction("statusHistory", "readonly");
      const store = tx.objectStore("statusHistory");

      if (!store.indexNames.contains("url")) {
        throw new Error("Index 'url' not found");
      }

      const index = store.index("url");
      const allStatusHistoryItems = await index.getAll(IDBKeyRange.only(url));
      statusHistory.set(allStatusHistoryItems);
    } catch (error) {
      console.error(
        "Failed to load status history:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  async function addHeader() {
    headers.update((h) => [...h, { key: "", value: "", selected: true }]);
  }

  async function addFormField() {
    formParams.update((f) => [...f, { key: "", value: "" }]);
  }

  async function addParam() {
    queryParams.update((p) => [...p, { key: "", value: "" }]);
    updateUrl();
  }

  function clearHeaders() {
    headers.set([]);
  }

  type Header = { key: string; value: string; selected: boolean };
  type AutocompleteHeaders = string[][];

  $: headerCount = $headers ? $headers.length : 0;
  $: pathParamsCount = $pathParams.length;
  $: queryParamsCount = $queryParams.length;
  $: formDataCount = $formParams.length;
  $: responseHeaderCount = $response ? $response.headers.length : 0;

  let autocompleteHeaders = writable<AutocompleteHeaders>([]);
  let knownHeaders: string[] = [
    "Accept",
    "Accept-Charset",
    "Accept-Encoding",
    "Accept-Language",
    "Accept-Datetime",
    "Authorization",
    "Cache-Control",
    "Connection",
    "Content-Length",
    "Content-MD5",
    "Content-Type",
    "Cookie",
    "Date",
    "Expect",
    "Forwarded",
    "From",
    "Host",
    "If-Match",
    "If-Modified-Since",
    "If-None-Match",
    "If-Range",
    "If-Unmodified-Since",
    "Max-Forwards",
    "Pragma",
    "Proxy-Authorization",
    "Range",
    "Referer",
    "TE",
    "User-Agent",
    "Upgrade",
    "Via",
    "Warning",
    "A-IM",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers",
    "Content-Encoding",
    "Content-Language",
    "Origin",
    "DNT",
    "X-Requested-With",
    "Content-Location",
    "Content-Disposition",
    "Content-Security-Policy",
    "X-Frame-Options",
    "X-XSS-Protection",
    "Strict-Transport-Security",
  ];

  function clearParams() {
    queryParams.set([]);
    updateUrl();
  }

  async function createNewGroup() {
    const trimmedGroupName = $newGroupName.trim();
    const MAX_GROUP_NAME_LENGTH = 50;

    if (!trimmedGroupName) {
      showStatusMessage("Group name cannot be empty", "error");
      return;
    }

    if (trimmedGroupName.length > MAX_GROUP_NAME_LENGTH) {
      showStatusMessage(
        `Group name cannot exceed ${MAX_GROUP_NAME_LENGTH} characters`,
        "error",
      );
      return;
    }

    let groupExists = false;
    groups.update((g) => {
      if (
        g.some(
          (existingGroup) =>
            existingGroup.toLowerCase() === trimmedGroupName.toLowerCase(),
        )
      ) {
        groupExists = true;
        return g;
      }
      return [...g, trimmedGroupName];
    });

    if (groupExists) {
      showStatusMessage(`Group "${trimmedGroupName}" already exists`, "warn");
      return;
    }

    selectedGroup.set(trimmedGroupName);
    newGroupName.set("");
    groupModalOpen.set(false);

    try {
      await loadHistory(trimmedGroupName);
      showStatusMessage(
        `Group "${trimmedGroupName}" created successfully`,
        "info",
      );
    } catch (error) {
      console.error("Error loading history for new group:", error);
      showStatusMessage(
        `Group created, but there was an error loading its history`,
        "warn",
      );
    }
  }

  $: {
    if ($url.trim()) {
      try {
        const replacedUrl = replaceVariables($url, $variables);
        const urlObj = new URL(replacedUrl);

        const newQueryParams = Array.from(urlObj.searchParams.entries()).map(
          ([key, value]) => ({ key, value }),
        );

        if (newQueryParams.length > 0) {
          queryParams.update((currentParams) => {
            const currentParamsMap = new Map(
              currentParams.map((param) => [param.key, param]),
            );
            newQueryParams.forEach((param) => {
              if (!currentParamsMap.has(param.key)) {
                currentParamsMap.set(param.key, param);
              }
            });
            return Array.from(currentParamsMap.values());
          });

          url.set(urlObj.origin + urlObj.pathname);
        }
      } catch (error) {
        console.error("Invalid URL:", error);
      }
    }
  }

  let searchTerm = writable("");

  function updateUrl() {
    if (!$url.trim()) {
      return;
    }

    try {
      const updatedUrl = replaceVariables($url, $variables);
      const urlObj = new URL(updatedUrl);

      urlObj.search = "";
      const nonEmptyParams = $queryParams.filter(
        (param) => param.key && param.value,
      );

      if (nonEmptyParams.length > 0) {
        nonEmptyParams.forEach((param) => {
          urlObj.searchParams.set(param.key, param.value);
        });
      }

      const newUrl = urlObj.toString();

      if (newUrl !== $url) {
        url.set(newUrl);
      }
    } catch (error) {
      console.error("Error updating URL:", error);
    }
  }

  async function handleSendRequest() {
    if (!$url.trim()) {
      showStatusMessage("URL cannot be empty", "error");
      return;
    }

    isSending.set(true);
    const actualUrl = $url;

    const requestData = prepareRequestData(
      actualUrl,
      $method,
      $headers,
      $body,
      $pathParams,
      $queryParams,
      $formParams,
      $bodyType,
      $variables,
      $requestTimeout,
    );

    try {
      const res = await sendRequest(requestData, $variables);
      response.set(res);
      isSending.set(false);

      const newStatusHistoryItem = createNewStatusHistoryItem(actualUrl, res);
      saveStatusHistory(newStatusHistoryItem);
      statusHistory.update((history) => [...history, newStatusHistoryItem]);

      const existingHistoryItem = $history.find(
        (item) =>
          item.url === actualUrl &&
          item.method === $method &&
          item.group === $selectedGroup,
      );

      if (existingHistoryItem) {
        const updatedHistoryItem = {
          ...existingHistoryItem,
          body: $body,
          headers: $headers,
          params: $params,
          response: JSON.stringify(res),
        };
        updateHistoryItem(updatedHistoryItem);
      } else {
        const newHistoryItem = createNewHistoryItem(
          actualUrl,
          $method,
          $body,
          $headers,
          $params,
          JSON.stringify(res),
          $selectedGroup,
        );
        history.update((h) => {
          const newHistory = [...h, newHistoryItem];
          saveHistory(newHistoryItem);
          return newHistory;
        });
      }
    } catch (error) {
      console.error("Request failed:", error);
      let errorMessage = error instanceof Error ? error.message : String(error);
      response.set({
        status: 0,
        duration: 0,
        size: 0,
        body: "",
        headers: [],
        curl_command: "",
        timestamp: new Date().toISOString(),
        error: errorMessage,
      });
      isSending.set(false);
    }
  }

  function getVariableSuggestions(partial: string): string[] {
    const environment = $currentEnvironment;
    let suggestions: string[] = [];
    envVariables.subscribe((vars) => {
      suggestions = vars
        .filter((variable) => variable.values[environment] !== undefined)
        .map((variable) => variable.key)
        .filter((key) => key.toLowerCase().includes(partial.toLowerCase()));
    })();
    return suggestions;
  }

  function handleQueryParamInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const lastOpenBrace = value.lastIndexOf("{{");
    if (lastOpenBrace !== -1 && lastOpenBrace > value.lastIndexOf("}}")) {
      const partial = value.slice(lastOpenBrace + 2);
      const suggestions = getVariableSuggestions(partial);
      queryParamAutocomplete.set(suggestions);
    } else {
      queryParamAutocomplete.set([]);
    }
  }

  function selectQueryParamSuggestion(index: number, suggestion: string) {
    queryParams.update((qp) => {
      const lastOpenBrace = qp[index].key.lastIndexOf("{{");
      if (lastOpenBrace !== -1) {
        const partial = qp[index].key.slice(lastOpenBrace + 2);
        qp[index].key =
          qp[index].key.slice(0, lastOpenBrace + 2) + suggestion + "}}";
      } else {
        qp[index].key = "{{" + suggestion + "}}";
      }
      return qp;
    });
    queryParamAutocomplete.set([]);
  }

  function handleUrlInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const lastOpenBrace = value.lastIndexOf("{{");
    if (lastOpenBrace !== -1 && lastOpenBrace > value.lastIndexOf("}}")) {
      const partial = value.slice(lastOpenBrace + 2);
      const suggestions = getVariableSuggestions(partial);
      urlAutocomplete.set(suggestions);
    } else {
      urlAutocomplete.set([]);
    }
  }

  function handleHeaderInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const lastOpenBrace = value.lastIndexOf("{{");
    if (lastOpenBrace !== -1 && lastOpenBrace > value.lastIndexOf("}}")) {
      const partial = value.slice(lastOpenBrace + 2);
      const suggestions = getVariableSuggestions(partial);
      headerAutocomplete.set(suggestions);
    } else {
      const suggestions = [
        ...knownHeaders,
        ...$customHeaders.map((h) => h.name),
      ].filter((header) => header.toLowerCase().includes(value.toLowerCase()));
      headerAutocomplete.set(suggestions);
    }
  }

  function selectHeaderSuggestion(index: number, suggestion: string) {
    headers.update((h) => {
      const lastOpenBrace = h[index].key.lastIndexOf("{{");
      if (
        lastOpenBrace !== -1 &&
        lastOpenBrace > h[index].key.lastIndexOf("}}")
      ) {
        h[index].key =
          h[index].key.slice(0, lastOpenBrace) + "{{" + suggestion + "}}";
      } else {
        h[index].key = suggestion;
      }
      return h;
    });
    headerAutocomplete.set([]);
  }

  function selectUrlSuggestion(suggestion: string) {
    const lastOpenBrace = $url.lastIndexOf("{{");
    url.set($url.slice(0, lastOpenBrace) + "{{" + suggestion + "}}");
    urlAutocomplete.set([]);
  }

  async function cancelRequest() {
    await invoke("cancel_request");
    isSending.set(false);
  }

  async function saveHistory(historyItem: HistoryItem) {
    console.log("Saving history:", historyItem);
    try {
      const db = await dbPromise;
      await db.add("history", historyItem);
      console.log("History saved successfully.");
    } catch (error) {
      console.error(
        "Error saving history:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  async function updateHistoryItem(historyItem: HistoryItem) {
    console.log("Updating history:", historyItem);
    try {
      const db = await dbPromise;
      await db.put("history", historyItem);
      console.log("History updated successfully.");
      history.update((h) =>
        h.map((item) => (item.id === historyItem.id ? historyItem : item)),
      );
    } catch (error) {
      console.error(
        "Error updating history:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  async function loadGroups() {
    console.log("Loading groups...");
    try {
      const db = await dbPromise;
      const allHistoryItems = await db.getAll("history");
      const uniqueGroups = [
        ...new Set(allHistoryItems.map((item) => item.group)),
      ];
      groups.set(uniqueGroups);
    } catch (error) {
      console.error(
        "Failed to load groups:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  async function loadHistory(selectedGroup: string) {
    console.log("Loading history for group:", selectedGroup);
    try {
      const db = await dbPromise;
      const allHistoryItems = await db.getAll("history");
      const filteredHistory = allHistoryItems
        .filter((item) => item.group === selectedGroup)
        .map((item) => ({
          ...item,
          headers: item.headers || [],
        }));
      history.set(filteredHistory.reverse());
    } catch (error) {
      console.error(
        "Failed to load history:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  async function deleteHistoryItem(id: number) {
    console.log("Deleting history item:", id);
    try {
      const db = await dbPromise;
      await db.delete("history", id);
      history.update((h) => h.filter((item) => item.id !== id));
      console.log("History item deleted successfully.");
      clearInput(url);
    } catch (error) {
      console.error(
        "Error deleting history item:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  function duplicateHistoryItem(item: HistoryItem) {
    const newHistoryItem: HistoryItem = {
      ...item,
      id: Date.now(),
      url: item.url,
    };
    history.update((h) => {
      const newHistory = [newHistoryItem, ...h];
      saveHistory(newHistoryItem);
      return newHistory;
    });

    selectHistoryItem(newHistoryItem);
  }

  async function saveVariable(key: string, environment: string, value: string) {
    console.log("Saving variable:", { key, environment, value });
    try {
      const db = await dbPromise;
      const variable = await db.get("variables", key);
      if (variable) {
        variable.values[environment] = value;
        await db.put("variables", variable);
      } else {
        await db.put("variables", { key, values: { [environment]: value } });
      }
      console.log("Variable saved successfully.");
    } catch (error) {
      console.error(
        "Error saving variable:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  async function deleteVariableFromDb(key: string) {
    console.log("Deleting variable:", key);
    try {
      const db = await dbPromise;
      await db.delete("variables", key);
      console.log("Variable deleted successfully.");
    } catch (error) {
      console.error(
        "Error deleting variable:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  function isXml(str: string): boolean {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(str, "text/xml");
      return !doc.querySelector("parsererror");
    } catch (error) {
      return false;
    }
  }

  function formatXml(xml: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "text/xml");
    const serializer = new XMLSerializer();
    const formattedXml = serializer
      .serializeToString(doc)
      .replace(/>/g, ">\n")
      .replace(/\n{2,}/g, "\n")
      .trim();
    return Prism.highlight(formattedXml, Prism.languages.markup, "markup");
  }

  async function loadVariables() {
    console.log("Loading variables...");
    try {
      const db = await dbPromise;
      const allVariables = await db.getAll("variables");
      const variablesList = allVariables.map((v) => ({
        key: v.key,
        values: v.values,
      }));
      envVariables.set(variablesList);
    } catch (error) {
      console.error(
        "Failed to load variables:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  const statusClasses: { [key: string]: string } = {
    // Informational responses
    "100": "bg-purple-500",
    "101": "bg-purple-500",
    "1xx": "bg-purple-500",

    // Successful responses
    "200": "bg-green-500",
    "201": "bg-green-500",
    "202": "bg-green-500",
    "203": "bg-green-500",
    "204": "bg-green-500",
    "205": "bg-green-500",
    "206": "bg-green-500",
    "2xx": "bg-green-500",

    // Redirection messages
    "300": "bg-blue-500",
    "301": "bg-blue-500",
    "302": "bg-blue-500",
    "303": "bg-blue-500",
    "304": "bg-blue-500",
    "305": "bg-blue-500",
    "307": "bg-blue-500",
    "308": "bg-blue-500",
    "3xx": "bg-blue-500",

    // Client errors
    "400": "bg-yellow-500",
    "401": "bg-orange-500", // Unauthorized
    "402": "bg-yellow-500",
    "403": "bg-pink-500", // Forbidden
    "404": "bg-yellow-700", // Not Found
    "405": "bg-yellow-500",
    "406": "bg-yellow-500",
    "407": "bg-yellow-500",
    "408": "bg-yellow-500",
    "409": "bg-yellow-500",
    "410": "bg-yellow-500",
    "411": "bg-yellow-500",
    "412": "bg-yellow-500",
    "413": "bg-yellow-500",
    "414": "bg-yellow-500",
    "415": "bg-yellow-500",
    "416": "bg-yellow-500",
    "417": "bg-yellow-500",
    "418": "bg-yellow-500",
    "422": "bg-yellow-500",
    "425": "bg-yellow-500",
    "426": "bg-yellow-500",
    "428": "bg-yellow-500",
    "429": "bg-yellow-500",
    "431": "bg-yellow-500",
    "451": "bg-yellow-500",
    "4xx": "bg-yellow-500",

    // Server errors
    "500": "bg-red-500",
    "501": "bg-red-600",
    "502": "bg-red-700",
    "503": "bg-red-800",
    "504": "bg-red-600",
    "505": "bg-red-600",
    "506": "bg-red-600",
    "507": "bg-red-600",
    "508": "bg-red-600",
    "510": "bg-red-600",
    "511": "bg-red-600",
    "5xx": "bg-red-600",

    // Default
    default: "bg-gray-500",
  };

  function getStatusClass(status: number): string {
    const statusKey = `${status}`;
    const statusRangeKey = `${Math.floor(status / 100)}xx`;
    return (
      statusClasses[statusKey] ||
      statusClasses[statusRangeKey] ||
      statusClasses["default"]
    );
  }

  let jsonData = writable("{}");
  function selectHistoryItem(item: HistoryItem) {
    url.set(item.url);
    method.set(item.method);
    body.set(item.body);
    headers.set(item.headers || []);
    params.set(item.params || []);
    response.set(item.response ? JSON.parse(item.response) : null);
    jsonData.set(item.response ? item.response : "{}");
    queryParams.set(item.params || []);
    loadStatusHistory(item.url);
  }

  function handleGroupSelect(group: string) {
    selectedGroup.set(group);
    groupModalOpen.set(false);
    loadHistory(group);
  }

  function clearInput(store: Writable<string>) {
    store.set("");
    headers.set([]);
    params.set([]);
    response.set(null);
  }

  async function addVariable() {
    if (!$newVariableKey.trim()) {
      showStatusMessage("Variable key cannot be empty", "error");
      return;
    }

    const trimmedKey = $newVariableKey.trim();
    const trimmedValue = $newVariableValue.trim();
    const environment = $currentEnvironment;

    let variableExists = false;

    envVariables.update((vars) => {
      const variable = vars.find((v) => v.key === trimmedKey);
      if (variable) {
        variable.values[environment] = trimmedValue;
        variableExists = true;
      } else {
        vars.push({ key: trimmedKey, values: { [environment]: trimmedValue } });
      }
      return vars;
    });

    if (variableExists) {
      showStatusMessage(`Variable "${trimmedKey}" updated`, "info");
    } else {
      showStatusMessage(`Variable "${trimmedKey}" added successfully`, "info");
    }

    await saveVariable(trimmedKey, environment, trimmedValue);
    newVariableKey.set("");
    newVariableValue.set("");
  }

  function deleteVariable(key: string) {
    envVariables.update((vars) =>
      vars.filter((variable) => variable.key !== key),
    );
    deleteVariableFromDb(key);
  }

  function jsonToTableData(data: string): {
    headers: string[];
    rows: string[][];
  } {
    try {
      const jsonData = JSON.parse(data);
      return processData(jsonData);
    } catch (e) {
      try {
        const xmlData = xmlToJson(data);
        return processData(xmlData);
      } catch (xmlError) {
        console.error("Error parsing data:", xmlError);
        return { headers: [], rows: [] };
      }
    }
  }

  function xmlToJson(xml: string): any {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");

    function xmlToObj(node: Element): any {
      const obj: any = {};

      if (node.childNodes.length === 1 && node.childNodes[0].nodeType === 3) {
        return node.textContent;
      }

      for (const child of Array.from(node.children)) {
        const name = child.nodeName;

        if (obj[name]) {
          if (!Array.isArray(obj[name])) {
            obj[name] = [obj[name]];
          }
          obj[name].push(xmlToObj(child));
        } else {
          obj[name] = xmlToObj(child);
        }
      }

      return obj;
    }

    return xmlToObj(xmlDoc.documentElement);
  }

  function processData(data: any): { headers: string[]; rows: string[][] } {
    if (Array.isArray(data)) {
      const headers = Array.from(new Set(data.flatMap(Object.keys)));
      const rows = data.map((item) =>
        headers.map((header) => JSON.stringify(item[header] || "")),
      );
      return { headers, rows };
    } else if (typeof data === "object" && data !== null) {
      const headers = Object.keys(data);
      const rows = [
        headers.map((header) => {
          const value = data[header];
          if (typeof value === "object" && value !== null) {
            return JSON.stringify(value);
          } else {
            return String(value);
          }
        }),
      ];
      return { headers, rows };
    } else {
      return {
        headers: ["Value"],
        rows: [[JSON.stringify(data)]],
      };
    }
  }

  $: tableData =
    $response && $response.body
      ? jsonToTableData($response.body)
      : { headers: [], rows: [] };

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      console.log("Copied to clipboard");
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  }

  let timestampUpdateInterval: number;
  onMount(() => {
    isSending.subscribe((value) => {
      if (value) {
        startTime = Date.now();
        timer = setInterval(() => {
          elapsedTime.set(Date.now() - startTime);
        }, 10);
      } else {
        clearInterval(timer);
        elapsedTime.set(0);
      }
    });
  });

  onDestroy(() => {
    clearInterval(timer);
    clearInterval(timestampUpdateInterval);
  });
  let preElement: HTMLElement;

  $: $currentEnvironment,
    localStorage.setItem("selectedEnvironment", $currentEnvironment);

  onMount(async () => {
    const savedTheme = localStorage.getItem("selectedTheme");
    if (savedTheme) {
      applyTheme(savedTheme);
    }

    const savedEnvironment = localStorage.getItem("selectedEnvironment");
    if (savedEnvironment) {
      currentEnvironment.set(savedEnvironment);
    }
    loadGroups();
    loadVariables();
    const db = await dbPromise;
    setDatabase(db);
    if (preElement) {
      Prism.highlightElement(preElement);
    }
    await loadCustomHeaders();
  });

  $: $queryParams, updateUrl();

  function convertToPostmanFormat(historyItems: HistoryItem[]): any {
    const postmanCollection = {
      info: {
        name: "Exported Collection",
        schema:
          "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      },
      item: historyItems.map((item) => ({
        name: `${item.method} ${item.url}`,
        request: {
          method: item.method,
          header: item.headers.map((header) => ({
            key: header.key,
            value: header.value,
          })),
          body: item.body
            ? {
                mode: item.body.startsWith("{") ? "raw" : "urlencoded",
                raw: item.body,
                urlencoded: item.body.split("&").map((pair) => {
                  const [key, value] = pair.split("=");
                  return { key, value };
                }),
              }
            : undefined,
          url: {
            raw: item.url,
            host: item.url.split("/")[2].split("."),
            path: item.url.split("/").slice(3),
          },
        },
      })),
    };

    return postmanCollection;
  }

  function getBodyPlaceholder(type: string): string {
    switch (type) {
      case "json":
        return '{"key": "value"}';
      case "xml":
        return "<root>\n  <element>value</element>\n</root>";
      case "raw":
        return "Enter raw body data here";
      default:
        return "";
    }
  }

  $: bodyPlaceholder = getBodyPlaceholder($bodyType);

  function handleBodyTypeChange(event: CustomEvent<string>) {
    bodyType.set(event.detail);
    body.set(getBodyPlaceholder(event.detail));
  }

  async function downloadPostmanCollection(historyItems: HistoryItem[]) {
    const postmanCollection = convertToPostmanFormat(historyItems);
    const postmanJson = JSON.stringify(postmanCollection, null, 2);

    try {
      const filePath = await dialog.save({
        defaultPath: "postman-collection.json",
        title: "Save Postman Collection",
        filters: [
          {
            name: "JSON",
            extensions: ["json"],
          },
        ],
      });

      if (filePath) {
        await writeTextFile(filePath, postmanJson);
        console.log("File saved successfully:", filePath);
        showStatusMessage("File saved successfully.");
      }
    } catch (error) {
      console.error("Failed to save file:", error);

      showStatusMessage("Failed to save file.", "error");
    }
  }

  function handleExport() {
    downloadPostmanCollection($history);
  }

  async function importPostmanCollection() {
    try {
      const filePath = await dialog.open({
        filters: [
          {
            name: "JSON",
            extensions: ["json"],
          },
        ],
      });

      if (typeof filePath === "string") {
        const postmanJson = await readTextFile(filePath);
        const postmanCollection = JSON.parse(postmanJson);

        const fileName =
          filePath.split(/[/\\]/).pop()?.split(".")[0] ||
          "Imported from Postman";

        const importedHistoryItems: HistoryItem[] = processPostmanCollection(
          postmanCollection,
          fileName,
        );

        history.update((h) => {
          const newHistory = [...h, ...importedHistoryItems];
          importedHistoryItems.forEach((item) => saveHistory(item));
          return newHistory;
        });

        selectedGroup.set(fileName);

        groupModalOpen.set(false);

        showStatusMessage("Postman collection imported successfully.");
      }
    } catch (error) {
      console.error("Failed to import Postman collection:", error);

      showStatusMessage("Failed to import Postman collection.", "error");
    }
  }
  function processPostmanCollection(
    collection: any,
    groupName: string,
  ): HistoryItem[] {
    const processItem = (item: any): HistoryItem | null => {
      if (item.request) {
        return {
          id: Date.now() + Math.random(),
          url:
            typeof item.request.url === "string"
              ? item.request.url
              : item.request.url.raw,
          method: item.request.method,
          body: item.request.body?.raw || "",
          headers:
            item.request.header?.map((h: any) => ({
              key: h.key,
              value: h.value,
            })) || [],
          params:
            item.request.url.query?.map((q: any) => ({
              key: q.key,
              value: q.value,
            })) || [],
          response: "",
          group: groupName,
        };
      }
      return null;
    };

    const processItems = (items: any[]): HistoryItem[] => {
      return items.flatMap((item) => {
        if (item.item) {
          return processItems(item.item);
        } else {
          const processedItem = processItem(item);
          return processedItem ? [processedItem] : [];
        }
      });
    };

    return processItems(collection.item);
  }

  function generateApiDocumentation(historyItems: HistoryItem[]): ApiDoc {
    const apiDoc: ApiDoc = {
      info: {
        title: "Generated API Documentation",
        version: "1.0.0",
      },
      paths: {},
    };

    historyItems.forEach((item) => {
      if (!apiDoc.paths[item.url]) {
        apiDoc.paths[item.url] = {};
      }

      let requestBodyExample: any;
      try {
        requestBodyExample = JSON.parse(item.body);
      } catch (e) {
        requestBodyExample = item.body;
      }

      let responseBodyExample: any;
      try {
        responseBodyExample = item.response ? JSON.parse(item.response) : {};
      } catch (e) {
        responseBodyExample = item.response;
      }

      apiDoc.paths[item.url][item.method.toLowerCase()] = {
        summary: `Request to ${item.url}`,
        parameters: [
          ...item.headers.map((header) => ({
            name: header.key,
            in: "header",
            required: true,
            schema: {
              type: "string",
            },
            example: header.value,
          })),
          ...item.params.map((param) => ({
            name: param.key,
            in: "query",
            required: true,
            schema: {
              type: "string",
            },
            example: param.value,
          })),
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
              },
              example: requestBodyExample,
            },
          },
        },
        responses: {
          [item.response ? responseBodyExample.status : "default"]: {
            description: "Response",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                },
                example: responseBodyExample,
              },
            },
          },
        },
      };
    });

    return apiDoc;
  }

  async function downloadApiDocumentation(historyItems: HistoryItem[]) {
    const apiDoc = generateApiDocumentation(historyItems);
    const apiDocJson = JSON.stringify(apiDoc, null, 2);

    try {
      const filePath = await dialog.save({
        title: "Save API Documentation",
        defaultPath: "api-documentation.json",
        filters: [{ name: "JSON", extensions: ["json"] }],
      });

      if (filePath) {
        await writeTextFile(filePath, apiDocJson);
        console.log("API Documentation saved successfully:", filePath);

        showStatusMessage("API Documentation saved successfully.");
      }
    } catch (error) {
      console.error("Failed to save API Documentation:", error);

      showStatusMessage("Failed to save API Documentation.", "error");
    }
  }

  async function deleteAllStatusHistory(url: string) {
    console.log("Deleting all status history for URL:", url);
    try {
      const db = await dbPromise;
      const tx = db.transaction("statusHistory", "readwrite");
      const store = tx.objectStore("statusHistory");
      const index = store.index("url");

      let cursor = await index.openCursor(IDBKeyRange.only(url));
      while (cursor) {
        await cursor.delete();
        cursor = await cursor.continue();
      }

      await tx.done;

      statusHistory.update((history) =>
        history.filter((item) => item.url !== url),
      );
      console.log("All status history for the URL deleted successfully.");
    } catch (error) {
      console.error(
        "Error deleting status history:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  function timeAgo(timestamp: string): string {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffSecs = Math.round(diffMs / 1000);
    const diffMins = Math.round(diffSecs / 60);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    if (diffSecs < 60) {
      return `${diffSecs} seconds ago`;
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    }
  }

  let statusHistoryOpen = writable(false);

  function toggleStatusHistory() {
    statusHistoryOpen.update((open) => !open);
  }

  function formatSize(size: number): string {
    return `${(size / 1024).toFixed(2)} KB`;
  }

  function clearAutocomplete(index: number) {
    setTimeout(() => {
      autocompleteHeaders.update((h) => {
        h[index] = [];
        return h;
      });
    }, 200);
  }

  function handleKeydown(event: KeyboardEvent, callback: () => void) {
    if (event.key === "Enter") {
      callback();
    }
  }

  let isLoading = writable(true);

  async function initializeApp() {
    try {
      await loadGroups();
      await loadVariables();
      await loadCustomHeaders();

      isLoading.set(false);
    } catch (error) {
      console.error("Error loading initial data:", error);
      isLoading.set(false);
    }
  }

  function jsonToCSV(jsonData: any): string {
    const rows = [];

    const convertToRow = (obj: any, headers: string[]): string[] => {
      return headers.map((header) =>
        obj[header] ? JSON.stringify(obj[header]) : "",
      );
    };

    if (Array.isArray(jsonData)) {
      const headers = Array.from(new Set(jsonData.flatMap(Object.keys)));
      rows.push(headers.join(","));

      for (const item of jsonData) {
        rows.push(convertToRow(item, headers).join(","));
      }
    } else if (typeof jsonData === "object" && jsonData !== null) {
      const headers = Object.keys(jsonData);
      rows.push(headers.join(","));
      rows.push(convertToRow(jsonData, headers).join(","));
    } else {
      rows.push("Value");
      rows.push(JSON.stringify(jsonData));
    }

    return rows.join("\n");
  }

  async function exportResponseToCSV() {
    if ($response && $response.body) {
      const csvData = jsonToCSV(JSON.parse($response.body));
      const filePath = await dialog.save({
        defaultPath: "response.csv",
        title: "Save CSV",
        filters: [
          {
            name: "CSV",
            extensions: ["csv"],
          },
        ],
      });

      if (filePath) {
        await writeTextFile(filePath, csvData);
        console.log("CSV file saved successfully:", filePath);
        showStatusMessage("CSV file saved successfully.");
      }
    } else {
      showStatusMessage("No response data to export.", "error");
    }
  }

  let showConfirmModal = writable(false);

  function openConfirmModal() {
    showConfirmModal.set(true);
  }

  function closeConfirmModal() {
    showConfirmModal.set(false);
  }

  function handleConfirmDelete() {
    deleteAllStatusHistory($url);
    closeConfirmModal();
  }

  let selectedHistoryItems = writable<HistoryItem[]>([]);
  function toggleHistoryItemSelection(item: HistoryItem) {
    selectedHistoryItems.update((items) => {
      const index = items.findIndex((i) => i.id === item.id);
      if (index !== -1) {
        return items.filter((i) => i.id !== item.id);
      } else if (items.length < 2) {
        return [...items, item];
      }
      return items;
    });
  }

  function openDiffView() {
    if ($selectedHistoryItems.length === 2) {
      showDiffView.set(true);
    }
  }
  //release alırken aç
  // document.addEventListener(
  //   "contextmenu",
  //   (e: MouseEvent) => {
  //     e.preventDefault();
  //     return false;
  //   },
  //   { capture: true },
  // );
</script>

{#if $isLoading}
  <SplashScreen onFinish={initializeApp} />
{:else}
  <TitleBar />

  <div class="flex h-screen flex-col">
    <div class="main-content">
      <MenuPanel
        on:openThemeSwitcher={() => themeModalOpen.set(true)}
        on:openGroupModal={() => groupModalOpen.set(true)}
        on:openCustomHeaderPanel={openCustomHeaderPanel}
        on:openVariablesPanel={() => variablesPanelOpen.set(true)}
        on:openHarAnalyzer={openHarAnalyzerModal}
        on:import={handleImport}
        on:downloadApiDocumentation={() => downloadApiDocumentation($history)}
        on:openApiFlowModal={openApiFlowModal}
        on:handleExport={handleExport}
        on:openSettings={openSettings}
      />

      {#if $currentLayout === "default"}
        <div class="history-panel-horizontal panel">
          {#if $selectedGroup}
            <div class="group">
              <div class="group-header sticky top-0 z-10">
                <div class="flex justify-between items-center mb-2">
                  <h1
                    class="text-base font-semibold flex items-center group-title"
                    title={$selectedGroup}
                  >
                    <span class="truncate">{$selectedGroup}</span>
                  </h1>
                </div>

                <div class="search-container mb-2">
                  <input
                    type="text"
                    bind:value={$searchTerm}
                    placeholder="Search history..."
                    class="w-full p-2 border rounded"
                  />
                  {#if $selectedHistoryItems.length === 2}
                    <button on:click={openDiffView} class="compare-button">
                      <span class="button-text">Compare Selected</span>
                      <span class="button-icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <polyline points="16 3 21 3 21 8"></polyline>
                          <line x1="4" y1="20" x2="21" y2="3"></line>
                          <polyline points="21 16 21 21 16 21"></polyline>
                          <line x1="15" y1="15" x2="21" y2="21"></line>
                          <line x1="4" y1="4" x2="9" y2="9"></line>
                        </svg>
                      </span>
                    </button>
                  {/if}
                </div>
              </div>

              <div class="history-list-horizontal">
                <ul>
                  {#each $history.filter((item) => item.url
                        .toLowerCase()
                        .includes($searchTerm.toLowerCase()) || item.method
                        .toLowerCase()
                        .includes($searchTerm.toLowerCase())) as item}
                    <li
                      class="mb-2 history-item flex justify-between items-center"
                    >
                      <button
                        type="button"
                        class="w-full text-left"
                        on:click={() => selectHistoryItem(item)}
                      >
                        <span
                          class="px-2 py-1 rounded
                        {item.method === 'GET' ? 'method-get' : ''} 
                        {item.method === 'POST' ? 'method-post' : ''} 
                        {item.method === 'PUT' ? 'method-put' : ''} 
                        {item.method === 'DELETE' ? 'method-delete' : ''} 
                        {item.method === 'PATCH' ? 'method-patch' : ''} 
                        {item.method === 'OPTIONS' ? 'method-options' : ''} 
                        {item.method === 'HEAD' ? 'method-head' : ''} 
                        {item.method === 'CONNECT' ? 'method-connect' : ''} 
                        {item.method === 'TRACE' ? 'method-trace' : ''}
                        text-white"
                        >
                          {item.method.substring(0, 3)}
                        </span>
                        <span class="url">{item.url}</span>
                      </button>
                      <label class="custom-checkbox">
                        <input
                          type="checkbox"
                          checked={$selectedHistoryItems.some(
                            (i) => i.id === item.id,
                          )}
                          on:change={() => toggleHistoryItemSelection(item)}
                          disabled={$selectedHistoryItems.length === 2 &&
                            !$selectedHistoryItems.some(
                              (i) => i.id === item.id,
                            )}
                        />
                        <span class="checkmark"></span>
                      </label>
                      <button
                        class="duplicate-icon"
                        aria-label="Duplicate history item"
                        on:click={() => duplicateHistoryItem(item)}
                        on:keydown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            duplicateHistoryItem(item);
                        }}
                      >
                        <Icon
                          icon="clarity:clone-solid"
                          width="18"
                          height="18"
                        />
                      </button>
                      <button
                        class="delete-icon"
                        aria-label="Delete history item"
                        on:click={() => openModal(item.id)}
                        on:keydown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            openModal(item.id);
                        }}
                      >
                        <Icon
                          icon="material-symbols:delete-outline"
                          width="18"
                          height="18"
                        />
                      </button>
                    </li>
                  {/each}
                </ul>
              </div>
            </div>
          {/if}
        </div>

        <div class="request-panel panel">
          <div class="flex mb-2 w-full">
            <HttpMethodDropdown {method} />

            <div class="input-container">
              <input
                type="text"
                id="url"
                bind:value={$url}
                on:input={handleUrlInput}
                placeholder="https://api.example.com/data"
                class="flex-1 p-2 border rounded"
              />
              {#if $urlAutocomplete.length > 0}
                <div class="autocomplete-suggestions">
                  {#each $urlAutocomplete as suggestion}
                    <div
                      class="autocomplete-suggestion"
                      on:mousedown={() => selectUrlSuggestion(suggestion)}
                    >
                      {suggestion}
                    </div>
                  {/each}
                </div>
              {/if}
              {#if $url}
                <span
                  class="clear-icon"
                  role="button"
                  tabindex="0"
                  on:keydown={(e) => handleKeydown(e, () => clearInput(url))}
                  on:click={() => clearInput(url)}>×</span
                >
              {/if}
            </div>
          </div>
          <button
            type="button"
            on:click={handleSendRequest}
            class="button mb-2 send-request-button"
          >
            <span class="button-text">Send Request</span>
            <span class="button-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </span>
          </button>
          <div class="tabs">
            <button
              type="button"
              class="tab {$selectedRequestTab === 'body' ? 'active' : ''}"
              on:click={() => selectedRequestTab.set("body")}
              aria-label="Body Tab"
            >
              Body
            </button>

            <button
              type="button"
              class="tab {$selectedRequestTab === 'headers' ? 'active' : ''}"
              on:click={() => selectedRequestTab.set("headers")}
              aria-label="Headers Tab"
            >
              Headers
              <span class="header-count">{headerCount}</span>
            </button>

            <button
              type="button"
              class="tab {$selectedRequestTab === 'path-params'
                ? 'active'
                : ''}"
              on:click={() => selectedRequestTab.set("path-params")}
              aria-label="Path Params Tab"
            >
              Path Params
              <span class="header-count">{pathParamsCount}</span>
            </button>
            <button
              type="button"
              class="tab {$selectedRequestTab === 'query-params'
                ? 'active'
                : ''}"
              on:click={() => selectedRequestTab.set("query-params")}
              aria-label="Query Params Tab"
            >
              Query Params
              <span class="header-count">{queryParamsCount}</span>
            </button>
            <button
              type="button"
              class="tab {$selectedRequestTab === 'form-data' ? 'active' : ''}"
              on:click={() => selectedRequestTab.set("form-data")}
              aria-label="Form Data Tab"
            >
              Form Data
              <span class="header-count">{formDataCount}</span>
            </button>
            <!-- <button
              type="button"
              class="tab {$selectedRequestTab === 'group' ? 'active' : ''}"
              on:click={() => selectedRequestTab.set("group")}
              aria-label="Group Tab"
            >
              Group
            </button> -->
          </div>
          <div class="tab-content">
            {#if $selectedRequestTab === "body"}
              <HttpBodyDropdown
                bind:selected={bodyType}
                on:change={handleBodyTypeChange}
              />
              {#if $bodyType === "json" || $bodyType === "xml" || $bodyType === "raw"}
                <textarea
                  id="body"
                  bind:value={$body}
                  placeholder={bodyPlaceholder}
                  class=".body-textarea w-full mb-4 p-2 border rounded h-4/6"
                ></textarea>
              {/if}
            {:else if $selectedRequestTab === "headers"}
              <div class="params-container">
                <div class="top-buttons">
                  <button type="button" on:click={addHeader} class="">
                    <Icon icon="fluent-mdl2:add-to" width="18" height="18" />
                  </button>
                  <span class="separator"></span>
                  <button
                    type="button"
                    on:click={clearHeaders}
                    class="delete-all"
                  >
                    <Icon
                      icon="material-symbols:delete-outline"
                      width="18"
                      height="18"
                    />
                  </button>
                </div>

                {#if Array.isArray($headers)}
                  {#each $headers as header, index}
                    <div class="header-row relative">
                      <input type="checkbox" bind:checked={header.selected} />
                      <div class="header-inputs">
                        <div class="input-container">
                          <input
                            type="text"
                            placeholder="Key"
                            bind:value={header.key}
                            on:input={(e) => handleHeaderInput(e, index)}
                            class="header-input"
                            disabled={!header.selected}
                          />
                          {#if $headerAutocomplete.length > 0}
                            <div class="autocomplete-suggestions">
                              {#each $headerAutocomplete as suggestion}
                                <div
                                  class="autocomplete-suggestion"
                                  on:mousedown={() =>
                                    selectHeaderSuggestion(index, suggestion)}
                                >
                                  {suggestion}
                                </div>
                              {/each}
                            </div>
                          {/if}
                        </div>
                        <input
                          type="text"
                          placeholder="Value"
                          bind:value={header.value}
                          class="header-input"
                          disabled={!header.selected}
                        />
                      </div>
                      <button
                        type="button"
                        on:click={() =>
                          headers.update((h) =>
                            h.filter((_, i) => i !== index),
                          )}
                        class="delete-all"
                        disabled={!header.selected}
                      >
                        <Icon
                          icon="material-symbols:delete-outline"
                          width="24"
                          height="24"
                        />
                      </button>
                    </div>
                  {/each}
                {/if}
              </div>
            {:else if $selectedRequestTab === "group"}
              <div class="mb-4">
                <select
                  id="group"
                  bind:value={$selectedGroup}
                  class="w-full mb-4 p-2 border rounded text-primary bg-accent"
                >
                  {#each $groups as group}
                    <option value={group}>{group}</option>
                  {/each}
                  <option value="new">+ Create New Group</option>
                </select>
                {#if $selectedGroup === "new"}
                  <input
                    type="text"
                    placeholder="New Group Name"
                    bind:value={$newGroupName}
                    class="w-full mb-4 p-2 border rounded text-primary bg-accent"
                    on:blur={createNewGroup}
                  />
                {/if}
              </div>
            {:else if $selectedRequestTab === "path-params"}
              <div class="params-container">
                <div class="top-buttons">
                  <button
                    type="button"
                    on:click={() =>
                      pathParams.update((p) => [...p, { key: "", value: "" }])}
                    class=""
                  >
                    <Icon icon="fluent-mdl2:add-to" width="18" height="18" />
                  </button>
                  <span class="separator"></span>
                  <button
                    type="button"
                    on:click={() => pathParams.set([])}
                    class="delete-all"
                  >
                    <Icon
                      icon="material-symbols:delete-outline"
                      width="18"
                      height="18"
                    />
                  </button>
                </div>
                {#each $pathParams as param, index}
                  <div class="header-row">
                    <input
                      type="text"
                      placeholder="Key"
                      bind:value={param.key}
                      class="flex-1 p-2 border rounded text-primary bg-accent mr-2"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      bind:value={param.value}
                      class="flex-1 p-2 border rounded text-primary bg-accent"
                    />
                    <button
                      type="button"
                      on:click={() =>
                        pathParams.update((p) =>
                          p.filter((_, i) => i !== index),
                        )}
                      class="delete-all"
                    >
                      <Icon
                        icon="material-symbols:delete-outline"
                        width="18"
                        height="18"
                      />
                    </button>
                  </div>
                {/each}
              </div>
            {:else if $selectedRequestTab === "query-params"}
              <div class="params-container">
                <div class="top-buttons">
                  <button type="button" on:click={addParam} class="">
                    <Icon icon="fluent-mdl2:add-to" width="18" height="18" />
                  </button>
                  <span class="separator"></span>
                  <button
                    type="button"
                    on:click={clearParams}
                    class="delete-all"
                  >
                    <Icon
                      icon="material-symbols:delete-outline"
                      width="18"
                      height="18"
                    />
                  </button>
                </div>

                {#each $queryParams as param, index}
                  <div class="header-row">
                    <div class="input-container">
                      <input
                        type="text"
                        placeholder="Key"
                        bind:value={param.key}
                        on:input={(e) => handleQueryParamInput(e, index)}
                        class="flex-1 p-2 border rounded text-primary bg-accent mr-2"
                      />
                      {#if $queryParamAutocomplete.length > 0}
                        <div class="autocomplete-suggestions">
                          {#each $queryParamAutocomplete as suggestion}
                            <div
                              class="autocomplete-suggestion"
                              on:mousedown={() =>
                                selectQueryParamSuggestion(index, suggestion)}
                            >
                              {suggestion}
                            </div>
                          {/each}
                        </div>
                      {/if}
                    </div>
                    <input
                      type="text"
                      placeholder="Value"
                      bind:value={param.value}
                      class="flex-1 p-2 border rounded text-primary bg-accent"
                    />
                    <button
                      type="button"
                      on:click={() =>
                        queryParams.update((p) =>
                          p.filter((_, i) => i !== index),
                        )}
                      class="delete-all"
                    >
                      <Icon
                        icon="material-symbols:delete-outline"
                        width="18"
                        height="18"
                      />
                    </button>
                  </div>
                {/each}
              </div>
            {:else if $selectedRequestTab === "form-data"}
              <div class="params-container">
                <div class="top-buttons">
                  <button type="button" on:click={addFormField} class="">
                    <Icon icon="fluent-mdl2:add-to" width="18" height="18" />
                  </button>
                  <span class="separator"></span>
                  <button
                    type="button"
                    on:click={() => formParams.set([])}
                    class="delete-all"
                  >
                    <Icon
                      icon="material-symbols:delete-outline"
                      width="18"
                      height="18"
                    />
                  </button>
                </div>
                {#each $formParams as field, index}
                  <div class="header-row">
                    <input
                      type="text"
                      placeholder="Key"
                      bind:value={field.key}
                      class="flex-1 p-2 border rounded text-primary bg-accent mr-2"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      bind:value={field.value}
                      class="flex-1 p-2 border rounded text-primary bg-accent"
                    />
                    <button
                      type="button"
                      on:click={() =>
                        formParams.update((f) =>
                          f.filter((_, i) => i !== index),
                        )}
                      class="delete-all"
                    >
                      <Icon
                        icon="material-symbols:delete-outline"
                        width="18"
                        height="18"
                      />
                    </button>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </div>

        <div class="response-panel panel relative">
          {#if $response}
            <div class="status-box border p-4 mb-4 rounded">
              <div class="flex justify-end">
                <div class="flex items-center">
                  <span
                    class="text-white px-2 py-1 rounded {getStatusClass(
                      $response.status,
                    )}"
                    >{$response.status}
                    {$response.status === 200 ? "OK" : ""}</span
                  >
                </div>
                <div class="flex items-center ml-2">
                  <span>{$response.duration} ms</span>
                </div>
                <div class="flex items-center ml-2">
                  <span>{($response.size / 1024).toFixed(2)} KB</span>
                </div>
                <div class="flex items-center ml-2">
                  <span
                    role="button"
                    tabindex="0"
                    on:keydown={(e) =>
                      handleKeydown(e, () => toggleStatusHistory())}
                    on:click={toggleStatusHistory}
                    >{timeAgo($response.timestamp)}</span
                  >
                </div>
              </div>
            </div>

            {#if $response.error}
              <div class="error-message mb-4">
                {$response.error}
              </div>
            {/if}
            <div class="flex response-tabs">
              <button
                type="button"
                class="tab {$selectedTab === 'response' ? 'active' : ''}"
                on:click={() => selectedTab.set("response")}
                aria-label="Response Tab"
              >
                Response
              </button>
              <button
                type="button"
                class="tab {$selectedTab === 'table' ? 'active' : ''}"
                on:click={() => selectedTab.set("table")}
                aria-label="Table Tab"
              >
                Table
              </button>
              <button
                type="button"
                class="tab {$selectedTab === 'headers' ? 'active' : ''}"
                on:click={() => selectedTab.set("headers")}
                aria-label="Headers Tab"
              >
                Headers
                <span class="header-count">{responseHeaderCount}</span>
              </button>
              <button
                type="button"
                class="tab {$selectedTab === 'curl' ? 'active' : ''}"
                on:click={() => selectedTab.set("curl")}
                aria-label="Curl Command Tab"
              >
                Curl Command
              </button>
            </div>

            <div class="tab-content">
              {#if $selectedTab === "response"}
                <div class="response-container relative">
                  {#if $response && $response.body}
                    <button
                      type="button"
                      on:click={exportResponseToCSV}
                      class="text-blue-500"
                    >
                      <Icon
                        icon="foundation:page-export-csv"
                        width="18"
                        height="18"
                      />
                    </button>
                    <button
                      type="button"
                      on:click={exportResponseToPDF}
                      class="text-blue-500"
                    >
                      <Icon
                        icon="foundation:page-export-pdf"
                        width="18"
                        height="18"
                      />
                    </button>
                    {#if isXml($response.body)}
                      <pre bind:this={preElement}>
                    <code class="language-xml">{$response.body}</code>
                  </pre>
                      <!-- <pre><code>{@html formatXml($response.body)}</code></pre> -->
                    {:else}
                      <JSONEditor
                        jsonData={$response && $response.body
                          ? $response.body
                          : "{}"}
                        theme="light"
                      />
                    {/if}
                  {:else}
                    <p>No response body</p>
                  {/if}
                </div>
              {:else if $selectedTab === "table"}
                <AdvancedDataTable data={tableData} itemsPerPage={20} />
              {:else if $selectedTab === "headers"}
                <ResponseHeadersTable headers={$response.headers} />
              {:else if $selectedTab === "curl"}
                <div class="flex justify-between">
                  <span class="p-2 rounded">
                    {@html $response.curl_command}
                  </span>
                  <button
                    type="button"
                    on:click={() => copyToClipboard($response.curl_command)}
                    class="text-blue-500"
                  >
                    <Icon icon="mingcute:copy-line" width="18" height="18" />
                  </button>
                </div>
              {/if}
            </div>
          {:else}
            <div>No response</div>
          {/if}

          {#if $isSending}
            <div
              class="sending-request absolute inset-0 flex items-center justify-center z-50"
            >
              <div class=" p-4 rounded shadow-lg">
                <h2 class="text-lg font-bold mb-4">Sending request...</h2>
                <p class="mb-4">Elapsed time: {$elapsedTime} ms</p>
                <button
                  type="button"
                  on:click={cancelRequest}
                  class="w-full p-2 rounded">Cancel Request</button
                >
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <div class="history-panel-vertical panel">
          {#if $selectedGroup}
            <div class="group">
              <div class="group-header sticky top-0 z-10">
                <div class="flex justify-between items-center mb-2">
                  <h1
                    class="text-base font-semibold flex items-center group-title"
                    title={$selectedGroup}
                  >
                    <span class="truncate">{$selectedGroup}</span>
                  </h1>
                </div>

                <div class="search-container mb-2">
                  <input
                    type="text"
                    bind:value={$searchTerm}
                    placeholder="Search history..."
                    class="w-full p-2 border rounded"
                  />
                  {#if $selectedHistoryItems.length === 2}
                    <button on:click={openDiffView} class="compare-button">
                      <span class="button-text">Compare Selected</span>
                      <span class="button-icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <polyline points="16 3 21 3 21 8"></polyline>
                          <line x1="4" y1="20" x2="21" y2="3"></line>
                          <polyline points="21 16 21 21 16 21"></polyline>
                          <line x1="15" y1="15" x2="21" y2="21"></line>
                          <line x1="4" y1="4" x2="9" y2="9"></line>
                        </svg>
                      </span>
                    </button>
                  {/if}
                </div>
              </div>

              <div class="history-list-horizontal">
                <ul>
                  {#each $history.filter((item) => item.url
                        .toLowerCase()
                        .includes($searchTerm.toLowerCase()) || item.method
                        .toLowerCase()
                        .includes($searchTerm.toLowerCase())) as item}
                    <li
                      class="mb-2 history-item flex justify-between items-center"
                    >
                      <button
                        type="button"
                        class="w-full text-left"
                        on:click={() => selectHistoryItem(item)}
                      >
                        <span
                          class="px-2 py-1 rounded
                        {item.method === 'GET' ? 'method-get' : ''} 
                        {item.method === 'POST' ? 'method-post' : ''} 
                        {item.method === 'PUT' ? 'method-put' : ''} 
                        {item.method === 'DELETE' ? 'method-delete' : ''} 
                        {item.method === 'PATCH' ? 'method-patch' : ''} 
                        {item.method === 'OPTIONS' ? 'method-options' : ''} 
                        {item.method === 'HEAD' ? 'method-head' : ''} 
                        {item.method === 'CONNECT' ? 'method-connect' : ''} 
                        {item.method === 'TRACE' ? 'method-trace' : ''}
                        text-white"
                        >
                          {item.method.substring(0, 3)}
                        </span>
                        <span class="url">{item.url}</span>
                      </button>
                      <label class="custom-checkbox">
                        <input
                          type="checkbox"
                          checked={$selectedHistoryItems.some(
                            (i) => i.id === item.id,
                          )}
                          on:change={() => toggleHistoryItemSelection(item)}
                          disabled={$selectedHistoryItems.length === 2 &&
                            !$selectedHistoryItems.some(
                              (i) => i.id === item.id,
                            )}
                        />
                        <span class="checkmark"></span>
                      </label>
                      <button
                        class="duplicate-icon"
                        aria-label="Duplicate history item"
                        on:click={() => duplicateHistoryItem(item)}
                        on:keydown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            duplicateHistoryItem(item);
                        }}
                      >
                        <Icon
                          icon="clarity:clone-solid"
                          width="18"
                          height="18"
                        />
                      </button>
                      <button
                        class="delete-icon"
                        aria-label="Delete history item"
                        on:click={() => openModal(item.id)}
                        on:keydown={(e) => {
                          if (e.key === "Enter" || e.key === " ")
                            openModal(item.id);
                        }}
                      >
                        <Icon
                          icon="material-symbols:delete-outline"
                          width="18"
                          height="18"
                        />
                      </button>
                    </li>
                  {/each}
                </ul>
              </div>
            </div>
          {/if}
        </div>
        <div class="combined-panel panel">
          <div class="request-section" style="height: {$dividerPosition}%;">
            <div class="request-panel panel">
              <div class="flex mb-2">
                <HttpMethodDropdown {method} />

                <div class="input-container">
                  <input
                    type="text"
                    id="url"
                    bind:value={$url}
                    on:input={handleUrlInput}
                    placeholder="https://api.example.com/data"
                    class="flex-1 p-2 border rounded"
                  />
                  {#if $urlAutocomplete.length > 0}
                    <div class="autocomplete-suggestions">
                      {#each $urlAutocomplete as suggestion}
                        <div
                          class="autocomplete-suggestion"
                          on:mousedown={() => selectUrlSuggestion(suggestion)}
                        >
                          {suggestion}
                        </div>
                      {/each}
                    </div>
                  {/if}
                  {#if $url}
                    <span
                      class="clear-icon"
                      role="button"
                      tabindex="0"
                      on:keydown={(e) =>
                        handleKeydown(e, () => clearInput(url))}
                      on:click={() => clearInput(url)}>×</span
                    >
                  {/if}
                </div>
              </div>
              <button
                type="button"
                on:click={handleSendRequest}
                class="button mb-2"
                >Send Request
              </button>
              <div class="tabs">
                <button
                  type="button"
                  class="tab {$selectedRequestTab === 'body' ? 'active' : ''}"
                  on:click={() => selectedRequestTab.set("body")}
                  aria-label="Body Tab"
                >
                  Body
                </button>

                <button
                  type="button"
                  class="tab {$selectedRequestTab === 'headers'
                    ? 'active'
                    : ''}"
                  on:click={() => selectedRequestTab.set("headers")}
                  aria-label="Headers Tab"
                >
                  Headers
                  <span class="header-count">{headerCount}</span>
                </button>

                <button
                  type="button"
                  class="tab {$selectedRequestTab === 'path-params'
                    ? 'active'
                    : ''}"
                  on:click={() => selectedRequestTab.set("path-params")}
                  aria-label="Path Params Tab"
                >
                  Path Params
                  <span class="header-count">{pathParamsCount}</span>
                </button>
                <button
                  type="button"
                  class="tab {$selectedRequestTab === 'query-params'
                    ? 'active'
                    : ''}"
                  on:click={() => selectedRequestTab.set("query-params")}
                  aria-label="Query Params Tab"
                >
                  Query Params
                  <span class="header-count">{queryParamsCount}</span>
                </button>
                <button
                  type="button"
                  class="tab {$selectedRequestTab === 'form-data'
                    ? 'active'
                    : ''}"
                  on:click={() => selectedRequestTab.set("form-data")}
                  aria-label="Form Data Tab"
                >
                  Form Data
                  <span class="header-count">{formDataCount}</span>
                </button>
                <!-- <button
                  type="button"
                  class="tab {$selectedRequestTab === 'group' ? 'active' : ''}"
                  on:click={() => selectedRequestTab.set("group")}
                  aria-label="Group Tab"
                >
                  Group
                </button> -->
              </div>
              <div class="tab-content" style="overflow-y: hidden !important;">
                {#if $selectedRequestTab === "body"}
                  <HttpBodyDropdown
                    bind:selected={bodyType}
                    on:change={handleBodyTypeChange}
                  />
                  {#if $bodyType === "json" || $bodyType === "xml" || $bodyType === "raw"}
                    <textarea
                      id="body"
                      bind:value={$body}
                      placeholder={bodyPlaceholder}
                      class=".body-textarea w-full mb-4 p-2 border rounded h-4/6"
                    ></textarea>
                  {/if}
                {:else if $selectedRequestTab === "headers"}
                  <div class="params-container">
                    <div class="top-buttons">
                      <button type="button" on:click={addHeader} class="">
                        <Icon
                          icon="fluent-mdl2:add-to"
                          width="18"
                          height="18"
                        />
                      </button>
                      <span class="separator"></span>
                      <button
                        type="button"
                        on:click={clearHeaders}
                        class="delete-all"
                      >
                        <Icon
                          icon="material-symbols:delete-outline"
                          width="18"
                          height="18"
                        />
                      </button>
                    </div>

                    {#each $headers as header, index}
                      <div class="header-row relative">
                        <input type="checkbox" bind:checked={header.selected} />
                        <div class="header-inputs">
                          <div class="input-container">
                            <input
                              type="text"
                              placeholder="Key"
                              bind:value={header.key}
                              on:input={(e) => handleHeaderInput(e, index)}
                              class="header-input"
                              disabled={!header.selected}
                            />
                            {#if $headerAutocomplete.length > 0}
                              <div class="autocomplete-suggestions">
                                {#each $headerAutocomplete as suggestion}
                                  <div
                                    class="autocomplete-suggestion"
                                    on:mousedown={() =>
                                      selectHeaderSuggestion(index, suggestion)}
                                  >
                                    {suggestion}
                                  </div>
                                {/each}
                              </div>
                            {/if}
                          </div>
                          <input
                            type="text"
                            placeholder="Value"
                            bind:value={header.value}
                            class="header-input"
                            disabled={!header.selected}
                          />
                        </div>
                        <button
                          type="button"
                          on:click={() =>
                            headers.update((h) =>
                              h.filter((_, i) => i !== index),
                            )}
                          class="delete-all"
                          disabled={!header.selected}
                        >
                          <Icon
                            icon="material-symbols:delete-outline"
                            width="24"
                            height="24"
                          />
                        </button>
                      </div>
                    {/each}
                  </div>
                {:else if $selectedRequestTab === "group"}
                  <div class="mb-4">
                    <select
                      id="group"
                      bind:value={$selectedGroup}
                      class="w-full mb-4 p-2 border rounded text-primary bg-accent"
                    >
                      {#each $groups as group}
                        <option value={group}>{group}</option>
                      {/each}
                      <option value="new">+ Create New Group</option>
                    </select>
                    {#if $selectedGroup === "new"}
                      <input
                        type="text"
                        placeholder="New Group Name"
                        bind:value={$newGroupName}
                        class="w-full mb-4 p-2 border rounded text-primary bg-accent"
                        on:blur={createNewGroup}
                      />
                    {/if}
                  </div>
                {:else if $selectedRequestTab === "path-params"}
                  <div class="params-container">
                    <div class="top-buttons">
                      <button
                        type="button"
                        on:click={() =>
                          pathParams.update((p) => [
                            ...p,
                            { key: "", value: "" },
                          ])}
                        class=""
                      >
                        <Icon
                          icon="fluent-mdl2:add-to"
                          width="18"
                          height="18"
                        />
                      </button>
                      <span class="separator"></span>
                      <button
                        type="button"
                        on:click={() => pathParams.set([])}
                        class="delete-all"
                      >
                        <Icon
                          icon="material-symbols:delete-outline"
                          width="18"
                          height="18"
                        />
                      </button>
                    </div>
                    {#each $pathParams as param, index}
                      <div class="header-row">
                        <input
                          type="text"
                          placeholder="Key"
                          bind:value={param.key}
                          class="flex-1 p-2 border rounded text-primary bg-accent mr-2"
                        />
                        <input
                          type="text"
                          placeholder="Value"
                          bind:value={param.value}
                          class="flex-1 p-2 border rounded text-primary bg-accent"
                        />
                        <button
                          type="button"
                          on:click={() =>
                            pathParams.update((p) =>
                              p.filter((_, i) => i !== index),
                            )}
                          class="delete-all"
                        >
                          <Icon
                            icon="material-symbols:delete-outline"
                            width="18"
                            height="18"
                          />
                        </button>
                      </div>
                    {/each}
                  </div>
                {:else if $selectedRequestTab === "query-params"}
                  <div class="params-container">
                    <div class="top-buttons">
                      <button type="button" on:click={addParam} class="">
                        <Icon
                          icon="fluent-mdl2:add-to"
                          width="18"
                          height="18"
                        />
                      </button>
                      <span class="separator"></span>
                      <button
                        type="button"
                        on:click={clearParams}
                        class="delete-all"
                      >
                        <Icon
                          icon="material-symbols:delete-outline"
                          width="18"
                          height="18"
                        />
                      </button>
                    </div>

                    {#each $queryParams as param, index}
                      <div class="header-row">
                        <div class="input-container">
                          <input
                            type="text"
                            placeholder="Key"
                            bind:value={param.key}
                            on:input={(e) => handleQueryParamInput(e, index)}
                            class="flex-1 p-2 border rounded text-primary bg-accent mr-2"
                          />
                          {#if $queryParamAutocomplete.length > 0}
                            <div class="autocomplete-suggestions">
                              {#each $queryParamAutocomplete as suggestion}
                                <div
                                  class="autocomplete-suggestion"
                                  on:mousedown={() =>
                                    selectQueryParamSuggestion(
                                      index,
                                      suggestion,
                                    )}
                                >
                                  {suggestion}
                                </div>
                              {/each}
                            </div>
                          {/if}
                        </div>
                        <input
                          type="text"
                          placeholder="Value"
                          bind:value={param.value}
                          class="flex-1 p-2 border rounded text-primary bg-accent"
                        />
                        <button
                          type="button"
                          on:click={() =>
                            queryParams.update((p) =>
                              p.filter((_, i) => i !== index),
                            )}
                          class="delete-all"
                        >
                          <Icon
                            icon="material-symbols:delete-outline"
                            width="18"
                            height="18"
                          />
                        </button>
                      </div>
                    {/each}
                  </div>
                {:else if $selectedRequestTab === "form-data"}
                  <div class="params-container">
                    <div class="top-buttons">
                      <button type="button" on:click={addFormField} class="">
                        <Icon
                          icon="fluent-mdl2:add-to"
                          width="18"
                          height="18"
                        />
                      </button>
                      <span class="separator"></span>
                      <button
                        type="button"
                        on:click={() => formParams.set([])}
                        class="delete-all"
                      >
                        <Icon
                          icon="material-symbols:delete-outline"
                          width="18"
                          height="18"
                        />
                      </button>
                    </div>
                    {#each $formParams as field, index}
                      <div class="header-row">
                        <input
                          type="text"
                          placeholder="Key"
                          bind:value={field.key}
                          class="flex-1 p-2 border rounded text-primary bg-accent mr-2"
                        />
                        <input
                          type="text"
                          placeholder="Value"
                          bind:value={field.value}
                          class="flex-1 p-2 border rounded text-primary bg-accent"
                        />
                        <button
                          type="button"
                          on:click={() =>
                            formParams.update((f) =>
                              f.filter((_, i) => i !== index),
                            )}
                          class="delete-all"
                        >
                          <Icon
                            icon="material-symbols:delete-outline"
                            width="18"
                            height="18"
                          />
                        </button>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>
          </div>
          <div class="divider" on:mousedown={handleMouseDown}></div>
          <div
            class="response-section"
            style="height: {100 - $dividerPosition}%;"
          >
            <div class="response-panel panel relative">
              {#if $response}
                <div class="status-box border p-4 mb-4 rounded">
                  <div class="flex justify-end">
                    <div class="flex items-center">
                      <span
                        class="text-white px-2 py-1 rounded {getStatusClass(
                          $response.status,
                        )}"
                        >{$response.status}
                        {$response.status === 200 ? "OK" : ""}</span
                      >
                    </div>
                    <div class="flex items-center ml-2">
                      <span>{$response.duration} ms</span>
                    </div>
                    <div class="flex items-center ml-2">
                      <span>{($response.size / 1024).toFixed(2)} KB</span>
                    </div>
                    <div class="flex items-center ml-2">
                      <span
                        role="button"
                        tabindex="0"
                        on:keydown={(e) =>
                          handleKeydown(e, () => toggleStatusHistory())}
                        on:click={toggleStatusHistory}
                        >{timeAgo($response.timestamp)}</span
                      >
                    </div>
                  </div>
                </div>

                {#if $response.error}
                  <div class="error-message mb-4">
                    {$response.error}
                  </div>
                {/if}
                <div class="flex response-tabs">
                  <button
                    type="button"
                    class="tab {$selectedTab === 'response' ? 'active' : ''}"
                    on:click={() => selectedTab.set("response")}
                    aria-label="Response Tab"
                  >
                    Response
                  </button>
                  <button
                    type="button"
                    class="tab {$selectedTab === 'table' ? 'active' : ''}"
                    on:click={() => selectedTab.set("table")}
                    aria-label="Table Tab"
                  >
                    Table
                  </button>
                  <button
                    type="button"
                    class="tab {$selectedTab === 'headers' ? 'active' : ''}"
                    on:click={() => selectedTab.set("headers")}
                    aria-label="Headers Tab"
                  >
                    Headers
                    <span class="header-count">{responseHeaderCount}</span>
                  </button>
                  <button
                    type="button"
                    class="tab {$selectedTab === 'curl' ? 'active' : ''}"
                    on:click={() => selectedTab.set("curl")}
                    aria-label="Curl Command Tab"
                  >
                    Curl Command
                  </button>
                </div>

                <div class="tab-content">
                  {#if $selectedTab === "response"}
                    <div class="response-container relative">
                      {#if $response && $response.body}
                        <button
                          type="button"
                          on:click={exportResponseToCSV}
                          class="text-blue-500"
                        >
                          <Icon
                            icon="foundation:page-export-csv"
                            width="18"
                            height="18"
                          />
                        </button>
                        <button
                          type="button"
                          on:click={exportResponseToPDF}
                          class="text-blue-500"
                        >
                          <Icon
                            icon="foundation:page-export-pdf"
                            width="18"
                            height="18"
                          />
                        </button>
                        {#if isXml($response.body)}
                          <pre bind:this={preElement}>
                        <code class="language-xml">{$response.body}</code>
                      </pre>
                          <!-- <pre><code>{@html formatXml($response.body)}</code></pre> -->
                        {:else}
                          <JSONEditor
                            jsonData={$response && $response.body
                              ? $response.body
                              : "{}"}
                            theme="light"
                          />
                        {/if}
                      {:else}
                        <p>No response body</p>
                      {/if}
                    </div>
                  {:else if $selectedTab === "table"}
                    <AdvancedDataTable data={tableData} itemsPerPage={10} />
                  {:else if $selectedTab === "headers"}
                    <ResponseHeadersTable headers={$response.headers} />
                  {:else if $selectedTab === "curl"}
                    <div class="flex justify-between">
                      <span class="p-2 rounded">
                        {@html $response.curl_command}
                      </span>
                      <button
                        type="button"
                        on:click={() => copyToClipboard($response.curl_command)}
                        class="text-blue-500"
                      >
                        <Icon
                          icon="mingcute:copy-line"
                          width="18"
                          height="18"
                        />
                      </button>
                    </div>
                  {/if}
                </div>
              {:else}
                <div>No response</div>
              {/if}

              {#if $isSending}
                <div
                  class="sending-request absolute inset-0 flex items-center justify-center z-50"
                >
                  <div class=" p-4 rounded shadow-lg">
                    <h2 class="text-lg font-bold mb-4">Sending request...</h2>
                    <p class="mb-4">Elapsed time: {$elapsedTime} ms</p>
                    <button
                      type="button"
                      on:click={cancelRequest}
                      class="w-full p-2 rounded">Cancel Request</button
                    >
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<StatusBar message={$statusMessage} type={$statusType} />
{#if $statusHistoryOpen}
  <div
    class="status-history-modal fixed inset-0 flex items-end justify-end bg-black bg-opacity-50 z-50"
  >
    <div class="status-history p-4 shadow-lg w-1/3 h-full overflow-y-auto">
      <button
        type="button"
        on:click={toggleStatusHistory}
        style="box-shadow: 0 7px 12px rgba(0, 0, 0, 0.3);"
        class="close-button rounded-full p-1 shadow-lg absolute top-1 right-1 flex items-center justify-center"
      >
        <Icon icon="eva:close-fill" width="20" height="20" />
      </button>

      {#if $statusHistory.length > 0}
        <button
          type="button"
          on:click={openConfirmModal}
          class="delete-all-button"
        >
          <Icon icon="mdi:delete-sweep" width="20" height="20" />
          Delete All History for this URL
        </button>
      {/if}

      {#if $statusHistory.length === 0}
        <p>No status history available.</p>
      {/if}
      <div class="status-section mt-10 mb-4">
        <h4 class="text-sm font-semibold mb-2">Within the Last Hour</h4>
        {#each $statusHistory.filter((item) => new Date().getTime() - new Date(item.timestamp).getTime() <= 3600000) as history}
          <div
            class="status-history-item flex justify-between items-center p-2 mb-2"
          >
            <div
              class="text-white px-2 py-1 rounded {getStatusClass(
                history.status,
              )}"
            >
              {history.status}
              {history.status === 200 ? "OK" : ""}
            </div>
            <div class="px-2">{history.duration} ms</div>
            <div class="px-2">{formatSize(history.size)}</div>
            <div class="px-2">{timeAgo(history.timestamp)}</div>
          </div>
        {/each}
        <div class="divider border-t border-gray-300 mt-2"></div>
      </div>
      {#if $statusHistory.filter((item) => new Date().getTime() - new Date(item.timestamp).getTime() > 3600000 && new Date().getDate() === new Date(item.timestamp).getDate()).length > 0}
        <div class="status-section mb-4">
          <h4 class="text-sm font-semibold mb-2">Today</h4>
          {#each $statusHistory.filter((item) => new Date().getTime() - new Date(item.timestamp).getTime() > 3600000 && new Date().getDate() === new Date(item.timestamp).getDate()) as history}
            <div
              class="status-history-item flex justify-between items-center p-2 mb-2"
            >
              <div
                class="px-2 text-white rounded {getStatusClass(history.status)}"
              >
                {history.status}
                {history.status === 200 ? "OK" : ""}
              </div>
              <div class="px-2">{history.duration} ms</div>
              <div class="px-2">{formatSize(history.size)}</div>
              <div class="px-2">{timeAgo(history.timestamp)}</div>
            </div>
          {/each}
          <div class="divider border-t border-gray-300 mt-2"></div>
        </div>
      {/if}

      {#if $statusHistory.filter((item) => new Date().getTime() - new Date(item.timestamp).getTime() > 86400000).length > 0}
        <div class="status-section mb-4">
          <h4 class="text-sm font-semibold mb-2">Older</h4>
          {#each $statusHistory.filter((item) => new Date().getTime() - new Date(item.timestamp).getTime() > 86400000) as history}
            <div
              class="status-history-item flex justify-between items-center p-2 mb-2"
            >
              <div
                class="px-2 text-white rounded {getStatusClass(history.status)}"
              >
                {history.status}
                {history.status === 200 ? "OK" : ""}
              </div>
              <div class="px-2">{history.duration} ms</div>
              <div class="px-2">{formatSize(history.size)}</div>
              <div class="px-2">{timeAgo(history.timestamp)}</div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
{/if}

{#if $variablesPanelOpen}
  <div class="fixed inset-0 flex items-center justify-center bg-opacity-50">
    <div
      class="variables-panel p-8 rounded-lg shadow-2xl relative max-w-2xl w-full"
    >
      <h2 class="text-2xl font-bold mb-6">Variables</h2>

      <div class="flex mb-6">
        <select
          bind:value={$currentEnvironment}
          class="flex-1 p-3 border rounded-lg mr-4 variables-select"
        >
          <option value="default">Default</option>
          <option value="development">Development</option>
          <option value="test">Test</option>
          <option value="staging">Staging</option>
          <option value="production">Production</option>
        </select>
        <input
          type="text"
          placeholder="Key"
          bind:value={$newVariableKey}
          class="flex-1 p-3 border rounded-lg text-primary bg-accent mr-4"
        />
        <input
          type="text"
          placeholder="Value"
          bind:value={$newVariableValue}
          class="flex-1 p-3 border rounded-lg text-primary bg-accent mr-4"
        />
        <button
          type="button"
          on:click={addVariable}
          class="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
        >
          <Icon icon="fluent-mdl2:add-to" width="20" height="20" class="mr-2" />
          Add
        </button>
      </div>

      <ul>
        {#each $envVariables as variable}
          <li class="mb-4 flex justify-between items-center">
            <strong class="text-primary">{variable.key}:</strong>
            <span class="text-secondary">
              {variable.values[$currentEnvironment] || "Not set"}
            </span>
            <button
              type="button"
              on:click={() => deleteVariable(variable.key)}
              class="text-red-500 hover:text-red-700"
            >
              <Icon
                icon="material-symbols:delete-outline"
                width="24"
                height="24"
              />
            </button>
          </li>
        {/each}
      </ul>

      <button
        type="button"
        on:click={() => variablesPanelOpen.set(false)}
        style="box-shadow: 0 7px 12px rgba(0, 0, 0, 0.3);"
        class="rounded-full p-1 shadow-lg absolute top-1 right-1 flex items-center justify-center"
      >
        <Icon icon="eva:close-fill" width="20" height="20" />
      </button>
    </div>
  </div>
{/if}

{#if $customHeaderPanelOpen}
  <CustomHeaderPanel />
{/if}

<ConfirmModal
  bind:show={$showModal}
  message="Are you sure you want to delete this history item?"
  on:confirm={confirmDelete}
  on:close={closeModal}
/>

{#if $themeModalOpen}
  <div
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <div class="bg-white p-6 rounded shadow-2xl w-11/12 md:w-3/5 max-w-6xl">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold text-neutral-950">Change Theme</h2>
        <button
          type="button"
          on:click={closeThemeSwitcherModal}
          class="close-button"
          aria-label="Close"
        >
          <Icon icon="eva:close-fill" width="24" height="24" />
        </button>
      </div>
      <ThemeSwitcher />
    </div>
  </div>
{/if}

{#if $groupModalOpen}
  <div
    class="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50"
  >
    <div class="bg-white p-4 rounded shadow-lg w-1/2">
      <h2 class="text-lg font-bold mb-4 text-neutral-950">Select Group</h2>
      <div class="grid grid-cols-5 gap-1">
        {#each $groups as group}
          <div
            class="group-card"
            role="button"
            tabindex="0"
            on:keydown={(e) => handleKeydown(e, () => handleGroupSelect(group))}
            on:click={() => handleGroupSelect(group)}
          >
            {group}
          </div>
        {/each}
      </div>
      <div class="mt-4">
        <input
          type="text"
          placeholder="New Group Name"
          bind:value={$newGroupName}
          class="w-full mb-2 p-2 border rounded text-primary bg-accent"
        />
        <button
          type="button"
          on:click={createNewGroup}
          class="w-full p-2 bg-primary text-background rounded mb-2"
          >Add Group</button
        >
        <button
          type="button"
          on:click={importPostmanCollection}
          class="w-full p-2 bg-orange-600 text-background rounded"
          >Import</button
        >
      </div>
    </div>
  </div>
{/if}

{#if $apiFlowModalOpen}
  <div
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
  >
    <div class="bg-white p-4 rounded shadow-lg w-full h-full overflow-hidden">
      <div class="flex justify-between items-center mb-4">
        <h4 class="text-xl font-bold">API Flow Designer</h4>
        <button
          type="button"
          on:click={closeApiFlowModal}
          style="box-shadow: 0 10px 15px rgba(0, 0, 0, 0.3);"
          class="rounded-full p-4 shadow flex items-center justify-center"
        >
          <Icon icon="eva:close-fill" width="20" height="20" />
        </button>
      </div>

      <div class="h-full">
        <APIFlowDesigner
          initialFlow={$currentFlow}
          on:save={handleFlowSave}
          on:run={handleFlowRun}
        />
      </div>
    </div>
  </div>
{/if}

{#if $showSettings}
  <SettingsModal bind:showSettings bind:requestTimeout />
{/if}

<ConfirmModal
  bind:show={$showConfirmModal}
  message="Are you sure you want to delete all history for this URL? This action cannot be undone."
  on:confirm={handleConfirmDelete}
  on:close={closeConfirmModal}
/>

{#if $showDiffView}
  <div class="diff-view-modal">
    <DiffViewer
      leftItem={$selectedHistoryItems[0]}
      rightItem={$selectedHistoryItems[1]}
      on:close={() => showDiffView.set(false)}
    />
  </div>
{/if}

<CurlImportDialog
  bind:show={showCurlImportDialog}
  on:submit={handleCurlImport}
  on:cancel={() => (showCurlImportDialog = false)}
/>

<HarAnalyzerModal
  bind:show={showHarAnalyzerModal}
  on:close={() => (showHarAnalyzerModal = false)}
/>

<style>
  .fixed {
    position: fixed;
  }
  .inset-0 {
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
  .flex {
    display: flex;
  }
  .items-center {
    align-items: center;
  }
  .justify-center {
    justify-content: center;
  }
  .bg-black {
    background-color: rgba(0, 0, 0, 0.5);
  }

  .bg-white {
    background-color: #ffffff;
  }
  .p-4 {
    padding: 1rem;
  }
  .rounded {
    border-radius: 0.5rem;
  }
  .shadow-lg {
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .group-card {
    border: 1px solid var(--seperator);
    color: var(--dark-text);
    padding: 0.4rem;
    margin-bottom: 0.1rem;
    cursor: pointer;
    text-align: center;
    background-color: var(--surface);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .group-card:hover {
    background-color: var(--group-card-hover);
  }

  .clear-icon:hover {
    color: var(--error);
    font-weight: bolder;
  }

  .header-container {
    margin-top: 1rem;
  }

  .header-row {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .header-row input[type="text"] {
    flex: 1;
    margin-right: 0.5rem;
  }
  .header-row input[type="checkbox"] {
    margin: 0;
    margin-right: 0.5rem;
  }

  .header-row button {
    margin-left: 0.5rem;
  }

  .tab.active {
    background: var(--surface);
    border-bottom: 1px solid var(--surface);
    color: var(--primary-text);
    font-weight: bold;
    position: relative;
    z-index: 1;
    transform: translateY(-2px);
    box-shadow:
      0 -5px 8px -1px var(--surface),
      0 4px 4px -1px var(--divider);
    border-bottom: 2px solid var(--primary);
  }

  .vertical-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.1rem;
    margin-bottom: 0.5rem;
    padding-bottom: 0.1rem;
    padding-top: 0.1rem;
    border-bottom: 1px solid var(--divider);
    border-top: 1px solid var(--divider);
  }
  .button-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.65rem;
    width: 100%;
    height: 2.5rem;
    border-top: 1px solid var(--divider);
    border-bottom: 1px solid var(--divider);
    background-color: var(--surface);
    transition: background-color 0.3s ease;
    text-align: center;
  }
  .button-item:hover {
    background-color: var(--light-background);
  }

  .top-buttons {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.2rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--divider);
    border-top: 1px solid var(--divider);
    padding-bottom: 0.5rem;
    padding-top: 0.5rem;
  }

  .separator {
    width: 1px;
    height: 20px;
    background-color: var(--seperator);
  }

  .btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    border-radius: 0.375rem;
    cursor: pointer;
  }

  .btn-add {
    background-color: var(--primary);
    color: var(--background);
  }

  .btn-clear {
    background-color: var(--error);
    color: var(--background);
  }

  .error-message {
    color: var(--error);
    font-weight: bold;
  }

  .autocomplete-suggestions {
    border: 1px solid var(--divider);
    color: var(--primary-text);
    background: var(--light-background);
    position: absolute;
    max-height: 250px;
    overflow-y: auto;
    z-index: 1000;
    top: 100%;
  }
  .autocomplete-suggestion {
    padding: 0.5rem;
    cursor: pointer;
  }
  .autocomplete-suggestion:hover {
    background: var(--surface);
  }

  .custom-select {
    appearance: none;
    background-color: var(--select-background-color);
    padding: 0.5rem 1.5rem 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 1rem;
    color: var(--select-text-color);
    background-image: url('data:image/svg+xml;utf8,<svg fill="none" stroke="%236B7280" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 9l-7 7-7-7"/></svg>');
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1.5em;
    transition:
      border-color 0.3s ease-in-out,
      box-shadow 0.3s ease-in-out;
  }

  .custom-select:focus {
    border-color: var(--select-focus-border-color);
    outline: none;
    box-shadow: 0 0 0 3px var(--select-focus-box-shadow);
  }
</style>
