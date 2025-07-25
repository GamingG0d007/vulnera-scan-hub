export interface SystemComponent {
  name: string;
  version: string;
  type: 'kernel' | 'driver' | 'service' | 'library' | 'runtime';
  description: string;
}

export interface SystemProfile {
  status: string;
  data: {
    osName: string;
    osVersion: string;
    architecture: string;
    kernelVersion: string;
    hostname: string;
    lastBoot: string;
    systemComponents: SystemComponent[];
  };
}

export interface Application {
  id: string;
  name: string;
  version: string;
  installPath: string;
  installDate: string;
  publisher: string;
  size?: number;
  lastModified: string;
  vulnerabilityCount: number;
  updateAvailable: boolean;
  updateVersion?: string;
}

export interface ApplicationInventory {
  status: string;
  data: {
    totalApplications: number;
    lastScanned: string;
    applications: Application[];
  };
}

export interface ScanError {
  status: 'error';
  error: {
    code: string;
    message: string;
    details: string;
  };
}

export type ScanResult = SystemProfile | ApplicationInventory | ScanError;

class SystemProfileService {
  parseJsonFile(fileContent: string): ScanResult {
    try {
      const parsed = JSON.parse(fileContent);
      
      if (parsed.status === 'error') {
        return parsed as ScanError;
      }
      
      // Check if it's a system profile (original format)
      if (parsed.data?.osName && parsed.data?.systemComponents) {
        return parsed as SystemProfile;
      }
      
      // Check if it's a combined format with nested systemProfile and applicationInventory
      if (parsed.data?.systemProfile && parsed.data?.applicationInventory) {
        // For now, prioritize the application inventory since it contains vulnerability counts
        const appData = parsed.data.applicationInventory;
        const transformedAppInventory: ApplicationInventory = {
          status: 'success',
          data: {
            totalApplications: appData.totalApplications,
            lastScanned: appData.lastScanned,
            applications: appData.applications
          }
        };
        return transformedAppInventory;
      }
      
      // Check if it's a system profile (alternative format)
      if (parsed.scanType === 'systemProfile' && parsed.components) {
        // Transform to expected format
        const transformedProfile: SystemProfile = {
          status: 'success',
          data: {
            osName: parsed.os,
            osVersion: parsed.osVersion,
            architecture: parsed.architecture || 'unknown',
            kernelVersion: parsed.kernelVersion || 'unknown',
            hostname: parsed.hostname,
            lastBoot: parsed.timestamp || new Date().toISOString(),
            systemComponents: parsed.components.map((comp: any) => ({
              name: comp.name,
              version: comp.version,
              type: comp.type as 'kernel' | 'driver' | 'service' | 'library' | 'runtime',
              description: comp.description || `${comp.type} component`
            }))
          }
        };
        return transformedProfile;
      }
      
      // Check if it's an application inventory (original format)
      if (parsed.data?.totalApplications && parsed.data?.applications) {
        return parsed as ApplicationInventory;
      }
      
      throw new Error('Invalid JSON format. Expected system profile or application inventory.');
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  extractVulnerableComponents(scanResult: ScanResult): string[] {
    if (scanResult.status === 'error') {
      return [];
    }

    const components: string[] = [];

    if ('data' in scanResult && 'systemComponents' in scanResult.data) {
      // System profile
      scanResult.data.systemComponents.forEach(component => {
        components.push(`${component.name} ${component.version}`);
      });
    } else if ('data' in scanResult && 'applications' in scanResult.data) {
      // Application inventory
      scanResult.data.applications
        .filter(app => app.vulnerabilityCount > 0)
        .forEach(app => {
          components.push(`${app.name} ${app.version}`);
        });
    }

    return components;
  }

  generateVulnerabilitySearchTerms(scanResult: ScanResult): string[] {
    if (scanResult.status === 'error') {
      return [];
    }

    const searchTerms: string[] = [];

    if ('data' in scanResult && 'systemComponents' in scanResult.data) {
      // Add OS-specific terms
      searchTerms.push(scanResult.data.osName);
      searchTerms.push(`${scanResult.data.osName} ${scanResult.data.osVersion}`);
      
      // Add component names
      scanResult.data.systemComponents.forEach(component => {
        searchTerms.push(component.name);
      });
    } else if ('data' in scanResult && 'applications' in scanResult.data) {
      // Add application names
      scanResult.data.applications.forEach(app => {
        searchTerms.push(app.name);
        if (app.publisher && app.publisher !== app.name) {
          searchTerms.push(app.publisher);
        }
      });
    }

    return [...new Set(searchTerms)]; // Remove duplicates
  }
}

export const systemProfileService = new SystemProfileService();