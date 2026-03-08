import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScheduleProvider } from "@/context/ScheduleContext";
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
            <Route path="/" element={<ManagerHome />} />
            <Route path="/schedule" element={<SchedulePage />} />
            <Route path="/availability" element={<AvailabilityPage />} />
            <Route path="/swaps" element={<SwapsPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/therapist" element={<TherapistHome />} />
            <Route path="/therapist/schedule" element={<TherapistSchedulePage />} />
            <Route path="/therapist/availability" element={<TherapistAvailabilityPage />} />
            <Route path="/therapist/swaps" element={<TherapistSwapsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ScheduleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
