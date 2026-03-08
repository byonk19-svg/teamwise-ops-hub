import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScheduleProvider } from "@/context/ScheduleContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import ManagerHome from "./pages/ManagerHome";
import TherapistHome from "./pages/TherapistHome";
import TherapistSchedulePage from "./pages/TherapistSchedulePage";
import SchedulePage from "./pages/SchedulePage";
import AvailabilityPage from "./pages/AvailabilityPage";
import TherapistAvailabilityPage from "./pages/TherapistAvailabilityPage";
import SwapsPage from "./pages/SwapsPage";
import TherapistSwapsPage from "./pages/TherapistSwapsPage";
import TeamPage from "./pages/TeamPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ScheduleProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<ProtectedRoute><ManagerHome /></ProtectedRoute>} />
            <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
            <Route path="/availability" element={<ProtectedRoute><AvailabilityPage /></ProtectedRoute>} />
            <Route path="/swaps" element={<ProtectedRoute><SwapsPage /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
            <Route path="/therapist" element={<ProtectedRoute><TherapistHome /></ProtectedRoute>} />
            <Route path="/therapist/schedule" element={<ProtectedRoute><TherapistSchedulePage /></ProtectedRoute>} />
            <Route path="/therapist/availability" element={<ProtectedRoute><TherapistAvailabilityPage /></ProtectedRoute>} />
            <Route path="/therapist/swaps" element={<ProtectedRoute><TherapistSwapsPage /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ScheduleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
