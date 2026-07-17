import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { TripProvider } from "@/context/TripContext";
import BottomNav from "@/components/BottomNav";
import Index from "./pages/Index";
import Itinerary from "./pages/Itinerary";
import Hotels from "./pages/Hotels";
import Transports from "./pages/Transports";
import RouteScheme from "./pages/RouteScheme";
import Budget from "./pages/Budget";
import Activities from "./pages/Activities";
import PendingItems from "./pages/PendingItems";
import Flights from "./pages/Flights";
import WhatToDo from "./pages/WhatToDo";
import CityWhatToDo from "./pages/CityWhatToDo";
import CategoryPlaces from "./pages/CategoryPlaces";
import VideoTips from "./pages/VideoTips";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TripProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <div className="max-w-lg mx-auto min-h-screen relative">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/itinerario" element={<Itinerary />} />
              <Route path="/hoteles" element={<Hotels />} />
              <Route path="/transportes" element={<Transports />} />
              <Route path="/trayectos" element={<RouteScheme />} />
              <Route path="/presupuesto" element={<Budget />} />
              <Route path="/actividades" element={<Activities />} />
              <Route path="/pendientes" element={<PendingItems />} />
              <Route path="/vuelos" element={<Flights />} />
              <Route path="/que-hacer" element={<WhatToDo />} />
              <Route path="/que-hacer/:cityId" element={<CityWhatToDo />} />
              <Route path="/que-hacer/:cityId/:category" element={<CategoryPlaces />} />
              <Route path="/tips-videos" element={<VideoTips />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <BottomNav />
          </div>
        </HashRouter>
      </TripProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
