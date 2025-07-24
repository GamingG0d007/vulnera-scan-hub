import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  X,
  Wifi
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { systemProfileService, type ScanResult } from '@/services/systemProfileService';
import { nvdApi } from '@/services/nvdApi';

const Scanner = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [scanResults, setScanResults] = useState<ScanResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
<<<<<<< HEAD
  const [appTable, setAppTable] = useState<any[]>([]); // Applications from uploaded JSON
  const [checkedApps, setCheckedApps] = useState<{ [key: string]: boolean }>({});
  const [nvdResults, setNvdResults] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [visibleRows, setVisibleRows] = useState(11);
  const [isConnecting, setIsConnecting] = useState(false);
  const [scannerStatus, setScannerStatus] = useState<string>('');
=======
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
>>>>>>> 8bc1d98d7b974b33ff787ef36e7c71fea95b0a6c
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    // Parse applications from the first file (for demo, can be extended for multiple)
    if (jsonFiles.length > 0) {
      const text = await jsonFiles[0].text();
      try {
        const parsed = systemProfileService.parseJsonFile(text);
        let apps: any[] = [];
        if ('data' in parsed && 'applications' in parsed.data) {
          apps = parsed.data.applications;
        }
        setAppTable(apps);
        // Default all unchecked
        const checked: { [key: string]: boolean } = {};
        apps.forEach(app => { checked[app.name] = false; });
        setCheckedApps(checked);
        setVisibleRows(11);
      } catch (err) {
        setAppTable([]);
        setCheckedApps({});
        setVisibleRows(11);
      }
    }
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
    try {
      // Read all uploaded files as text
      const fileContents = await Promise.all(uploadedFiles.map(file => file.text()));
      // Parse each file as JSON
      const jsonPayloads = fileContents.map(content => {
        try {
          return JSON.parse(content);
        } catch (e) {
          return null;
        }
      });
      // Filter out any files that failed to parse
      const validPayloads = jsonPayloads.filter(Boolean);
      if (validPayloads.length === 0) {
        toast({
          title: "Invalid JSON",
          description: "None of the uploaded files could be parsed as valid JSON.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
      // Send to backend
      const response = await fetch('http://127.0.0.1:8000/api/v1/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ files: validPayloads }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Fetch the scan results from the backend after POST
      const getResponse = await fetch('http://127.0.0.1:8000/api/v1/scan');
      if (!getResponse.ok) {
        throw new Error(`Failed to fetch scan results: ${getResponse.status}`);
      }
      const scanData = await getResponse.json();
      setVulnerabilities(Array.isArray(scanData) ? scanData : []);
      toast({
        title: "Scan Complete",
        description: `Scan results received from backend.`,
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

  // Checkbox handler
  const handleCheckbox = (name: string) => {
    setCheckedApps(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Check All handler
  const handleCheckAll = (checked: boolean) => {
    const newChecked: { [key: string]: boolean } = {};
    appTable.forEach(app => { newChecked[app.name] = checked; });
    setCheckedApps(newChecked);
  };

  // Scan button handler
  const handleScanNVD = () => {
    const selectedNames = appTable.filter(app => checkedApps[app.name]).map(app => app.name);
    if (selectedNames.length === 0) {
      toast({ title: "No Applications Selected", description: "Please select at least one application.", variant: "destructive" });
      return;
    }
    // Redirect to /search and pass selectedNames as state
    navigate('/search', { state: { searchTerm: selectedNames.join(' ') } });
  };

  // Connect to Scanner handler
  const handleConnectToScanner = async () => {
    setIsConnecting(true);
    setScannerStatus('');
    
    try {
      const response = await fetch('http://localhost:3000/scanner/api/v1/scan', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Try to get the response text to see what we're actually getting
        const responseText = await response.text();
        console.error('Non-JSON response received:', responseText.substring(0, 200));
        throw new Error(`Expected JSON response but received ${contentType || 'unknown content type'}. The server may not be properly configured.`);
      }
      
      const data = await response.json();
      setScannerStatus('Connected successfully');
      toast({
        title: "Scanner Connected",
        description: "Successfully connected to the scanner API",
      });
      
      // Handle the response data as needed
      console.log('Scanner response:', data);
      
    } catch (error) {
      console.error('Connection error:', error);
      setScannerStatus('Connection failed');
      
      let errorMessage = 'Failed to connect to scanner';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Unable to reach the scanner API. Please check if the server is running on http://localhost:3000.';
        } else if (error.message.includes('HTTP error! status: 404')) {
          errorMessage = 'API endpoint not found. Please check if the scanner API is properly configured.';
        } else if (error.message.includes('HTTP error! status: 500')) {
          errorMessage = 'Server error. Please check the scanner API logs.';
        } else if (error.message.includes('Expected JSON response')) {
          errorMessage = 'Server returned HTML instead of JSON. The API endpoint may not be properly configured.';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
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

      {/* Side by Side Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* First Section: File Upload */}
        <Card className={uploadedFiles.length > 0 ? 'p-3 transition-all duration-300' : 'p-6 transition-all duration-300'}>
          <h2 className="text-xl font-semibold text-foreground mb-4">File Upload</h2>
          <p className="text-muted-foreground mb-6">
            Upload JSON files with system profile or application inventory data.
          </p>

          <div className={uploadedFiles.length > 0 ? 'border-2 border-dashed border-border rounded-lg p-3 text-center hover:border-primary/50 transition-all duration-300' : 'border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-all duration-300'}>
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

              {/* Application Table with Checkboxes */}
              {appTable.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-md font-semibold mb-2">Applications</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 border">
                            <button
                              className="text-xs underline text-primary"
                              type="button"
                              onClick={() => {
                                // If all checked, uncheck all; else check all
                                const allChecked = appTable.length > 0 && appTable.every(app => checkedApps[app.name]);
                                handleCheckAll(!allChecked);
                              }}
                            >
                              {appTable.length > 0 && appTable.every(app => checkedApps[app.name]) ? 'Uncheck All' : 'Check All'}
                            </button>
                          </th>
                          <th className="p-2 border">Name</th>
                          <th className="p-2 border">Version</th>
                          <th className="p-2 border">Publisher</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appTable.slice(0, visibleRows).map(app => (
                          <tr key={app.id}>
                            <td className="p-2 border text-center">
                              <input type="checkbox" checked={!!checkedApps[app.name]} onChange={() => handleCheckbox(app.name)} />
                            </td>
                            <td className="p-2 border">{app.name}</td>
                            <td className="p-2 border">{app.version}</td>
                            <td className="p-2 border">{app.publisher && app.publisher.trim() ? app.publisher : 'Unknown'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {appTable.length > visibleRows && (
                    <div className="flex justify-center mt-2">
                      <Button variant="outline" size="sm" onClick={() => setVisibleRows(v => v + 10)}>
                        Extend
                      </Button>
                    </div>
                  )}
                  <div className="flex justify-end mt-4">
                    <Button onClick={handleScanNVD} disabled={isScanning}>
                      {isScanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                      Scan Selected Applications
                    </Button>
                  </div>
                </div>
              )}

              {/* NVD Results Table */}
              {nvdResults.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-md font-semibold mb-2">NVD Vulnerabilities</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm">
                      <thead>
                        <tr className="bg-muted">
                          <th className="p-2 border">CVE</th>
                          <th className="p-2 border">Title</th>
                          <th className="p-2 border">Severity</th>
                          <th className="p-2 border">Score</th>
                          <th className="p-2 border">Published</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nvdResults.map((vuln, idx) => (
                          <tr key={idx}>
                            <td className="p-2 border">
                              <a
                                href={`https://nvd.nist.gov/vuln/detail/${vuln.cve}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline hover:text-blue-800"
                              >
                                {vuln.cve}
                              </a>
                            </td>
                            <td className="p-2 border">{vuln.title}</td>
                            <td className="p-2 border">{vuln.severity}</td>
                            <td className="p-2 border">{vuln.score}</td>
                            <td className="p-2 border">{vuln.publishedDate?.slice(0,10)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
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

        {/* Second Section: Scanner Connection */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Scanner Connection</h2>
          <p className="text-muted-foreground mb-6">
            Connect to the vulnerability scanner to perform real-time scans.
          </p>

          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-all duration-300">
            <Wifi className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Connect to Scanner</h3>
            <p className="text-muted-foreground mb-4">
              Establish connection to the vulnerability scanner API
            </p>
            <Button onClick={handleConnectToScanner} disabled={isConnecting}>
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wifi className="h-4 w-4 mr-2" />
                  Connect to Scanner
                </>
              )}
            </Button>
            
            {scannerStatus && (
              <div className="mt-4">
                <Badge variant={scannerStatus.includes('failed') ? 'destructive' : 'default'}>
                  {scannerStatus}
                </Badge>
              </div>
            )}
          </div>
        </Card>
      </div>

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