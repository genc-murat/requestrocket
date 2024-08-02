// src/lib/requestModule.ts
import { invoke } from "@tauri-apps/api/tauri";
import type { ResponseData, HistoryItem, StatusHistoryItem } from "../components/api-types"; // Yolu doğru şekilde ayarlayın

export async function sendRequest(requestData: any, variables: any): Promise<ResponseData> {
    console.log("Sending request with data:", requestData);

    try {
        const res: ResponseData = await invoke<ResponseData>("send_request", {
            requestData,
        });
        console.log("Response received:", res);
        return res;
    } catch (error) {
        console.error("Request failed:", error);
        throw error;
    }
}

export function prepareRequestData(url: string, method: string, headers: any[], body: string, pathParams: any[], queryParams: any[], formParams: any[], bodyType: string, variables: any, requestTimeout: number): any {
    const actualHeaders = headers
        .filter((header) => header.selected)
        .map((header) => ({
            key: replaceVariables(header.key, variables),
            value: replaceVariables(header.value, variables),
            selected: header.selected,
        }));

    const pathParamsObject = Object.fromEntries(
        pathParams.map((param) => [
            param.key.replace(/\{\{(.*?)\}\}/g, "$1"),
            replaceVariables(param.key, variables),
        ]),
    );
    const queryParamsObject = Object.fromEntries(
        queryParams.map((param) => [
            param.key.replace(/\{\{(.*?)\}\}/g, "$1"),
            replaceVariables(param.key, variables),
        ]),
    );
    const formParamsObject = Object.fromEntries(
        formParams.map((param) => [
            param.key.replace(/\{\{(.*?)\}\}/g, "$1"),
            replaceVariables(param.key, variables),
        ]),
    );

    let requestBody;
    let contentType;

    if (method === "GET") {
        requestBody = null;
    } else {
        switch (bodyType) {
            case "json":
                contentType = "application/json";
                requestBody = replaceVariables(body, variables);
                break;
            case "xml":
                if (body.includes("soapenv:Envelope")) {
                    contentType = "text/xml; charset=utf-8";
                    requestBody = replaceVariables(body, variables);
                } else {
                    contentType = "application/xml";
                    requestBody = replaceVariables(body, variables);
                }
                break;
            case "form-data":
                contentType = "multipart/form-data";
                requestBody = formParamsObject;
                break;
            case "form-urlencoded":
                contentType = "application/x-www-form-urlencoded";
                requestBody = new URLSearchParams(
                    formParams.map((field) => [
                        field.key,
                        replaceVariables(field.value, variables),
                    ]),
                ).toString();
                break;
            default:
                contentType = "text/plain";
                requestBody = replaceVariables(body, variables);
        }
    }

    return {
        url,
        method,
        body: requestBody,
        headers: Object.fromEntries(
            actualHeaders.map((header) => [header.key, header.value]),
        ),
        path_params: pathParamsObject,
        query_params: queryParamsObject,
        form_data: bodyType === "form-data" ? formParamsObject : undefined,
        content_type: contentType,
        timeout: Number(requestTimeout),
    };
}

function replaceVariables(str: string, variables: any): string {
    return str.replace(/\{\{(.*?)\}\}/g, (match, key) => {
        return variables[key.trim()] || match;
    });
}

export function createNewStatusHistoryItem(url: string, res: ResponseData): StatusHistoryItem {
    return {
        id: Date.now(),
        url,
        status: res.status,
        duration: res.duration,
        size: res.size,
        timestamp: new Date().toISOString(),
    };
}

export function createNewHistoryItem(url: string, method: string, body: string, headers: any, params: any[], response: string, group: string): HistoryItem {
    return {
        id: Date.now(),
        url,
        method,
        body,
        headers: Array.isArray(headers) ? headers : Object.entries(headers).map(([key, value]) => ({ key, value, selected: true })),
        params,
        response,
        group,
    };
}