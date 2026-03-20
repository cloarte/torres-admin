import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import UsuariosList from "@/pages/maestros/UsuariosList";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border">
    <p className="text-muted-foreground">Módulo <strong>{title}</strong> — próximamente</p>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" duration={3000} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/maestros/usuarios" replace />} />
          <Route element={<AppLayout />}>
            <Route path="/maestros/usuarios" element={<UsuariosList />} />
            <Route path="/maestros/vendedores" element={<PlaceholderPage title="Vendedores" />} />
            <Route path="/maestros/productos" element={<PlaceholderPage title="Productos" />} />
            <Route path="/maestros/lineas" element={<PlaceholderPage title="Líneas" />} />
            <Route path="/maestros/clientes" element={<PlaceholderPage title="Clientes" />} />
            <Route path="/maestros/canales" element={<PlaceholderPage title="Canales" />} />
            <Route path="/maestros/rutas" element={<PlaceholderPage title="Rutas" />} />
            <Route path="/maestros/beneficiarios" element={<PlaceholderPage title="Beneficiarios" />} />
            <Route path="/maestros/configuracion" element={<PlaceholderPage title="Configuración" />} />
            <Route path="/pricing/precios-canal" element={<PlaceholderPage title="Precios por Canal" />} />
            <Route path="/pricing/precios-especiales" element={<PlaceholderPage title="Precios Especiales" />} />
            <Route path="/pricing/descuentos" element={<PlaceholderPage title="Descuentos Condición" />} />
            <Route path="/pricing/cotizaciones" element={<PlaceholderPage title="Cotizaciones" />} />
            <Route path="/pricing/reportes" element={<PlaceholderPage title="Reportes" />} />
            <Route path="/pricing/sync-erp" element={<PlaceholderPage title="Sync ERP" />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
