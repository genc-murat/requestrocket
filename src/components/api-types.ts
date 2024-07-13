export type HistoryItem = {
  id: number;
  url: string;
  method: string;
  body: string;
  response: string;
  headers: Header[];
  params: Param[];
  group: string;
};

export type Header = {
  key: string;
  value: string;
};

export type Param = {
  key: string;
  value: string;
};

export type ResponseData = {
  status: number;
  duration: number;
  size: number;
  body: string;
  headers: [string, string][];
  curl_command: string;
  timestamp: string;
  error: string | null;
};

export type StatusHistoryItem = {
  id: number;
  url: string;
  status: number;
  duration: number;
  size: number;
  timestamp: string;
};

export interface ApiDoc {
  info: {
    title: string;
    version: string;
  };
  paths: {
    [path: string]: {
      [method: string]: {
        summary: string;
        parameters: Array<{
          name: string;
          in: string;
          required: boolean;
          schema: {
            type: string;
          };
          example: string;
        }>;
        requestBody?: {
          content: {
            [contentType: string]: {
              schema: {
                type: string;
              };
              example: any;
            };
          };
        };
        responses: {
          [statusCode: string]: {
            description: string;
            content: {
              [contentType: string]: {
                schema: {
                  type: string;
                };
                example: any;
              };
            };
          };
        };
      };
    };
  };
}