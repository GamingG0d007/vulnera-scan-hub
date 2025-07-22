import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Shield, 
  Search, 
  FileText, 
  Scan, 
  BarChart3, 
  Database,
  Settings,
  ChevronLeft
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Vulnerabilities', href: '/vulnerabilities', icon: Shield },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Scanner', href: '/scanner', icon: Scan },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Data Sources', href: '/data-sources', icon: Database },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border">
        <div className="flex h-16 items-center px-6 border-b border-border">
          <Shield className="h-8 w-8 text-primary" />
          <span className="ml-2 text-xl font-bold text-foreground">Vulnerability Tracker</span>
        </div>
        
        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center p-3 rounded-lg bg-accent">
            <Settings className="h-5 w-5 text-muted-foreground mr-3" />
            <span className="text-sm text-muted-foreground">Settings</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;