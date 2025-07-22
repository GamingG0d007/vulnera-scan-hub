import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { VulnerabilityCard } from '@/components/VulnerabilityCard';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import { nvdApi } from '@/services/nvdApi';
import { useToast } from '@/hooks/use-toast';

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

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      const response = await nvdApi.searchVulnerabilities({
        keywordSearch: searchTerm,
        resultsPerPage: 20
      });

      const formattedResults = response.vulnerabilities.map(vuln => 
        nvdApi.formatVulnerability(vuln)
      );

      setResults(formattedResults);
      setTotalResults(response.totalResults);
      
      toast({
        title: "Search Complete",
        description: `Found ${response.totalResults} vulnerabilities`,
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
                cve={result.cve}
                title={result.title}
                severity={result.severity}
                score={result.score}
                publishedDate={result.publishedDate}
                status={result.status}
                source={result.source}
                description={result.description}
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