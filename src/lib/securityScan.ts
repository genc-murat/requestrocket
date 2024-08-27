import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

interface SecurityScanConfig {
  id: string;
  name: string;
  url: string;
  method: string;
  headers: { [key: string]: string };
  body?: string;
  auth?: {
    type: 'Basic' | 'Bearer' | 'OAuth2';
    credentials: string;
  };
}

interface SecurityVulnerability {
  id: string;
  type: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  recommendation: string;
  details?: any;
  cwe?: string; // Common Weakness Enumeration
}

interface SecurityScanResult {
  configId: string;
  timestamp: number;
  vulnerabilities: SecurityVulnerability[];
  overallScore: number; // 0-100 arası bir güvenlik skoru
  apiInfo: {
    responseTime: number;
    statusCode: number;
    serverInfo?: string;
  };
}

export const securityScanConfigs: Writable<SecurityScanConfig[]> = writable([]);
export const securityScanResults: Writable<SecurityScanResult[]> = writable([]);

export async function runSecurityScan(config: SecurityScanConfig): Promise<SecurityScanResult> {
  const vulnerabilities: SecurityVulnerability[] = [];
  const startTime = Date.now();

  // HTTPS Kontrolü
  if (!config.url.startsWith('https://')) {
    vulnerabilities.push({
      id: 'HTTPS-001',
      type: 'Unsecure Connection',
      description: 'API is not using HTTPS',
      severity: 'High',
      recommendation: 'Implement HTTPS to encrypt data in transit',
      cwe: 'CWE-319'
    });
  }

  // Temel Güvenlik Başlıkları Kontrolü
  const securityHeaders = [
    { name: 'Strict-Transport-Security', id: 'HEADER-001', cwe: 'CWE-523' },
    { name: 'X-Frame-Options', id: 'HEADER-002', cwe: 'CWE-1021' },
    { name: 'X-XSS-Protection', id: 'HEADER-003', cwe: 'CWE-79' },
    { name: 'X-Content-Type-Options', id: 'HEADER-004', cwe: 'CWE-693' },
    { name: 'Content-Security-Policy', id: 'HEADER-005', cwe: 'CWE-1021' }
  ];

  try {
    const response = await fetch(config.url, {
      method: config.method,
      headers: {
        ...config.headers,
        ...(config.auth?.type === 'Basic' && { 'Authorization': `Basic ${config.auth.credentials}` }),
        ...(config.auth?.type === 'Bearer' && { 'Authorization': `Bearer ${config.auth.credentials}` })
      },
      body: config.body
    });

    const responseTime = Date.now() - startTime;

    securityHeaders.forEach(header => {
      if (!response.headers.get(header.name)) {
        vulnerabilities.push({
          id: header.id,
          type: 'Missing Security Header',
          description: `${header.name} header is missing`,
          severity: 'Medium',
          recommendation: `Implement ${header.name} header`,
          cwe: header.cwe
        });
      }
    });

    // Rate Limiting Kontrolü
    if (!response.headers.get('X-RateLimit-Limit')) {
      vulnerabilities.push({
        id: 'RATELIMIT-001',
        type: 'No Rate Limiting',
        description: 'API does not implement rate limiting',
        severity: 'Medium',
        recommendation: 'Implement rate limiting to prevent abuse',
        cwe: 'CWE-770'
      });
    }

    // CORS Kontrolü
    const corsHeader = response.headers.get('Access-Control-Allow-Origin');
    if (corsHeader === '*') {
      vulnerabilities.push({
        id: 'CORS-001',
        type: 'Overly Permissive CORS',
        description: 'CORS is set to allow all origins',
        severity: 'Medium',
        recommendation: 'Restrict CORS to specific trusted domains',
        cwe: 'CWE-942'
      });
    }

    // API Versiyonlama Kontrolü
    if (!config.url.includes('/v') && !response.headers.get('API-Version')) {
      vulnerabilities.push({
        id: 'VERSION-001',
        type: 'No API Versioning',
        description: 'API does not implement versioning',
        severity: 'Low',
        recommendation: 'Implement API versioning to manage changes'
      });
    }

    // Server Bilgisi Kontrolü
    const serverInfo = response.headers.get('Server') || undefined;
    if (serverInfo) {
      vulnerabilities.push({
        id: 'SERVER-001',
        type: 'Server Information Disclosure',
        description: 'Server is disclosing version information',
        severity: 'Low',
        recommendation: 'Remove or obfuscate the Server header',
        details: { serverInfo },
        cwe: 'CWE-200'
      });
    }

    // JWT token kontrolü
    if (config.auth?.type === 'Bearer') {
      const jwtVulnerabilities = checkJWTSecurity(config.auth.credentials);
      vulnerabilities.push(...jwtVulnerabilities);
    }

    // API Dokümantasyonu Kontrolü
    const apiDocsEndpoints = ['/docs', '/swagger', '/openapi.json', '/api-docs'];
    for (const endpoint of apiDocsEndpoints) {
      const docsResponse = await fetch(new URL(endpoint, config.url).toString());
      if (docsResponse.ok) {
        vulnerabilities.push({
          id: 'DOCS-001',
          type: 'Public API Documentation',
          description: 'API documentation is publicly accessible',
          severity: 'Low',
          recommendation: 'Consider restricting access to API documentation in production',
          details: { endpoint }
        });
        break;
      }
    }

    // Genel Güvenlik Skoru Hesaplama
    const overallScore = calculateSecurityScore(vulnerabilities);

    const result: SecurityScanResult = {
      configId: config.id,
      timestamp: Date.now(),
      vulnerabilities,
      overallScore,
      apiInfo: {
        responseTime,
        statusCode: response.status,
        serverInfo
      }
    };

    securityScanResults.update(results => [...results, result]);

    return result;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    vulnerabilities.push({
      id: 'CONN-001',
      type: 'Connection Error',
      description: `Failed to connect to API: ${errorMessage}`,
      severity: 'Critical',
      recommendation: 'Ensure API is accessible and properly configured',
      cwe: 'CWE-521'
    });

    const result: SecurityScanResult = {
      configId: config.id,
      timestamp: Date.now(),
      vulnerabilities,
      overallScore: 0,
      apiInfo: {
        responseTime: Date.now() - startTime,
        statusCode: 0
      }
    };

    securityScanResults.update(results => [...results, result]);

    return result;
  }
}

function checkJWTSecurity(token: string): SecurityVulnerability[] {
  const vulnerabilities: SecurityVulnerability[] = [];
  const [header, payload, signature] = token.split('.');

  if (!header || !payload || !signature) {
    vulnerabilities.push({
      id: 'JWT-001',
      type: 'Invalid JWT Format',
      description: 'The JWT token is not properly formatted',
      severity: 'High',
      recommendation: 'Ensure the JWT token is correctly formatted with header, payload, and signature',
      cwe: 'CWE-345'
    });
  }

  try {
    const decodedHeader = JSON.parse(atob(header));
    if (decodedHeader.alg === 'none') {
      vulnerabilities.push({
        id: 'JWT-002',
        type: 'Insecure JWT Algorithm',
        description: 'JWT uses the "none" algorithm',
        severity: 'Critical',
        recommendation: 'Use a secure algorithm like RS256 for JWT signing',
        cwe: 'CWE-327'
      });
    }
  } catch (error) {
    vulnerabilities.push({
      id: 'JWT-003',
      type: 'JWT Parsing Error',
      description: 'Unable to parse JWT header',
      severity: 'Medium',
      recommendation: 'Ensure the JWT is properly encoded',
      cwe: 'CWE-345'
    });
  }

  return vulnerabilities;
}

function calculateSecurityScore(vulnerabilities: SecurityVulnerability[]): number {
  const severityWeights = {
    Low: 1,
    Medium: 2,
    High: 3,
    Critical: 4
  };

  const totalWeight = vulnerabilities.reduce((sum, vuln) => sum + severityWeights[vuln.severity], 0);
  const maxPossibleWeight = 4 * vulnerabilities.length; // Assuming all vulnerabilities could be Critical

  return Math.round((1 - totalWeight / maxPossibleWeight) * 100);
}

export function addSecurityScanConfig(config: SecurityScanConfig) {
  securityScanConfigs.update(configs => [...configs, config]);
}

export function removeSecurityScanConfig(id: string) {
  securityScanConfigs.update(configs => configs.filter(config => config.id !== id));
}

export function getLatestScanResult(configId: string): SecurityScanResult | undefined {
  let latestResult: SecurityScanResult | undefined;
  
  securityScanResults.subscribe(results => {
    latestResult = results
      .filter(result => result.configId === configId)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
  });

  return latestResult;
}

export function getScanHistory(configId: string, limit: number = 10): SecurityScanResult[] {
  let history: SecurityScanResult[] = [];

  securityScanResults.subscribe(results => {
    history = results
      .filter(result => result.configId === configId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  });

  return history;
}

export function compareScans(scan1: SecurityScanResult, scan2: SecurityScanResult): {
  newVulnerabilities: SecurityVulnerability[],
  resolvedVulnerabilities: SecurityVulnerability[],
  scoreDifference: number
} {
  const newVulnerabilities = scan2.vulnerabilities.filter(
    v2 => !scan1.vulnerabilities.some(v1 => v1.id === v2.id)
  );

  const resolvedVulnerabilities = scan1.vulnerabilities.filter(
    v1 => !scan2.vulnerabilities.some(v2 => v2.id === v1.id)
  );

  const scoreDifference = scan2.overallScore - scan1.overallScore;

  return { newVulnerabilities, resolvedVulnerabilities, scoreDifference };
}