export interface HarFile {
    log: {
      version: string;
      creator: {
        name: string;
        version: string;
      };
      entries: HarEntry[];
    };
  }
  
  export interface HarEntry {
    startedDateTime: string;
    time: number;
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
  }