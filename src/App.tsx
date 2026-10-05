import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/Login.tsx";
import TechnicianBoard from "./pages/TechnicianBoard.tsx";
import AssessmentForm from "./pages/AssessmentForm.tsx";
import RequestForm from "./pages/RequestForm.tsx";
import NotificationCenter from "./pages/NotificationCenter.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminDashboard from "./pages/AdminDashboard.tsx";
import SpareParts from "./pages/SpareParts.tsx";
import Checksheet from "./pages/Checksheet.tsx";
// ── Admin ──
import AdminSpareRequests from "./pages/AdminSpareRequests.tsx";
import TechnicianDetail from "./pages/TechnicianDetail.tsx";
import TechnicianHistory from "./pages/TechnicianHistory.tsx";
// ── QC ──
import QCDashboard from "./pages/QCDashboard.tsx";
import QCRecordDetail from "./pages/QCRecordDetail.tsx";
// ── Executive ──
import ExecutiveDashboard from "./pages/ExecutiveDashboard.tsx";
import ExecutivePurchaseApproval from "./pages/ExecutivePurchaseApproval.tsx";
import ExecutiveUserApproval from "./pages/ExecutiveUserApproval.tsx";

import ErrorBoundary from "./components/ErrorBoundary.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/board" element={<TechnicianBoard />} />
            <Route path="/request" element={<RequestForm />} />
            <Route path="/notifications" element={<NotificationCenter />} />
            <Route path="/assessment/:id" element={<AssessmentForm />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/spare-requests" element={<AdminDashboard defaultTab="spare-requests" />} />
            <Route path="/admin/technician-history" element={<AdminDashboard defaultTab="technician-history" />} />
            <Route path="/admin/technician/:id" element={<AdminDashboard />} />
            <Route path="/spare-parts" element={<SpareParts />} />
            <Route path="/checksheet" element={<Checksheet />} />
            {/* QC */}
            <Route path="/qc/dashboard" element={<QCDashboard />} />
            <Route path="/qc/schedule" element={<QCDashboard />} />
            <Route path="/qc/record/:id" element={<QCRecordDetail />} />
            {/* Executive */}
            <Route path="/executive/dashboard" element={<ExecutiveDashboard />} />
            <Route path="/executive/purchase-approval" element={<ExecutivePurchaseApproval />} />
            <Route path="/executive/user-approval" element={<ExecutiveUserApproval />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
