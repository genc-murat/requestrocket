// harImporter.ts
import type { HistoryItem, Header, Param } from "../components/api-types";

interface HarEntry {
    startedDateTime: string;
    request: {
        method: string;
        url: string;
        httpVersion: string;
        headers: { name: string; value: string }[];
        queryString: { name: string; value: string }[];
        postData?: {
            mimeType: string;
            params?: { name: string; value: string }[];
            text?: string;
        };
    };
    response: {
        status: number;
        statusText: string;
        httpVersion: string;
        headers: { name: string; value: string }[];
        content: {
            size: number;
            mimeType: string;
            text?: string;
            encoding?: string;
        };
    };
    timings: {
        send: number;
        wait: number;
        receive: number;
    };
}

interface HarFile {
    log: {
        version: string;
        creator: {
            name: string;
            version: string;
        };
        entries: HarEntry[];
    };
}

function parseUrl(url: string): { url: string; pathParams: Param[] } {
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);
    const pathParams: Param[] = pathSegments.map((segment, index) => ({
        key: `param${index + 1}`,
        value: segment
    }));
    return { url: `${urlObj.origin}${urlObj.pathname}`, pathParams };
}

function decodeContent(content: string, encoding?: string): string {
    if (encoding === 'base64') {
        return atob(content);
    }
    return content;
}

export function importHarFile(harContent: string): Promise<HistoryItem[]> {
    return new Promise((resolve, reject) => {
        try {
            const harFile: HarFile = JSON.parse(harContent);
            const historyItems: HistoryItem[] = harFile.log.entries.map((entry) => {
                const { url, pathParams } = parseUrl(entry.request.url);

                const headers: Header[] = entry.request.headers.map((h) => ({
                    key: h.name,
                    value: h.value,
                    selected: true,
                }));

                const queryParams: Param[] = entry.request.queryString.map((q) => ({
                    key: q.name,
                    value: q.value,
                }));

                let body = '';
                let formParams: Param[] = [];
                if (entry.request.postData) {
                    if (entry.request.postData.params) {
                        formParams = entry.request.postData.params.map((p) => ({
                            key: p.name,
                            value: p.value,
                        }));
                    } else if (entry.request.postData.text) {
                        body = entry.request.postData.text;
                    }
                }

                const responseBody = entry.response.content.text
                    ? decodeContent(entry.response.content.text, entry.response.content.encoding)
                    : '';

                const responseData = {
                    status: entry.response.status,
                    statusText: entry.response.statusText,
                    headers: entry.response.headers,
                    body: responseBody,
                    size: entry.response.content.size,
                    mimeType: entry.response.content.mimeType,
                };

                return {
                    id: Date.now() + Math.random(),
                    url,
                    method: entry.request.method,
                    headers,
                    body,
                    params: queryParams,
                    pathParams,
                    formParams,
                    response: JSON.stringify(responseData),
                    group: 'Imported from HAR',
                    timestamp: new Date(entry.startedDateTime).getTime(),
                    duration: entry.timings.send + entry.timings.wait + entry.timings.receive,
                };
            });

            resolve(historyItems);
        } catch (error) {
            reject(new Error('Failed to parse HAR file'));
        }
    });
}