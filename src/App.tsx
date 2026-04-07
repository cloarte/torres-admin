import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import UsuariosList from "@/pages/maestros/UsuariosList";
import VendedoresList from "@/pages/maestros/VendedoresList";
import ProductosList from "@/pages/maestros/ProductosList";
import LineasList from "@/pages/maestros/LineasList";
import ClientesList from "@/pages/maestros/ClientesList";
import ClienteDetail from "@/pages/maestros/ClienteDetail";
import CanalesList from "@/pages/maestros/CanalesList";
import RutasList from "@/pages/maestros/RutasList";
import RutaClientes from "@/pages/maestros/RutaClientes";
import RutaProgramacion from "@/pages/maestros/RutaProgramacion";
import BeneficiariosList from "@/pages/maestros/BeneficiariosList";
import Configuracion from "@/pages/maestros/Configuracion";
import PreciosCanalPage from "@/pages/pricing/PreciosCanalPage";
import PreciosEspecialesPage from "@/pages/pricing/PreciosEspecialesPage";
import DescuentosCondicionPage from "@/pages/pricing/DescuentosCondicionPage";
import CotizacionesListPage from "@/pages/pricing/CotizacionesListPage";
import CotizacionNuevaPage from "@/pages/pricing/CotizacionNuevaPage";
import ReportesPreciosPage from "@/pages/pricing/ReportesPreciosPage";
import NotFound from "./pages/NotFound.tsx";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" duration={3000} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/maestros/usuarios" replace />} />
          <Route element={<AppLayout />}>
            {/* MAESTROS */}
            <Route path="/maestros/usuarios" element={<UsuariosList />} />
            <Route path="/maestros/vendedores" element={<VendedoresList />} />
            <Route path="/maestros/productos" element={<ProductosList />} />
            <Route path="/maestros/lineas" element={<LineasList />} />
            <Route path="/maestros/clientes" element={<ClientesList />} />
            <Route path="/maestros/clientes/:id" element={<ClienteDetail />} />
            <Route path="/maestros/canales" element={<CanalesList />} />
            <Route path="/maestros/rutas" element={<RutasList />} />
            <Route path="/maestros/rutas/:id/clientes" element={<RutaClientes />} />
            <Route path="/maestros/rutas/:id/programacion" element={<RutaProgramacion />} />
            <Route path="/maestros/beneficiarios" element={<BeneficiariosList />} />
            <Route path="/maestros/configuracion" element={<Configuracion />} />
            {/* PRICING */}
            <Route path="/pricing/precios-canal" element={<PreciosCanalPage />} />
            <Route path="/pricing/precios-especiales" element={<PreciosEspecialesPage />} />
            <Route path="/pricing/descuentos" element={<DescuentosCondicionPage />} />
            <Route path="/pricing/cotizaciones" element={<CotizacionesListPage />} />
            <Route path="/pricing/cotizaciones/nueva" element={<CotizacionNuevaPage />} />
            <Route path="/pricing/reportes" element={<ReportesPreciosPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
