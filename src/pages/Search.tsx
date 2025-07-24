import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VulnerabilityCard } from '@/components/VulnerabilityCard';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { nvdApi } from '@/services/nvdApi';
import { useToast } from '@/hooks/use-toast';
import { StatCard } from '@/components/StatCard';
import { AlertTriangle, Shield, FileX, CheckCircle } from 'lucide-react';

interface SearchResult {
  cve: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  score: number;
  publishedDate: string;
  lastModified: string;
  status: string;
  source: string;
  references: Array<{ url: string; source: string }>;
}

const PINNED_KEY = 'pinned_cves';

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [shouldAutoSearch, setShouldAutoSearch] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  });
  const { toast } = useToast();
  const location = useLocation();
  const [pinned, setPinned] = useState<any[]>([]);

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

  // Update stats based on pinned vulnerabilities
  useEffect(() => {
    setStats({
      total: pinned.length,
      critical: pinned.filter(v => v.severity === 'Critical').length,
      high: pinned.filter(v => v.severity === 'High').length,
      medium: pinned.filter(v => v.severity === 'Medium').length,
      low: pinned.filter(v => v.severity === 'Low').length,
    });
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

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!searchTerm.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Split searchTerm by spaces or commas, filter out empty strings
      const keywords = searchTerm
        .split(/[,\s]+/)
        .map(s => s.trim())
        .filter(Boolean);
      
      // If only one keyword, use the original logic
      let allVulns = [];
      let total = 0;
      if (keywords.length === 1) {
        const response = await nvdApi.searchVulnerabilities({
          keywordSearch: keywords[0],
          resultsPerPage: 20
        });
        allVulns = response.vulnerabilities.map(vuln => nvdApi.formatVulnerability(vuln));
        total = response.totalResults;
      } else {
        // For multiple keywords, fetch in parallel and merge results
        const responses = await Promise.all(
          keywords.map(keyword =>
            nvdApi.searchVulnerabilities({ keywordSearch: keyword, resultsPerPage: 20 })
          )
        );
        // Flatten and deduplicate by CVE
        const vulnMap = new Map();
        responses.forEach(response => {
          response.vulnerabilities.forEach(vuln => {
            const formatted = nvdApi.formatVulnerability(vuln);
            vulnMap.set(formatted.cve, formatted);
          });
        });
        allVulns = Array.from(vulnMap.values());
        total = allVulns.length;
      }

      setResults(allVulns);
      setTotalResults(total);
      
      toast({
        title: "Search Complete",
        description: `Found ${total} vulnerabilities`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search Failed",
        description: "Failed to search vulnerabilities. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // On mount, check for searchTerm in location.state and trigger search
  useEffect(() => {
    if (location.state && location.state.searchTerm) {
      setSearchTerm(location.state.searchTerm);
      setShouldAutoSearch(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  useEffect(() => {
    if (shouldAutoSearch && searchTerm.trim()) {
      handleSearch();
      setShouldAutoSearch(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldAutoSearch, searchTerm]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Search Vulnerabilities</h1>
        <p className="text-muted-foreground mt-2">
          Search for vulnerabilities across multiple databases
        </p>
      </div>

      {/* Search Form */}
      <Card className="p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by CVE ID, package name, or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-lg py-6"
              disabled={isLoading}
            />
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Enter a CVE ID, package name, or keywords to search across multiple vulnerability databases.
            </p>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <SearchIcon className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-sm font-semibold text-foreground mb-3">Example searches:</h3>
          <div className="flex flex-wrap gap-2">
            {[
              'OpenSSL',
              'Microsoft Windows',
              'CVE-2023-44487',
              'Docker',
              'Apache',
              'Node.js'
            ].map((example) => (
              <Button
                key={example}
                variant="outline"
                size="sm"
                onClick={() => setSearchTerm(example)}
                disabled={isLoading}
              >
                {example}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Statistics Grid - Now synced with pinned CVEs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Vulnerabilities"
          count={stats.total}
          percentage="0%"
          trend="neutral"
          icon={Shield}
        />
        <StatCard
          title="Critical"
          count={stats.critical}
          percentage="0%"
          trend="neutral"
          severity="critical"
          icon={AlertTriangle}
        />
        <StatCard
          title="High"
          count={stats.high}
          percentage="0%"
          trend="neutral"
          severity="high"
          icon={FileX}
        />
        <StatCard
          title="Medium"
          count={stats.medium}
          percentage="0%"
          trend="neutral"
          severity="medium"
          icon={AlertTriangle}
        />
        <StatCard
          title="Low"
          count={stats.low}
          percentage="0%"
          trend="neutral"
          severity="low"
          icon={CheckCircle}
        />
      </div>

      {/* Search Results */}
      {totalResults > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">
              Search Results ({totalResults.toLocaleString()} found)
            </h2>
          </div>

          <div className="grid gap-6">
            {results.map((result) => (
              <VulnerabilityCard
                key={result.cve}
                {...result}
                pinned={!!pinned.find((v: any) => v.cve === result.cve)}
                onPin={() => handlePin(result)}
                onUnpin={() => handleUnpin(result.cve)}
              />
            ))}
          </div>

          {results.length < totalResults && (
            <div className="text-center pt-6">
              <Button variant="outline" disabled={isLoading}>
                Load More Results
              </Button>
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {!isLoading && searchTerm && results.length === 0 && totalResults === 0 && (
        <Card className="p-12 text-center">
          <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No vulnerabilities found</h3>
          <p className="text-muted-foreground">
            Try searching with different keywords or check your spelling.
          </p>
        </Card>
      )}
    </div>
  );
};

export default Search;