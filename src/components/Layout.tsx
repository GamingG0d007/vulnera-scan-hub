import { ReactNode, useState } from 'react';
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
  ChevronLeft,
  ChevronRight
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

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className={collapsed ? "fixed inset-y-0 left-0 z-50 w-20 bg-card border-r border-border transition-all duration-200" : "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-all duration-200"}>
        <div className={collapsed ? "flex flex-col items-center h-16 justify-center border-b border-border" : "flex items-center px-6 h-16 border-b border-border"}>
          <Shield className="h-8 w-8 text-primary" />
          {!collapsed && <span className="ml-2 text-xl font-bold text-foreground">Vulnerability Tracker</span>}
        </div>
        <div className={collapsed ? "flex flex-col items-center mt-2" : "flex flex-col items-end px-4 mt-2"}>
          <button
            className="p-1 rounded hover:bg-accent"
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>
        </div>
        <nav className={collapsed ? "mt-8 flex flex-col items-center" : "mt-8 px-4"}>
          <div className={collapsed ? "space-y-2 w-full" : "space-y-2"}>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    collapsed
                      ? 'flex flex-col items-center justify-center py-3 w-full rounded-lg transition-colors'
                      : 'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                  title={item.name}
                >
                  <item.icon className={collapsed ? "h-6 w-6" : "h-5 w-5 mr-3"} />
                  {!collapsed && item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className={collapsed ? "absolute bottom-4 left-0 right-0 flex justify-center" : "absolute bottom-4 left-4 right-4"}>
          <div className="flex items-center p-3 rounded-lg bg-accent">
            <Settings className="h-5 w-5 text-muted-foreground mr-3" />
            {!collapsed && <span className="text-sm text-muted-foreground">Settings</span>}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={collapsed ? "pl-20 transition-all duration-200" : "pl-64 transition-all duration-200"}>
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;