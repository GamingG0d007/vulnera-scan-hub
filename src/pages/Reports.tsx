import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  Calendar, 
  TrendingUp,
  AlertTriangle,
  Shield,
  BarChart3
} from 'lucide-react';

const Reports = () => {
  const reports = [
    {
      id: 'vuln-report-001',
      title: 'Vulnerability Report',
      description: 'Overview of critical issues for review',
      type: 'Vulnerability',
      status: 'Ready',
      lastGenerated: '2024-01-15T10:30:00Z',
      size: '2.3 MB',
      downloadUrl: '#'
    },
    {
      id: 'remediation-001',
      title: 'Remediation Report',
      description: 'Step-by-step remediation instructions',
      type: 'Remediation',
      status: 'Ready',
      lastGenerated: '2024-01-15T09:45:00Z',
      size: '1.8 MB',
      downloadUrl: '#'
    },
    {
      id: 'trend-001',
      title: 'Security Trends Analysis',
      description: 'Monthly security posture trends',
      type: 'Analytics',
      status: 'Generating',
      lastGenerated: '2024-01-14T14:20:00Z',
      size: '3.1 MB',
      downloadUrl: '#'
    },
    {
      id: 'compliance-001',
      title: 'Compliance Report',
      description: 'NIST cybersecurity framework compliance',
      type: 'Compliance',
      status: 'Ready',
      lastGenerated: '2024-01-13T16:15:00Z',
      size: '4.2 MB',
      downloadUrl: '#'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ready':
        return 'bg-success text-white';
      case 'generating':
        return 'bg-warning text-black';
      case 'error':
        return 'bg-destructive text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'vulnerability':
        return <AlertTriangle className="h-5 w-5" />;
      case 'remediation':
        return <Shield className="h-5 w-5" />;
      case 'analytics':
        return <BarChart3 className="h-5 w-5" />;
      case 'compliance':
        return <FileText className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const generateNewReport = (type: string) => {
    // In a real implementation, this would trigger report generation
    console.log(`Generating ${type} report...`);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-muted-foreground mt-2">
            Generate and view vulnerability reports
          </p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generate New Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-primary/20">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">12</p>
              <p className="text-sm text-muted-foreground">Total Reports</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-success/20">
              <Download className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">48</p>
              <p className="text-sm text-muted-foreground">Downloads</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-warning/20">
              <TrendingUp className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">3</p>
              <p className="text-sm text-muted-foreground">Scheduled</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-info/20">
              <Calendar className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">Weekly</p>
              <p className="text-sm text-muted-foreground">Auto-Generated</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Report Generation */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Generate Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { type: 'Vulnerability', description: 'Current vulnerability status' },
            { type: 'Remediation', description: 'Step-by-step fix instructions' },
            { type: 'Analytics', description: 'Security trends and metrics' },
            { type: 'Compliance', description: 'Regulatory compliance status' }
          ].map((reportType) => (
            <Card key={reportType.type} className="p-4 hover:shadow-glow transition-all duration-300 cursor-pointer">
              <div className="flex items-center space-x-3 mb-3">
                {getTypeIcon(reportType.type)}
                <h3 className="font-semibold text-foreground">{reportType.type} Report</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{reportType.description}</p>
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => generateNewReport(reportType.type)}
              >
                Generate
              </Button>
            </Card>
          ))}
        </div>
      </Card>

      {/* Existing Reports */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Available Reports</h2>
          <p className="text-sm text-muted-foreground">
            {reports.length} reports available
          </p>
        </div>

        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="p-2 rounded-lg bg-accent">
                  {getTypeIcon(report.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{report.title}</h3>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(report.lastGenerated).toLocaleDateString()}</span>
                    </div>
                    <span>{report.size}</span>
                    <Badge variant="outline" className="text-xs">
                      {report.type}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Badge className={getStatusColor(report.status)}>
                  {report.status}
                </Badge>
                {report.status === 'Ready' && (
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Report Templates */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Report Templates</h2>
        <p className="text-muted-foreground mb-6">
          Customize report templates to match your organization's requirements.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Executive Summary', description: 'High-level overview for leadership' },
            { name: 'Technical Deep Dive', description: 'Detailed technical analysis' },
            { name: 'Compliance Audit', description: 'Regulatory compliance reporting' }
          ].map((template) => (
            <Card key={template.name} className="p-4">
              <h3 className="font-semibold text-foreground mb-2">{template.name}</h3>
              <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
              <Button variant="outline" size="sm" className="w-full">
                Edit Template
              </Button>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Reports;
