interface NVDVulnerability {
  cve: {
    id: string;
    sourceIdentifier: string;
    published: string;
    lastModified: string;
    vulnStatus: string;
    descriptions: Array<{
      lang: string;
      value: string;
    }>;
    metrics?: {
      cvssMetricV31?: Array<{
        cvssData: {
          baseScore: number;
          baseSeverity: string;
        };
      }>;
      cvssMetricV2?: Array<{
        cvssData: {
          baseScore: number;
        };
      }>;
    };
    references: Array<{
      url: string;
      source: string;
    }>;
  };
}

interface NVDApiResponse {
  resultsPerPage: number;
  startIndex: number;
  totalResults: number;
  format: string;
  version: string;
  timestamp: string;
  vulnerabilities: NVDVulnerability[];
}

class NVDApiService {
  private baseUrl = 'https://services.nvd.nist.gov/rest/json/cves/2.0';

  async searchVulnerabilities(params: {
    keywordSearch?: string;
    cveId?: string;
    resultsPerPage?: number;
    startIndex?: number;
  }): Promise<NVDApiResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.keywordSearch) {
      searchParams.append('keywordSearch', params.keywordSearch);
    }
    
    if (params.cveId) {
      searchParams.append('cveId', params.cveId);
    }
    
    searchParams.append('resultsPerPage', (params.resultsPerPage || 20).toString());
    searchParams.append('startIndex', (params.startIndex || 0).toString());

    const url = `${this.baseUrl}?${searchParams.toString()}`;
    
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching from NVD API:', error);
      throw error;
    }
  }

  async searchByKeywords(keywords: string[], resultsPerPage = 20): Promise<NVDApiResponse> {
    const keywordSearch = keywords.join(' ');
    return this.searchVulnerabilities({ keywordSearch, resultsPerPage });
  }

  async searchByCVE(cveId: string): Promise<NVDApiResponse> {
    return this.searchVulnerabilities({ cveId });
  }

  formatVulnerability(nvdVuln: NVDVulnerability) {
    const cve = nvdVuln.cve;
    const description = cve.descriptions.find(d => d.lang === 'en')?.value || 'No description available';
    
    let score = 0;
    let severity = 'Unknown';
    
    if (cve.metrics?.cvssMetricV31?.[0]) {
      score = cve.metrics.cvssMetricV31[0].cvssData.baseScore;
      severity = cve.metrics.cvssMetricV31[0].cvssData.baseSeverity;
    } else if (cve.metrics?.cvssMetricV2?.[0]) {
      score = cve.metrics.cvssMetricV2[0].cvssData.baseScore;
      // Convert CVSS v2 score to severity
      if (score >= 7.0) severity = 'High';
      else if (score >= 4.0) severity = 'Medium';
      else severity = 'Low';
    }

    return {
      cve: cve.id,
      title: description.substring(0, 100) + (description.length > 100 ? '...' : ''),
      description,
      severity: severity as 'Critical' | 'High' | 'Medium' | 'Low',
      score,
      publishedDate: cve.published,
      lastModified: cve.lastModified,
      status: cve.vulnStatus,
      source: cve.sourceIdentifier,
      references: cve.references
    };
  }
}

export const nvdApi = new NVDApiService();