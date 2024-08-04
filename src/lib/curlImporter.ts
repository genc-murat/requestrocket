// curlImporter.ts

import type { HistoryItem, Header } from "../types/api-types";  // Varsayılan olarak bu tiplerin tanımlandığını varsayıyoruz

function parseCurlCommand(curlCommand: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let escaped = false;

  for (let char of curlCommand) {
    if (escaped) {
      current += char;
      escaped = false;
    } else if (char === '\\') {
      escaped = true;
    } else if (char === '"' && !inQuotes) {
      inQuotes = true;
    } else if (char === '"' && inQuotes) {
      inQuotes = false;
      result.push(current);
      current = '';
    } else if (char === ' ' && !inQuotes) {
      if (current) {
        result.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }

  if (current) {
    result.push(current);
  }

  return result;
}

export function importCurlCommand(curlCommand: string): Promise<HistoryItem> {
  return new Promise((resolve, reject) => {
    try {
      const parsedCommand = parseCurlCommand(curlCommand);
      
      let url = '';
      let method = 'GET';
      let headers: Header[] = [];
      let body = '';
      
      for (let i = 0; i < parsedCommand.length; i++) {
        const arg = parsedCommand[i];
        
        if (arg.startsWith('http')) {
          url = arg.replace(/^['"]|['"]$/g, '');  // Remove quotes if present
        } else if (arg === '-X' || arg === '--request') {
          method = parsedCommand[++i];
        } else if (arg === '-H' || arg === '--header') {
          const headerStr = parsedCommand[++i].replace(/^['"]|['"]$/g, '');
          const [key, ...valueParts] = headerStr.split(':');
          const value = valueParts.join(':').trim();
          headers.push({ key, value, selected: true });
        } else if (arg === '-d' || arg === '--data') {
          body = parsedCommand[++i].replace(/^['"]|['"]$/g, '');
        }
      }
      
      const historyItem: HistoryItem = {
        id: Date.now(),
        url,
        method,
        headers,
        body,
        params: [],
        response: '',
        group: 'Imported',
      };
      
      resolve(historyItem);
    } catch (error) {
      reject(new Error('Failed to parse cURL command'));
    }
  });
}

export function validateCurlCommand(curlCommand: string): boolean {
  const parsedCommand = parseCurlCommand(curlCommand);
  return parsedCommand.length > 1 && parsedCommand[0].toLowerCase() === 'curl';
}

export function extractUrlFromCurl(curlCommand: string): string | null {
  const parsedCommand = parseCurlCommand(curlCommand);
  for (let arg of parsedCommand) {
    if (arg.startsWith('http')) {
      return arg.replace(/^['"]|['"]$/g, '');
    }
  }
  return null;
}