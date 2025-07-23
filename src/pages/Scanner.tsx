import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Upload, 
  FileText, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  Download,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { systemProfileService, type ScanResult } from '@/services/systemProfileService';
import { nvdApi } from '@/services/nvdApi';

const Scanner = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const jsonFiles = files.filter(file => file.type === 'application/json' || file.name.endsWith('.json'));
    
    if (jsonFiles.length !== files.length) {
      toast({
        title: "Invalid Files",
        description: "Only JSON files are supported",
        variant: "destructive",
      });
    }
    
    setUploadedFiles(prev => [...prev, ...jsonFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processScanResults = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No Files",
        description: "Please upload scan result files first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const results: ScanResult[] = [];
    const allVulnerabilities: any[] = [];

    try {
      for (const file of uploadedFiles) {
        const content = await file.text();
        const scanResult = systemProfileService.parseJsonFile(content);
        results.push(scanResult);

        // Extract search terms for vulnerability lookup
        const searchTerms = systemProfileService.generateVulnerabilitySearchTerms(scanResult);
        
        // Search for vulnerabilities for each component
        for (const term of searchTerms.slice(0, 3)) { // Limit to first 3 terms to avoid rate limits
          try {
            const nvdResponse = await nvdApi.searchVulnerabilities({
              keywordSearch: term,
              resultsPerPage: 5
            });
            
            const formattedVulns = nvdResponse.vulnerabilities.map(vuln => ({
              ...nvdApi.formatVulnerability(vuln),
              component: term
            }));
            
            allVulnerabilities.push(...formattedVulns);
          } catch (error) {
            console.error(`Error searching for ${term}:`, error);
          }
        }
      }

      setScanResults(results);
      setVulnerabilities(allVulnerabilities);
      
      toast({
        title: "Scan Complete",
        description: `Processed ${results.length} files and found ${allVulnerabilities.length} potential vulnerabilities`,
      });
    } catch (error) {
      console.error('Processing error:', error);
      toast({
        title: "Processing Failed",
        description: error instanceof Error ? error.message : "Failed to process files",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      scanResults,
      vulnerabilities,
      summary: {
        filesProcessed: scanResults.length,
        vulnerabilitiesFound: vulnerabilities.length,
        criticalCount: vulnerabilities.filter(v => v.severity === 'Critical').length,
        highCount: vulnerabilities.filter(v => v.severity === 'High').length,
        mediumCount: vulnerabilities.filter(v => v.severity === 'Medium').length,
        lowCount: vulnerabilities.filter(v => v.severity === 'Low').length,
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vulnerability-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Scanner</h1>
        <p className="text-muted-foreground mt-2">
          Scan your systems for vulnerabilities
        </p>
      </div>

      {/* Upload Section */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Scanner Configuration</h2>
        <p className="text-muted-foreground mb-6">
          Configure system scan settings for next scan.
        </p>

        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Upload Scan Results</h3>
          <p className="text-muted-foreground mb-4">
            Drag and drop or click to select JSON files with system profile or application inventory data
          </p>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Scan Results
          </Button>
        </div>

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Uploaded Files:</h3>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">{file.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {(file.size / 1024).toFixed(1)} KB
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex items-center space-x-3 mt-4">
              <Button onClick={processScanResults} disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Process Scan Results
                  </>
                )}
              </Button>
              
              {vulnerabilities.length > 0 && (
                <Button variant="outline" onClick={downloadReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* Scan Results */}
      {scanResults.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Scan Results</h2>
          <div className="space-y-6">
            {scanResults.map((result, index) => (
              <div key={index}>
                {result.status === 'error' ? (
                  <div className="p-4 rounded-lg border border-border">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      <div>
                        <p className="font-medium text-foreground">Error: {'error' in result ? result.error.code : 'Unknown error'}</p>
                        <p className="text-sm text-muted-foreground">{'error' in result ? result.error.message : 'An error occurred'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-success" />
                        <div>
                          <p className="font-medium text-foreground">
                            {'data' in result && 'osName' in result.data ? `${result.data.osName} ${result.data.osVersion}` : 'Application Inventory'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {'data' in result && 'systemComponents' in result.data 
                              ? `${result.data.systemComponents.length} system components` 
                              : 'data' in result && 'applications' in result.data
                              ? `${result.data.applications.length} applications`
                              : 'No data available'}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {result.status}
                      </Badge>
                    </div>

                    {/* Table for applications or components */}
                    {'data' in result && (
                      <div className="border border-border rounded-lg">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12">
                                <Checkbox
                                  checked={
                                    'applications' in result.data
                                      ? result.data.applications.every(app => selectedItems.has(`${index}-${app.id}`))
                                      : 'systemComponents' in result.data
                                      ? result.data.systemComponents.every(comp => selectedItems.has(`${index}-${comp.name}`))
                                      : false
                                  }
                                  onCheckedChange={(checked) => {
                                    const newSelected = new Set(selectedItems);
                                    if ('applications' in result.data) {
                                      result.data.applications.forEach(app => {
                                        const id = `${index}-${app.id}`;
                                        if (checked) {
                                          newSelected.add(id);
                                        } else {
                                          newSelected.delete(id);
                                        }
                                      });
                                    } else if ('systemComponents' in result.data) {
                                      result.data.systemComponents.forEach(comp => {
                                        const id = `${index}-${comp.name}`;
                                        if (checked) {
                                          newSelected.add(id);
                                        } else {
                                          newSelected.delete(id);
                                        }
                                      });
                                    }
                                    setSelectedItems(newSelected);
                                  }}
                                />
                              </TableHead>
                              <TableHead>Name</TableHead>
                              <TableHead>Version</TableHead>
                              <TableHead>Type</TableHead>
                              {'applications' in result.data ? (
                                <>
                                  <TableHead>Publisher</TableHead>
                                  <TableHead>Install Date</TableHead>
                                  <TableHead>Vulnerabilities</TableHead>
                                </>
                              ) : (
                                <TableHead>Description</TableHead>
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {'applications' in result.data ? (
                              result.data.applications.map((app) => {
                                const itemId = `${index}-${app.id}`;
                                return (
                                  <TableRow key={app.id}>
                                    <TableCell>
                                      <Checkbox
                                        checked={selectedItems.has(itemId)}
                                        onCheckedChange={(checked) => {
                                          const newSelected = new Set(selectedItems);
                                          if (checked) {
                                            newSelected.add(itemId);
                                          } else {
                                            newSelected.delete(itemId);
                                          }
                                          setSelectedItems(newSelected);
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell className="font-medium">{app.name}</TableCell>
                                    <TableCell>{app.version}</TableCell>
                                    <TableCell>
                                      <Badge variant="secondary">Application</Badge>
                                    </TableCell>
                                    <TableCell>{app.publisher || 'Unknown'}</TableCell>
                                    <TableCell>{app.installDate || 'Unknown'}</TableCell>
                                    <TableCell>
                                      {app.vulnerabilityCount > 0 ? (
                                        <Badge variant="destructive">{app.vulnerabilityCount}</Badge>
                                      ) : (
                                        <Badge variant="outline">0</Badge>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            ) : 'systemComponents' in result.data ? (
                              result.data.systemComponents.map((comp) => {
                                const itemId = `${index}-${comp.name}`;
                                return (
                                  <TableRow key={comp.name}>
                                    <TableCell>
                                      <Checkbox
                                        checked={selectedItems.has(itemId)}
                                        onCheckedChange={(checked) => {
                                          const newSelected = new Set(selectedItems);
                                          if (checked) {
                                            newSelected.add(itemId);
                                          } else {
                                            newSelected.delete(itemId);
                                          }
                                          setSelectedItems(newSelected);
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell className="font-medium">{comp.name}</TableCell>
                                    <TableCell>{comp.version}</TableCell>
                                    <TableCell>
                                      <Badge variant="outline">{comp.type}</Badge>
                                    </TableCell>
                                    <TableCell>{comp.description}</TableCell>
                                  </TableRow>
                                );
                              })
                            ) : null}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Vulnerability Results */}
      {vulnerabilities.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            Found Vulnerabilities ({vulnerabilities.length})
          </h2>
          <div className="grid gap-4">
            {vulnerabilities.slice(0, 10).map((vuln, index) => (
              <div key={index} className="p-4 rounded-lg border border-border">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{vuln.cve}</h3>
                    <p className="text-sm text-muted-foreground">Component: {vuln.component}</p>
                  </div>
                  <Badge className={
                    vuln.severity === 'Critical' ? 'bg-severity-critical' :
                    vuln.severity === 'High' ? 'bg-severity-high' :
                    vuln.severity === 'Medium' ? 'bg-severity-medium' : 'bg-severity-low'
                  }>
                    {vuln.severity}
                  </Badge>
                </div>
                <p className="text-sm text-foreground">{vuln.title}</p>
                {vuln.score > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">CVSS Score: {vuln.score}</p>
                )}
              </div>
            ))}
          </div>
          
          {vulnerabilities.length > 10 && (
            <p className="text-sm text-muted-foreground mt-4 text-center">
              And {vulnerabilities.length - 10} more vulnerabilities...
            </p>
          )}
        </Card>
      )}
    </div>
  );
};

export default Scanner;