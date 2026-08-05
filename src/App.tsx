import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { TripProvider } from "@/context/TripContext";
import BottomNav from "@/components/BottomNav";
import TripChat from "@/components/TripChat";
import Index from "./pages/Index";
import Plan from "./pages/Plan";
import Moverse from "./pages/Moverse";
import Descubrir from "./pages/Descubrir";
import Gestiones from "./pages/Gestiones";
import ActivityDetail from "./pages/ActivityDetail";
import CityWhatToDo from "./pages/CityWhatToDo";
import CategoryPlaces from "./pages/CategoryPlaces";
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

              {/* Las 4 secciones grandes. La sub-pestaña va en la URL. */}
              <Route path="/plan" element={<Plan />} />
              <Route path="/plan/:section" element={<Plan />} />
              <Route path="/moverse" element={<Moverse />} />
              <Route path="/moverse/:section" element={<Moverse />} />
              <Route path="/descubrir" element={<Descubrir />} />
              <Route path="/descubrir/:section" element={<Descubrir />} />
              <Route path="/gestiones" element={<Gestiones />} />
              <Route path="/gestiones/:section" element={<Gestiones />} />

              {/* Pantallas de detalle, a pantalla completa */}
              <Route path="/actividades/:activityId" element={<ActivityDetail />} />
              <Route path="/que-hacer/:cityId" element={<CityWhatToDo />} />
              <Route path="/que-hacer/:cityId/:category" element={<CategoryPlaces />} />

              {/* Direcciones antiguas: se mantienen para no romper enlaces guardados */}
              <Route path="/calendario" element={<Navigate to="/plan/dias" replace />} />
              <Route path="/itinerario" element={<Navigate to="/plan/ciudades" replace />} />
              <Route path="/hoteles" element={<Navigate to="/plan/hoteles" replace />} />
              <Route path="/trayectos" element={<Navigate to="/moverse/trayectos" replace />} />
              <Route path="/transportes" element={<Navigate to="/moverse/trenes" replace />} />
              <Route path="/vuelos" element={<Navigate to="/moverse/vuelos" replace />} />
              <Route path="/actividades" element={<Navigate to="/descubrir/actividades" replace />} />
              <Route path="/que-hacer" element={<Navigate to="/descubrir/sitios" replace />} />
              <Route path="/tips-videos" element={<Navigate to="/descubrir/videos" replace />} />
              <Route path="/pendientes" element={<Navigate to="/gestiones/pendientes" replace />} />
              <Route path="/apps" element={<Navigate to="/gestiones/apps" replace />} />
              <Route path="/presupuesto" element={<Navigate to="/gestiones/dinero" replace />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
            <TripChat />
            <BottomNav />
          </div>
        </HashRouter>
      </TripProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
