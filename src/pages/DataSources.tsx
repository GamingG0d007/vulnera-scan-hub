import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Database, 
  Plus, 
  Settings, 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Globe,
  Server,
  Cloud
} from 'lucide-react';

const DataSources = () => {
  const dataSources = [
    {
      id: 'nvd',
      name: 'NIST NVD',
      description: 'National Vulnerability Database',
      type: 'API',
      status: 'Connected',
      lastSync: '2024-01-15T10:30:00Z',
      url: 'https://services.nvd.nist.gov',
      recordCount: 234567,
      icon: <Globe className="h-5 w-5" />
    },
    {
      id: 'mitre',
      name: 'MITRE CVE',
      description: 'Common Vulnerabilities and Exposures',
      type: 'API',
      status: 'Connected',
      lastSync: '2024-01-15T09:45:00Z',
      url: 'https://cve.mitre.org',
      recordCount: 189234,
      icon: <Database className="h-5 w-5" />
    },
    {
      id: 'github',
      name: 'GitHub Advisory',
      description: 'GitHub Security Advisories',
      type: 'API',
      status: 'Pending',
      lastSync: '2024-01-14T16:20:00Z',
      url: 'https://api.github.com',
      recordCount: 45123,
      icon: <Cloud className="h-5 w-5" />
    },
    {
      id: 'custom',
      name: 'Internal Scanner',
      description: 'Organization vulnerability scanner',
      type: 'Upload',
      status: 'Connected',
      lastSync: '2024-01-15T08:15:00Z',
      url: 'Internal System',
      recordCount: 892,
      icon: <Server className="h-5 w-5" />
    },
    {
      id: 'osv',
      name: 'OSV',
      description: 'Open Source Vulnerabilities Database',
      type: 'API',
      status: 'Disconnected',
      lastSync: '2024-01-10T14:30:00Z',
      url: 'https://osv.dev',
      recordCount: 156789,
      icon: <Database className="h-5 w-5" />
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'connected':
        return 'bg-success text-white';
      case 'pending':
        return 'bg-warning text-black';
      case 'error':
        return 'bg-destructive text-white';
      case 'disconnected':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'connected':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <RefreshCw className="h-4 w-4" />;
      case 'error':
      case 'disconnected':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Data Sources</h1>
          <p className="text-muted-foreground mt-2">
            Manage vulnerability data sources and integrations
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Data Source
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-primary/20">
              <Database className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{dataSources.length}</p>
              <p className="text-sm text-muted-foreground">Total Sources</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-success/20">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {dataSources.filter(ds => ds.status === 'Connected').length}
              </p>
              <p className="text-sm text-muted-foreground">Connected</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-warning/20">
              <RefreshCw className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {dataSources.filter(ds => ds.status === 'Pending').length}
              </p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-info/20">
              <Globe className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {dataSources.reduce((sum, ds) => sum + ds.recordCount, 0).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Total Records</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Data Sources List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Connected Data Sources</h2>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync All
          </Button>
        </div>

        <div className="space-y-4">
          {dataSources.map((source) => (
            <div key={source.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-accent">
                  {source.icon}
                </div>
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h3 className="font-semibold text-foreground">{source.name}</h3>
                    <Badge className={getStatusColor(source.status)}>
                      {getStatusIcon(source.status)}
                      <span className="ml-1">{source.status}</span>
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{source.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Type: {source.type}</span>
                    <span>Records: {source.recordCount.toLocaleString()}</span>
                    <span>Last sync: {new Date(source.lastSync).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync
                </Button>
                <Button variant="outline" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Add New Data Source */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Add New Data Source</h2>
        <p className="text-muted-foreground mb-6">
          Connect to additional vulnerability databases and feeds.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              name: 'Custom API',
              description: 'Connect to your custom vulnerability API',
              type: 'API',
              icon: <Database className="h-5 w-5" />
            },
            {
              name: 'CVSS Feed',
              description: 'Real-time CVSS scoring updates',
              type: 'Feed',
              icon: <Globe className="h-5 w-5" />
            },
            {
              name: 'File Upload',
              description: 'Manual file upload for vulnerability data',
              type: 'Upload',
              icon: <Server className="h-5 w-5" />
            }
          ].map((sourceType) => (
            <Card key={sourceType.name} className="p-4 hover:shadow-glow transition-all duration-300 cursor-pointer">
              <div className="flex items-center space-x-3 mb-3">
                {sourceType.icon}
                <h3 className="font-semibold text-foreground">{sourceType.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{sourceType.description}</p>
              <Button size="sm" className="w-full">
                Connect
              </Button>
            </Card>
          ))}
        </div>
      </Card>

      {/* API Configuration */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">API Configuration</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              NVD API Key (Optional)
            </label>
            <Input 
              placeholder="Enter your NVD API key for higher rate limits"
              type="password"
            />
            <p className="text-xs text-muted-foreground mt-1">
              API key provides higher rate limits and priority access
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Custom API Endpoint
            </label>
            <Input 
              placeholder="https://api.example.com/vulnerabilities"
            />
          </div>

          <div className="flex space-x-3">
            <Button>Save Configuration</Button>
            <Button variant="outline">Test Connection</Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DataSources;