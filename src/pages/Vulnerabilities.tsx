import { useState } from 'react';
import { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { VulnerabilityCard } from '@/components/VulnerabilityCard';
import { 
  Filter, 
  Search, 
  SortAsc, 
  ExternalLink,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { nvdApi } from '@/services/nvdApi';
import { useToast } from '@/hooks/use-toast';

const PINNED_KEY = 'pinned_cves';

const Vulnerabilities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('published');
  const [pinned, setPinned] = useState<any[]>([]);
  const [nvdResults, setNvdResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load pinned from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(PINNED_KEY);
    if (stored) {
      try {
        setPinned(JSON.parse(stored));
      } catch {}
    }
  }, []);

  // Save pinned to localStorage when changed
  useEffect(() => {
    localStorage.setItem(PINNED_KEY, JSON.stringify(pinned));
  }, [pinned]);

  // Pin/unpin handlers
  const handlePin = (vuln: any) => {
    if (!pinned.find((v: any) => v.cve === vuln.cve)) {
      setPinned([vuln, ...pinned]);
    }
  };
  const handleUnpin = (cve: string) => {
    setPinned(pinned.filter((v: any) => v.cve !== cve));
  };

  // Export pinned as JSON
  const exportPinned = () => {
    const blob = new Blob([JSON.stringify(pinned, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pinned-vulnerabilities.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import pinned from JSON
  const importPinned = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then(text => {
      try {
        const arr = JSON.parse(text);
        if (Array.isArray(arr)) {
          setPinned(arr);
        }
      } catch {}
    });
  };

  // Helper: is CVE ID
  const isCveId = (term: string) => /^CVE-\d{4}-\d{4,}$/.test(term.trim().toUpperCase());

  // Search handler
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setNvdResults([]);
    if (!searchTerm.trim()) return;
    if (isCveId(searchTerm)) {
      setIsLoading(true);
      try {
        const response = await nvdApi.searchByCVE(searchTerm.trim());
        const formatted = response.vulnerabilities.map(vuln => nvdApi.formatVulnerability(vuln));
        setNvdResults(formatted);
        if (formatted.length === 0) {
          setError('No results found for this CVE ID.');
        }
      } catch (err) {
        setError('Failed to fetch from NVD.');
        toast({ title: 'NVD Search Failed', description: 'Could not fetch vulnerability from NVD.', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
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
    },
    {
      cve: 'CVE-2023-1234',
      title: 'SQL Injection in WordPress Plugin',
      severity: 'High' as const,
      score: 7.2,
      publishedDate: '2024-01-12T14:30:00Z',
      status: 'Resolved',
      source: 'NIST NVD',
      description: 'SQL injection vulnerability in popular WordPress plugin affecting thousands of sites.'
    },
    {
      cve: 'CVE-2023-9876',
      title: 'Cross-Site Scripting in React Component',
      severity: 'Medium' as const,
      score: 6.1,
      publishedDate: '2024-01-11T11:45:00Z',
      status: 'Mitigated',
      source: 'NIST NVD',
      description: 'XSS vulnerability in commonly used React component library.'
    },
    {
      cve: 'CVE-2023-5555',
      title: 'Information Disclosure in Node.js',
      severity: 'Low' as const,
      score: 3.7,
      publishedDate: '2024-01-10T16:20:00Z',
      status: 'Resolved',
      source: 'NIST NVD',
      description: 'Minor information disclosure issue in Node.js runtime environment.'
    }
  ];

  const filteredVulnerabilities = mockVulnerabilities.filter(vuln => {
    const matchesSearch = vuln.cve.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vuln.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || vuln.severity.toLowerCase() === severityFilter;
    const matchesStatus = statusFilter === 'all' || vuln.status.toLowerCase().replace(' ', '-') === statusFilter;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new':
        return 'bg-severity-critical text-white';
      case 'investigating':
        return 'bg-severity-high text-white';
      case 'in progress':
        return 'bg-severity-medium text-black';
      case 'mitigated':
        return 'bg-severity-low text-white';
      case 'resolved':
        return 'bg-success text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vulnerability Tracker</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and track vulnerabilities from multiple sources
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex gap-3 flex-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for vulnerabilities (CVE ID, keywords, etc)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? <span className="animate-spin"><Search className="h-4 w-4 mr-2" /></span> : <Search className="h-4 w-4 mr-2" />}
            Search
          </Button>
        </div>
          
          <div className="flex gap-3">
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="investigating">Investigating</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="mitigated">Mitigated</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">Published Date</SelectItem>
                <SelectItem value="severity">Severity</SelectItem>
                <SelectItem value="score">CVSS Score</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Only show pinned vulnerabilities section (if any) */}
      {pinned.length > 0 && (
        <Card className="p-6 border-2 border-primary/40 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Pinned Vulnerabilities</h2>
            <div className="flex gap-2">
              <button
                className="text-xs underline text-primary"
                onClick={exportPinned}
                type="button"
              >Export JSON</button>
              <label className="text-xs underline text-primary cursor-pointer">
                Import JSON
                <input type="file" accept=".json" className="hidden" onChange={importPinned} />
              </label>
            </div>
          </div>
          <div className="space-y-4">
            {pinned.map((vuln) => (
              <VulnerabilityCard
                key={vuln.cve}
                {...vuln}
                pinned={true}
                onUnpin={() => handleUnpin(vuln.cve)}
              />
            ))}
          </div>
        </Card>
      )}

      {/* Show NVD API search results if present */}
      {nvdResults.length > 0 && (
        <div className="space-y-4 mt-8">
          <h2 className="text-xl font-semibold text-foreground">
            Search Results ({nvdResults.length} found)
          </h2>
          <div className="grid gap-6">
            {nvdResults.map((result) => (
              <VulnerabilityCard
                key={result.cve}
                {...result}
                pinned={!!pinned.find((v: any) => v.cve === result.cve)}
                onPin={() => handlePin(result)}
                onUnpin={() => handleUnpin(result.cve)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Show error or no results message if search attempted but no results */}
      {error && (
        <Card className="p-12 text-center mt-8">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-destructive mb-2">{error}</h3>
        </Card>
      )}
      {!isLoading && searchTerm && nvdResults.length === 0 && !error && (
        <Card className="p-12 text-center mt-8">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No vulnerabilities found</h3>
          <p className="text-muted-foreground">
            Try searching with different keywords or check your spelling.
          </p>
        </Card>
      )}

      {/* Show mock vulnerabilities if no API results and no search term */}
      {nvdResults.length === 0 && !searchTerm && (
        <div className="space-y-4 mt-8">
          <h2 className="text-xl font-semibold text-foreground">
            Example Vulnerabilities
          </h2>
          <div className="grid gap-6">
            {filteredVulnerabilities.map((vuln) => (
              <VulnerabilityCard
                key={vuln.cve}
                {...vuln}
                pinned={!!pinned.find((v: any) => v.cve === vuln.cve)}
                onPin={() => handlePin(vuln)}
                onUnpin={() => handleUnpin(vuln.cve)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Vulnerabilities;