import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TripProvider } from "@/context/TripContext";
import BottomNav from "@/components/BottomNav";
import Index from "./pages/Index";
import Itinerary from "./pages/Itinerary";
import Hotels from "./pages/Hotels";
import Transports from "./pages/Transports";
import Budget from "./pages/Budget";
import Activities from "./pages/Activities";
import PendingItems from "./pages/PendingItems";
import Flights from "./pages/Flights";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TripProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="max-w-lg mx-auto min-h-screen relative">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/itinerario" element={<Itinerary />} />
              <Route path="/hoteles" element={<Hotels />} />
              <Route path="/transportes" element={<Transports />} />
              <Route path="/presupuesto" element={<Budget />} />
              <Route path="/actividades" element={<Activities />} />
              <Route path="/pendientes" element={<PendingItems />} />
              <Route path="/vuelos" element={<Flights />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </div>
        </BrowserRouter>
      </TripProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
