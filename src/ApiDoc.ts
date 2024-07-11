interface ApiDoc {
    info: {
      title: string;
      version: string;
    };
    paths: {
      [url: string]: {
        [method: string]: {
          summary: string;
          parameters: {
            name: string;
            in: string;
            required: boolean;
            schema: {
              type: string;
            };
            example: any;
          }[];
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: string;
                };
                example: any;
              };
            };
          };
          responses: {
            [status: string]: {
              description: string;
              content: {
                "application/json": {
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
  