import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Vulnerabilities from "./pages/Vulnerabilities";
import Search from "./pages/Search";
import Scanner from "./pages/Scanner";
import Reports from "./pages/Reports";
import DataSources from "./pages/DataSources";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vulnerabilities" element={<Vulnerabilities />} />
            <Route path="/search" element={<Search />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/data-sources" element={<DataSources />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
