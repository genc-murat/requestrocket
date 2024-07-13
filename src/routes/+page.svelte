<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { writable } from "svelte/store";
  import type { Writable } from "svelte/store";
  import { openDB, deleteDB } from "idb";
  import { invoke } from "@tauri-apps/api/tauri";
  import {
    faPlus,
    faTrashAlt,
    faClone,
    faEdit,
    faCopy,
    faDownload,
    faUpload,
    faClose,
    faRepeat,
  } from "@fortawesome/free-solid-svg-icons";
  import { library } from "@fortawesome/fontawesome-svg-core";
  import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
  import { writeTextFile, readTextFile } from "@tauri-apps/api/fs";
  import { dialog } from "@tauri-apps/api";
  import { sendNotification } from "@tauri-apps/api/notification";
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

  import type {
    Flow,
    FlowBlock,
    Connection,
    BlockType,
    SwitchCase,
  } from "../components/flow-types";

  import type {
    HistoryItem,
    Header,
    Param,
    ResponseData,
    StatusHistoryItem,
    ApiDoc,
  } from "../components/api-types";

  library.add(
    faPlus,
    faTrashAlt,
    faClone,
    faEdit,
    faCopy,
    faDownload,
    faUpload,
    faClose,
    faRepeat,
  );

  let currentFlow: Writable<Flow | null> = writable(null);
  let flowResults: Writable<{ [key: string]: any } | null> = writable(null);

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
            // Bu bloklar için özel bir işlem yapılmıyor
            result = { message: `${block.type} block executed` };
            break;
          default:
            console.warn(`Unsupported block type: ${block.type}`);
            result = { error: `Unsupported block type: ${block.type}` };
        }

        flowResults.update((results) => ({ ...results, [block.id]: result }));

        // Sonraki bloğu belirle
        const nextBlockId = determineNextBlock(block, result, flow);
        if (!nextBlockId) break; // Eğer sonraki blok yoksa akışı sonlandır

        // Sonraki bloğu bul
        const nextBlockIndex = flow.blocks.findIndex(
          (b) => b.id === nextBlockId,
        );
        if (nextBlockIndex === -1) {
          console.error(`Next block with id ${nextBlockId} not found`);
          break;
        }

        // Döngüyü sonraki blokla devam ettir
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

      // Döngüden çıkma kontrolü
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
    return eval(script); // Not: eval kullanımı güvenlik riskleri taşıyabilir, dikkatli kullanılmalıdır.
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
      return variables[key.trim()] ?? match;
    });
  }

  type SwitchCase = {
    value: string;
    next: string | null;
  };

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
  let apiFlowModalOpen = writable(false);

  function openApiFlowModal() {
    apiFlowModalOpen.set(true);
  }

  function closeApiFlowModal() {
    apiFlowModalOpen.set(false);
  }

  let url = writable("");
  let method = writable("GET");
  let body = writable('{"key": "value"}');
  // let headers = writable<Header[]>([]);
  let params = writable<Param[]>([]);
  let bodyType = writable("json");
  let pathParams = writable<Param[]>([]);
  let queryParams = writable<Param[]>([]);
  let formParams = writable<Param[]>([]);
  let response = writable<ResponseData | null>(null);
  let history = writable<HistoryItem[]>([]);
  let selectedTab = writable("response");
  let selectedRequestTab = writable("body");
  let selectedGroup = writable("");
  let groups = writable<string[]>([]);
  let newGroupName = writable("");
  let modalOpen = writable(true);
  let isSending = writable(false);
  let elapsedTime = writable(0);
  let startTime: number;
  let timer: ReturnType<typeof setInterval>;

  let variables = writable<{ [key: string]: string }>({});
  let newVariableKey = writable("");
  let newVariableValue = writable("");
  let variablesPanelOpen = writable(false);

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
        db.createObjectStore("statusHistory", {
          keyPath: "id",
          autoIncrement: true,
        });
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
      const allStatusHistoryItems = await db.getAllFromIndex(
        "statusHistory",
        "url",
        IDBKeyRange.only(url),
      );
      statusHistory.set(allStatusHistoryItems);
    } catch (error) {
      console.error(
        "Failed to load status history:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  async function addHeader() {
    headers.update((h) => [...h, { key: "", value: "" }]);
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

  type Header = { key: string; value: string };
  type AutocompleteHeaders = string[][];

  let headers = writable<Header[]>([]);
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

  function filterHeaders(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const allHeaders = [...knownHeaders, ...$customHeaders.map((h) => h.name)];
    const filtered = allHeaders.filter((header) =>
      header.toLowerCase().includes(value.toLowerCase()),
    );
    autocompleteHeaders.update((h) => {
      h[index] = filtered;
      return h;
    });
  }

  function selectAutocompleteItem(index: number, suggestion: string) {
    headers.update((h) => {
      h[index].key = suggestion;
      return h;
    });
    autocompleteHeaders.update((h) => {
      h[index] = [];
      return h;
    });
  }

  function clearParams() {
    queryParams.set([]);
    updateUrl();
  }

  function createNewGroup() {
    if ($newGroupName) {
      groups.update((g) => [...g, $newGroupName]);
      selectedGroup.set($newGroupName);
      newGroupName.set("");
      modalOpen.set(false);
    }
  }

  function updateUrl() {
    let urlWithParams = $url;
    if ($queryParams.length > 0) {
      const queryString = new URLSearchParams(
        $queryParams.map((param) => [param.key, param.value]),
      ).toString();
      urlWithParams = $url.split("?")[0] + `?${queryString}`;
    }
    url.set(urlWithParams);
  }

  async function sendRequest() {
    isSending.set(true);
    const actualUrl = $url;
    const actualHeaders = $headers.map((header) => ({
      key: replaceVariables(header.key, $variables),
      value: replaceVariables(header.value, $variables),
    }));

    const pathParamsObject = Object.fromEntries(
      $pathParams.map((param) => [param.key, param.value]),
    );
    const queryParamsObject = Object.fromEntries(
      $queryParams.map((param) => [param.key, param.value]),
    );
    const formParamsObject = Object.fromEntries(
      $formParams.map((field) => [field.key, field.value]),
    );

    let requestBody;
    let contentType;
    if ($method === "GET") {
      requestBody = null;
    } else {
      switch ($bodyType) {
        case "json":
          contentType = "application/json";
          requestBody = $body;
          break;
        case "xml":
          if ($body.includes("soapenv:Envelope")) {
            contentType = "text/xml; charset=utf-8";
            requestBody = $body;
            // Add SOAPAction header if not already present
            if (
              !actualHeaders.some((h) => h.key.toLowerCase() === "soapaction")
            ) {
              actualHeaders.push({
                key: "SOAPAction",
                value: '""', // You might need to set a specific SOAPAction
              });
            }
          } else {
            contentType = "application/xml";
            requestBody = $body;
          }
          break;
        case "form-data":
          contentType = "multipart/form-data";
          requestBody = formParamsObject;
          break;
        case "form-urlencoded":
          contentType = "application/x-www-form-urlencoded";
          requestBody = new URLSearchParams(
            $formParams.map((field) => [field.key, field.value]),
          ).toString();
          break;
        default:
          contentType = "text/plain";
          requestBody = $body;
      }
    }

    const requestData: any = {
      url: actualUrl,
      method: $method,
      body: requestBody,
      headers: Object.fromEntries(
        actualHeaders.map((header) => [header.key, header.value]),
      ),
      path_params: pathParamsObject,
      query_params: queryParamsObject,
      form_data: $bodyType === "form-data" ? formParamsObject : undefined,
      content_type: contentType,
    };

    console.log("Sending request with data:", requestData);

    try {
      const res: ResponseData = await invoke<ResponseData>("send_request", {
        requestData,
      });
      console.log("Response received:", res);
      response.set(res);
      isSending.set(false);

      statusHistory.set([
        {
          id: Date.now(),
          url: actualUrl,
          status: res.status,
          duration: res.duration,
          size: res.size,
          timestamp: res.timestamp,
        },
      ]);

      saveStatusHistory({
        id: Date.now(),
        url: actualUrl,
        status: res.status,
        duration: res.duration,
        size: res.size,
        timestamp: res.timestamp,
      });

      const existingHistoryItem = $history.find(
        (item) =>
          item.url === actualUrl &&
          item.method === $method &&
          item.group === $selectedGroup,
      );
      if (existingHistoryItem) {
        const updatedHistoryItem: HistoryItem = {
          ...existingHistoryItem,
          body: $body,
          headers: actualHeaders,
          params: $params,
          response: JSON.stringify(res),
        };
        updateHistoryItem(updatedHistoryItem);
      } else {
        const newHistoryItem: HistoryItem = {
          id: Date.now(),
          url: actualUrl,
          method: $method,
          body: $body,
          headers: actualHeaders,
          params: $params,
          response: JSON.stringify(res),
          group: $selectedGroup,
        };
        history.update((h) => {
          const newHistory = [...h, newHistoryItem];
          saveHistory(newHistoryItem);
          return newHistory;
        });
      }
    } catch (error) {
      console.error("Request failed:", error);
      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error("Error stack:", error.stack);
      } else {
        errorMessage = String(error);
      }
      response.set({
        status: 0,
        duration: 0,
        size: 0,
        body: "",
        headers: [],
        curl_command: "",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      });

      isSending.set(false);
    }
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
      const filteredHistory = allHistoryItems.filter(
        (item) => item.group === selectedGroup,
      );
      history.set(filteredHistory);
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
      const newHistory = [...h, newHistoryItem];
      saveHistory(newHistoryItem);
      return newHistory;
    });

    selectHistoryItem(newHistoryItem);
  }

  async function saveVariable(key: string, value: string) {
    console.log("Saving variable:", { key, value });
    try {
      const db = await dbPromise;
      await db.put("variables", { key, value });
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

  async function loadVariables() {
    console.log("Loading variables...");
    try {
      const db = await dbPromise;
      const allVariables = await db.getAll("variables");
      const variablesObject = Object.fromEntries(
        allVariables.map((v) => [v.key, v.value]),
      );
      variables.set(variablesObject);
    } catch (error) {
      console.error(
        "Failed to load variables:",
        error instanceof Error ? error.message : error,
      );
    }
  }

  function getStatusClass(status: number): string {
    if (status >= 200 && status < 300) {
      return "bg-green-500";
    } else if (status >= 300 && status < 400) {
      return "bg-blue-500";
    } else if (status >= 400 && status < 500) {
      return "bg-yellow-500";
    } else if (status >= 500) {
      return "bg-red-500";
    } else {
      return "bg-gray-500";
    }
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
    loadStatusHistory(item.url);
  }

  function handleGroupSelect(group: string) {
    selectedGroup.set(group);
    modalOpen.set(false);
    loadHistory(group);
  }

  function clearInput(store: Writable<string>) {
    store.set("");
    headers.set([]);
    params.set([]);
    response.set(null);
  }

  function addVariable() {
    if ($newVariableKey && $newVariableValue) {
      variables.update((vars) => ({
        ...vars,
        [$newVariableKey]: $newVariableValue,
      }));
      saveVariable($newVariableKey, $newVariableValue);
      newVariableKey.set("");
      newVariableValue.set("");
    }
  }

  function deleteVariable(key: string) {
    variables.update((vars) => {
      const { [key]: _, ...rest } = vars;
      return rest;
    });
    deleteVariableFromDb(key);
  }

  function jsonToTableData(json: string): {
    headers: string[];
    rows: string[][];
  } {
    try {
      const data = JSON.parse(json);
      if (Array.isArray(data)) {
        const headers = Object.keys(data[0]);
        const rows = data.map((item) =>
          headers.map((header) => JSON.stringify(item[header])),
        );
        return { headers, rows };
      } else if (typeof data === "object" && data !== null) {
        const headers = Object.keys(data);
        const rows = [headers.map((header) => JSON.stringify(data[header]))];
        return { headers, rows };
      }
    } catch (e) {
      console.error("Error parsing JSON:", e);
    }
    return { headers: [], rows: [] };
  }

  $: tableData =
    $response && $response.body && isValidJson($response.body)
      ? jsonToTableData($response.body)
      : { headers: [], rows: [] };

  function isValidJson(json: string): boolean {
    try {
      JSON.parse(json);
      return true;
    } catch {
      return false;
    }
  }

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
        }, 10); // Update every 10 milliseconds
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

  onMount(async () => {
    loadGroups();
    loadVariables();
    const db = await dbPromise;
    setDatabase(db);
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

        sendNotification({
          title: "Success",
          body: "File saved successfully.",
        });
      }
    } catch (error) {
      console.error("Failed to save file:", error);
      sendNotification({
        title: "Error",
        body: "Failed to save file.",
      });
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

        // Dosya adını al
        const fileName =
          filePath.split("/").pop()?.split(".").slice(0, -1).join(".") ||
          "Imported from Postman";

        // Postman koleksiyonunu işle
        const importedHistoryItems: HistoryItem[] = processPostmanCollection(
          postmanCollection,
          fileName,
        );

        // Yeni öğeleri history store'a ekle
        history.update((h) => {
          const newHistory = [...h, ...importedHistoryItems];
          importedHistoryItems.forEach((item) => saveHistory(item));
          return newHistory;
        });

        selectedGroup.set(fileName);

        sendNotification({
          title: "Success",
          body: "Postman collection imported successfully.",
        });
      }
    } catch (error) {
      console.error("Failed to import Postman collection:", error);
      sendNotification({
        title: "Error",
        body: "Failed to import Postman collection.",
      });
    }
  }

  function processPostmanCollection(
    collection: any,
    groupName: string,
  ): HistoryItem[] {
    const processItem = (item: any): HistoryItem | null => {
      if (item.request) {
        return {
          id: Date.now() + Math.random(), // Benzersiz bir ID oluştur
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

        sendNotification({
          title: "Success",
          body: "API Documentation saved successfully.",
        });
      }
    } catch (error) {
      console.error("Failed to save API Documentation:", error);
      sendNotification({
        title: "Error",
        body: "Failed to save API Documentation.",
      });
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
</script>

<div class="flex h-screen">
  {#if $modalOpen}
    <div
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    >
      <div class="bg-white p-4 rounded shadow-lg w-1/2">
        <h2 class="text-lg font-bold mb-4">Select Group</h2>
        <div class="grid grid-cols-4 gap-2">
          {#each $groups as group}
            <div class="group-card" on:click={() => handleGroupSelect(group)}>
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
            class="w-full p-2 bg-primary text-background rounded"
            >Add Group</button
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
            class="text-red-900 bg-slate-50 rounded-full p-4 shadow flex items-center justify-center"
          >
            <FontAwesomeIcon icon="close" />
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

  <div class="menu-panel panel">
    <div class="vertical-buttons">
      <button
        type="button"
        on:click={openCustomHeaderPanel}
        class="button-item hover:text-green-700"
      >
        <FontAwesomeIcon icon={faEdit} size="lg" />
        <span>Headers</span>
      </button>
      <button
        type="button"
        on:click={() => variablesPanelOpen.set(true)}
        class="button-item hover:text-green-700"
      >
        <FontAwesomeIcon icon="edit" size="lg" />
        <span>Variables</span>
      </button>
      <button
        type="button"
        on:click={importPostmanCollection}
        class="button-item hover:text-orange-700"
      >
        <FontAwesomeIcon icon="upload" size="lg" />
        <span>Import</span>
      </button>
      <button
        type="button"
        on:click={() => downloadApiDocumentation($history)}
        class="button-item hover:text-green-700"
      >
        <FontAwesomeIcon icon="download" size="lg" />
        <span>Doc</span>
      </button>
      <button
        type="button"
        on:click={openApiFlowModal}
        class="button-item bg-gray-300 rounded-md cursor-not-allowed opacity-50"
        disabled
      >
        <FontAwesomeIcon icon="edit" size="lg" />
        <span>Designer</span>
      </button>

      <button
        type="button"
        on:click={handleExport}
        class="button-item bg-gray-300 rounded-md cursor-not-allowed opacity-50"
        disabled
      >
        <FontAwesomeIcon icon="download" size="lg" />
        <span>Export</span>
      </button>
    </div>
  </div>

  <div class="history-panel panel">
    <h2 class="text-xl font-bold mb-4">History</h2>
    {#if $selectedGroup}
      <div class="group">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold mb-2 flex items-center">
            <button
              type="button"
              class="text-blue-600"
              on:click={() => {
                modalOpen.set(true);
              }}
            >
              <FontAwesomeIcon icon="repeat" class="mr-2" />
            </button>
            {$selectedGroup}
          </h3>
        </div>

        <ul>
          {#each $history as item}
            <li class="mb-2 history-item flex justify-between items-center">
              <button
                type="button"
                class="w-full text-left"
                on:click={() => selectHistoryItem(item)}
              >
                <strong
                  class="px-2 py-1 rounded
                {item.method === 'GET' ? 'bg-green-500' : ''} 
                {item.method === 'POST' ? 'bg-blue-500' : ''} 
                {item.method === 'PUT' ? 'bg-yellow-500' : ''} 
                {item.method === 'DELETE' ? 'bg-red-500' : ''} 
                {item.method === 'PATCH' ? 'bg-purple-500' : ''} 
                {item.method === 'OPTIONS' ? 'bg-indigo-500' : ''} 
                {item.method === 'HEAD' ? 'bg-teal-500' : ''} 
                {item.method === 'CONNECT' ? 'bg-pink-500' : ''} 
                {item.method === 'TRACE' ? 'bg-orange-500' : ''}
                text-white"
                >
                  {item.method.substring(0, 3)}
                </strong>

                <span class="url">{item.url}</span>
              </button>
              <button
                class="duplicate-icon text-blue-500"
                aria-label="Duplicate history item"
                on:click={() => duplicateHistoryItem(item)}
                on:keydown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    duplicateHistoryItem(item);
                }}
              >
                <FontAwesomeIcon icon="clone" size="lg" />
              </button>
              <button
                class="delete-icon text-red-500"
                aria-label="Delete history item"
                on:click={() => deleteHistoryItem(item.id)}
                on:keydown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    deleteHistoryItem(item.id);
                }}
              >
                <FontAwesomeIcon icon="trash-alt" size="lg" />
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>

  <div class="request-panel panel">
    <h2 class="text-xl font-bold mb-4">Request</h2>

    <div class="flex mb-4">
      <select
        id="method"
        bind:value={$method}
        class="p-2 border rounded text-primary bg-accent mr-2"
      >
        <option value="GET">GET</option>
        <option value="POST">POST</option>
        <option value="PUT">PUT</option>
        <option value="DELETE">DELETE</option>
        <option value="PATCH">PATCH</option>
        <option value="OPTIONS">OPTIONS</option>
        <option value="HEAD">HEAD</option>
      </select>
      <div class="input-container">
        <input
          type="text"
          id="url"
          bind:value={$url}
          placeholder="https://api.example.com/data"
          class="flex-1 p-2 border rounded text-primary bg-accent"
        />
        {#if $url}
          <span class="clear-icon" on:click={() => clearInput(url)}>×</span>
        {/if}
      </div>
    </div>
    <button type="button" on:click={sendRequest} class="button mb-4"
      >Send Request</button
    >
    <!-- <button type="button" on:click={cancelRequest} class="button mb-4">Cancel Request</button> -->
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
      </button>
      <button
        type="button"
        class="tab {$selectedRequestTab === 'group' ? 'active' : ''}"
        on:click={() => selectedRequestTab.set("group")}
        aria-label="Group Tab"
      >
        Group
      </button>
      <button
        type="button"
        class="tab {$selectedRequestTab === 'path-params' ? 'active' : ''}"
        on:click={() => selectedRequestTab.set("path-params")}
        aria-label="Path Params Tab"
      >
        Path Params
      </button>
      <button
        type="button"
        class="tab {$selectedRequestTab === 'query-params' ? 'active' : ''}"
        on:click={() => selectedRequestTab.set("query-params")}
        aria-label="Query Params Tab"
      >
        Query Params
      </button>
      <button
        type="button"
        class="tab {$selectedRequestTab === 'form-data' ? 'active' : ''}"
        on:click={() => selectedRequestTab.set("form-data")}
        aria-label="Form Data Tab"
      >
        Form Data
      </button>
    </div>
    <div class="tab-content">
      {#if $selectedRequestTab === "body"}
        <select
          id="bodyType"
          bind:value={$bodyType}
          class="w-full mb-4 p-2 border rounded text-primary bg-accent"
        >
          <option value="json">JSON</option>
          <option value="xml">XML</option>
        </select>
        {#if $bodyType === "json" || $bodyType === "xml"}
          <textarea
            id="body"
            bind:value={$body}
            placeholder={$bodyType === "json"
              ? '{"key": "value"}'
              : "<xml></xml>"}
            class="w-full mb-4 p-2 border rounded text-primary bg-accent h-4/6"
          ></textarea>
        {/if}
      {:else if $selectedRequestTab === "headers"}
        <div class="params-container">
          <div class="top-buttons">
            <button type="button" on:click={addHeader} class="">
              <FontAwesomeIcon icon="plus" size="lg" /> Add
            </button>
            <span class="separator"></span>
            <button type="button" on:click={clearHeaders} class="text-red-700">
              <FontAwesomeIcon icon="trash-alt" size="lg" /> Delete All
            </button>
          </div>
          {#each $headers as header, index}
            <div class="header-row relative">
              <input
                type="text"
                placeholder="Key"
                bind:value={header.key}
                class="flex-1 p-2 border rounded text-primary bg-accent mr-2"
                on:input={(e) => filterHeaders(index, e)}
                on:blur={() => clearAutocomplete(index)}
              />
              {#if $autocompleteHeaders[index]?.length}
                <div class="autocomplete-suggestions">
                  {#each $autocompleteHeaders[index] as suggestion}
                    <div
                      class="autocomplete-suggestion"
                      on:mousedown={() =>
                        selectAutocompleteItem(index, suggestion)}
                    >
                      {suggestion}
                    </div>
                  {/each}
                </div>
              {/if}
              <input
                type="text"
                placeholder="Value"
                bind:value={header.value}
                class="flex-1 p-2 border rounded text-primary bg-accent"
              />
              <button
                type="button"
                on:click={() =>
                  headers.update((h) => h.filter((_, i) => i !== index))}
                class="text-red-500"
              >
                <FontAwesomeIcon icon="trash-alt" size="lg" />
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
                pathParams.update((p) => [...p, { key: "", value: "" }])}
              class=""
            >
              <FontAwesomeIcon icon="plus" size="lg" /> Add
            </button>
            <span class="separator"></span>
            <button
              type="button"
              on:click={() => pathParams.set([])}
              class="text-red-700"
            >
              <FontAwesomeIcon icon="trash-alt" size="lg" /> Delete All
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
                  pathParams.update((p) => p.filter((_, i) => i !== index))}
                class="text-red-500"
              >
                <FontAwesomeIcon icon="trash-alt" size="lg" />
              </button>
            </div>
          {/each}
        </div>
      {:else if $selectedRequestTab === "query-params"}
        <div class="params-container">
          <div class="top-buttons">
            <button type="button" on:click={addParam} class="">
              <FontAwesomeIcon icon="plus" size="lg" /> Add
            </button>
            <span class="separator"></span>
            <button type="button" on:click={clearParams} class="text-red-700">
              <FontAwesomeIcon icon="trash-alt" size="lg" /> Delete All
            </button>
          </div>
          {#each $queryParams as param, index}
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
                  queryParams.update((p) => p.filter((_, i) => i !== index))}
                class="text-red-500"
              >
                <FontAwesomeIcon icon="trash-alt" size="lg" />
              </button>
            </div>
          {/each}
        </div>
      {:else if $selectedRequestTab === "form-data"}
        <div class="params-container">
          <div class="top-buttons">
            <button type="button" on:click={addFormField} class="">
              <FontAwesomeIcon icon="plus" size="lg" /> Add
            </button>
            <span class="separator"></span>
            <button
              type="button"
              on:click={() => formParams.set([])}
              class="text-red-700"
            >
              <FontAwesomeIcon icon="trash-alt" size="lg" /> Delete All
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
                  formParams.update((f) => f.filter((_, i) => i !== index))}
                class="text-red-500"
              >
                <FontAwesomeIcon icon="trash-alt" size="lg" />
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>

  <div class="response-panel panel relative">
    <h2 class="text-xl font-bold mb-4">Results</h2>
    {#if $response}
      <div class="status-box border border-gray-500 p-4 mb-4 rounded">
        <div class="flex justify-end">
          <div class="flex items-center">
            <span
              class="text-white px-2 py-1 rounded {getStatusClass(
                $response.status,
              )}"
              >{$response.status} {$response.status === 200 ? "OK" : ""}</span
            >
          </div>
          <div class="flex items-center ml-2">
            <span>{$response.duration} ms</span>
          </div>
          <div class="flex items-center ml-2">
            <span>{($response.size / 1024).toFixed(2)} KB</span>
          </div>
          <div class="flex items-center ml-2">
            <span on:click={toggleStatusHistory}
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
      <div class="flex mb-4">
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
            <!-- <button 
              type="button" 
              on:click={() => copyToClipboard($response.body)} 
              class="copy-button text-blue-500"
            >
              <FontAwesomeIcon icon="copy" size="xl" />
            </button> -->
            <JSONEditor
              jsonData={$response && $response.body ? $response.body : "{}"}
              theme="light"
            />
          </div>
        {:else if $selectedTab === "table"}
          <div class="table-container">
            {#if tableData.headers.length > 0}
              <table>
                <thead>
                  <tr>
                    {#each tableData.headers as header}
                      <th>{header}</th>
                    {/each}
                  </tr>
                </thead>
                <tbody>
                  {#each tableData.rows as row}
                    <tr>
                      {#each row as cell}
                        <td>{cell}</td>
                      {/each}
                    </tr>
                  {/each}
                </tbody>
              </table>
            {:else}
              <p>Unable to display data in table format.</p>
            {/if}
          </div>
        {:else if $selectedTab === "headers"}
          <table>
            {#each $response.headers as [key, value]}
              <tr>
                <th>{key}</th>
                <td>{value}</td>
              </tr>
            {/each}
          </table>
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
              <FontAwesomeIcon icon="copy" size="xl" />
            </button>
          </div>
        {/if}
      </div>
    {:else}
      <div>No response</div>
    {/if}

    {#if $isSending}
      <div
        class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      >
        <div class="bg-white p-4 rounded shadow-lg">
          <h2 class="text-lg font-bold mb-4">Sending request...</h2>
          <p class="mb-4">Elapsed time: {$elapsedTime} ms</p>
          <button
            type="button"
            on:click={cancelRequest}
            class="w-full p-2 bg-red-500 text-white rounded"
            >Cancel Request</button
          >
        </div>
      </div>
    {/if}
  </div>

  {#if $statusHistoryOpen}
    <div
      class="status-history-modal fixed inset-0 flex items-end justify-end bg-black bg-opacity-50 z-50"
    >
      <div
        class="status-history bg-white p-4 shadow-lg w-1/3 h-full overflow-y-auto"
      >
        <button
          type="button"
          on:click={toggleStatusHistory}
          class="text-red-900 bg-slate-50 rounded-full p-2 shadow absolute top-4 right-4 flex items-center justify-center"
        >
          <FontAwesomeIcon icon="close" size="lg" />
        </button>
        <h2 class="text-xl font-bold mb-4">Status History</h2>
        {#if $statusHistory.length === 0}
          <p>No status history available.</p>
        {/if}
        <div class="status-section mb-4">
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
        <div class="status-section mb-4">
          <h4 class="text-sm font-semibold mb-2">Today</h4>
          {#each $statusHistory.filter((item) => new Date().getTime() - new Date(item.timestamp).getTime() > 3600000 && new Date().getDate() === new Date(item.timestamp).getDate()) as history}
            <div
              class="status-history-item flex justify-between items-center p-2 mb-2"
            >
              <div class="px-2 text-white {getStatusClass(history.status)}">
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
        <div class="status-section">
          <h4 class="text-sm font-semibold mb-2">Older</h4>
          {#each $statusHistory.filter((item) => new Date().getTime() - new Date(item.timestamp).getTime() > 86400000) as history}
            <div
              class="status-history-item flex justify-between items-center p-2 mb-2"
            >
              <div class="px-2 text-white {getStatusClass(history.status)}">
                {history.status}
                {history.status === 200 ? "OK" : ""}
              </div>
              <div class="px-2">{history.duration} ms</div>
              <div class="px-2">{formatSize(history.size)}</div>
              <div class="px-2">{timeAgo(history.timestamp)}</div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  {#if $variablesPanelOpen}
    <div
      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="variables-panel bg-white p-4 rounded shadow-lg relative">
        <h2 class="text-xl font-bold mb-4">Variables</h2>
        <div class="flex mb-4">
          <input
            type="text"
            placeholder="Key"
            bind:value={$newVariableKey}
            class="flex-1 p-2 border rounded text-primary bg-accent mr-2"
          />
          <input
            type="text"
            placeholder="Value"
            bind:value={$newVariableValue}
            class="flex-1 p-2 border rounded text-primary bg-accent mr-2"
          />
          <button
            type="button"
            on:click={addVariable}
            class="flex items-center"
          >
            <FontAwesomeIcon icon="plus" size="lg" class="mr-2" />Add
          </button>
        </div>

        <ul>
          {#each Object.entries($variables) as [key, value]}
            <li class="mb-2 flex justify-between items-center">
              <strong class="text-primary">{key}:</strong>
              <span class="text-secondary">{value}</span>
              <button
                type="button"
                on:click={() => deleteVariable(key)}
                class="text-red-500"
              >
                <FontAwesomeIcon icon="trash-alt" />
              </button>
            </li>
          {/each}
        </ul>
        <button
          type="button"
          on:click={() => variablesPanelOpen.set(false)}
          class="text-red-900 bg-slate-50 rounded-full p-2 shadow absolute top-4 right-4 flex items-center justify-center"
        >
          <FontAwesomeIcon icon="close" size="lg" />
        </button>
      </div>
    </div>
  {/if}
</div>

{#if $customHeaderPanelOpen}
  <CustomHeaderPanel />
{/if}

<style>
  pre {
    background: var(--light-background);
    color: var(--primary-text);
  }

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
  .bg-opacity-50 {
    background-opacity: 0.5;
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
    border: 1px solid #ccc;
    padding: 0.4rem;
    margin-bottom: 0.1rem;
    cursor: pointer;
    text-align: center;
  }

  .group-card:hover {
    background-color: #f0f0f0;
  }

  .input-container {
    position: relative;
    width: 100%;
  }

  .clear-icon {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    font-size: 1rem;
    color: var(--secondary-text);
    transition: color 0.3s ease;
    user-select: none;
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

  .header-row input {
    flex: 1;
    margin-right: 0.5rem;
  }

  .header-row button {
    margin-left: 0.5rem;
  }

  .duplicate-icon {
    display: none;
    cursor: pointer;
    margin-left: 10px;
  }

  .history-item:hover .duplicate-icon {
    display: inline;
  }

  .tab {
    cursor: pointer;
    padding: 0.3rem 0.6rem;
    margin-right: 0.3rem;
    border: 1px solid var(--divider);
    border-bottom: none;
    background: var(--surface);
    border-radius: 4px 4px 0 0;
  }

  .tab.active {
    background: var(--light-background);
    border-bottom: 1px solid var(--surface);
    color: var(--dark-text);
  }

  .tab-content {
    border: 1px solid var(--divider);
    padding: 0.5rem;
    background: var(--surface);
    white-space: pre-wrap;
    word-break: break-word;
    overflow-y: auto;
    max-height: 100%;
  }

  .vertical-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    padding-top: 0.5rem;
    border-bottom: 1px solid var(--divider);
    border-top: 1px solid var(--divider);
  }
  .button-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    width: 100%;
    border-top: 1px solid var(--divider);
    border-bottom: 1px solid var(--divider);
    background-color: var(--surface);
    transition: background-color 0.3s ease;
    text-align: center;
    font-size: x-small;
  }

  .button-item span {
    margin-top: 0.5rem;
  }

  .button-item:hover {
    background-color: var(--light-background);
  }

  .top-buttons {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--divider);
    border-top: 1px solid var(--divider);
    padding-bottom: 0.5rem;
    padding-top: 0.5rem;
  }

  .separator {
    width: 1px;
    height: 20px;
    background-color: #ccc;
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

  .variables-panel {
    padding: 1rem;
    border: 1px solid #ccc;
    margin-top: 1rem;
    border-radius: 0.5rem;
  }

  .error-message {
    color: red;
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
</style>
