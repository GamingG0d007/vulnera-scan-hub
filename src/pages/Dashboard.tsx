import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '@/components/StatCard';
import { VulnerabilityCard } from '@/components/VulnerabilityCard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  AlertTriangle, 
  Shield, 
  FileX, 
  CheckCircle,
  Search,
  RefreshCw,
  Upload,
  FileText,
  Loader2
} from 'lucide-react';

interface VulnerabilityStats {
  critical: number;
  high: number;
  medium: number;
  low: number;
  total: number;
}

const Dashboard = () => {
  const [stats] = useState<VulnerabilityStats>({
    critical: 28,
    high: 67,
    medium: 93,
    low: 46,
    total: 234
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdated] = useState(new Date().toLocaleDateString());
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [vulnerabilities, setVulnerabilities] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pinned, setPinned] = useState<any[]>([]);
  const navigate = useNavigate();

  // Load pinned from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('pinned_cves');
    if (stored) {
      try {
        setPinned(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const handleUploadClick = () => {
    navigate('/scanner');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setUploadStatus('uploading');
      
      // Simulate upload process
      setTimeout(() => {
        setUploadStatus('success');
        setTimeout(() => setUploadStatus('idle'), 3000);
      }, 2000);
    } else {
      setUploadStatus('error');
      setTimeout(() => setUploadStatus('idle'), 3000);
    }
  };

  const processScanResults = async () => {
    if (!fileInputRef.current || !fileInputRef.current.files || fileInputRef.current.files.length === 0) {
      setUploadStatus('error');
      setTimeout(() => setUploadStatus('idle'), 3000);
      return;
    }
    setIsProcessing(true);
    setUploadStatus('uploading');
    try {
      const file = fileInputRef.current.files[0];
      const content = await file.text();
      let json;
      try {
        json = JSON.parse(content);
      } catch {
        setUploadStatus('error');
        setIsProcessing(false);
        setTimeout(() => setUploadStatus('idle'), 3000);
        return;
      }
      // Add 10 second delay before fetch
      await new Promise(resolve => setTimeout(resolve, 10000));
      const response = await fetch('http://127.0.0.1:8000/api/v1/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: [json] }),
      });
      if (!response.ok) throw new Error('Failed to scan');
      const data = await response.json();
      setVulnerabilities(data.vulnerabilities || []);
      setUploadStatus('success');
      setTimeout(() => setUploadStatus('idle'), 3000);
    } catch {
      setUploadStatus('error');
      setTimeout(() => setUploadStatus('idle'), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const mockVulnerabilities = [
    {
      cve: 'CVE-2023-5678',
      title: 'Authentication Bypass in Docker',
      severity: 'Critical' as const,
      score: 9.1,
      publishedDate: '2024-01-15T10:30:00Z',
      status: 'Investigating',
      source: 'NIST NVD',
      description: 'A critical vulnerability that allows authentication bypass in Docker containers.'
    },
    {
      cve: 'CVE-2023-5432',
      title: 'Critical Remote Code Execution in OpenSSL',
      severity: 'Critical' as const,
      score: 9.8,
      publishedDate: '2024-01-14T15:22:00Z',
      status: 'New',
      source: 'NIST NVD',
      description: 'A severe vulnerability allowing remote code execution in OpenSSL library.'
    },
    {
      cve: 'CVE-2023-6789',
      title: 'Denial of Service in Apache Tomcat',
      severity: 'Medium' as const,
      score: 5.9,
      publishedDate: '2024-01-13T09:15:00Z',
      status: 'In Progress',
      source: 'NIST NVD',
      description: 'A denial of service vulnerability affecting Apache Tomcat installations.'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and track vulnerabilities from multiple sources
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-6">
        <div className="flex gap-3 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for vulnerabilities (CVE ID, keywords, etc)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Enter a CVE ID, package name, or keywords to search across multiple vulnerability databases.
        </p>
      </Card>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Vulnerabilities"
          count={stats.total}
          percentage="+12%"
          trend="up"
          icon={Shield}
        />
        <StatCard
          title="Critical"
          count={stats.critical}
          percentage="+15%"
          trend="up"
          severity="critical"
          icon={AlertTriangle}
        />
        <StatCard
          title="High"
          count={stats.high}
          percentage="+8%"
          trend="up"
          severity="high"
          icon={FileX}
        />
        <StatCard
          title="Medium"
          count={stats.medium}
          percentage="-3%"
          trend="down"
          severity="medium"
          icon={AlertTriangle}
        />
        <StatCard
          title="Low"
          count={stats.low}
          percentage="-5%"
          trend="down"
          severity="low"
          icon={CheckCircle}
        />
      </div>

      {/* Pinned Vulnerabilities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Pinned Vulnerabilities</h2>
              <Button variant="outline" size="sm" onClick={() => navigate('/vulnerabilities')}>
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {pinned.length > 0 ? (
                pinned.map((cve) => (
                  <VulnerabilityCard key={cve.cve} {...cve} />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No pinned vulnerabilities yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pin vulnerabilities from the Search or Vulnerabilities page to see them here.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Scanner Integration */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Scanner Integration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div>
                  <p className="font-medium text-foreground">Vulnerability Scanner</p>
                  <p className="text-sm text-muted-foreground">Upload scan results from your vulnerability scanner</p>
                </div>
              </div>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleUploadClick}
                disabled={uploadStatus === 'uploading'}
              >
                {uploadStatus === 'uploading' ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : uploadStatus === 'success' ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Uploaded!
                  </>
                ) : uploadStatus === 'error' ? (
                  <>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Error
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Scan
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Last Updated:</span>
                <span className="text-sm text-foreground">{lastUpdated}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Data Sources:</span>
                <span className="text-sm text-foreground">NVD, MITRE</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span className="text-sm text-success">Operational</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;