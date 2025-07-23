import { useState } from 'react';
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

const Vulnerabilities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('published');

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
          <Button>
            <Search className="h-4 w-4 mr-2" />
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

      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total', count: mockVulnerabilities.length, color: 'bg-primary' },
          { label: 'Critical', count: mockVulnerabilities.filter(v => v.severity === 'Critical').length, color: 'bg-severity-critical' },
          { label: 'High', count: mockVulnerabilities.filter(v => v.severity === 'High').length, color: 'bg-severity-high' },
          { label: 'Medium', count: mockVulnerabilities.filter(v => v.severity === 'Medium').length, color: 'bg-severity-medium' },
          { label: 'Low', count: mockVulnerabilities.filter(v => v.severity === 'Low').length, color: 'bg-severity-low' },
          { label: 'Resolved', count: mockVulnerabilities.filter(v => v.status === 'Resolved').length, color: 'bg-success' }
        ].map((stat) => (
          <Card key={stat.label} className="p-4 text-center">
            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${stat.color} text-white text-sm font-bold mb-2`}>
              {stat.count}
            </div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Vulnerabilities Table View */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Vulnerabilities</h2>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>Showing {filteredVulnerabilities.length} of {mockVulnerabilities.length} vulnerabilities</span>
          </div>
        </div>

        <div className="space-y-4">
          {filteredVulnerabilities.map((vuln) => (
            <div key={vuln.cve} className="border border-border rounded-lg p-4 hover:shadow-glow transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Badge className={
                    vuln.severity === 'Critical' ? 'bg-severity-critical' :
                    vuln.severity === 'High' ? 'bg-severity-high' :
                    vuln.severity === 'Medium' ? 'bg-severity-medium' : 'bg-severity-low'
                  }>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {vuln.severity}
                  </Badge>
                  <Badge variant="outline" className="text-foreground border-border">
                    CVSS: {vuln.score}
                  </Badge>
                  <Badge className={getStatusColor(vuln.status)}>
                    {vuln.status}
                  </Badge>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
              </div>

              <div className="space-y-2">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{vuln.cve}</h3>
                  <p className="text-sm text-foreground">{vuln.title}</p>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2">{vuln.description}</p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(vuln.publishedDate).toLocaleDateString()}</span>
                    </div>
                    <span>Source: {vuln.source}</span>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredVulnerabilities.length === 0 && (
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No vulnerabilities found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or filters.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Vulnerabilities;